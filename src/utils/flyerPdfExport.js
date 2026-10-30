/**
 * Utility to generate and download official high-definition flyers as PDF and image files
 * directly to the client's device without popping up the browser printer dialog.
 *
 * Strategy:
 *  1. First tries html-to-image (handles CSS gradients, background-clip:text, dark backgrounds)
 *  2. Falls back to html2canvas if html-to-image fails
 *  3. Uses jsPDF to wrap the image into a properly sized PDF
 *  4. Downloads via <a>.click() on desktop, Web Share API on mobile (iOS Safari safe)
 */

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
};

export const ensurePdfLibraries = async () => {
  // Load html-to-image (much better dark background support than html2canvas)
  const htmlToImageSrc = 'https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js';
  // Load html2canvas as fallback
  const h2cSrc = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  // Load jsPDF
  const jspdfSrc = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

  const tasks = [];
  if (!window.htmlToImage) tasks.push(loadScript(htmlToImageSrc));
  if (!window.html2canvas) tasks.push(loadScript(h2cSrc));
  if (!window.jspdf?.jsPDF && !window.jsPDF) tasks.push(loadScript(jspdfSrc));

  await Promise.all(tasks);

  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
  if (!jsPDF) throw new Error('PDF generation libraries could not be initialized');

  return { jsPDF };
};

/**
 * Capture a DOM element to a PNG data URL.
 * Tries html-to-image first (CSS gradient support), falls back to html2canvas.
 */
const captureElementToPng = async (element) => {
  const W = element.scrollWidth || element.offsetWidth;
  const H = element.scrollHeight || element.offsetHeight;

  // --- Try html-to-image first ---
  if (window.htmlToImage) {
    try {
      const dataUrl = await window.htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        width: W,
        height: H,
        style: {
          // Force the element to a fixed size so nothing gets clipped
          overflow: 'visible',
          borderRadius: '0',
        },
        // Inline all fonts
        fontEmbedCSS: '',
        skipAutoScale: false,
      });
      if (dataUrl && dataUrl.length > 1000) return dataUrl;
    } catch (e) {
      console.warn('html-to-image failed, trying html2canvas:', e);
    }
  }

  // --- Fallback: html2canvas ---
  if (window.html2canvas) {
    const canvas = await window.html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#050608',
      logging: false,
      windowWidth: Math.max(W, 1080),
      windowHeight: Math.max(H, 600),
      width: W,
      height: H,
      scrollX: 0,
      scrollY: 0,
    });
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  throw new Error('No image capture library available');
};

/**
 * Trigger a safe file download that works on both desktop and mobile (iOS Safari).
 */
const triggerDownload = async (blob, filename) => {
  // iOS Safari / mobile: use Web Share API when available
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })
  ) {
    try {
      await navigator.share({
        files: [new File([blob], filename, { type: blob.type })],
        title: filename,
      });
      return;
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn('Web Share failed, falling back to direct download', e);
      } else {
        return; // User cancelled share
      }
    }
  }

  // Desktop / Android: <a> download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
};

/**
 * Downloads a DOM element directly as a real .pdf file to user's device.
 * No print dialog — goes straight to downloads.
 */
export const downloadElementAsPdf = async (element, filename = 'StyleCorner_Flyer.pdf', isLandscape = false) => {
  if (!element) throw new Error('Element not found');

  const { jsPDF } = await ensurePdfLibraries();

  // Hide no-print elements during capture
  const hidden = [];
  element.querySelectorAll('.no-print').forEach((el) => {
    hidden.push({ el, display: el.style.display });
    el.style.display = 'none';
  });

  try {
    const imgData = await captureElementToPng(element);

    // Work out image dimensions from the data URL
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = imgData;
    });
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    const isL = isLandscape || imgW > imgH;
    const pdf = new jsPDF({
      orientation: isL ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgRatio = imgW / imgH;

    let renderW = pageWidth;
    let renderH = pageWidth / imgRatio;
    if (renderH > pageHeight) {
      renderH = pageHeight;
      renderW = pageHeight * imgRatio;
    }

    const posX = (pageWidth - renderW) / 2;
    const posY = (pageHeight - renderH) / 2;

    pdf.addImage(imgData, imgData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');

    // Get PDF as blob and trigger download (no print dialog)
    const pdfBlob = pdf.output('blob');
    await triggerDownload(pdfBlob, filename);
    return true;
  } finally {
    hidden.forEach(({ el, display }) => {
      el.style.display = display;
    });
  }
};

/**
 * Downloads multiple elements as a single multi-page PDF pack.
 */
export const downloadMultipleElementsAsPdf = async (elementsWithConfig, filename = 'StyleCorner_Marketing_Flyers_Pack.pdf') => {
  if (!elementsWithConfig || elementsWithConfig.length === 0) {
    throw new Error('No elements provided');
  }

  const { jsPDF } = await ensurePdfLibraries();

  const hidden = [];
  elementsWithConfig.forEach(({ el }) => {
    if (!el) return;
    el.querySelectorAll('.no-print').forEach((npe) => {
      hidden.push({ el: npe, display: npe.style.display });
      npe.style.display = 'none';
    });
  });

  try {
    let pdf = null;

    for (let i = 0; i < elementsWithConfig.length; i++) {
      const { el, isLandscape } = elementsWithConfig[i];
      if (!el) continue;

      const imgData = await captureElementToPng(el);

      const img = await new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = imgData;
      });
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      const isL = isLandscape || imgW > imgH;

      if (!pdf) {
        pdf = new jsPDF({
          orientation: isL ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });
      } else {
        pdf.addPage('a4', isL ? 'landscape' : 'portrait');
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = imgW / imgH;

      let renderW = pageWidth;
      let renderH = pageWidth / imgRatio;
      if (renderH > pageHeight) {
        renderH = pageHeight;
        renderW = pageHeight * imgRatio;
      }

      const posX = (pageWidth - renderW) / 2;
      const posY = (pageHeight - renderH) / 2;

      pdf.addImage(imgData, imgData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG', posX, posY, renderW, renderH, undefined, 'FAST');
    }

    if (pdf) {
      const pdfBlob = pdf.output('blob');
      await triggerDownload(pdfBlob, filename);
      return true;
    }
    return false;
  } finally {
    hidden.forEach(({ el, display }) => {
      el.style.display = display;
    });
  }
};

/**
 * Downloads a DOM element directly as a high-definition PNG image.
 */
export const downloadElementAsImage = async (element, filename = 'StyleCorner_Flyer.png') => {
  if (!element) throw new Error('Element not found');

  await ensurePdfLibraries(); // loads html-to-image and html2canvas

  const hidden = [];
  element.querySelectorAll('.no-print').forEach((el) => {
    hidden.push({ el, display: el.style.display });
    el.style.display = 'none';
  });

  try {
    const dataUrl = await captureElementToPng(element);

    // Convert data URL to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await triggerDownload(blob, filename);
    return true;
  } finally {
    hidden.forEach(({ el, display }) => {
      el.style.display = display;
    });
  }
};
