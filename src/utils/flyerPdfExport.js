/**
 * Utility to generate and download official high-definition flyers as PDF and image files
 * directly to the client's device without popping up the browser printer dialog.
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
  const tasks = [];
  if (!window.html2canvas) {
    tasks.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
  }
  if (!window.jspdf?.jsPDF && !window.jsPDF) {
    tasks.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
  }
  await Promise.all(tasks);

  const html2canvas = window.html2canvas;
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;

  if (!html2canvas || !jsPDF) {
    throw new Error('PDF generation libraries could not be initialized');
  }

  return { html2canvas, jsPDF };
};

/**
 * Downloads a DOM element directly as a real .pdf file to user's device
 */
export const downloadElementAsPdf = async (element, filename = 'StyleCorner_Flyer.pdf', isLandscape = false) => {
  if (!element) throw new Error('Element not found');

  const { html2canvas, jsPDF } = await ensurePdfLibraries();

  // Hide no-print elements during capture
  const hidden = [];
  element.querySelectorAll('.no-print').forEach((el) => {
    hidden.push({ el, display: el.style.display });
    el.style.display = 'none';
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#050608',
      logging: false,
      windowWidth: Math.max(element.scrollWidth, 1080),
    });

    const isL = isLandscape || canvas.width > canvas.height;
    const pdf = new jsPDF({
      orientation: isL ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgRatio = canvas.width / canvas.height;

    let renderW = pageWidth;
    let renderH = pageWidth / imgRatio;

    if (renderH > pageHeight) {
      renderH = pageHeight;
      renderW = pageHeight * imgRatio;
    }

    const posX = (pageWidth - renderW) / 2;
    const posY = (pageHeight - renderH) / 2;

    pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
    pdf.save(filename);
    return true;
  } finally {
    hidden.forEach(({ el, display }) => {
      el.style.display = display;
    });
  }
};

/**
 * Downloads multiple elements as a single multi-page PDF pack
 */
export const downloadMultipleElementsAsPdf = async (elementsWithConfig, filename = 'StyleCorner_Marketing_Flyers_Pack.pdf') => {
  if (!elementsWithConfig || elementsWithConfig.length === 0) {
    throw new Error('No elements provided');
  }

  const { html2canvas, jsPDF } = await ensurePdfLibraries();

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

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#050608',
        logging: false,
        windowWidth: Math.max(el.scrollWidth, 1080),
      });

      const isL = isLandscape || canvas.width > canvas.height;

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

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgRatio = canvas.width / canvas.height;

      let renderW = pageWidth;
      let renderH = pageWidth / imgRatio;

      if (renderH > pageHeight) {
        renderH = pageHeight;
        renderW = pageHeight * imgRatio;
      }

      const posX = (pageWidth - renderW) / 2;
      const posY = (pageHeight - renderH) / 2;

      pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
    }

    if (pdf) {
      pdf.save(filename);
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
 * Downloads a DOM element directly as a high-definition PNG image
 */
export const downloadElementAsImage = async (element, filename = 'StyleCorner_Flyer.png') => {
  if (!element) throw new Error('Element not found');

  const { html2canvas } = await ensurePdfLibraries();

  const hidden = [];
  element.querySelectorAll('.no-print').forEach((el) => {
    hidden.push({ el, display: el.style.display });
    el.style.display = 'none';
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#050608',
      logging: false,
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } finally {
    hidden.forEach(({ el, display }) => {
      el.style.display = display;
    });
  }
};
