import React from 'react';
import { Download, Play, Sparkles, Video, Film, Check, Share2, Eye, RefreshCw, Layers } from 'lucide-react';

/**
 * Generates an actual, playable .mp4 / webm video clip using HTML5 Canvas & MediaRecorder
 * so the user can immediately save it to their device!
 */
export const generateAndDownloadVideo = async (ad, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      const isVertical = ad.aspectRatio === '9:16';
      const width = isVertical ? 720 : 1280;
      const height = isVertical ? 1280 : 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(30); // 30 FPS
      const mimeTypes = [
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      let selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
      const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';

      const recorder = new MediaRecorder(stream, { mimeType: selectedMime });
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StyleCorner_${ad.title.replace(/\s+/g, '_')}_Ad.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        resolve(url);
      };

      recorder.start();

      // Render 150 frames (5 seconds animated teaser at 30fps)
      const totalFrames = 150;
      let frame = 0;

      const drawFrame = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const t = frame / totalFrames; // 0 to 1

        // Background Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0a0c13');
        grad.addColorStop(0.5, ad.themeColor === '#10b981' ? '#06281e' : ad.themeColor === '#38bdf8' ? '#091c33' : ad.themeColor === '#a855f7' ? '#1f0d33' : '#1f1807');
        grad.addColorStop(1, '#050608');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Ambient particles / glow circles
        ctx.save();
        ctx.globalAlpha = 0.2 + 0.1 * Math.sin(t * Math.PI * 4);
        ctx.fillStyle = ad.themeColor || '#f5b942';
        ctx.beginPath();
        ctx.arc(width * 0.5 + Math.sin(t * Math.PI * 2) * 50, height * 0.35, 180 + Math.sin(t * Math.PI * 2) * 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Brand Pill
        ctx.save();
        ctx.fillStyle = 'rgba(245, 185, 66, 0.18)';
        ctx.strokeStyle = '#f5b942';
        ctx.lineWidth = 3;
        const pillW = isVertical ? 380 : 450;
        const pillH = 50;
        const pillX = (width - pillW) / 2;
        const pillY = isVertical ? 90 : 60;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 25);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.fillStyle = '#f5b942';
        ctx.textAlign = 'center';
        ctx.fillText('STYLECORNER ATELIER', width / 2, pillY + 34);
        ctx.restore();

        // Main Title (With Scale Entrance)
        ctx.save();
        const scale = Math.min(1, t * 5);
        ctx.translate(width / 2, height * (isVertical ? 0.30 : 0.32));
        ctx.scale(scale, scale);
        ctx.font = `900 ${isVertical ? '48px' : '52px'} Outfit, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 15;
        
        // Wrap text
        const words = ad.title.split(' ');
        let line = '';
        let yOffset = 0;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > width * 0.85 && n > 0) {
            ctx.fillText(line, 0, yOffset);
            line = words[n] + ' ';
            yOffset += isVertical ? 56 : 58;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 0, yOffset);
        ctx.restore();

        // Hook Description Box
        ctx.save();
        const boxW = width * 0.88;
        const boxH = isVertical ? 220 : 180;
        const boxX = (width - boxW) / 2;
        const boxY = height * (isVertical ? 0.50 : 0.48);

        ctx.fillStyle = 'rgba(21, 24, 34, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.font = `600 ${isVertical ? '26px' : '24px'} Outfit, sans-serif`;
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'center';
        
        // Wrap Hook
        const hookWords = ad.hook.split(' ');
        let hLine = '';
        let hOffset = boxY + 60;
        for (let m = 0; m < hookWords.length; m++) {
          const testH = hLine + hookWords[m] + ' ';
          if (ctx.measureText(testH).width > boxW * 0.88 && m > 0) {
            ctx.fillText(hLine, width / 2, hOffset);
            hLine = hookWords[m] + ' ';
            hOffset += 38;
          } else {
            hLine = testH;
          }
        }
        ctx.fillText(hLine, width / 2, hOffset);

        // Tags
        ctx.font = '700 20px Outfit, sans-serif';
        ctx.fillStyle = ad.themeColor || '#f5b942';
        ctx.fillText(ad.tags.map(t => `#${t}`).join('   '), width / 2, boxY + boxH - 25);
        ctx.restore();

        // Call To Action Button (Pulsing)
        ctx.save();
        const pulse = 1 + 0.04 * Math.sin(t * Math.PI * 6);
        const btnW = width * 0.82;
        const btnH = 75;
        const btnX = (width - btnW) / 2;
        const btnY = height * (isVertical ? 0.78 : 0.76);

        ctx.translate(width / 2, btnY + btnH / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-width / 2, -(btnY + btnH / 2));

        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY);
        btnGrad.addColorStop(0, '#d4af37');
        btnGrad.addColorStop(1, '#f5b942');
        ctx.fillStyle = btnGrad;
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 22);
        ctx.fill();

        ctx.font = '900 26px Outfit, sans-serif';
        ctx.fillStyle = '#0c0e14';
        ctx.textAlign = 'center';
        ctx.fillText('BOOK OR SHOP NOW ➔', width / 2, btnY + 47);
        ctx.restore();

        // Footer domain & escrow
        ctx.save();
        ctx.font = '700 20px Outfit, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('www.stylecorner.world · 100% Escrow Protected Booking', width / 2, height - (isVertical ? 60 : 35));
        ctx.restore();

        frame++;
        if (onProgress) onProgress(Math.round((frame / totalFrames) * 100));
        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    } catch (err) {
      reject(err);
    }
  });
};

export const VideoAdsStudio = ({ adVideos, onAddCustomVideo, showToast, isMobile }) => {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [generatingId, setGeneratingId] = React.useState(null);
  const [generatingProgress, setGeneratingProgress] = React.useState(0);
  const [previewVideo, setPreviewVideo] = React.useState(null);
  const [promptText, setPromptText] = React.useState('');
  const [selectedFormat, setSelectedFormat] = React.useState('9:16');
  const [creatingNew, setCreatingNew] = React.useState(false);

  const filteredVideos = activeFilter === 'all'
    ? adVideos
    : adVideos.filter(v => v.category === activeFilter);

  const handleDownloadVideo = async (ad) => {
    setGeneratingId(ad.id);
    setGeneratingProgress(0);
    try {
      showToast?.(`Rendering ${ad.title} into high-definition MP4...`, 'info');
      await generateAndDownloadVideo(ad, (p) => setGeneratingProgress(p));
      showToast?.(`Video "${ad.title}" downloaded successfully!`, 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Could not export video on this browser.', 'error');
    } finally {
      setGeneratingId(null);
      setGeneratingProgress(0);
    }
  };

  const handleCreatePromptAd = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setCreatingNew(true);
    setTimeout(() => {
      const newAd = {
        id: `vid-custom-${Date.now()}`,
        title: promptText.trim().slice(0, 40),
        category: 'custom',
        duration: '0:15',
        aspectRatio: selectedFormat,
        badge: selectedFormat === '9:16' ? 'TikTok / Reel' : 'Landscape HD',
        description: `Custom advertisement generated for prompt: "${promptText.trim()}"`,
        hook: promptText.trim(),
        callToAction: 'Experience verified excellence on stylecorner.world',
        tags: ['CustomAd', 'StyleCorner', 'VIPGrooming'],
        themeColor: '#f5b942',
        accentGradient: 'linear-gradient(135deg, #1f1807, #0c0e14)',
        soundtrack: 'VIP Lounge Signature Beat (WAV)',
      };

      if (onAddCustomVideo) onAddCustomVideo(newAd);
      showToast?.('New video ad generated and added to your collection!', 'success');
      setPromptText('');
      setCreatingNew(false);
    }, 1200);
  };

  return (
    <div>
      {/* Hero Studio Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(59,130,246,0.15) 50%, rgba(168,85,247,0.15) 100%)',
        border: '1.5px solid rgba(212,175,55,0.4)',
        borderRadius: '24px',
        padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,185,66,0.2)', border: '1px solid rgba(245,185,66,0.4)', borderRadius: '50px', padding: '0.3rem 0.85rem', marginBottom: '0.75rem', fontSize: '0.74rem', fontWeight: 800, color: '#f5b942', textTransform: 'uppercase', fontFamily: 'Outfit' }}>
            <Sparkles size={13} /> AI Video Commercials Studio
          </div>
          <h2 style={{ fontSize: isMobile ? '1.35rem' : '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem', fontFamily: 'Outfit' }}>
            Descriptive StyleCorner Video Ads
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
            Generate, preview, and download HD video advertisements for Instagram Reels, TikTok, and YouTube hoardings. Click any ad below to render and save the video file directly to your device.
          </p>
        </div>
      </div>

      {/* AI Prompt Generator Card */}
      <form onSubmit={handleCreatePromptAd} style={{
        backgroundColor: '#151822',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <Video size={17} color="#f5b942" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'Outfit' }}>
            Generate New Ad From Description
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. Master barber fade and beard sculpting promotion in Ikeja Lagos..."
            style={{
              flex: 1,
              background: '#0c0e14',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontFamily: 'Outfit',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              style={{
                background: '#0c0e14',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '0 0.85rem',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontFamily: 'Outfit',
                minHeight: '44px',
              }}
            >
              <option value="9:16">9:16 (TikTok / Reels)</option>
              <option value="16:9">16:9 (Landscape / YouTube)</option>
            </select>

            <button
              type="submit"
              disabled={creatingNew || !promptText.trim()}
              className="app-btn app-btn-accent"
              style={{
                minHeight: '44px',
                padding: '0 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              {creatingNew ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {creatingNew ? 'Generating...' : 'Generate Ad'}
            </button>
          </div>
        </div>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem', WebkitOverflowScrolling: 'touch' }}>
        {[
          { id: 'all', label: 'All Video Ads' },
          { id: 'salon', label: 'Salon Services' },
          { id: 'recruitment', label: 'Specialist Recruitment' },
          { id: 'store', label: 'Atelier Store' },
          { id: 'ai', label: 'AI Matcher' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '50px',
              border: activeFilter === tab.id ? '1.5px solid #f5b942' : '1px solid rgba(255,255,255,0.08)',
              background: activeFilter === tab.id ? '#f5b942' : '#151822',
              color: activeFilter === tab.id ? '#0c0e14' : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: 800,
              fontFamily: 'Outfit',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Video Ad Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(330px, 1fr))',
        gap: '1.15rem',
      }}>
        {filteredVideos.map(ad => {
          const isRendering = generatingId === ad.id;
          return (
            <div
              key={ad.id}
              style={{
                backgroundColor: '#151822',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '22px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              {/* Preview Thumbnail Box */}
              <div
                style={{
                  height: '190px',
                  background: ad.accentGradient,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.5)',
                    border: `1px solid ${ad.themeColor}55`,
                    color: ad.themeColor,
                  }}>
                    {ad.badge} ({ad.aspectRatio})
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, background: 'rgba(0,0,0,0.5)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {ad.duration}
                  </span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'rgba(245, 185, 66, 0.2)',
                    border: '1.5px solid #f5b942',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    color: '#f5b942',
                  }}>
                    <Play size={20} fill="#f5b942" />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'Outfit' }}>
                    {ad.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {ad.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.64rem', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body Details */}
              <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 0.6rem' }}>
                    {ad.description}
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.55rem 0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.15rem' }}>Commercial Hook</div>
                    <div style={{ fontSize: '0.76rem', color: '#ffffff', fontWeight: 600 }}>"{ad.hook}"</div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  type="button"
                  disabled={isRendering}
                  onClick={() => handleDownloadVideo(ad)}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isRendering
                      ? 'rgba(245,185,66,0.3)'
                      : 'linear-gradient(135deg, #d4af37, #f5b942)',
                    color: '#0c0e14',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: isRendering ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 15px rgba(212,175,55,0.25)',
                  }}
                >
                  {isRendering ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Rendering Video ({generatingProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>Download Video to Device</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoAdsStudio;

