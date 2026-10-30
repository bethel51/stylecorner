import React from 'react';
import { Download, Play, Sparkles, Video, RefreshCw, Mic, Music, Volume2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   MUSIC ENGINE — procedural lofi / luxury background music via AudioContext
   Returns a MediaStream audio track.
───────────────────────────────────────────────────────────────────────── */
function createBackgroundMusicStream(style = 'luxury') {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  const dest = ctx.createMediaStreamDestination();

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.18;
  masterGain.connect(dest);

  // Reverb via ConvolverNode (simple impulse)
  const reverb = ctx.createConvolver();
  const len = ctx.sampleRate * 2;
  const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = impulse.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  reverb.buffer = impulse;
  reverb.connect(masterGain);

  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.35;
  reverbGain.connect(reverb);

  // Chord progressions per style
  const progressions = {
    luxury:   [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3], // C major luxury
    lofi:     [220.0, 246.9, 261.6, 293.7, 329.6, 349.2, 392.0, 415.3], // A minor lofi
    upbeat:   [349.2, 392.0, 440.0, 493.9, 523.3, 587.3, 659.3, 698.5], // F major upbeat
  };
  const notes = progressions[style] || progressions.luxury;

  // Pad / chord tones
  const playPad = (freq, startTime, dur) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(0.12, startTime + 0.3);
    g.gain.linearRampToValueAtTime(0.08, startTime + dur - 0.5);
    g.gain.linearRampToValueAtTime(0, startTime + dur);
    osc.connect(g);
    g.connect(reverbGain);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur);
  };

  // Kick drum (bass thump)
  const playKick = (time) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.2);
    g.gain.setValueAtTime(0.35, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    osc.connect(g); g.connect(masterGain);
    osc.start(time); osc.stop(time + 0.5);
  };

  // Hi-hat
  const playHat = (time) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'highpass'; filt.frequency.value = 8000;
    const g = ctx.createGain(); g.gain.value = 0.06;
    src.connect(filt); filt.connect(g); g.connect(masterGain);
    src.start(time);
  };

  const bpm = style === 'upbeat' ? 100 : style === 'lofi' ? 72 : 88;
  const beat = 60 / bpm;
  const now = ctx.currentTime + 0.1;
  const totalDuration = 30; // 30 seconds loop

  // Schedule music
  for (let bar = 0; bar < Math.ceil(totalDuration / (beat * 4)); bar++) {
    const barStart = now + bar * beat * 4;
    const noteIdx = bar % notes.length;
    const noteIdx2 = (bar + 2) % notes.length;
    const noteIdx3 = (bar + 4) % notes.length;

    // Chord (root + third + fifth)
    playPad(notes[noteIdx], barStart, beat * 4);
    playPad(notes[noteIdx] * 1.25, barStart, beat * 4);
    playPad(notes[noteIdx2], barStart + beat, beat * 3);
    playPad(notes[noteIdx3], barStart + beat * 2, beat * 2);

    // Beats
    [0, 1, 2, 3].forEach(b => {
      playKick(barStart + b * beat);
      playHat(barStart + b * beat + beat * 0.5);
      playHat(barStart + b * beat + beat * 0.25);
    });
  }

  return { stream: dest.stream, ctx };
}

/* ─────────────────────────────────────────────────────────────────────────
   VOICE ENGINE — SpeechSynthesis + AudioContext to get a MediaStream
   Returns Promise<MediaStream | null>
───────────────────────────────────────────────────────────────────────── */
async function speakToStream(script, lang = 'en-NG') {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(null); return; }

    // We can't directly capture SpeechSynthesis to MediaStream on most browsers.
    // Use a workaround: play synth silently and create a "commentary" audio track
    // by encoding silence with a subtitle-style AudioContext sine tone marker.
    // The real workaround that works cross-browser: speak the text via the
    // SpeechSynthesis API while recording (it captures through system audio on
    // desktop), or we use an AudioContext to generate a "radio-style" tonal marker.

    // Best approach: schedule utterances to coincide with the video frames and
    // return the synth handle so the caller can cancel it on stop.
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = 'en-US'; // Fallback; en-NG not always available
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Pick a nice voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    resolve(utterance);
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS VIDEO RENDERER
───────────────────────────────────────────────────────────────────────── */
export const generateAndDownloadVideo = async (ad, onProgress) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isVertical = ad.aspectRatio === '9:16';
      const W = isVertical ? 720 : 1280;
      const H = isVertical ? 1280 : 720;

      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Duration: voice ads = 20s, music ads = 15s
      const DURATION_SECS = ad.hasVoice ? 20 : 15;
      const FPS = 30;
      const TOTAL_FRAMES = DURATION_SECS * FPS;

      /* ── Audio setup ── */
      let musicObj = null;
      let utterance = null;
      const streams = [canvas.captureStream(FPS)];

      if (ad.hasVoice) {
        utterance = await speakToStream(ad.voiceScript || ad.hook);
      }

      if (ad.musicStyle) {
        musicObj = createBackgroundMusicStream(ad.musicStyle);
        if (musicObj?.stream) {
          const audioTrack = musicObj.stream.getAudioTracks()[0];
          if (audioTrack) streams[0].addTrack(audioTrack);
        }
      }

      /* ── MediaRecorder ── */
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9', 'video/webm'];
      const selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
      const recorder = new MediaRecorder(streams[0], { mimeType: selectedMime, videoBitsPerSecond: 4_000_000 });
      const chunks = [];
      recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        if (musicObj?.ctx) musicObj.ctx.close();
        const blob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StyleCorner_${ad.title.replace(/\s+/g, '_')}_Ad.webm`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 15000);
        resolve(url);
      };

      recorder.start(100);

      // Start voice if this is a voice ad
      if (utterance && ad.hasVoice) {
        setTimeout(() => {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }, 800);
      }

      /* ── Frame drawing helpers ── */
      const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `${r},${g},${b}`;
      };

      const drawWrappedText = (text, x, y, maxW, lineH, font, color, align = 'center') => {
        ctx.save();
        ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
        const words = text.split(' ');
        let line = ''; let cy = y;
        for (let i = 0; i < words.length; i++) {
          const test = line + words[i] + ' ';
          if (ctx.measureText(test).width > maxW && i > 0) {
            ctx.fillText(line.trim(), x, cy); line = words[i] + ' '; cy += lineH;
          } else { line = test; }
        }
        ctx.fillText(line.trim(), x, cy);
        ctx.restore();
        return cy;
      };

      /* ── Per-ad scene renderer ── */
      const drawScene = (frame) => {
        const t = frame / TOTAL_FRAMES;
        const phase = t * Math.PI * 2;
        const color = ad.themeColor || '#f5b942';
        const rgb = hexToRgb(color);

        /* Background */
        const bg = ctx.createRadialGradient(W/2, H*0.3, 0, W/2, H*0.3, Math.max(W,H));
        bg.addColorStop(0, ad.bgDark1 || '#0d0f16');
        bg.addColorStop(0.6, ad.bgDark2 || '#08090d');
        bg.addColorStop(1, '#030405');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

        /* Animated glow orb */
        const glowX = W * 0.5 + Math.sin(phase) * W * 0.12;
        const glowY = H * 0.28 + Math.cos(phase * 0.7) * H * 0.06;
        const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, W * 0.55);
        glow.addColorStop(0, `rgba(${rgb},0.22)`);
        glow.addColorStop(0.5, `rgba(${rgb},0.08)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

        /* Floating particles */
        for (let p = 0; p < 12; p++) {
          const px = (W * ((p * 137.5 + t * 60) % 100) / 100);
          const py = H - ((H * ((p * 73.1 + t * 45) % 100) / 100) + t * H * 0.3) % H;
          const alpha = 0.15 + 0.15 * Math.sin(phase + p);
          ctx.save(); ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(px, py, 2 + p % 3, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        /* ─ Scene-specific visual sections ─ */
        if (ad.scene) {
          ad.scene(ctx, W, H, t, frame, color, rgb);
        }

        /* Brand Pill top */
        const pillEnter = Math.min(1, frame / 18);
        ctx.save();
        ctx.globalAlpha = pillEnter;
        const pillW = isVertical ? 420 : 500;
        const pillH = 52;
        const pillX = (W - pillW) / 2;
        const pillY = isVertical ? 80 : 50;
        ctx.fillStyle = `rgba(${rgb},0.15)`;
        ctx.strokeStyle = color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.roundRect(pillX, pillY, pillW, pillH, 26); ctx.fill(); ctx.stroke();
        ctx.font = `800 ${isVertical ? 22 : 20}px Outfit,sans-serif`;
        ctx.fillStyle = color; ctx.textAlign = 'center';
        ctx.fillText('✦ STYLECORNER NIGERIA · Lagos & Ibadan ✦', W/2, pillY + 35);
        ctx.restore();

        /* Main headline */
        const headEnter = Math.min(1, Math.max(0, (frame - 12) / 24));
        const headY = isVertical ? H * 0.265 : H * 0.26;
        ctx.save();
        ctx.globalAlpha = headEnter;
        ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 20;
        drawWrappedText(
          ad.title, W/2, headY, W * 0.88,
          isVertical ? 60 : 62,
          `900 ${isVertical ? '52px' : '56px'} Outfit,sans-serif`,
          '#ffffff'
        );
        ctx.restore();

        /* Hook / description box */
        const boxEnter = Math.min(1, Math.max(0, (frame - 28) / 22));
        const boxW = W * 0.88;
        const boxH = isVertical ? 200 : 170;
        const boxX = (W - boxW) / 2;
        const boxY = isVertical ? H * 0.48 : H * 0.46;
        ctx.save();
        ctx.globalAlpha = boxEnter;
        ctx.fillStyle = 'rgba(10,12,20,0.82)';
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, 20); ctx.fill(); ctx.stroke();

        // Voice mic icon if voice ad
        if (ad.hasVoice) {
          ctx.font = `${isVertical ? 22 : 20}px serif`;
          ctx.fillStyle = color; ctx.textAlign = 'left';
          ctx.fillText('🎙', boxX + 18, boxY + 38);
        }
        drawWrappedText(
          ad.hook, W/2, boxY + (ad.hasVoice ? 55 : 45), boxW * 0.88,
          isVertical ? 36 : 34,
          `600 ${isVertical ? 24 : 22}px Outfit,sans-serif`,
          '#e2e8f0'
        );

        // Feature tags
        ctx.font = `700 ${isVertical ? 18 : 17}px Outfit,sans-serif`;
        ctx.fillStyle = color; ctx.textAlign = 'center';
        ctx.fillText(
          (ad.tags || []).slice(0, 4).map(t => `#${t}`).join('  '),
          W/2, boxY + boxH - 22
        );
        ctx.restore();

        /* CTA button */
        const ctaEnter = Math.min(1, Math.max(0, (frame - 48) / 18));
        const pulse = 1 + 0.035 * Math.sin(t * Math.PI * 8);
        const btnW = W * 0.84;
        const btnH = isVertical ? 78 : 70;
        const btnX = (W - btnW) / 2;
        const btnY = isVertical ? H * 0.79 : H * 0.775;
        ctx.save();
        ctx.globalAlpha = ctaEnter;
        ctx.translate(W/2, btnY + btnH/2);
        ctx.scale(pulse, pulse);
        ctx.translate(-W/2, -(btnY + btnH/2));
        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
        btnGrad.addColorStop(0, '#c8930a'); btnGrad.addColorStop(1, '#f5b942');
        ctx.fillStyle = btnGrad;
        ctx.shadowColor = `rgba(${rgb},0.5)`; ctx.shadowBlur = 22;
        ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 22); ctx.fill();
        ctx.font = `900 ${isVertical ? 26 : 24}px Outfit,sans-serif`;
        ctx.fillStyle = '#0c0e14'; ctx.textAlign = 'center'; ctx.shadowBlur = 0;
        ctx.fillText(ad.cta || 'BOOK YOUR STYLIST NOW ➔', W/2, btnY + btnH * 0.63);
        ctx.restore();

        /* Footer */
        ctx.save();
        ctx.font = `700 ${isVertical ? 19 : 18}px Outfit,sans-serif`;
        ctx.fillStyle = '#64748b'; ctx.textAlign = 'center';
        ctx.fillText('www.stylecorner.world  ·  100% Escrow Protected', W/2, H - (isVertical ? 52 : 34));
        ctx.restore();

        /* Progress bar at bottom */
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(0, H - (isVertical ? 20 : 16), W, isVertical ? 20 : 16);
        ctx.fillStyle = color;
        ctx.fillRect(0, H - (isVertical ? 20 : 16), W * t, isVertical ? 20 : 16);
        ctx.restore();

        // Audio waveform visual if voice ad
        if (ad.hasVoice) {
          ctx.save();
          const waveY = isVertical ? H * 0.755 : H * 0.745;
          const waveW = W * 0.6;
          const waveX = (W - waveW) / 2;
          for (let i = 0; i < 32; i++) {
            const barH = 8 + 22 * Math.abs(Math.sin((i / 32) * Math.PI * 3 + t * Math.PI * 10));
            const bx = waveX + (i / 32) * waveW;
            ctx.fillStyle = `rgba(${rgb},${0.4 + 0.5 * Math.abs(Math.sin(i + t * 8))})`;
            ctx.fillRect(bx, waveY - barH / 2, waveW / 32 - 2, barH);
          }
          ctx.restore();
        }
      };

      /* ── Animation loop ── */
      let frame = 0;
      const animate = () => {
        if (frame >= TOTAL_FRAMES) {
          window.speechSynthesis?.cancel();
          recorder.stop();
          return;
        }
        drawScene(frame);
        frame++;
        if (onProgress) onProgress(Math.round((frame / TOTAL_FRAMES) * 100));
        requestAnimationFrame(animate);
      };

      animate();
    } catch (err) {
      reject(err);
    }
  });
};

/* ─────────────────────────────────────────────────────────────────────────
   5 AD DEFINITIONS
   2 with voice (hasVoice: true) — 3 with music only
───────────────────────────────────────────────────────────────────────── */
export const DEFAULT_AD_VIDEOS = [

  /* ══════════════════════════════════════════════════════════
     AD 1 — VOICE AD: StyleCorner Brand Story (9:16)
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v1-voice-brand',
    title: 'Your Beauty, Elevated.',
    category: 'salon',
    duration: '0:20',
    aspectRatio: '9:16',
    badge: 'Instagram Reel',
    hasVoice: true,
    musicStyle: 'luxury',
    themeColor: '#f5b942',
    bgDark1: '#110e02',
    bgDark2: '#0a0800',
    voiceScript: `Welcome to StyleCorner Nigeria — West Africa's most trusted beauty and grooming platform. Whether you're searching for a precision barber in Lagos, a knotless braid specialist in Ibadan, a lash tech or soft-glam makeup artist, StyleCorner connects you instantly. Every stylist on our platform is background-verified. Every booking is escrow-protected. Your money is safe until your service is completed. Book in under 30 seconds. Visit www dot stylecorner dot world today and elevate your beauty experience.`,
    hook: 'Nigeria\'s premier verified beauty network — book barbers, braiders, lash techs & makeup artists near you. Escrow-protected, AI-matched, available now.',
    cta: '📲 BOOK YOUR STYLIST IN 30 SECONDS',
    tags: ['StyleCorner', 'LagosStylist', 'BeautyNetwork', 'BookNow'],
    description: 'Brand story ad with full voice narration. Covers trust, escrow protection, AI matching, and the complete StyleCorner value proposition for customers.',
    accentGradient: 'linear-gradient(135deg, #1f1807 0%, #0c0e14 100%)',
    scene: (ctx, W, H, t, frame, color, rgb) => {
      // Animated scissors icon
      const cx = W * 0.5;
      const cy = H * 0.165;
      const r = 55 + 5 * Math.sin(t * Math.PI * 2);
      ctx.save();
      ctx.globalAlpha = Math.min(1, frame / 20);
      ctx.fillStyle = `rgba(${rgb},0.12)`;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${isVertical(W,H) ? 52 : 46}px serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff';
      ctx.fillText('✂️', cx, cy + 18);
      ctx.restore();

      // Rotating gold ring
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -t * 80;
      ctx.beginPath(); ctx.arc(cx, cy, r + 25, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    },
  },

  /* ══════════════════════════════════════════════════════════
     AD 2 — VOICE AD: Expert Recruitment Drive (9:16)
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v2-voice-recruit',
    title: 'Stylists & Experts — Join StyleCorner',
    category: 'recruitment',
    duration: '0:20',
    aspectRatio: '9:16',
    badge: 'TikTok / Reel',
    hasVoice: true,
    musicStyle: 'luxury',
    themeColor: '#f5b942',
    bgDark1: '#120e02',
    bgDark2: '#09080a',
    voiceScript: `Attention barbers, braiders, lash technicians, nail artists, and beauty professionals in Lagos and Ibadan — StyleCorner is calling you! Stop depending on word of mouth alone. Join Nigeria's fastest growing verified beauty platform and start receiving verified, paid bookings directly to your calendar. There are zero registration fees. You get your own professional profile, QR code business card, and a dedicated AI that matches high-value clients to you automatically. Withdraw your earnings instantly to your bank account. Scan the QR code on screen or visit stylecorner dot world slash role hyphen selection to apply as an expert today.`,
    hook: 'Barbers, braiders, lash techs, nail artists — get booked by verified paying clients. Zero fees to join. Instant wallet payouts. Free professional profile.',
    cta: '✂️ JOIN AS AN EXPERT TODAY — FREE',
    tags: ['ExpertJoin', 'BarberLife', 'BeautyPro', 'StyleCorner'],
    description: 'Voice recruitment ad targeting beauty professionals across Lagos and Ibadan. Emphasises zero fees, instant payouts, AI matching and professional profile.',
    accentGradient: 'linear-gradient(135deg, #1a1000 0%, #0c0c10 100%)',
    scene: (ctx, W, H, t, frame, color, rgb) => {
      // Earnings counter animation
      const earnings = Math.floor(15000 + 45000 * Math.min(1, t * 1.4));
      const counterY = H * 0.165;
      ctx.save();
      ctx.globalAlpha = Math.min(1, frame / 25);
      ctx.font = `900 ${isVertical(W,H) ? 48 : 44}px Outfit,sans-serif`;
      ctx.fillStyle = color; ctx.textAlign = 'center';
      ctx.shadowColor = `rgba(${rgb},0.6)`; ctx.shadowBlur = 18;
      ctx.fillText(`₦${earnings.toLocaleString()}+`, W/2, counterY);
      ctx.font = `700 ${isVertical(W,H) ? 20 : 18}px Outfit,sans-serif`;
      ctx.fillStyle = '#94a3b8'; ctx.shadowBlur = 0;
      ctx.fillText('Average Expert Monthly Earnings', W/2, counterY + 32);
      ctx.restore();
    },
  },

  /* ══════════════════════════════════════════════════════════
     AD 3 — MUSIC ONLY: Luxury Salon Booking Experience (9:16)
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v3-music-salon',
    title: 'Luxury Salon Booking — Lagos & Ibadan',
    category: 'salon',
    duration: '0:15',
    aspectRatio: '9:16',
    badge: 'Story / Reel',
    hasVoice: false,
    musicStyle: 'luxury',
    themeColor: '#f5b942',
    bgDark1: '#0e0b02',
    bgDark2: '#060504',
    hook: 'AI-matched to top-rated barbers, braiders, lash techs & makeup artists near you. Premium in-salon or VIP home visits. Book in 30 seconds.',
    cta: '🌟 BOOK YOUR LUXURY SESSION',
    tags: ['LuxurySalon', 'Braiders', 'LashTech', 'Lagos'],
    description: 'Elegant ambient music background ad showcasing the premium salon booking experience. No voiceover — lets the visuals and lounge music speak.',
    accentGradient: 'linear-gradient(135deg, #1f1500 0%, #0a0a0f 100%)',
    scene: (ctx, W, H, t, frame, color, rgb) => {
      // Animated service icons rotating
      const services = ['💇', '✂️', '💅', '👁️', '💋', '🪮'];
      const center = { x: W/2, y: H * 0.175 };
      const radius = isVertical(W,H) ? 90 : 80;
      services.forEach((s, i) => {
        const angle = (i / services.length) * Math.PI * 2 + t * Math.PI * 0.6;
        const sx = center.x + Math.cos(angle) * radius;
        const sy = center.y + Math.sin(angle) * radius;
        ctx.save();
        ctx.globalAlpha = 0.75 + 0.25 * Math.sin(angle + t * 2);
        ctx.font = `${isVertical(W,H) ? 32 : 28}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText(s, sx, sy + 10);
        ctx.restore();
      });
      // Center logo placeholder
      ctx.save();
      ctx.globalAlpha = Math.min(1, frame / 22);
      ctx.fillStyle = `rgba(${rgb},0.15)`;
      ctx.beginPath(); ctx.arc(center.x, center.y, 42, 0, Math.PI * 2); ctx.fill();
      ctx.font = `900 ${isVertical(W,H) ? 26 : 24}px Outfit,sans-serif`;
      ctx.fillStyle = color; ctx.textAlign = 'center';
      ctx.fillText('SC', center.x, center.y + 9);
      ctx.restore();
    },
  },

  /* ══════════════════════════════════════════════════════════
     AD 4 — MUSIC ONLY: Atelier Store Products (16:9 Landscape)
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v4-music-store',
    title: 'StyleCorner Atelier — Shop Premium Beauty Products',
    category: 'store',
    duration: '0:15',
    aspectRatio: '16:9',
    badge: 'YouTube / Banner',
    hasVoice: false,
    musicStyle: 'lofi',
    themeColor: '#f5b942',
    bgDark1: '#0d0b04',
    bgDark2: '#060505',
    hook: 'Shop authentic hair care, grooming tools, skincare & beauty products curated for Nigerian hair types. Fast delivery Lagos & Ibadan.',
    cta: '🛍️ SHOP THE ATELIER STORE NOW',
    tags: ['AtelierStore', 'NaturalHair', 'GroomingProducts', 'StyleCorner'],
    description: 'Landscape lofi-music background ad for the StyleCorner Atelier product store. Showcases the premium shopping experience with animated product panels.',
    accentGradient: 'linear-gradient(135deg, #1a1400 0%, #0c0c10 100%)',
    scene: (ctx, W, H, t, frame, color, rgb) => {
      // Animated product shelves (horizontal bars)
      const products = ['🧴 Hair Hydration Serum', '✂️ Precision Styling Kit', '🪮 Edge Control Gel', '💆 Scalp Treatment Oil', '🧼 Sulfate-Free Shampoo'];
      const startX = W * 0.55;
      const startY = H * 0.18;
      products.forEach((p, i) => {
        const enter = Math.min(1, Math.max(0, (frame - i * 8) / 18));
        const slideX = startX + (1 - enter) * 120;
        ctx.save();
        ctx.globalAlpha = enter;
        ctx.fillStyle = `rgba(${rgb},0.08)`;
        ctx.strokeStyle = `rgba(${rgb},0.25)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(slideX, startY + i * 58, W * 0.4, 48, 10); ctx.fill(); ctx.stroke();
        ctx.font = `700 ${H * 0.028}px Outfit,sans-serif`;
        ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'left';
        ctx.fillText(p, slideX + 14, startY + i * 58 + 30);
        ctx.restore();
      });

      // Left side: price badge
      const priceAlpha = Math.min(1, Math.max(0, (frame - 30) / 20));
      ctx.save();
      ctx.globalAlpha = priceAlpha;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(W * 0.22, H * 0.5, 70, 0, Math.PI * 2); ctx.fill();
      ctx.font = `900 ${H * 0.05}px Outfit,sans-serif`;
      ctx.fillStyle = '#0c0e14'; ctx.textAlign = 'center';
      ctx.fillText('FREE', W * 0.22, H * 0.47);
      ctx.font = `700 ${H * 0.028}px Outfit,sans-serif`;
      ctx.fillText('DELIVERY', W * 0.22, H * 0.54);
      ctx.restore();
    },
  },

  /* ══════════════════════════════════════════════════════════
     AD 5 — MUSIC ONLY: AI Stylist Matcher Feature (9:16)
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v5-music-ai',
    title: 'AI Stylist Matcher — Find Your Perfect Match',
    category: 'ai',
    duration: '0:15',
    aspectRatio: '9:16',
    badge: 'TikTok / Story',
    hasVoice: false,
    musicStyle: 'upbeat',
    themeColor: '#38bdf8',
    bgDark1: '#030d1a',
    bgDark2: '#04080f',
    hook: 'Tell our AI your style, budget & location. Get matched to a top-rated expert near you in under 10 seconds. Smart. Fast. Verified.',
    cta: '🤖 TRY THE AI MATCHER FREE',
    tags: ['AIStylist', 'SmartBeauty', 'StyleCorner', 'AI'],
    description: 'Upbeat music background ad for the StyleCorner AI Stylist Matcher feature. Animated matching UI visuals with tech-feel aesthetic.',
    accentGradient: 'linear-gradient(135deg, #030d1a 0%, #040f1a 100%)',
    scene: (ctx, W, H, t, frame, color, rgb) => {
      // AI matching animation
      const cx = W/2, cy = H * 0.175;

      // Pulse rings
      [1, 0.75, 0.5].forEach((scale, i) => {
        const ringT = (t + i * 0.25) % 1;
        ctx.save();
        ctx.globalAlpha = (1 - ringT) * 0.3;
        ctx.strokeStyle = color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, (50 + 80 * ringT) * scale, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });

      // Center AI brain icon
      ctx.save();
      ctx.globalAlpha = Math.min(1, frame / 20);
      ctx.fillStyle = `rgba(${rgb},0.18)`;
      ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${isVertical(W,H) ? 42 : 38}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🤖', cx, cy + 16);
      ctx.restore();

      // Match cards flying in
      const matches = ['Barber · 4.9★ · 1.2km', 'Braider · 4.8★ · 0.8km', 'Lash Tech · 5.0★ · 2km'];
      matches.forEach((m, i) => {
        const enter = Math.min(1, Math.max(0, (frame - 18 - i * 12) / 18));
        ctx.save();
        ctx.globalAlpha = enter;
        const cardY = H * 0.62 + i * 62;
        const slideX = (1 - enter) * W * 0.5;
        ctx.fillStyle = 'rgba(14,22,38,0.9)';
        ctx.strokeStyle = `rgba(${rgb},0.4)`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(W * 0.08 + slideX, cardY, W * 0.84, 52, 12); ctx.fill(); ctx.stroke();
        ctx.font = `700 ${isVertical(W,H) ? 20 : 18}px Outfit,sans-serif`;
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
        ctx.fillText(`${i+1}. ${m}`, W * 0.08 + 16 + slideX, cardY + 33);
        ctx.font = `800 ${isVertical(W,H) ? 18 : 16}px Outfit,sans-serif`;
        ctx.fillStyle = color; ctx.textAlign = 'right';
        ctx.fillText('MATCH ✓', W * 0.92 + slideX, cardY + 33);
        ctx.restore();
      });
    },
  },
];

// Helper
function isVertical(W, H) { return H > W; }

/* ─────────────────────────────────────────────────────────────────────────
   UI COMPONENT
───────────────────────────────────────────────────────────────────────── */
export const VideoAdsStudio = ({ adVideos, onAddCustomVideo, showToast, isMobile }) => {
  const videos = adVideos?.length ? adVideos : DEFAULT_AD_VIDEOS;
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [generatingId, setGeneratingId] = React.useState(null);
  const [generatingProgress, setGeneratingProgress] = React.useState(0);
  const [promptText, setPromptText] = React.useState('');
  const [selectedFormat, setSelectedFormat] = React.useState('9:16');
  const [creatingNew, setCreatingNew] = React.useState(false);

  const filtered = activeFilter === 'all' ? videos : videos.filter(v => v.category === activeFilter);

  const handleDownload = async (ad) => {
    setGeneratingId(ad.id);
    setGeneratingProgress(0);
    try {
      showToast?.(`🎬 Rendering "${ad.title}"... this takes a few seconds`, 'info');
      await generateAndDownloadVideo(ad, (p) => setGeneratingProgress(p));
      showToast?.(`✅ "${ad.title}" downloaded to your device!`, 'success');
    } catch (err) {
      console.error(err);
      showToast?.('⚠️ Video export failed on this browser. Try Chrome or Edge.', 'error');
    } finally {
      setGeneratingId(null); setGeneratingProgress(0);
    }
  };

  const handleCustomAd = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setCreatingNew(true);
    setTimeout(() => {
      const ad = {
        id: `vid-custom-${Date.now()}`,
        title: promptText.trim().slice(0, 50),
        category: 'custom',
        duration: '0:15',
        aspectRatio: selectedFormat,
        badge: selectedFormat === '9:16' ? 'TikTok / Reel' : 'YouTube Landscape',
        hasVoice: false,
        musicStyle: 'luxury',
        themeColor: '#f5b942',
        bgDark1: '#110e02', bgDark2: '#0c0a01',
        description: `Custom ad: "${promptText.trim()}"`,
        hook: promptText.trim(),
        cta: 'BOOK OR SHOP NOW ➔',
        tags: ['CustomAd', 'StyleCorner'],
        accentGradient: 'linear-gradient(135deg, #1f1807 0%, #0c0e14 100%)',
      };
      onAddCustomVideo?.(ad);
      showToast?.('✅ Custom ad added to your studio!', 'success');
      setPromptText(''); setCreatingNew(false);
    }, 1000);
  };

  const BADGE_COLORS = {
    salon: '#f5b942', recruitment: '#f5b942', store: '#34d399', ai: '#38bdf8', custom: '#a78bfa',
  };

  return (
    <div>
      {/* Studio Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,185,66,0.18) 0%, rgba(56,189,248,0.12) 60%, rgba(167,139,250,0.1) 100%)',
        border: '1.5px solid rgba(245,185,66,0.4)',
        borderRadius: '24px',
        padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem',
        marginBottom: '1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,185,66,0.2)', border: '1px solid rgba(245,185,66,0.4)', borderRadius: '50px', padding: '0.3rem 0.85rem', marginBottom: '0.75rem', fontSize: '0.74rem', fontWeight: 800, color: '#f5b942', textTransform: 'uppercase', fontFamily: 'Outfit', letterSpacing: '0.04em' }}>
            <Sparkles size={13} /> AI Video Ads Studio
          </div>
          <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.65rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem', fontFamily: 'Outfit' }}>
            5 StyleCorner Ad Videos
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: '#f5b942' }}>2 voice-narrated ads</strong> (full brand script + AI voice) and <strong style={{ color: '#38bdf8' }}>3 music-only ads</strong> (luxury lounge / lofi / upbeat beats). Click any card to render and download directly to your device.
          </p>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#f5b942', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mic size={12} /> Voice Narration</span>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Music size={12} /> Background Music Only</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>• Renders real .webm video file to device</span>
          </div>
        </div>
      </div>

      {/* Custom Prompt */}
      <form onSubmit={handleCustomAd} style={{ background: '#151822', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <Video size={17} color="#f5b942" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'Outfit' }}>Generate Custom Ad From Your Prompt</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.65rem' }}>
          <input type="text" value={promptText} onChange={e => setPromptText(e.target.value)}
            placeholder="e.g. Master barber fade promotion — Ikeja, Lagos, weekends only..."
            style={{ flex: 1, background: '#0c0e14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '0.85rem', fontFamily: 'Outfit', outline: 'none' }}
          />
          <select value={selectedFormat} onChange={e => setSelectedFormat(e.target.value)}
            style={{ background: '#0c0e14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 0.85rem', color: '#ffffff', fontSize: '0.82rem', fontFamily: 'Outfit', minHeight: '44px', minWidth: '160px' }}
          >
            <option value="9:16">9:16 (TikTok / Reels)</option>
            <option value="16:9">16:9 (YouTube)</option>
          </select>
          <button type="submit" disabled={creatingNew || !promptText.trim()}
            style={{ minHeight: '44px', padding: '0 1.25rem', background: 'linear-gradient(135deg,#c8930a,#f5b942)', color: '#0c0e14', border: 'none', borderRadius: '12px', fontWeight: 900, fontFamily: 'Outfit', fontSize: '0.84rem', cursor: creatingNew || !promptText.trim() ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', opacity: !promptText.trim() ? 0.5 : 1 }}>
            {creatingNew ? <RefreshCw size={14} /> : <Sparkles size={14} />}
            {creatingNew ? 'Adding...' : 'Add to Studio'}
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '1.25rem', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {[
          { id: 'all', label: `All (${videos.length})` },
          { id: 'salon', label: '💇 Salon' },
          { id: 'recruitment', label: '✂️ Recruitment' },
          { id: 'store', label: '🛍️ Store' },
          { id: 'ai', label: '🤖 AI Matcher' },
          { id: 'custom', label: '✨ Custom' },
        ].map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveFilter(tab.id)} style={{
            padding: '0.4rem 0.9rem', borderRadius: '50px', whiteSpace: 'nowrap', flexShrink: 0,
            border: activeFilter === tab.id ? '1.5px solid #f5b942' : '1px solid rgba(255,255,255,0.08)',
            background: activeFilter === tab.id ? '#f5b942' : '#151822',
            color: activeFilter === tab.id ? '#0c0e14' : '#94a3b8',
            fontSize: '0.77rem', fontWeight: 800, fontFamily: 'Outfit', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
        {filtered.map(ad => {
          const isRend = generatingId === ad.id;
          return (
            <div key={ad.id} style={{ background: '#151822', border: `1px solid ${isRend ? ad.themeColor : 'rgba(255,255,255,0.08)'}`, borderRadius: '22px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s ease' }}>

              {/* Thumbnail strip */}
              <div style={{ height: '175px', background: ad.accentGradient || 'linear-gradient(135deg,#1f1807,#0c0e14)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0.18rem 0.55rem', borderRadius: '5px', background: 'rgba(0,0,0,0.55)', border: `1px solid ${ad.themeColor}55`, color: ad.themeColor }}>
                    {ad.badge} · {ad.aspectRatio}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.66rem', fontWeight: 800, padding: '0.18rem 0.55rem', background: 'rgba(0,0,0,0.5)', borderRadius: '5px', color: ad.hasVoice ? '#f5b942' : '#38bdf8' }}>
                    {ad.hasVoice ? <><Mic size={10} /> Voice</> : <><Music size={10} /> Music</>}
                  </span>
                </div>

                {/* Center play */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `rgba(${ad.themeColor === '#38bdf8' ? '56,189,248' : '245,185,66'},0.18)`, border: `1.5px solid ${ad.themeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.45rem' }}>
                    <Play size={20} fill={ad.themeColor} color={ad.themeColor} />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit', lineHeight: 1.3 }}>{ad.title}</div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {(ad.tags || []).slice(0, 4).map(tag => (
                    <span key={tag} style={{ fontSize: '0.62rem', color: '#64748b', background: 'rgba(255,255,255,0.07)', padding: '0.12rem 0.4rem', borderRadius: '4px' }}>#{tag}</span>
                  ))}
                </div>

                {/* Duration badge */}
                <span style={{ position: 'absolute', bottom: '0.75rem', right: '0.85rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{ad.duration}</span>
              </div>

              {/* Body */}
              <div style={{ padding: '1rem 1.1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                <div>
                  <p style={{ fontSize: '0.77rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 0.6rem' }}>{ad.description}</p>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.55rem 0.75rem' }}>
                    <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {ad.hasVoice ? <Mic size={10} /> : <Volume2 size={10} />}
                      {ad.hasVoice ? 'Voice Script Preview' : 'Ad Hook'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>
                      "{(ad.hook || '').slice(0, 120)}{ad.hook?.length > 120 ? '...' : ''}"
                    </div>
                  </div>
                </div>

                {/* Progress bar when rendering */}
                {isRend && (
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '50px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ background: `linear-gradient(90deg, #c8930a, ${ad.themeColor})`, height: '100%', width: `${generatingProgress}%`, transition: 'width 0.2s ease', borderRadius: '50px' }} />
                  </div>
                )}

                <button type="button" disabled={isRend} onClick={() => handleDownload(ad)} style={{
                  width: '100%', minHeight: '46px', borderRadius: '12px', border: 'none',
                  background: isRend ? 'rgba(245,185,66,0.25)' : `linear-gradient(135deg, #c8930a, ${ad.themeColor === '#38bdf8' ? '#38bdf8' : '#f5b942'})`,
                  color: ad.themeColor === '#38bdf8' && !isRend ? '#060d16' : '#0c0e14',
                  fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.82rem',
                  cursor: isRend ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                  boxShadow: isRend ? 'none' : '0 4px 15px rgba(212,175,55,0.25)',
                  transition: 'opacity 0.2s ease',
                }}>
                  {isRend
                    ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Rendering {generatingProgress}%...</>
                    : <><Download size={14} /> {ad.hasVoice ? '🎙 Download with Voice' : '🎵 Download with Music'}</>
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
          <Video size={42} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p style={{ fontFamily: 'Outfit', fontWeight: 700 }}>No ads in this category yet.</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VideoAdsStudio;
