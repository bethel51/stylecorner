import React, { useState, useEffect, useRef } from 'react';
import { Download, Play, Pause, RotateCcw, Sparkles, Video, RefreshCw, Mic, Music, Volume2, VolumeX, X, Maximize, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   PROCEDURAL LUXURY BACKGROUND MUSIC ENGINE (Web AudioContext)
───────────────────────────────────────────────────────────────────────────── */
function createBackgroundMusicEngine(style = 'luxury') {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  const dest = ctx.createMediaStreamDestination ? ctx.createMediaStreamDestination() : null;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.22;
  masterGain.connect(ctx.destination);
  if (dest) masterGain.connect(dest);

  // Reverb impulse
  const reverb = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 1.5);
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

  const chords = {
    luxury:    [261.6, 329.6, 392.0, 523.3], // C major luxury chord
    lofi:      [220.0, 261.6, 329.6, 440.0], // A minor lofi chill
    upbeat:    [349.2, 440.0, 523.3, 659.3], // F major modern kinetic
    cinematic: [130.8, 196.0, 261.6, 329.6, 392.0], // Cinematic orchestral build
  };
  const notes = chords[style] || chords.luxury;

  let isRunning = true;
  let nextBeatTime = ctx.currentTime + 0.1;
  const bpm = style === 'cinematic' ? 96 : style === 'upbeat' ? 104 : style === 'lofi' ? 72 : 86;
  const beat = 60 / bpm;

  const schedulePad = (freq, time, dur) => {
    if (!isRunning) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.001, time);
    g.gain.linearRampToValueAtTime(0.09, time + 0.2);
    g.gain.linearRampToValueAtTime(0.001, time + dur);
    osc.connect(g);
    g.connect(reverbGain);
    g.connect(masterGain);
    osc.start(time);
    osc.stop(time + dur);
  };

  const scheduleImpact = (time) => {
    if (!isRunning) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, time);
    osc.frequency.exponentialRampToValueAtTime(28, time + 1.2);
    g.gain.setValueAtTime(0.4, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 1.4);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(time);
    osc.stop(time + 1.5);
  };

  const scheduleThump = (time) => {
    if (!isRunning) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.18);
    g.gain.setValueAtTime(0.25, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.3);
  };

  // Initial cinematic boom if cinematic
  if (style === 'cinematic') {
    scheduleImpact(ctx.currentTime + 0.05);
  }

  let step = 0;
  const timer = setInterval(() => {
    if (!isRunning || ctx.state === 'closed') {
      clearInterval(timer);
      return;
    }
    while (nextBeatTime < ctx.currentTime + 1.0) {
      if (step % 4 === 0) {
        notes.forEach((f) => schedulePad(f, nextBeatTime, beat * 3.5));
      }
      if (step % 2 === 0) {
        scheduleThump(nextBeatTime);
      }
      nextBeatTime += beat;
      step++;
    }
  }, 200);

  return {
    stream: dest?.stream || null,
    ctx,
    stop: () => {
      isRunning = false;
      clearInterval(timer);
      try { ctx.close(); } catch (_) {}
    },
    setMute: (muted) => {
      masterGain.gain.value = muted ? 0 : 0.22;
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   8 COMPLETE COMMERCIAL ADS DATA (Including 3 High-Production Motion Graphics)
───────────────────────────────────────────────────────────────────────────── */
export const DEFAULT_AD_VIDEOS = [
  /* ══════════════════════════════════════════════════════════
     FLAGSHIP MASTER COMMERCIAL: Premium Cinematic Brand Film (60s)
     Director's Cut · 6-Scene Narrative Arc
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v0-cinematic-flagship',
    title: 'STYLECORNER — The Cinematic Brand Commercial',
    category: 'flagship',
    duration: 55,
    durationText: '0:55',
    aspectRatio: '9:16',
    badge: '👑 Flagship Film · Director\'s Cut',
    hasVoice: true,
    musicStyle: 'cinematic',
    themeColor: '#f5b942',
    accentGradient: 'linear-gradient(135deg, #3d2303 0%, #08090d 50%, #1c1103 100%)',
    hook: 'A 6-act international-grade commercial: The Problem, The Discovery, 8 Beauty Experiences, 6-Step Workflow, The Glow Transformation, and The Anthem Finale.',
    voiceScript: "Looking good shouldn't be complicated. The endless searching, unconfirmed bookings, and waiting for replies... It ends today. Meet StyleCorner. Your beauty. Your expert. Your convenience. From precision fades and knotless goddess braids, to melted frontal installs, volume lashes, pedicures, and nail artistry. Book your verified specialist in thirty seconds with complete escrow protection. Watch your expert accept in real-time, get pampered in-salon or at home, and release payment only when you are thrilled. Find your expert. Book your service. Own your look. StyleCorner. Beauty meets convenience. Start your experience today at stylecorner dot world.",
    cta: '👑 BOOK YOUR CINEMATIC EXPERIENCE',
    tags: ['MasterCommercial', 'CinematicFilm', 'DirectorsCut', 'StyleCornerOriginal', 'LagosBeauty'],
    description: 'World-class 6-scene cinematic brand commercial directed in the style of Apple, Nike, and Coca-Cola. Includes dramatic problem setup, smartphone app discovery, 8-service rapid match cuts, animated 6-step platform workflow, radiant transformations, and monumental brand anthem finale.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 1 — ANIMATED HUMANS: Live Master Barber Session
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v9-human-barber',
    title: 'Live Barber Session — Master Fade & Hot Razor Lineup',
    category: 'characters',
    duration: 20,
    durationText: '0:20',
    aspectRatio: '9:16',
    badge: 'Animated Humans · 60fps',
    hasVoice: true,
    musicStyle: 'upbeat',
    themeColor: '#f5b942',
    accentGradient: 'linear-gradient(135deg, #2b1800 0%, #0d0a14 100%)',
    hook: 'Live animated master barber sculpting a skin fade with gold clippers, razor lineup, dynamic particle fade, and 5-star client reaction.',
    voiceScript: "Experience the ultimate barber cut without the wait. Our verified master barbers deliver razor-sharp taper fades, crisp beard lineups, and hot towel pampering. Every cut is backed by our complete satisfaction guarantee. Ready for your sharpest look yet? Book your chair today on stylecorner dot world.",
    cta: '✂️ BOOK YOUR MASTER BARBER',
    tags: ['MasterBarber', 'AnimatedHumans', 'SkinFade', 'LagosGrooming'],
    description: 'Cinematic animated commercial featuring a live master barber giving a precision skin taper fade to a seated client with vibrating clippers, comb action, razor glint, and 5-star reaction.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 2 — ANIMATED HUMANS: Knotless Goddess Braids & Glam
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v10-human-braids',
    title: 'Live Braids Session — Knotless Goddess Braids & Glam',
    category: 'characters',
    duration: 20,
    durationText: '0:20',
    aspectRatio: '9:16',
    badge: 'Animated Humans · 60fps',
    hasVoice: true,
    musicStyle: 'luxury',
    themeColor: '#e879f9',
    accentGradient: 'linear-gradient(135deg, #2b0825 0%, #0d0a14 100%)',
    hook: 'Live animated braider weaving knotless braids with dynamic hair physics sway, glinting gold cuffs, sheen mist spray, and radiant client transformation.',
    voiceScript: "Tired of spending your entire Saturday in a cramped salon? StyleCorner connects you with elite braiders for painless, knotless goddess braids and flawless frontal installs in record time. Escrow-protected payments and five-star verified specialists in Lagos and Ibadan. Book your transformation now at stylecorner dot world.",
    cta: '✨ BOOK YOUR TOP BRAIDER NOW',
    tags: ['GoddessBraids', 'AnimatedHumans', 'HairPhysics', 'LekkiBraiders'],
    description: 'High-energy animated commercial featuring a master stylist weaving knotless braids with realistic hair physics, gold jewelry cuffs, salon vanity bulbs, and instant glowing mirror review.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 3 — MOTION GRAPHICS: The 30-Second Booking Journey
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v6-motion-journey',
    title: 'Kinetic Workflow — 30s Booking Journey',
    category: 'motion',
    duration: 20,
    durationText: '0:20',
    aspectRatio: '9:16',
    badge: 'Motion Graphics · 4K 60fps',
    hasVoice: true,
    musicStyle: 'upbeat',
    themeColor: '#f5b942',
    accentGradient: 'linear-gradient(135deg, #2b1800 0%, #0d0a14 100%)',
    hook: 'Step-by-step kinetic workflow: 1. Search style, 2. AI matches top verified stylists in Lagos & Ibadan, 3. Escrow locked, 4. Instant glam.',
    voiceScript: "Need your hair braided or a fresh fade today? Step one: open StyleCorner and search your desired look. Step two: our smart AI locks onto vetted specialists in your neighborhood with real client ratings. Step three: book with escrow protection. Your money is safe until you are completely satisfied. Look fresh with zero stress. Book now on stylecorner dot world.",
    cta: '⚡ START YOUR 30S BOOKING',
    tags: ['MotionGraphics', 'BookingWorkflow', 'StyleCornerAI', 'EscrowSafe'],
    description: 'Kinetic motion graphics commercial demonstrating the 3-step transformation: search query, AI radar specialist lock-on, and escrow vault guarantee.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 2 — MOTION GRAPHICS: Pro Stylist Calendar & Revenue Growth
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v7-motion-pro-earnings',
    title: 'Kinetic Growth — Stylist Bookings & Payouts',
    category: 'motion',
    duration: 20,
    durationText: '0:20',
    aspectRatio: '9:16',
    badge: 'Motion Graphics · Pro Revenue',
    hasVoice: true,
    musicStyle: 'luxury',
    themeColor: '#f59e0b',
    accentGradient: 'linear-gradient(135deg, #251200 0%, #0c0915 100%)',
    hook: 'Kinetic infographic showing live calendar bookings filling up, live revenue ticker from ₦0 to ₦185,000, and 1-tap instant bank transfer.',
    voiceScript: "Attention barbers, braiders and beauty specialists! Watch your weekly calendar fill up automatically with paying clients. With StyleCorner Pro, withdraw your daily earnings instantly to any Nigerian bank account. Keep one hundred percent of your tips. Zero registration fees. Build your brand with a free QR business profile. Apply today at stylecorner dot world slash role hyphen selection.",
    cta: '✂️ JOIN STYLECORNER PRO TODAY',
    tags: ['ProGrowth', 'BarberEarnings', 'InstantPayout', 'ZeroFees'],
    description: 'Infographic motion graphics commercial for beauty pros. Dynamic weekly calendar filling up, live digital Naira revenue ticker, and instant bank wire animation.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 3 — MOTION GRAPHICS: VIP At-Home Glam Experience
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v8-motion-vip-home',
    title: 'VIP At-Home Glam — Skip the Lagos Traffic',
    category: 'motion',
    duration: 18,
    durationText: '0:18',
    aspectRatio: '9:16',
    badge: 'Motion Graphics · VIP Mobile',
    hasVoice: false,
    musicStyle: 'luxury',
    themeColor: '#e879f9',
    accentGradient: 'linear-gradient(135deg, #250222 0%, #0c0812 100%)',
    hook: 'Skip the 3-hour Lagos traffic. Book vetted braiders, barbers, lash techs & nail artists directly to your living room or hotel suite in comfort.',
    cta: '🌟 BOOK VIP HOME GLAM VISIT',
    tags: ['VIPHomeVisit', 'NoTraffic', 'LuxuryGlam', 'LagosVIP'],
    description: 'Cinematic motion graphics commercial comparing painful Lagos traffic vs luxurious AC living-room beauty appointments with verified mobile artists.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 4 — VOICE AD: StyleCorner Brand Story
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v1-voice-brand',
    title: 'Your Beauty, Elevated.',
    category: 'salon',
    duration: 20,
    durationText: '0:20',
    aspectRatio: '9:16',
    badge: 'Instagram Reel / TikTok',
    hasVoice: true,
    musicStyle: 'luxury',
    themeColor: '#f5b942',
    accentGradient: 'linear-gradient(135deg, #1f1807 0%, #0c0e14 100%)',
    hook: 'West Africa\'s premier verified beauty network — book verified braiders, barbers, lash techs & makeup artists in seconds. Escrow protected.',
    voiceScript: "Welcome to StyleCorner Nigeria — Lagos and Ibadan's premier beauty network. Book background-verified barbers, braiders, lash techs and makeup artists in under thirty seconds. In-salon or VIP home service. One hundred percent escrow protected. Visit stylecorner dot world today.",
    cta: '📲 BOOK YOUR STYLIST NOW',
    tags: ['StyleCorner', 'LagosStylist', 'BeautyNetwork', 'BookNow'],
    description: 'Full voice narrated brand commercial. Highlights verified specialists, 100% escrow protection, and 30-second mobile booking.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 5 — VOICE AD: Expert Recruitment Drive
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v2-voice-recruit',
    title: 'Stylists & Pros — Join StyleCorner',
    category: 'recruitment',
    duration: 20,
    durationText: '0:20',
    aspectRatio: '9:16',
    badge: 'TikTok / Reel',
    hasVoice: true,
    musicStyle: 'luxury',
    themeColor: '#f5b942',
    accentGradient: 'linear-gradient(135deg, #1a1000 0%, #0c0c10 100%)',
    hook: 'Barbers, braiders, lash techs, nail artists — get booked by verified paying clients. Zero fees to join. Instant wallet payouts. Free profile.',
    voiceScript: "Calling all barbers, braiders, lash techs and beauty professionals in Lagos and Ibadan! Stop waiting for clients. Join StyleCorner Pro. Free professional profile, verified clients, and instant wallet payouts to your bank account. Zero registration fees. Apply free today.",
    cta: '✂️ JOIN AS AN EXPERT — FREE',
    tags: ['ExpertJoin', 'BarberLife', 'BeautyPro', 'StyleCorner'],
    description: 'Expert recruitment commercial with full voiceover. Focuses on zero fees, instant bank payouts, and guaranteed client bookings.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 6 — MUSIC ONLY: Luxury Salon Booking Experience
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v3-music-salon',
    title: 'Luxury Salon Booking — Lagos & Ibadan',
    category: 'salon',
    duration: 15,
    durationText: '0:15',
    aspectRatio: '9:16',
    badge: 'Story / Reel',
    hasVoice: false,
    musicStyle: 'luxury',
    themeColor: '#f5b942',
    accentGradient: 'linear-gradient(135deg, #1f1500 0%, #0a0a0f 100%)',
    hook: 'AI-matched to top-rated barbers, braiders, lash techs & makeup artists near you. Premium in-salon or VIP home visits. Book in 30 seconds.',
    cta: '🌟 BOOK YOUR LUXURY SESSION',
    tags: ['LuxurySalon', 'Braiders', 'LashTech', 'Lagos'],
    description: 'Luxury lounge music commercial. Highlighting the 5-star beauty booking experience, rotating services, and seamless appointments.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 7 — MUSIC ONLY: Atelier Store Products
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v4-music-store',
    title: 'StyleCorner Atelier — Premium Beauty Products',
    category: 'store',
    duration: 15,
    durationText: '0:15',
    aspectRatio: '16:9',
    badge: 'YouTube / Banner',
    hasVoice: false,
    musicStyle: 'lofi',
    themeColor: '#34d399',
    accentGradient: 'linear-gradient(135deg, #022013 0%, #0c0e14 100%)',
    hook: 'Shop authentic hair care, grooming tools, skincare & beauty products curated for Nigerian hair types. Fast delivery Lagos & Ibadan.',
    cta: '🛍️ SHOP THE ATELIER STORE NOW',
    tags: ['AtelierStore', 'NaturalHair', 'GroomingProducts', 'StyleCorner'],
    description: 'Lofi background music commercial for the Atelier store. Highlights authentic edge controls, clipper kits, and fast dispatch.',
  },

  /* ══════════════════════════════════════════════════════════
     AD 8 — MUSIC ONLY: AI Stylist Matcher
  ══════════════════════════════════════════════════════════ */
  {
    id: 'v5-music-ai',
    title: 'AI Stylist Matcher — Find Your Match in 10s',
    category: 'ai',
    duration: 15,
    durationText: '0:15',
    aspectRatio: '9:16',
    badge: 'TikTok / Story',
    hasVoice: false,
    musicStyle: 'upbeat',
    themeColor: '#38bdf8',
    accentGradient: 'linear-gradient(135deg, #031525 0%, #04080f 100%)',
    hook: 'Tell our AI your style, budget & location. Get matched to a top-rated expert near you in under 10 seconds. Smart. Fast. Verified.',
    cta: '🤖 TRY THE AI MATCHER FREE',
    tags: ['AIStylist', 'SmartBeauty', 'StyleCorner', 'AI'],
    description: 'Upbeat electronic commercial for the AI Matcher feature. Futuristic neon radar, budget filtering, and instant specialist matching.',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   STYLECORNER OFFICIAL EMBLEM LOGO (CANVAS VECTOR RENDERER)
───────────────────────────────────────────────────────────────────────────── */
export function drawStyleCornerLogo(ctx, cx, cy, size, { hasHalo = true, withText = false, glowColor = '#F5B942', textColor = '#ffffff', subtextColor = '#F5B942' } = {}) {
  ctx.save();

  // 1. Outer breathing golden halo
  if (hasHalo) {
    const haloRadius = size * 0.95;
    const halo = ctx.createRadialGradient(cx, cy, size * 0.15, cx, cy, haloRadius);
    halo.addColorStop(0, 'rgba(245, 185, 66, 0.45)');
    halo.addColorStop(0.5, 'rgba(245, 185, 66, 0.15)');
    halo.addColorStop(1, 'rgba(245, 185, 66, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Dark outer squircle with razor gold border
  const sqSize = size * 0.88;
  const sqRadius = sqSize * 0.28;
  const x = cx - sqSize / 2;
  const y = cy - sqSize / 2;

  ctx.fillStyle = '#090a0f';
  ctx.strokeStyle = 'rgba(245, 185, 66, 0.85)';
  ctx.lineWidth = Math.max(1.5, size * 0.04);
  ctx.beginPath();
  ctx.roundRect(x, y, sqSize, sqSize, sqRadius);
  ctx.fill();
  ctx.stroke();

  // 3. Inner golden rounded circle/squircle with 24K metallic luster
  const goldSize = sqSize * 0.68;
  const gx = cx - goldSize / 2;
  const gy = cy - goldSize / 2;
  const goldGrad = ctx.createLinearGradient(gx, gy, gx + goldSize, gy + goldSize);
  goldGrad.addColorStop(0, '#FFF3C4');
  goldGrad.addColorStop(0.25, '#F5B942');
  goldGrad.addColorStop(0.75, '#C8930A');
  goldGrad.addColorStop(1, '#8C6000');
  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.roundRect(gx, gy, goldSize, goldSize, goldSize * 0.26);
  ctx.fill();

  // Subtle bevel edge reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 4. Center dark square cutout (iconic StyleCorner square)
  const cutSize = goldSize * 0.44;
  const cutX = cx - cutSize / 2;
  const cutY = cy - cutSize / 2;
  ctx.fillStyle = '#090a0f';
  ctx.beginPath();
  ctx.roundRect(cutX, cutY, cutSize, cutSize, cutSize * 0.22);
  ctx.fill();

  // Fine gold hairline border on square cutout
  ctx.strokeStyle = 'rgba(245, 185, 66, 0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 5. Optional brand typography beside or below logo
  if (withText) {
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(size * 0.38)}px Outfit, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText('Style Corner', cx, cy + size * 0.72);

    ctx.font = `800 ${Math.round(size * 0.19)}px Outfit, sans-serif`;
    ctx.fillStyle = subtextColor;
    ctx.fillText('ATELIER GROOMING & STYLING', cx, cy + size * 0.94);
  }

  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
   CINEMATIC SPECULAR STAR GLINT (FOR METALLIC GOLD & RAZOR LINEUPS)
───────────────────────────────────────────────────────────────────────────── */
export function drawStarGlint(ctx, x, y, radius, color = '#ffffff') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = '#F5B942';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x - radius, y); ctx.lineTo(x + radius, y);
  ctx.moveTo(x, y - radius); ctx.lineTo(x, y + radius);
  ctx.stroke();

  // Subtle 45-degree diagonal glint rays
  ctx.strokeStyle = 'rgba(245, 185, 66, 0.75)';
  ctx.lineWidth = 0.9;
  const diag = radius * 0.65;
  ctx.beginPath();
  ctx.moveTo(x - diag, y - diag); ctx.lineTo(x + diag, y + diag);
  ctx.moveTo(x - diag, y + diag); ctx.lineTo(x + diag, y - diag);
  ctx.stroke();
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED HUMAN COMMERCIAL 1: MASTER BARBER & CLIENT LIVE SESSION
───────────────────────────────────────────────────────────────────────────── */
function drawAnimatedBarberScene(ctx, W, H, ad, t, isVertical, color) {
  const cx = W / 2;
  const chairY = isVertical ? H * 0.44 : H * 0.52;

  if (t < 0.82) {
    // ── Salon Mirror & Modern Wall Slat Background ──
    const mirrorW = isVertical ? W * 0.76 : 560;
    const mirrorH = isVertical ? H * 0.46 : 380;
    const mirrorX = (W - mirrorW) / 2;
    const mirrorY = chairY - mirrorH * 0.62;

    // Soft Amber Backlight Halo Behind Mirror
    const mirrorGlow = ctx.createRadialGradient(cx, mirrorY + mirrorH * 0.45, 40, cx, mirrorY + mirrorH * 0.45, mirrorW * 0.75);
    mirrorGlow.addColorStop(0, 'rgba(245,185,66,0.22)');
    mirrorGlow.addColorStop(0.6, 'rgba(245,185,66,0.06)');
    mirrorGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mirrorGlow;
    ctx.fillRect(mirrorX - 40, mirrorY - 40, mirrorW + 80, mirrorH + 80);

    // Arched Luxury Mirror Frame
    ctx.save();
    ctx.fillStyle = '#0b0d14';
    ctx.strokeStyle = 'rgba(245,185,66,0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(mirrorX, mirrorY, mirrorW, mirrorH, [mirrorW * 0.4, mirrorW * 0.4, 20, 20]);
    ctx.fill();
    ctx.stroke();

    // Vertical gold accent slats on sides of mirror
    ctx.strokeStyle = 'rgba(245,185,66,0.18)';
    ctx.lineWidth = 1.5;
    for (let s = -3; s <= 3; s++) {
      if (s === 0) continue;
      const sx = cx + s * (isVertical ? 55 : 85);
      ctx.beginPath();
      ctx.moveTo(sx, mirrorY + 30);
      ctx.lineTo(sx, mirrorY + mirrorH - 20);
      ctx.stroke();
    }
    ctx.restore();

    // ── Hydraulic Barber Chair ──
    ctx.save();
    ctx.fillStyle = '#27272a';
    ctx.fillRect(cx - 8, chairY + 70, 16, 50);
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(cx, chairY + 120, 75, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chair Back Cushion
    ctx.fillStyle = '#12131a';
    ctx.strokeStyle = 'rgba(245,185,66,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 70, chairY - 50, 140, 110, 24);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // ── Seated Client (Human Character) ──
    const breath = Math.sin(t * Math.PI * 8) * 2.5;
    const clientHeadY = chairY - 60 + breath;
    const clientHeadX = cx - (t < 0.50 ? 25 : 0);

    // Black Salon Cape with Gold StyleCorner Crest
    ctx.save();
    ctx.fillStyle = '#141418';
    ctx.beginPath();
    ctx.moveTo(clientHeadX - 65, clientHeadY + 50);
    ctx.quadraticCurveTo(clientHeadX, clientHeadY + 35, clientHeadX + 65, clientHeadY + 50);
    ctx.lineTo(clientHeadX + 85, chairY + 95);
    ctx.lineTo(clientHeadX - 85, chairY + 95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,185,66,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cape Logo Crest
    drawStyleCornerLogo(ctx, clientHeadX, clientHeadY + 68, 22, { hasHalo: false });
    ctx.restore();

    // Client Neck
    ctx.fillStyle = '#6d4327';
    ctx.fillRect(clientHeadX - 14, clientHeadY + 24, 28, 24);

    // Client Head & Face (Melanin skin tone)
    ctx.save();
    ctx.fillStyle = '#7a4b2c';
    ctx.beginPath();
    ctx.ellipse(clientHeadX, clientHeadY, 32, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ear
    ctx.beginPath();
    ctx.arc(clientHeadX - 31, clientHeadY + 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Beard Lineup
    ctx.fillStyle = '#0c0d12';
    ctx.beginPath();
    ctx.arc(clientHeadX + 2, clientHeadY + 16, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.fill();

    // Eyes (Blinking animation)
    const isBlinking = (t * 14) % 1 > 0.88 && t < 0.50;
    ctx.fillStyle = '#ffffff';
    if (!isBlinking) {
      ctx.beginPath();
      ctx.ellipse(clientHeadX + (t < 0.5 ? 12 : 10), clientHeadY - 4, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(clientHeadX + (t < 0.5 ? 13 : 11), clientHeadY - 4, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#27170e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(clientHeadX + 6, clientHeadY - 4);
      ctx.lineTo(clientHeadX + 17, clientHeadY - 4);
      ctx.stroke();
    }

    // Smile in Phase 2
    if (t >= 0.50) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(clientHeadX + 10, clientHeadY + 18, 10, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    // Hair: Precision Taper Fade Texture on Sides & Curls on Top
    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(clientHeadX, clientHeadY - 14, 33, Math.PI, Math.PI * 2);
    ctx.fill();
    for (let c = 0; c < 7; c++) {
      ctx.beginPath();
      ctx.arc(clientHeadX - 22 + c * 7.5, clientHeadY - 43, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Razor Sharp Hairline Glint (Specular Gold & White Flare)
    if (t >= 0.35) {
      const glintPos = ((t * 2.5) % 1);
      const gx = clientHeadX - 25 + glintPos * 50;
      const gy = clientHeadY - 26;
      drawStarGlint(ctx, gx, gy, 8, '#ffffff');
    }
    ctx.restore();

    // ── Master Barber (Standing Professional Human Character) ──
    if (t < 0.55) {
      const barberX = clientHeadX + 68;
      const barberY = chairY - 110 + Math.sin(t * Math.PI * 6) * 1.5;

      ctx.save();
      // Barber Body & Modern Apron
      ctx.fillStyle = '#181922';
      ctx.beginPath();
      ctx.roundRect(barberX - 24, barberY + 50, 48, 120, 16);
      ctx.fill();

      // Gold Apron Cross Straps
      ctx.strokeStyle = '#F5B942';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(barberX - 16, barberY + 50);
      ctx.lineTo(barberX + 16, barberY + 85);
      ctx.moveTo(barberX + 16, barberY + 50);
      ctx.lineTo(barberX - 16, barberY + 85);
      ctx.stroke();

      // Barber Neck & Head
      ctx.fillStyle = '#5c3820';
      ctx.fillRect(barberX - 8, barberY + 28, 16, 22);
      ctx.beginPath();
      ctx.ellipse(barberX, barberY + 12, 22, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Barber Fade & Beard
      ctx.fillStyle = '#090a0f';
      ctx.beginPath();
      ctx.arc(barberX, barberY + 4, 23, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // Barber Arm Reaching with Gold Clipper
      const sweep = Math.sin(t * 16) * 10;
      const clipperX = clientHeadX + 22 + sweep * 0.4;
      const clipperY = clientHeadY - 12 + sweep * 0.6;

      ctx.strokeStyle = '#5c3820';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(barberX - 14, barberY + 65);
      ctx.quadraticCurveTo(barberX - 35, barberY + 55, clipperX + 18, clipperY + 14);
      ctx.stroke();

      // Gold Master Clipper
      ctx.save();
      ctx.translate(clipperX, clipperY);
      ctx.rotate(-0.35 + Math.sin(t * 16) * 0.08);
      ctx.fillStyle = '#F5B942';
      ctx.beginPath();
      ctx.roundRect(0, 0, 24, 11, 4);
      ctx.fill();
      ctx.fillStyle = '#e4e4e7';
      ctx.fillRect(-6, 1, 6, 9);

      // Micro Sparks / Hair Fade Particles
      for (let p = 0; p < 4; p++) {
        ctx.fillStyle = 'rgba(245,185,66,0.7)';
        ctx.beginPath();
        ctx.arc(-8 - p * 3, 5 + Math.sin(p + t * 20) * 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Barber Other Hand with Gold Comb
      ctx.strokeStyle = '#5c3820';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(barberX - 12, barberY + 80);
      ctx.lineTo(clientHeadX - 18, clientHeadY - 36);
      ctx.stroke();

      // Comb
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(clientHeadX - 25, clientHeadY - 42, 16, 6);
      ctx.restore();

      // Active Fade HUD Tag
      const hudY = isVertical ? H * 0.16 : H * 0.20;
      ctx.save();
      ctx.fillStyle = 'rgba(24,24,28,0.92)';
      ctx.strokeStyle = '#F5B942';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect((W - 290) / 2, hudY, 290, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 13px Outfit, sans-serif';
      ctx.fillStyle = '#F5B942';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ LIVE MASTER BARBER SESSION', W / 2, hudY + 23);
      ctx.restore();

    } else {
      // ── Phase 2: Finished Cut & Client 5-Star Reaction ──
      const hudY = isVertical ? H * 0.15 : H * 0.18;
      ctx.save();
      ctx.fillStyle = 'rgba(24,24,28,0.92)';
      ctx.strokeStyle = 'rgba(245,185,66,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect((W - 320) / 2, hudY, 320, 68, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#F5B942';
      ctx.textAlign = 'center';
      ctx.fillText('★★★★★', W / 2, hudY + 28);

      ctx.font = '800 14px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('"Freshest Fade in Lagos!" · Verified Client', W / 2, hudY + 52);
      ctx.restore();
    }

  } else {
    // ── Phase 3: StyleCorner Outro & CTA ──
    const outroY = isVertical ? H * 0.40 : H * 0.45;
    const pulse = 1 + 0.03 * Math.sin(t * Math.PI * 6);
    ctx.save();
    ctx.translate(W / 2, outroY);
    ctx.scale(pulse, pulse);
    drawStyleCornerLogo(ctx, 0, 0, isVertical ? 96 : 84, { hasHalo: true, withText: true });
    ctx.restore();

    const textY = outroY + (isVertical ? 120 : 105);
    ctx.save();
    ctx.font = `900 ${isVertical ? '34px' : '30px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Look Sharp. Feel Confident.', W / 2, textY);
    ctx.fillStyle = '#F5B942';
    ctx.font = `800 ${isVertical ? '17px' : '15px'} Outfit, sans-serif`;
    ctx.fillText('Top Lagos & Ibadan Barbers Ready For You', W / 2, textY + 36);
    ctx.restore();
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATED HUMAN COMMERCIAL 2: KNOTLESS GODDESS BRAIDS & GLAM SESSION
───────────────────────────────────────────────────────────────────────────── */
function drawAnimatedBraiderScene(ctx, W, H, ad, t, isVertical, color) {
  const cx = W / 2;
  const chairY = isVertical ? H * 0.44 : H * 0.52;

  if (t < 0.82) {
    // ── Vanity Mirror with Soft Globe Bulbs ──
    const mirrorW = isVertical ? W * 0.78 : 580;
    const mirrorH = isVertical ? H * 0.46 : 380;
    const mirrorX = (W - mirrorW) / 2;
    const mirrorY = chairY - mirrorH * 0.62;

    const ambientGlow = ctx.createRadialGradient(cx, mirrorY + mirrorH * 0.4, 30, cx, mirrorY + mirrorH * 0.4, mirrorW * 0.7);
    ambientGlow.addColorStop(0, 'rgba(232,121,249,0.22)');
    ambientGlow.addColorStop(0.5, 'rgba(245,185,66,0.12)');
    ambientGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(mirrorX - 40, mirrorY - 40, mirrorW + 80, mirrorH + 80);

    ctx.save();
    ctx.fillStyle = '#0e0e15';
    ctx.strokeStyle = 'rgba(232,121,249,0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(mirrorX, mirrorY, mirrorW, mirrorH, [mirrorW * 0.45, mirrorW * 0.45, 18, 18]);
    ctx.fill();
    ctx.stroke();

    // Glowing Vanity Globe Bulbs on Mirror Border
    for (let b = 0; b < 10; b++) {
      const angle = Math.PI + (b / 9) * Math.PI;
      const bx = cx + Math.cos(angle) * (mirrorW * 0.45);
      const by = mirrorY + mirrorW * 0.45 + Math.sin(angle) * (mirrorW * 0.45);
      ctx.fillStyle = 'rgba(254,240,138,0.95)';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ── Seated Female Client Character (Melanin Tone with Goddess Braids) ──
    const breath = Math.sin(t * Math.PI * 8) * 2;
    const clientHeadY = chairY - 55 + breath;
    const clientHeadX = cx - (t < 0.50 ? 20 : 0);

    ctx.save();
    ctx.fillStyle = '#16141c';
    ctx.beginPath();
    ctx.moveTo(clientHeadX - 60, clientHeadY + 45);
    ctx.quadraticCurveTo(clientHeadX, clientHeadY + 32, clientHeadX + 60, clientHeadY + 45);
    ctx.lineTo(clientHeadX + 80, chairY + 95);
    ctx.lineTo(clientHeadX - 80, chairY + 95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,121,249,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawStyleCornerLogo(ctx, clientHeadX, clientHeadY + 68, 22, { hasHalo: false });
    ctx.restore();

    ctx.fillStyle = '#5c3317';
    ctx.fillRect(clientHeadX - 12, clientHeadY + 22, 24, 25);

    ctx.save();
    ctx.fillStyle = '#6b3c1b';
    ctx.beginPath();
    ctx.ellipse(clientHeadX, clientHeadY, 30, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheek Highlighter Glow
    ctx.fillStyle = 'rgba(245,185,66,0.25)';
    ctx.beginPath();
    ctx.ellipse(clientHeadX + 14, clientHeadY + 4, 8, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Flutter Eyelashes & Eye
    const blink = (t * 12) % 1 > 0.88;
    if (!blink) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(clientHeadX + 11, clientHeadY - 4, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a0d05';
      ctx.beginPath();
      ctx.arc(clientHeadX + 12, clientHeadY - 4, 2.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#090a0f';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(clientHeadX + 5, clientHeadY - 7);
      ctx.quadraticCurveTo(clientHeadX + 14, clientHeadY - 9, clientHeadX + 18, clientHeadY - 6);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#1a0d05';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(clientHeadX + 5, clientHeadY - 4);
      ctx.lineTo(clientHeadX + 17, clientHeadY - 4);
      ctx.stroke();
    }

    // Lips
    ctx.fillStyle = '#a83256';
    ctx.beginPath();
    ctx.ellipse(clientHeadX + 10, clientHeadY + 16, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Cascading Knotless Goddess Braids with Physics Sway & Gold Cuffs ──
    const swayBase = Math.sin(t * Math.PI * 6) * 5;
    const braids = [
      { startX: -18, len: 140, swayMult: 1.2, cuffY: 45 },
      { startX: -10, len: 155, swayMult: 0.9, cuffY: 70 },
      { startX: -2,  len: 165, swayMult: 1.4, cuffY: 55 },
      { startX: 6,   len: 160, swayMult: 1.0, cuffY: 85 },
      { startX: 14,  len: 145, swayMult: 1.3, cuffY: 60 },
      { startX: 22,  len: 130, swayMult: 0.8, cuffY: 40 },
    ];

    braids.forEach((b) => {
      const sx = clientHeadX + b.startX;
      const sy = clientHeadY - 14;
      const sway = swayBase * b.swayMult;

      ctx.save();
      ctx.strokeStyle = '#0a0a0f';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + sway * 0.5, sy + b.len * 0.35,
        sx + sway, sy + b.len * 0.7,
        sx + sway * 1.2, sy + b.len
      );
      ctx.stroke();

      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Specular 24K Gold Hair Cuff with Star Glint
      const cuffX = sx + sway * 0.6;
      const cuffY = sy + b.cuffY;
      ctx.fillStyle = '#F5B942';
      ctx.beginPath();
      ctx.roundRect(cuffX - 3.5, cuffY - 1, 7, 6, 2);
      ctx.fill();
      drawStarGlint(ctx, cuffX, cuffY + 2, 5, '#FFF2B2');
      ctx.restore();
    });
    ctx.restore();

    // ── Master Braider / Stylist Character ──
    if (t < 0.55) {
      const braiderX = clientHeadX + 64;
      const braiderY = chairY - 105;

      ctx.save();
      ctx.fillStyle = '#1b1926';
      ctx.beginPath();
      ctx.roundRect(braiderX - 22, braiderY + 50, 44, 115, 14);
      ctx.fill();

      ctx.strokeStyle = '#F5B942';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#6b3c1b';
      ctx.fillRect(braiderX - 7, braiderY + 28, 14, 22);
      ctx.beginPath();
      ctx.ellipse(braiderX, braiderY + 14, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#090a0f';
      ctx.beginPath();
      ctx.arc(braiderX, braiderY + 6, 21, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(braiderX + 16, braiderY - 4, 10, 0, Math.PI * 2);
      ctx.fill();

      // Braider Hands Weaving Hair
      const weave = Math.sin(t * 22) * 8;
      const handX = clientHeadX + 5 + weave * 0.5;
      const handY = clientHeadY - 26 + weave * 0.3;

      ctx.strokeStyle = '#6b3c1b';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(braiderX - 14, braiderY + 62);
      ctx.lineTo(handX + 12, handY + 6);
      ctx.stroke();

      ctx.fillStyle = '#6b3c1b';
      ctx.beginPath();
      ctx.arc(handX, handY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e879f9';
      ctx.fillRect(handX - 10, handY - 14, 3, 20);

      for (let m = 0; m < 5; m++) {
        const mx = handX - 10 + Math.sin(m + t * 14) * 20;
        const my = handY - 20 - m * 8 - (t * 40) % 20;
        ctx.fillStyle = 'rgba(245,185,66,0.6)';
        ctx.beginPath();
        ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const hudY = isVertical ? H * 0.16 : H * 0.20;
      ctx.save();
      ctx.fillStyle = 'rgba(24,24,28,0.92)';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect((W - 290) / 2, hudY, 290, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 13px Outfit, sans-serif';
      ctx.fillStyle = '#e879f9';
      ctx.textAlign = 'center';
      ctx.fillText('✨ KNOTLESS GODDESS BRAIDS SESSION', W / 2, hudY + 23);
      ctx.restore();

    } else {
      const hudY = isVertical ? H * 0.15 : H * 0.18;
      ctx.save();
      ctx.fillStyle = 'rgba(24,24,28,0.92)';
      ctx.strokeStyle = 'rgba(232,121,249,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect((W - 320) / 2, hudY, 320, 68, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#F5B942';
      ctx.textAlign = 'center';
      ctx.fillText('★★★★★', W / 2, hudY + 28);

      ctx.font = '800 14px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('"Done in 3 hrs · Zero Scalp Pain!" · Verified', W / 2, hudY + 52);
      ctx.restore();
    }

  } else {
    // ── Phase 3: StyleCorner Outro & CTA ──
    const outroY = isVertical ? H * 0.40 : H * 0.45;
    const pulse = 1 + 0.03 * Math.sin(t * Math.PI * 6);
    ctx.save();
    ctx.translate(W / 2, outroY);
    ctx.scale(pulse, pulse);
    drawStyleCornerLogo(ctx, 0, 0, isVertical ? 96 : 84, { hasHalo: true, withText: true });
    ctx.restore();

    const textY = outroY + (isVertical ? 120 : 105);
    ctx.save();
    ctx.font = `900 ${isVertical ? '34px' : '30px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Your Beauty. Verified Stylists.', W / 2, textY);
    ctx.fillStyle = '#e879f9';
    ctx.font = `800 ${isVertical ? '17px' : '15px'} Outfit, sans-serif`;
    ctx.fillText('Book Salon or VIP Mobile Home Visits in Lagos & Ibadan', W / 2, textY + 36);
    ctx.restore();
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   FLAGSHIP MASTER COMMERCIAL: 6-ACT CINEMATIC BRAND FILM RENDERER
   Directed in the aesthetic of Apple, Nike & Coca-Cola
───────────────────────────────────────────────────────────────────────────── */
function drawMasterCinematicCommercial(ctx, W, H, ad, t, isVertical, color) {
  const cx = W / 2;
  const cy = H / 2;

  // Subtle continuous camera drift (cinematic handheld feel)
  const driftX = Math.sin(t * Math.PI * 3.7) * (W * 0.004);
  const driftY = Math.cos(t * Math.PI * 2.9) * (H * 0.003);
  ctx.save();
  ctx.translate(driftX, driftY);

  // 1. Deepest Obsidian Anamorphic Canvas
  ctx.fillStyle = '#06070a';
  ctx.fillRect(0, 0, W, H);

  // 2. Cinematic Lens Flare & Dynamic Ambient Glow
  const flareGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(W, H) * 0.9);
  flareGrad.addColorStop(0, 'rgba(245, 185, 66, 0.22)');
  flareGrad.addColorStop(0.4, 'rgba(20, 15, 8, 0.6)');
  flareGrad.addColorStop(1, '#050608');
  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, 0, W, H);

  // 3. Stardust & Bokeh Embers
  for (let i = 0; i < 22; i++) {
    const bx = (W * ((i * 179.3 + t * 75) % 100) / 100);
    const by = H - ((H * ((i * 91.7 + t * 60) % 100) / 100) + t * H * 0.2) % H;
    const bAlpha = 0.15 + 0.35 * Math.sin(t * Math.PI * 4 + i);
    ctx.save();
    ctx.globalAlpha = bAlpha;
    ctx.fillStyle = '#F5B942';
    ctx.beginPath();
    ctx.arc(bx, by, 1.5 + (i % 3) * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Filmic 2.39:1 Letterbox Bars (Top & Bottom)
  const barH = isVertical ? 38 : 28;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);
  ctx.strokeStyle = 'rgba(245, 185, 66, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barH); ctx.lineTo(W, barH);
  ctx.moveTo(0, H - barH); ctx.lineTo(W, H - barH);
  ctx.stroke();

  // 5. Film Director Metadata Overlay (Top Bar) with Broadcast Telemetry
  ctx.save();

  // Blinking REC dot
  const recVisible = Math.floor(t * 3) % 2 === 0;
  if (recVisible) {
    ctx.fillStyle = '#ff3131';
    ctx.shadowColor = '#ff3131';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(20, barH - 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 9px Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('REC', 30, barH - 10);
  }

  ctx.font = '800 11px Outfit, sans-serif';
  ctx.fillStyle = '#F5B942';
  ctx.textAlign = 'left';
  ctx.fillText('✦ STYLECORNER CINEMATIC FILM', 58, barH - 12);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#a1a1aa';
  ctx.fillText('4K UHD 60FPS · LAGOS & IBADAN', W - 20, barH - 12);
  ctx.restore();

  // ───────────────────────────────────────────────────────────────────────────
  // ACT 1: SCENE 1 — THE PROBLEM (t: 0.00 -> 0.16)
  // "Looking good shouldn't be complicated."
  // ───────────────────────────────────────────────────────────────────────────
  if (t < 0.16) {
    const actT = t / 0.16;
    const dolly = 1 + actT * 0.05;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dolly, dolly);
    ctx.translate(-cx, -cy);

    // Moody Dressing Room Mirror
    const mirW = isVertical ? W * 0.76 : 520;
    const mirH = isVertical ? H * 0.44 : 360;
    const mirX = (W - mirW) / 2;
    const mirY = isVertical ? H * 0.18 : H * 0.22;

    // Amber Dressing Lamp Glow
    const lampGlow = ctx.createRadialGradient(mirX + 40, mirY + 40, 10, mirX + 40, mirY + 40, 220);
    lampGlow.addColorStop(0, 'rgba(245,185,66,0.28)');
    lampGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lampGlow;
    ctx.fillRect(mirX - 40, mirY - 40, mirW + 80, mirH + 80);

    // Mirror Frame
    ctx.fillStyle = '#0a0b10';
    ctx.strokeStyle = 'rgba(245,185,66,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(mirX, mirY, mirW, mirH, 20);
    ctx.fill();
    ctx.stroke();

    // Seated Person (Silhouette looking in mirror with troubled expression)
    const px = cx - 30;
    const py = mirY + mirH * 0.65;
    ctx.fillStyle = '#6b4124';
    ctx.beginPath();
    ctx.ellipse(px, py - 40, 32, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hand touching unstyled hair
    ctx.strokeStyle = '#6b4124';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + 45, py + 20);
    ctx.quadraticCurveTo(px + 50, py - 20, px + 18, py - 60);
    ctx.stroke();

    // Troubled expression
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px + 10, py - 20, 8, 0.85 * Math.PI, 0.15 * Math.PI); // Frown
    ctx.stroke();

    // Floating Smartphone with Frustrating Chat Bubble
    const phoneX = cx + (isVertical ? 45 : 90);
    const phoneY = mirY + mirH * 0.22;
    ctx.fillStyle = 'rgba(24,24,28,0.95)';
    ctx.strokeStyle = 'rgba(239,68,68,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(phoneX, phoneY, isVertical ? 175 : 190, 75, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 11px Outfit, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'left';
    ctx.fillText('❌ "Sorry, fully booked!"', phoneX + 12, phoneY + 26);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('"Read 4:15 PM · No reply"', phoneX + 12, phoneY + 48);
    ctx.fillText('No confirmed appointment', phoneX + 12, phoneY + 64);

    // Dramatic statement overlay
    const textY = isVertical ? H * 0.68 : H * 0.74;
    ctx.font = `900 ${isVertical ? '30px' : '28px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Looking good shouldn’t be', cx, textY);
    ctx.fillStyle = '#F5B942';
    ctx.fillText('complicated.', cx, textY + 38);

    ctx.font = '800 13px Outfit, sans-serif';
    ctx.fillStyle = '#71717a';
    ctx.fillText('LAGOS & IBADAN · FRIDAY 6:30 PM · EVENT IN 2 HOURS', cx, textY + 74);
    ctx.restore();

  // ───────────────────────────────────────────────────────────────────────────
  // ACT 2: SCENE 2 — THE DISCOVERY (t: 0.16 -> 0.32)
  // "Meet Stylecorner. Your beauty. Your expert. Your convenience."
  // ───────────────────────────────────────────────────────────────────────────
  } else if (t < 0.32) {
    const actT = (t - 0.16) / 0.16;

    // Golden Lens Flare Transition at start of scene
    if (actT < 0.25) {
      const flash = (1 - actT / 0.25);
      ctx.fillStyle = `rgba(245, 185, 66, ${flash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
    }

    // High-End Smartphone Held in Hand
    const phoneW = isVertical ? W * 0.72 : 360;
    const phoneH = isVertical ? H * 0.52 : 440;
    const phoneX = (W - phoneW) / 2;
    const phoneY = isVertical ? H * 0.16 : H * 0.18;

    // Smartphone Outer Glass Chassis
    ctx.save();
    ctx.fillStyle = '#0f1118';
    ctx.strokeStyle = 'rgba(245,185,66,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(phoneX, phoneY, phoneW, phoneH, 36);
    ctx.fill();
    ctx.stroke();

    // Phone Dynamic Island Notch
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(phoneX + (phoneW - 90) / 2, phoneY + 10, 90, 20, 10);
    ctx.fill();

    // Phone Screen: StyleCorner App Live Interface
    const screenX = phoneX + 10;
    const screenY = phoneY + 34;
    const screenW = phoneW - 20;
    const screenH = phoneH - 46;

    ctx.fillStyle = '#090a0f';
    ctx.fillRect(screenX, screenY, screenW, screenH);

    // App Header with Official Logo
    drawStyleCornerLogo(ctx, cx, screenY + 45, 42, { hasHalo: true });

    ctx.font = '900 16px Outfit, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('StyleCorner', cx, screenY + 85);

    ctx.font = '800 11px Outfit, sans-serif';
    ctx.fillStyle = '#F5B942';
    ctx.fillText('TOP VERIFIED SPECIALISTS NEAR YOU', cx, screenY + 102);

    // Auto-typing Search Input
    ctx.fillStyle = '#181922';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(screenX + 14, screenY + 115, screenW - 28, 34, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 12px Outfit, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('🔍 Braiders, Barbers & Lashes... ✓', screenX + 26, screenY + 137);

    // Two Live Stylist Cards on Screen
    [
      { name: 'Chioma Adebayo', spec: 'Knotless Goddess Braids', loc: 'Lekki Phase 1', rating: '4.9 ★' },
      { name: 'Tunde Olatunji', spec: 'Master Skin Fade & Beard', loc: 'Ikeja GRA', rating: '5.0 ★' },
    ].forEach((s, idx) => {
      const cardY = screenY + 160 + idx * 56;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = 'rgba(245,185,66,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(screenX + 14, cardY, screenW - 28, 48, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 12px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(s.name, screenX + 24, cardY + 20);

      ctx.font = '700 11px Outfit, sans-serif';
      ctx.fillStyle = '#F5B942';
      ctx.fillText(`${s.spec} · ${s.loc}`, screenX + 24, cardY + 38);

      ctx.fillStyle = '#34d399';
      ctx.textAlign = 'right';
      ctx.fillText(s.rating, screenX + screenW - 24, cardY + 28);
    });
    ctx.restore();

    // Cinematic Discovery Text
    const discY = isVertical ? H * 0.73 : H * 0.77;
    ctx.save();
    ctx.font = `900 ${isVertical ? '34px' : '30px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Meet Stylecorner.', cx, discY);

    ctx.font = `800 ${isVertical ? '18px' : '16px'} Outfit, sans-serif`;
    ctx.fillStyle = '#F5B942';
    ctx.fillText('Your beauty. Your expert. Your convenience.', cx, discY + 36);
    ctx.restore();

  // ───────────────────────────────────────────────────────────────────────────
  // ACT 3: SCENE 3 — THE EXPERIENCE (t: 0.32 -> 0.54)
  // Fast-Paced Montage of 8 Professional Services
  // ───────────────────────────────────────────────────────────────────────────
  } else if (t < 0.54) {
    const actT = (t - 0.32) / 0.22;
    const serviceIndex = Math.min(7, Math.floor(actT * 8));

    const services = [
      { name: 'Chrome Gel Manicure', role: 'Nail Technician', icon: '💅', detail: 'Precision Russian cuticle prep & mirror chrome foil.' },
      { name: 'Russian Volume Lashes', role: 'Lash Technician', icon: '👁️', detail: 'Lightweight cashmere volume fans, isolation styling.' },
      { name: 'Silk Press & Treatment', role: 'Professional Hairstylist', icon: '💇', detail: 'Glossy thermal hydration & titanium ceramic curl.' },
      { name: 'Knotless Goddess Braids', role: 'Master Braider', icon: '🪮', detail: 'Painless diamond parting & cascading gold cuffs.' },
      { name: 'Melted Frontal Install', role: 'Wig Specialist', icon: '👑', detail: 'Invisible HD Swiss lace melt & custom hairline pluck.' },
      { name: 'Premium Wig Revamp', role: 'Revamp Master', icon: '✨', detail: 'Deep detox, steam treatment & bone-straight finish.' },
      { name: 'Skin Fade & Razor Lineup', role: 'Master Barber', icon: '✂️', detail: 'Zero-gap clipper taper & hot lather razor finish.' },
      { name: 'Spa Detox Pedicure', role: 'Pedicurist', icon: '🌸', detail: 'Warm eucalyptus soak, rose petals & organic scrub.' },
    ];

    const current = services[serviceIndex];

    // Cinematic Macro Close-up Frame
    const boxW = isVertical ? W * 0.86 : 640;
    const boxH = isVertical ? H * 0.44 : 360;
    const boxX = (W - boxW) / 2;
    const boxY = isVertical ? H * 0.18 : H * 0.20;

    ctx.save();
    ctx.fillStyle = '#0d0f17';
    ctx.strokeStyle = '#F5B942';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 24);
    ctx.fill();
    ctx.stroke();

    // Ambient Service Radiance
    const servGlow = ctx.createRadialGradient(cx, boxY + boxH * 0.45, 20, cx, boxY + boxH * 0.45, boxW * 0.6);
    servGlow.addColorStop(0, 'rgba(245,185,66,0.3)');
    servGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = servGlow;
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // Big Icon Emblem
    ctx.font = `${isVertical ? 72 : 62}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(current.icon, cx, boxY + (isVertical ? 95 : 85));

    // Service Title
    ctx.font = `900 ${isVertical ? '26px' : '24px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(current.name, cx, boxY + (isVertical ? 150 : 135));

    // Role Badge
    ctx.fillStyle = '#F5B942';
    ctx.font = '800 14px Outfit, sans-serif';
    ctx.fillText(`✦ ${current.role} ✦`, cx, boxY + (isVertical ? 180 : 162));

    // Detail Description Card
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX + 24, boxY + (isVertical ? 205 : 185), boxW - 48, 54, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 13px Outfit, sans-serif';
    ctx.fillStyle = '#e4e4e7';
    ctx.fillText(current.detail, cx, boxY + (isVertical ? 238 : 217));

    // Progress Bar across 8 services
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(boxX + 24, boxY + boxH - 24, boxW - 48, 6);
    ctx.fillStyle = '#F5B942';
    ctx.fillRect(boxX + 24, boxY + boxH - 24, (boxW - 48) * ((serviceIndex + 1) / 8), 6);
    ctx.restore();

    // Scene Header
    const expHeadY = isVertical ? H * 0.69 : H * 0.74;
    ctx.save();
    ctx.font = `900 ${isVertical ? '24px' : '22px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`EXPERIENCE ${serviceIndex + 1} OF 8`, cx, expHeadY);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 14px Outfit, sans-serif';
    ctx.fillText('100% Background-Checked Nigerian Specialists', cx, expHeadY + 28);
    ctx.restore();

  // ───────────────────────────────────────────────────────────────────────────
  // ACT 4: SCENE 4 — HOW STYLECORNER WORKS (t: 0.54 -> 0.74)
  // 6-Step Platform Workflow
  // ───────────────────────────────────────────────────────────────────────────
  } else if (t < 0.74) {
    const actT = (t - 0.54) / 0.20;
    const step = Math.min(6, Math.floor(actT * 6) + 1);

    const steps = [
      { num: 'STEP 1', title: 'Open & Select Service', desc: 'Browse verified salons, braiders, barbers & mobile experts.', icon: '📱' },
      { num: 'STEP 2', title: 'Book Verified Expert', desc: 'Pick your date, time slot, and secure booking in 30 seconds.', icon: '📅' },
      { num: 'STEP 3', title: 'Dashboard Alert', desc: 'Expert receives instant audio notification and client brief.', icon: '🔔' },
      { num: 'STEP 4', title: 'Expert Accepts', desc: 'Confirmed booking locked in calendar with direct client chat.', icon: '🛡️' },
      { num: 'STEP 5', title: 'Service Completed', desc: 'Luxury in-salon or VIP at-home session delivered to perfection.', icon: '✨' },
      { num: 'STEP 6', title: 'Instant Escrow Transfer', desc: 'Payment released automatically to expert’s bank account.', icon: '💳' },
    ];
    const curStep = steps[step - 1];

    // Step Stepper Indicator Header
    const stepBarY = isVertical ? H * 0.16 : H * 0.18;
    ctx.save();
    const dotsW = isVertical ? W * 0.82 : 480;
    const dotSpacing = dotsW / 5;
    const startX = (W - dotsW) / 2;

    for (let d = 0; d < 6; d++) {
      const dx = startX + d * dotSpacing;
      const isPast = d + 1 <= step;
      ctx.fillStyle = isPast ? '#F5B942' : 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(dx, stepBarY, isPast ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();

      if (d < 5) {
        ctx.strokeStyle = d + 1 < step ? '#F5B942' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dx + 9, stepBarY);
        ctx.lineTo(startX + (d + 1) * dotSpacing - 9, stepBarY);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Step Visual Card
    const cardW = isVertical ? W * 0.86 : 600;
    const cardH = isVertical ? H * 0.42 : 340;
    const cardX = (W - cardW) / 2;
    const cardY = isVertical ? H * 0.22 : H * 0.24;

    ctx.save();
    ctx.fillStyle = '#0f111a';
    ctx.strokeStyle = '#F5B942';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 22);
    ctx.fill();
    ctx.stroke();

    // Step Pill Badge
    ctx.fillStyle = 'rgba(245,185,66,0.18)';
    ctx.strokeStyle = '#F5B942';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 75, cardY + 22, 150, 32, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 13px Outfit, sans-serif';
    ctx.fillStyle = '#F5B942';
    ctx.textAlign = 'center';
    ctx.fillText(`${curStep.num} OF 6`, cx, cardY + 43);

    // Big Icon
    ctx.font = `${isVertical ? 64 : 54}px serif`;
    ctx.fillText(curStep.icon, cx, cardY + (isVertical ? 120 : 105));

    // Title & Description
    ctx.font = `900 ${isVertical ? '24px' : '22px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(curStep.title, cx, cardY + (isVertical ? 175 : 155));

    ctx.font = '700 14px Outfit, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(curStep.desc, cx, cardY + (isVertical ? 210 : 188));

    // Escrow Guarantee Pill
    ctx.fillStyle = 'rgba(52,211,153,0.15)';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX + 24, cardY + cardH - 52, cardW - 48, 36, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 12px Outfit, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('🔒 100% Escrow Protected · Payment Safe Until Complete', cx, cardY + cardH - 29);
    ctx.restore();

    // Workflow Footer Header
    const workHeadY = isVertical ? H * 0.71 : H * 0.76;
    ctx.save();
    ctx.font = `900 ${isVertical ? '24px' : '22px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('HOW STYLECORNER WORKS', cx, workHeadY);
    ctx.fillStyle = '#F5B942';
    ctx.font = '800 14px Outfit, sans-serif';
    ctx.fillText('Smooth. Transparent. Fully Protected.', cx, workHeadY + 28);
    ctx.restore();

  // ───────────────────────────────────────────────────────────────────────────
  // ACT 5: SCENE 5 — THE TRANSFORMATION (t: 0.74 -> 0.88)
  // "Find your expert. Book your service. Own your look."
  // ───────────────────────────────────────────────────────────────────────────
  } else if (t < 0.88) {
    const actT = (t - 0.74) / 0.14;

    // Golden Sunlight Radiance
    const sunGlow = ctx.createRadialGradient(cx, cy - 40, 20, cx, cy - 40, W * 0.8);
    sunGlow.addColorStop(0, 'rgba(245, 185, 66, 0.35)');
    sunGlow.addColorStop(0.6, 'rgba(245, 185, 66, 0.08)');
    sunGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, W, H);

    // Radiating Sunburst Rays
    ctx.save();
    ctx.strokeStyle = 'rgba(245,185,66,0.12)';
    ctx.lineWidth = 2;
    for (let r = 0; r < 16; r++) {
      const angle = (r / 16) * Math.PI * 2 + actT * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 40);
      ctx.lineTo(cx + Math.cos(angle) * (W * 0.9), (cy - 40) + Math.sin(angle) * (W * 0.9));
      ctx.stroke();
    }
    ctx.restore();

    // Confident Glowing Client Silhouette with Sparkles
    ctx.save();
    ctx.fillStyle = '#7a4b2c';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 60, 36, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smiling Face
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 44, 12, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Luscious Braid & Fade Texture
    ctx.fillStyle = '#090a0f';
    ctx.beginPath();
    ctx.arc(cx, cy - 76, 38, Math.PI, Math.PI * 2);
    ctx.fill();

    // 5 Gold Stars Cascading with Physics
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#F5B942';
    ctx.textAlign = 'center';
    ctx.fillText('★★★★★', cx, cy + 18);
    ctx.restore();

    // Monumental Anthem Typography
    const tranY = isVertical ? H * 0.64 : H * 0.68;
    ctx.save();
    ctx.font = `900 ${isVertical ? '32px' : '28px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Find your expert.', cx, tranY);
    ctx.fillStyle = '#F5B942';
    ctx.fillText('Book your service.', cx, tranY + 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Own your look.', cx, tranY + 80);
    ctx.restore();

  // ───────────────────────────────────────────────────────────────────────────
  // ACT 6: SCENE 6 — THE BRAND FINALE (t: 0.88 -> 1.00)
  // Monumental StyleCorner Anthem & Logo Reveal
  // ───────────────────────────────────────────────────────────────────────────
  } else {
    const actT = (t - 0.88) / 0.12;

    // Cinematic Radial Golden Eclipse
    const eclipseGlow = ctx.createRadialGradient(cx, isVertical ? H * 0.36 : H * 0.40, 20, cx, isVertical ? H * 0.36 : H * 0.40, W * 0.75);
    eclipseGlow.addColorStop(0, 'rgba(245, 185, 66, 0.35)');
    eclipseGlow.addColorStop(0.5, 'rgba(245, 185, 66, 0.12)');
    eclipseGlow.addColorStop(1, '#06070a');
    ctx.fillStyle = eclipseGlow;
    ctx.fillRect(0, 0, W, H);

    // Official Large-Scale StyleCorner Squircle Emblem with Orbital Pulse
    const logoY = isVertical ? H * 0.34 : H * 0.38;
    const logoScale = 1 + 0.03 * Math.sin(actT * Math.PI * 4);
    ctx.save();
    ctx.translate(cx, logoY);
    ctx.scale(logoScale, logoScale);
    drawStyleCornerLogo(ctx, 0, 0, isVertical ? 110 : 96, { hasHalo: true });
    ctx.restore();

    // Brand Name & Slogan
    const brandY = logoY + (isVertical ? 90 : 80);
    ctx.save();
    ctx.font = `900 ${isVertical ? '42px' : '36px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('STYLECORNER', cx, brandY);

    ctx.font = `800 ${isVertical ? '18px' : '16px'} Outfit, sans-serif`;
    ctx.fillStyle = '#F5B942';
    ctx.fillText('Beauty meets convenience.', cx, brandY + 34);

    ctx.font = '700 14px Outfit, sans-serif';
    ctx.fillStyle = '#e4e4e7';
    ctx.fillText('Discover your expert. Book your experience.', cx, brandY + 64);

    ctx.font = '600 13px Outfit, sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Coming to transform the way you book beauty services.', cx, brandY + 92);
    ctx.restore();

    // Official Website Pill & CTA
    const ctaY = isVertical ? H * 0.78 : H * 0.82;
    const ctaW = isVertical ? W * 0.86 : 520;
    const ctaH = isVertical ? 60 : 50;
    const ctaX = (W - ctaW) / 2;

    ctx.save();
    const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY + ctaH);
    ctaGrad.addColorStop(0, '#c8930a');
    ctaGrad.addColorStop(1, '#f5b942');
    ctx.fillStyle = ctaGrad;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 18);
    ctx.fill();

    ctx.font = `900 ${isVertical ? '18px' : '16px'} Outfit, sans-serif`;
    ctx.fillStyle = '#08090c';
    ctx.textAlign = 'center';
    ctx.fillText('VISIT WWW.STYLECORNER.WORLD ➔', cx, ctaY + ctaH * 0.62);
    ctx.restore();
  }

  // 6. Sound Waveform Bars (Active Audio Visualizer)
  ctx.save();
  const waveW = W * 0.7;
  const waveX = (W - waveW) / 2;
  const waveY = H - barH - (isVertical ? 20 : 16);
  for (let b = 0; b < 28; b++) {
    const barHeight = 4 + 18 * Math.abs(Math.sin(b * 0.4 + t * Math.PI * 8));
    const bx = waveX + (b / 28) * waveW;
    ctx.fillStyle = '#F5B942';
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(b + t * 5);
    ctx.beginPath();
    ctx.roundRect(bx, waveY - barHeight / 2, waveW / 28 - 3, barHeight, 2);
    ctx.fill();
  }
  ctx.restore();

  // 7. Scrubber Progress Line
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(0, H - 4, W, 4);
  ctx.fillStyle = '#F5B942';
  ctx.fillRect(0, H - 4, W * t, 4);

  // End cinematic drift transform
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
   CANVAS FRAME RENDERER — COMPLETE SCENES & MOTION GRAPHICS
───────────────────────────────────────────────────────────────────────────── */
function renderCommercialFrame(ctx, W, H, ad, progress) {
  const t = Math.max(0, Math.min(1, progress));
  const isVertical = H > W;
  const color = ad.themeColor || '#f5b942';

  // 0. Flagship Master Commercial: 6-Act Cinematic Brand Film
  if (ad.id === 'v0-cinematic-flagship' || ad.category === 'flagship') {
    drawMasterCinematicCommercial(ctx, W, H, ad, t, isVertical, color);
    return;
  }

  // 1. Solid Luxury Black & Radial Glow Background
  ctx.fillStyle = '#08090d';
  ctx.fillRect(0, 0, W, H);

  const glowX = W * 0.5 + Math.sin(t * Math.PI * 2) * W * 0.08;
  const glowY = H * 0.35 + Math.cos(t * Math.PI * 2) * H * 0.05;
  const bgGrad = ctx.createRadialGradient(glowX, glowY, 10, W * 0.5, H * 0.4, Math.max(W, H) * 0.85);
  bgGrad.addColorStop(0, color === '#e879f9' ? 'rgba(232,121,249,0.22)' : color === '#38bdf8' ? 'rgba(56,189,248,0.22)' : color === '#34d399' ? 'rgba(52,211,153,0.22)' : 'rgba(245,185,66,0.25)');
  bgGrad.addColorStop(0.5, '#0c0e15');
  bgGrad.addColorStop(1, '#050608');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Floating Stardust Particles
  for (let i = 0; i < 20; i++) {
    const px = (W * ((i * 137.5 + t * 90) % 100) / 100);
    const py = H - ((H * ((i * 73.1 + t * 65) % 100) / 100) + t * H * 0.25) % H;
    const alpha = 0.2 + 0.3 * Math.sin(t * Math.PI * 4 + i);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Top Header Bar: Official StyleCorner Squircle Logo & Pill
  const pillW = isVertical ? W * 0.88 : 500;
  const pillH = isVertical ? 48 : 44;
  const pillX = (W - pillW) / 2;
  const pillY = isVertical ? H * 0.042 : 26;

  ctx.save();
  ctx.fillStyle = 'rgba(18,18,22,0.92)';
  ctx.strokeStyle = 'rgba(245,185,66,0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 25);
  ctx.fill();
  ctx.stroke();

  // Official StyleCorner Squircle Emblem on Left
  const pillLogoSize = pillH * 0.68;
  const pillLogoX = pillX + 16 + pillLogoSize / 2;
  const pillLogoY = pillY + pillH / 2;
  drawStyleCornerLogo(ctx, pillLogoX, pillLogoY, pillLogoSize, { hasHalo: true });

  // Brand Name & Region Text
  ctx.textAlign = 'left';
  ctx.font = `900 ${isVertical ? 15 : 14}px Outfit, -apple-system, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('STYLECORNER', pillLogoX + pillLogoSize * 0.68, pillY + pillH * 0.58);

  ctx.font = `700 ${isVertical ? 12 : 11}px Outfit, -apple-system, sans-serif`;
  ctx.fillStyle = '#F5B942';
  ctx.fillText('· NIGERIA (LAGOS & IBADAN)', pillLogoX + pillLogoSize * 0.68 + (isVertical ? 112 : 105), pillY + pillH * 0.58);
  ctx.restore();

  // ───────────────────────────────────────────────────────────────────────────
  // SCENE RENDERERS
  // ───────────────────────────────────────────────────────────────────────────

  if (ad.id === 'v9-human-barber') {
    // ═════════════════════════════════════════════════════════════════════════
    // ANIMATED HUMANS 1: Master Barber & Seated Client Session
    // ═════════════════════════════════════════════════════════════════════════
    drawAnimatedBarberScene(ctx, W, H, ad, t, isVertical, color);

  } else if (ad.id === 'v10-human-braids') {
    // ═════════════════════════════════════════════════════════════════════════
    // ANIMATED HUMANS 2: Knotless Goddess Braids & Glam Session
    // ═════════════════════════════════════════════════════════════════════════
    drawAnimatedBraiderScene(ctx, W, H, ad, t, isVertical, color);

  } else if (ad.id === 'v6-motion-journey') {
    // ═════════════════════════════════════════════════════════════════════════
    // ═════════════════════════════════════════════════════════════════════════
    // MOTION GRAPHICS 1: 30-Second Booking Journey (Kinetic Multi-Stage)
    // ═════════════════════════════════════════════════════════════════════════
    const step = t < 0.30 ? 1 : t < 0.62 ? 2 : 3;

    // Kinetic Step Indicator Badge
    const stepBadgeY = isVertical ? H * 0.14 : H * 0.18;
    ctx.save();
    ctx.fillStyle = 'rgba(245,185,66,0.18)';
    ctx.strokeStyle = '#F5B942';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect((W - 260) / 2, stepBadgeY, 260, 34, 17);
    ctx.fill();
    ctx.stroke();
    ctx.font = '900 13px Outfit, sans-serif';
    ctx.fillStyle = '#F5B942';
    ctx.textAlign = 'center';
    ctx.fillText(
      step === 1 ? 'STEP 1 OF 3 · SEARCH YOUR STYLE' :
      step === 2 ? 'STEP 2 OF 3 · AI SPECIALIST MATCH' :
      'STEP 3 OF 3 · ESCROW LOCKED',
      W / 2, stepBadgeY + 22
    );
    ctx.restore();

    if (step === 1) {
      // ── Step 1: Kinetic Search Input ──
      const searchBoxY = isVertical ? H * 0.28 : H * 0.36;
      const sW = W * 0.86;
      const sH = 64;
      const sX = (W - sW) / 2;

      ctx.save();
      ctx.fillStyle = 'rgba(18,18,24,0.95)';
      ctx.strokeStyle = '#F5B942';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sX, searchBoxY, sW, sH, 20);
      ctx.fill();
      ctx.stroke();

      ctx.font = '24px serif';
      ctx.fillText('🔍', sX + 28, searchBoxY + 41);

      // Typing effect
      const queryText = "Knotless Braids · Lagos 📍";
      const charCount = Math.floor(Math.min(queryText.length, (t / 0.25) * queryText.length));
      ctx.font = `800 ${isVertical ? 20 : 18}px Outfit, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(queryText.slice(0, charCount) + (Math.floor(t * 20) % 2 === 0 ? '|' : ''), sX + 62, searchBoxY + 39);
      ctx.restore();

      // Filter chips sliding in
      const chips = ['+ Lekki Phase 1', '+ Ikeja GRA', '+ Bodija, Ibadan'];
      chips.forEach((c, idx) => {
        const chipY = searchBoxY + 85 + idx * 48;
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(W * 0.12, chipY, W * 0.76, 40, 20);
        ctx.fill();
        ctx.stroke();
        ctx.font = '700 15px Outfit, sans-serif';
        ctx.fillStyle = '#e4e4e7';
        ctx.textAlign = 'center';
        ctx.fillText(c, W / 2, chipY + 25);
        ctx.restore();
      });

    } else if (step === 2) {
      // ── Step 2: AI Radar Target Lock ──
      const radarCenterY = isVertical ? H * 0.28 : H * 0.36;
      // Rotating scan crosshair
      ctx.save();
      ctx.strokeStyle = '#F5B942';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -t * 120;
      ctx.beginPath();
      ctx.arc(W / 2, radarCenterY, 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Specialist Result Card
      const cardY = isVertical ? H * 0.40 : H * 0.50;
      const cW = W * 0.88;
      const cH = 150;
      const cX = (W - cW) / 2;

      ctx.save();
      ctx.fillStyle = 'rgba(20,20,28,0.95)';
      ctx.strokeStyle = '#F5B942';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cX, cardY, cW, cH, 22);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 19px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Chioma Braids Atelier', W / 2, cardY + 38);

      ctx.font = '700 15px Outfit, sans-serif';
      ctx.fillStyle = '#F5B942';
      ctx.fillText('⭐ 5.0 Rating · 142 Verified Bookings', W / 2, cardY + 68);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('📍 1.2km away · In-Salon or VIP Home', W / 2, cardY + 96);

      // Match badge
      ctx.fillStyle = '#22c55e';
      ctx.font = '900 16px Outfit, sans-serif';
      ctx.fillText('99% AI MATCH LOCKED ✓', W / 2, cardY + 128);
      ctx.restore();

    } else {
      // ── Step 3: Escrow Shield & Safe Vault ──
      const shieldY = isVertical ? H * 0.28 : H * 0.36;
      ctx.save();
      ctx.font = '56px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️', W / 2, shieldY + 10);
      ctx.restore();

      const vaultY = isVertical ? H * 0.38 : H * 0.48;
      ctx.save();
      ctx.font = `900 ${isVertical ? 32 : 28}px Outfit, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('100% Escrow Protection', W / 2, vaultY);
      ctx.fillStyle = '#F5B942';
      ctx.fillText('Zero Client Risk.', W / 2, vaultY + 40);

      ctx.font = '700 15px Outfit, sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Your payment is securely held in vault.', W / 2, vaultY + 80);
      ctx.fillText('Released ONLY after service is completed.', W / 2, vaultY + 106);
      ctx.restore();
    }

  } else if (ad.id === 'v7-motion-pro-earnings') {
    // ═════════════════════════════════════════════════════════════════════════
    // MOTION GRAPHICS 2: Stylist Kinetic Growth & Revenue Infographic
    // ═════════════════════════════════════════════════════════════════════════
    const isRevenueStage = t >= 0.42;

    if (!isRevenueStage) {
      // ── Stage 1: Weekly Calendar Filling Up ──
      const calHeadY = isVertical ? H * 0.16 : H * 0.20;
      ctx.save();
      ctx.font = '900 14px Outfit, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText('YOUR WEEKLY AUTOMATED APPOINTMENTS', W / 2, calHeadY);
      ctx.restore();

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const barStartY = isVertical ? H * 0.22 : H * 0.28;
      const barH = isVertical ? 150 : 120;
      const colW = (W * 0.84) / 7;
      const startX = W * 0.08;

      days.forEach((day, idx) => {
        const fillPercent = Math.min(1, Math.max(0, (t / 0.38) * 7 - idx));
        const currentH = barH * (0.2 + fillPercent * 0.8);
        const bx = startX + idx * colW + 4;
        const by = barStartY + (barH - currentH);

        ctx.save();
        ctx.fillStyle = idx >= 4 ? 'rgba(245,158,11,0.95)' : 'rgba(245,158,11,0.65)';
        ctx.beginPath();
        ctx.roundRect(bx, by, colW - 8, currentH, 6);
        ctx.fill();

        ctx.font = '800 12px Outfit, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(day, bx + (colW - 8) / 2, barStartY + barH + 20);

        if (fillPercent >= 1) {
          ctx.font = '900 11px Outfit, sans-serif';
          ctx.fillStyle = '#09090b';
          ctx.fillText(idx >= 4 ? 'FULL' : `${idx + 2}`, bx + (colW - 8) / 2, by + 18);
        }
        ctx.restore();
      });

      const calFootY = isVertical ? H * 0.48 : H * 0.58;
      ctx.save();
      ctx.font = '800 18px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Verified Paying Clients Book 24/7', W / 2, calFootY);
      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('No more empty salon chairs.', W / 2, calFootY + 28);
      ctx.restore();

    } else {
      // ── Stage 2: Digital Revenue Counter & Bank Wire ──
      const revHeadY = isVertical ? H * 0.16 : H * 0.20;
      ctx.save();
      ctx.font = '900 14px Outfit, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText('REAL-TIME REVENUE & WITHDRAWALS', W / 2, revHeadY);
      ctx.restore();

      const curNaira = Math.floor(Math.min(1, (t - 0.42) / 0.45) * 185500);
      const tickerY = isVertical ? H * 0.25 : H * 0.32;
      ctx.save();
      ctx.font = `900 ${isVertical ? 52 : 44}px Outfit, sans-serif`;
      ctx.fillStyle = '#F5B942';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(245,158,11,0.5)';
      ctx.shadowBlur = 20;
      ctx.fillText(`₦${curNaira.toLocaleString()}`, W / 2, tickerY);
      ctx.shadowBlur = 0;

      ctx.font = '700 15px Outfit, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Monthly Earnings Deposited Direct to Wallet', W / 2, tickerY + 34);
      ctx.restore();

      // Bank Transfer Graphic
      const wireY = isVertical ? H * 0.38 : H * 0.48;
      const wBoxW = W * 0.86;
      ctx.save();
      ctx.fillStyle = 'rgba(20,24,35,0.95)';
      ctx.strokeStyle = 'rgba(245,158,11,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect((W - wBoxW) / 2, wireY, wBoxW, 90, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '800 15px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('StyleCorner Wallet  ➔  Your Nigerian Bank', W / 2, wireY + 36);

      ctx.font = '900 14px Outfit, sans-serif';
      ctx.fillStyle = '#22c55e';
      ctx.fillText('⚡ Instant Payout Released in 5 Seconds ✓', W / 2, wireY + 66);
      ctx.restore();

      const feeY = isVertical ? H * 0.54 : H * 0.65;
      ctx.save();
      ctx.font = '800 16px Outfit, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'center';
      ctx.fillText('✓ 0% Platform Onboarding Fee', W / 2, feeY);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('✓ Keep 100% of Your Client Tips', W / 2, feeY + 28);
      ctx.restore();
    }

  } else if (ad.id === 'v8-motion-vip-home') {
    // ═════════════════════════════════════════════════════════════════════════
    // MOTION GRAPHICS 3: VIP At-Home Glam (Lagos Traffic vs Comfort)
    // ═════════════════════════════════════════════════════════════════════════
    const isComparisonStage = t >= 0.38;

    if (!isComparisonStage) {
      // ── Stage 1: GPS City Radar Pin Drop ──
      const radarCenterY = isVertical ? H * 0.28 : H * 0.36;

      // Pulsing radar circles
      [1, 0.65, 0.3].forEach((sc, i) => {
        const ringT = (t * 2 + i * 0.3) % 1;
        ctx.save();
        ctx.globalAlpha = (1 - ringT) * 0.5;
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, radarCenterY, 80 * ringT * sc, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Pin
      ctx.save();
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillText('📍', W / 2, radarCenterY + 16);
      ctx.restore();

      const homeHeadY = isVertical ? H * 0.44 : H * 0.54;
      ctx.save();
      ctx.font = `900 ${isVertical ? 32 : 28}px Outfit, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Your Living Room is the Salon.', W / 2, homeHeadY);
      ctx.fillStyle = '#e879f9';
      ctx.fillText('VIP Service At Your Door.', W / 2, homeHeadY + 40);

      ctx.font = '700 15px Outfit, sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Victoria Island · Lekki · Ikoyi · Ikeja · Bodija', W / 2, homeHeadY + 80);
      ctx.restore();

    } else {
      // ── Stage 2: Comparison Cards (Traffic vs VIP Comfort) ──
      const cardW = W * 0.88;
      const startX = (W - cardW) / 2;
      const card1Y = isVertical ? H * 0.18 : H * 0.24;
      const card2Y = isVertical ? H * 0.36 : H * 0.44;

      // Card 1: Traffic Struggle
      ctx.save();
      ctx.fillStyle = 'rgba(30,12,16,0.9)';
      ctx.strokeStyle = 'rgba(239,68,68,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(startX, card1Y, cardW, 85, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 17px Outfit, sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.textAlign = 'center';
      ctx.fillText('3 Hours in Lagos Traffic Jam  ❌', W / 2, card1Y + 34);
      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Hot sun, parking struggle & wasted weekend', W / 2, card1Y + 62);
      ctx.restore();

      // Card 2: VIP Home Glam
      ctx.save();
      ctx.fillStyle = 'rgba(30,14,35,0.95)';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(startX, card2Y, cardW, 95, 18);
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 18px Outfit, sans-serif';
      ctx.fillStyle = '#e879f9';
      ctx.textAlign = 'center';
      ctx.fillText('VIP Specialist In AC Comfort  ✨  ✅', W / 2, card2Y + 38);
      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Top verified artist arrives with full luxury kit', W / 2, card2Y + 68);
      ctx.restore();

      const perksY = isVertical ? H * 0.54 : H * 0.65;
      ctx.save();
      ctx.font = '800 15px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('✦ Frontals · Braids · Fades · Soft Glam · Lashes', W / 2, perksY);
      ctx.fillStyle = '#e879f9';
      ctx.fillText('100% Background-Verified Specialists', W / 2, perksY + 28);
      ctx.restore();
    }

  } else if (ad.category === 'salon' && ad.hasVoice) {
    // ── AD 4: Brand Story ──
    const iconY = isVertical ? H * 0.21 : H * 0.28;
    ctx.save();
    ctx.fillStyle = 'rgba(245,185,66,0.15)';
    ctx.strokeStyle = '#F5B942';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W / 2, iconY, isVertical ? 50 : 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = `${isVertical ? 48 : 38}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✂️', W / 2, iconY + 16);
    ctx.restore();

    const headY = isVertical ? H * 0.37 : H * 0.46;
    ctx.save();
    ctx.font = `900 ${isVertical ? '38px' : '34px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Book Verified Stylists.', W / 2, headY);
    ctx.fillStyle = '#F5B942';
    ctx.fillText('In Seconds.', W / 2, headY + 46);
    ctx.restore();

    const boxY = isVertical ? H * 0.52 : H * 0.64;
    const boxW = W * 0.86;
    const boxH = isVertical ? 140 : 100;
    const boxX = (W - boxW) / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(18,18,22,0.85)';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = `700 ${isVertical ? 17 : 15}px Outfit, sans-serif`;
    ctx.fillStyle = '#e4e4e7';
    ctx.textAlign = 'center';
    ctx.fillText('✦ Braiders · Precision Barbers · Lash Techs', W / 2, boxY + 38);
    ctx.fillText('✦ 100% Escrow Protected · Lagos & Ibadan', W / 2, boxY + 70);
    ctx.fillStyle = '#F5B942';
    ctx.fillText('✦ In-Salon or VIP Mobile Home Visits', W / 2, boxY + 102);
    ctx.restore();

  } else if (ad.category === 'recruitment') {
    // ── AD 5: Expert Recruitment ──
    const meterY = isVertical ? H * 0.22 : H * 0.28;
    const earnings = Math.floor(15000 + 50000 * Math.min(1, t * 1.5));
    ctx.save();
    ctx.font = `900 ${isVertical ? '48px' : '42px'} Outfit, sans-serif`;
    ctx.fillStyle = '#F5B942';
    ctx.textAlign = 'center';
    ctx.fillText(`₦${earnings.toLocaleString()}+`, W / 2, meterY);
    ctx.font = `700 ${isVertical ? 17 : 15}px Outfit, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Average Monthly Earnings for Top Stylists', W / 2, meterY + 32);
    ctx.restore();

    const headY = isVertical ? H * 0.38 : H * 0.48;
    ctx.save();
    ctx.font = `900 ${isVertical ? '36px' : '32px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Calling Barbers & Braiders!', W / 2, headY);
    ctx.fillStyle = '#F5B942';
    ctx.fillText('Get Booked. Get Paid.', W / 2, headY + 44);
    ctx.restore();

    const perksY = isVertical ? H * 0.53 : H * 0.65;
    const boxW = W * 0.86;
    const boxH = isVertical ? 130 : 95;
    const boxX = (W - boxW) / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(18,18,22,0.85)';
    ctx.strokeStyle = 'rgba(245,185,66,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 18);
    ctx.fill();
    ctx.stroke();

    ctx.font = `700 ${isVertical ? 16 : 14}px Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('✓ Zero Joining or Registration Fee', W / 2, perksY + 34);
    ctx.fillText('✓ Instant Wallet Payouts to Any Nigerian Bank', W / 2, perksY + 66);
    ctx.fillStyle = '#F5B942';
    ctx.fillText('✓ Free Professional Profile & QR Business Card', W / 2, perksY + 98);
    ctx.restore();

  } else if (ad.category === 'store') {
    // ── AD 7: Atelier Store Products ──
    const shelfY = isVertical ? H * 0.22 : H * 0.32;
    ctx.save();
    ctx.font = `900 ${isVertical ? '36px' : '32px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('StyleCorner Atelier Store', W / 2, shelfY);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Authentic Beauty Essentials', W / 2, shelfY + 42);
    ctx.restore();

    const products = [
      '🧴 Hair Hydration Serum · ₦8,500',
      '✂️ Master Barber Fade Clipper · ₦24,000',
      '🪮 Edge Control & Sleek Styling Gel · ₦4,500',
    ];
    const cardStartY = isVertical ? H * 0.38 : H * 0.5;
    products.forEach((prod, idx) => {
      const enter = Math.min(1, Math.max(0, (t * 3 - idx * 0.4)));
      ctx.save();
      ctx.globalAlpha = enter;
      const cy = cardStartY + idx * (isVertical ? 58 : 50);
      ctx.fillStyle = 'rgba(18,30,24,0.9)';
      ctx.strokeStyle = 'rgba(52,211,153,0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(W * 0.08, cy, W * 0.84, isVertical ? 48 : 42, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = `700 ${isVertical ? 16 : 14}px Outfit, sans-serif`;
      ctx.fillStyle = '#e4e4e7';
      ctx.textAlign = 'left';
      ctx.fillText(prod, W * 0.08 + 18, cy + (isVertical ? 30 : 26));
      ctx.restore();
    });

  } else if (ad.category === 'ai') {
    // ── AD 8: AI Stylist Matcher ──
    const radarY = isVertical ? H * 0.24 : H * 0.32;
    [1, 0.65, 0.35].forEach((scale, i) => {
      const pulseT = (t + i * 0.33) % 1;
      ctx.save();
      ctx.globalAlpha = (1 - pulseT) * 0.4;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W / 2, radarY, (isVertical ? 80 : 60) * pulseT * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.fillStyle = 'rgba(56,189,248,0.18)';
    ctx.beginPath();
    ctx.arc(W / 2, radarY, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🤖', W / 2, radarY + 13);
    ctx.restore();

    const matchHeadY = isVertical ? H * 0.42 : H * 0.54;
    ctx.save();
    ctx.font = `900 ${isVertical ? '36px' : '32px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Smart AI Stylist Matcher', W / 2, matchHeadY);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Matched in 10 Seconds.', W / 2, matchHeadY + 42);
    ctx.restore();

    const locY = isVertical ? H * 0.58 : H * 0.72;
    ctx.save();
    ctx.fillStyle = 'rgba(14,24,40,0.85)';
    ctx.strokeStyle = 'rgba(56,189,248,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(W * 0.08, locY, W * 0.84, 52, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = `700 ${isVertical ? 16 : 14}px Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('📍 Ikeja · Fade & Beard Specialist', W * 0.08 + 16, locY + 32);
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText('99% MATCH ✓', W * 0.92 - 16, locY + 32);
    ctx.restore();

  } else {
    // ── AD 6: Luxury Salon Experience ──
    const center = { x: W / 2, y: isVertical ? H * 0.24 : H * 0.32 };
    const radius = isVertical ? 75 : 60;
    const services = ['💇', '✂️', '💅', '👁️', '💋', '🪮'];
    services.forEach((s, idx) => {
      const angle = (idx / services.length) * Math.PI * 2 + t * Math.PI * 1.2;
      const sx = center.x + Math.cos(angle) * radius;
      const sy = center.y + Math.sin(angle) * radius;
      ctx.save();
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillText(s, sx, sy + 10);
      ctx.restore();
    });

    const luxHeadY = isVertical ? H * 0.42 : H * 0.52;
    ctx.save();
    ctx.font = `900 ${isVertical ? '36px' : '32px'} Outfit, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Luxury Salon Booking', W / 2, luxHeadY);
    ctx.fillStyle = '#F5B942';
    ctx.fillText('Lagos & Ibadan', W / 2, luxHeadY + 44);
    ctx.restore();
  }

  // 5. Sound Waveform Bars (When Voice or Music active)
  ctx.save();
  const waveW = W * 0.65;
  const waveX = (W - waveW) / 2;
  const waveY = isVertical ? H * 0.74 : H * 0.77;
  for (let b = 0; b < 24; b++) {
    const barH = 6 + 22 * Math.abs(Math.sin(b * 0.4 + t * Math.PI * 6));
    const bx = waveX + (b / 24) * waveW;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(b + t * 4);
    ctx.beginPath();
    ctx.roundRect(bx, waveY - barH / 2, waveW / 24 - 3, barH, 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. Pulsing Golden CTA Button at Bottom
  const pulse = 1 + 0.02 * Math.sin(t * Math.PI * 6);
  const btnW = W * 0.84;
  const btnH = isVertical ? 68 : 56;
  const btnX = (W - btnW) / 2;
  const btnY = isVertical ? H * 0.81 : H * 0.83;

  ctx.save();
  ctx.translate(W / 2, btnY + btnH / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-W / 2, -(btnY + btnH / 2));

  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  btnGrad.addColorStop(0, '#c8930a');
  btnGrad.addColorStop(1, color);
  ctx.fillStyle = btnGrad;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 20);
  ctx.fill();

  ctx.font = `900 ${isVertical ? 22 : 18}px Outfit, sans-serif`;
  ctx.fillStyle = '#08090C';
  ctx.textAlign = 'center';
  ctx.fillText(ad.cta || 'BOOK YOUR STYLIST NOW ➔', W / 2, btnY + btnH * 0.62);
  ctx.restore();

  // 7. Footer text with Official StyleCorner Logo Watermark
  ctx.save();
  const footY = H - (isVertical ? 32 : 18);
  const logoMarkSize = isVertical ? 20 : 16;
  const brandFootText = 'www.stylecorner.world · 100% Escrow Protected';
  ctx.font = `700 ${isVertical ? 14 : 12}px Outfit, sans-serif`;
  const footTextW = ctx.measureText(brandFootText).width;
  const footLogoX = (W - footTextW) / 2 - logoMarkSize * 0.85;

  drawStyleCornerLogo(ctx, footLogoX, footY - 1, logoMarkSize, { hasHalo: false });
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText(brandFootText, W / 2 + logoMarkSize * 0.45, footY + 4);
  ctx.restore();

  // 8. Progress scrubber line at very bottom
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, H - 6, W, 6);
  ctx.fillStyle = color;
  ctx.fillRect(0, H - 6, W * t, 6);
  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
   VIDEO RECORDER & DOWNLOADER (Attaches Canvas into DOM to guarantee video frames)
───────────────────────────────────────────────────────────────────────────── */
export const generateAndDownloadVideo = async (ad, onProgress) => {
  return new Promise(async (resolve, reject) => {
    const isVertical = ad.aspectRatio === '9:16';
    const W = isVertical ? 1080 : 1920;
    const H = isVertical ? 1920 : 1080;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.position = 'fixed';
    canvas.style.left = '-9999px';
    canvas.style.top = '-9999px';
    canvas.style.opacity = '0.01';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const DURATION_SECS = ad.duration || 15;
    const FPS = 30;
    const TOTAL_FRAMES = DURATION_SECS * FPS;

    let musicObj = null;
    let synthUtterance = null;
    const cleanup = () => {
      if (document.body.contains(canvas)) document.body.removeChild(canvas);
      if (musicObj) musicObj.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    try {
      const stream = canvas.captureStream(FPS);

      if (ad.musicStyle) {
        musicObj = createBackgroundMusicEngine(ad.musicStyle);
        if (musicObj?.stream) {
          const track = musicObj.stream.getAudioTracks()[0];
          if (track) stream.addTrack(track);
        }
      }

      const candidateMimes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let selectedMime = candidateMimes.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || 'video/webm';
      const isMp4 = selectedMime.includes('mp4');

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 12_000_000,
      });
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const ext = isMp4 ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: selectedMime });
        const filename = `StyleCorner_${ad.title.replace(/[^a-zA-Z0-9]/g, '_')}_Ad.${ext}`;

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] })) {
          try {
            await navigator.share({
              files: [new File([blob], filename, { type: blob.type })],
              title: filename,
            });
            cleanup();
            resolve(true);
            return;
          } catch (_) {}
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 15000);

        cleanup();
        resolve(url);
      };

      recorder.start(100);

      if (ad.hasVoice && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        synthUtterance = new SpeechSynthesisUtterance(ad.voiceScript || ad.hook);
        synthUtterance.rate = 0.95;
        synthUtterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const niceVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Female')));
        if (niceVoice) synthUtterance.voice = niceVoice;
        setTimeout(() => {
          try { window.speechSynthesis.speak(synthUtterance); } catch (_) {}
        }, 300);
      }

      let frame = 0;
      const renderNext = () => {
        if (frame >= TOTAL_FRAMES) {
          recorder.stop();
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        renderCommercialFrame(ctx, W, H, ad, frame / TOTAL_FRAMES);
        frame++;
        if (onProgress) onProgress(Math.round((frame / TOTAL_FRAMES) * 100));
        requestAnimationFrame(renderNext);
      };
      renderNext();

    } catch (err) {
      cleanup();
      reject(err);
    }
  });
};

/* ─────────────────────────────────────────────────────────────────────────────
   INTERACTIVE LIVE COMMERCIAL PLAYER MODAL
───────────────────────────────────────────────────────────────────────────── */
const VideoAdPlayerModal = ({ ad, onClose, onDownload, isDownloading }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeRatio, setActiveRatio] = useState(ad.aspectRatio || '9:16');
  const [showCenterIcon, setShowCenterIcon] = useState(false);

  const musicRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(0);

  const duration = ad.duration || 15;

  // Scene definitions for instant timeline jumping
  const getScenes = () => {
    if (ad.id === 'v0-cinematic-flagship') {
      return [
        { label: 'Act 1: Problem', time: 0 },
        { label: 'Act 2: Discovery', time: 9 },
        { label: 'Act 3: 8 Experiences', time: 18 },
        { label: 'Act 4: 6-Step Workflow', time: 30 },
        { label: 'Act 5: Glow Transform', time: 41 },
        { label: 'Act 6: Brand Finale', time: 49 },
      ];
    } else if (ad.id === 'v6-motion-journey') {
      return [
        { label: 'Step 1: Search', time: 0 },
        { label: 'Step 2: AI Match', time: 6 },
        { label: 'Step 3: Escrow Vault', time: 13 },
        { label: 'Outro', time: 17 },
      ];
    } else if (ad.id === 'v7-motion-pro-earnings') {
      return [
        { label: 'Calendar Fill', time: 0 },
        { label: '₦ Revenue Ticker', time: 6 },
        { label: '5s Bank Wire', time: 12 },
        { label: 'Pro Outro', time: 17 },
      ];
    } else if (ad.id === 'v8-motion-vip-home') {
      return [
        { label: 'Lagos GPS Pin', time: 0 },
        { label: 'Traffic vs Home AC', time: 5 },
        { label: 'VIP Services', time: 11 },
        { label: 'VIP Outro', time: 15 },
      ];
    } else if (ad.id === 'v9-human-barber') {
      return [
        { label: 'Live Taper Fade', time: 0 },
        { label: 'Razor Glint & 5★', time: 11 },
        { label: 'Barber Outro', time: 17 },
      ];
    } else if (ad.id === 'v10-human-braids') {
      return [
        { label: 'Goddess Braiding', time: 0 },
        { label: 'Mirror Glow & 5★', time: 11 },
        { label: 'Braids Outro', time: 17 },
      ];
    }
    return [
      { label: 'Scene 1: Intro', time: 0 },
      { label: 'Scene 2: Core Action', time: Math.floor(duration * 0.35) },
      { label: 'Scene 3: Guarantee', time: Math.floor(duration * 0.70) },
      { label: 'Scene 4: Outro', time: Math.floor(duration * 0.88) },
    ];
  };

  const scenes = getScenes();

  useEffect(() => {
    if (ad.musicStyle) {
      musicRef.current = createBackgroundMusicEngine(ad.musicStyle);
    }
    if (ad.hasVoice && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(ad.voiceScript || ad.hook);
      u.rate = 0.95 * playbackSpeed;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find(vo => vo.lang.startsWith('en') && (vo.name.includes('Natural') || vo.name.includes('Google')));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    }

    startTimeRef.current = performance.now();

    return () => {
      if (musicRef.current) musicRef.current.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [ad]);

  useEffect(() => {
    if (musicRef.current && musicRef.current.setMute) {
      musicRef.current.setMute(isMuted);
    }
  }, [isMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const tick = (now) => {
      if (!isPlaying) return;

      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = ((now - startTimeRef.current) / 1000) * playbackSpeed + pausedAtRef.current;

      if (elapsed >= duration) {
        setCurrentTime(duration);
        setIsPlaying(false);
        return;
      }

      setCurrentTime(elapsed);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      renderCommercialFrame(ctx, canvas.width, canvas.height, ad, elapsed / duration);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, ad, duration, playbackSpeed, activeRatio]);

  const togglePlay = () => {
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 550);

    if (isPlaying) {
      pausedAtRef.current = currentTime;
      startTimeRef.current = null;
      setIsPlaying(false);
      if (window.speechSynthesis) window.speechSynthesis.pause();
    } else {
      if (currentTime >= duration) {
        pausedAtRef.current = 0;
        setCurrentTime(0);
        if (ad.hasVoice && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(ad.voiceScript || ad.hook);
          u.rate = 0.95 * playbackSpeed;
          window.speechSynthesis.speak(u);
        }
      } else {
        if (window.speechSynthesis) window.speechSynthesis.resume();
      }
      startTimeRef.current = performance.now();
      setIsPlaying(true);
    }
  };

  const jumpToTime = (targetSec) => {
    const clamped = Math.max(0, Math.min(duration, targetSec));
    pausedAtRef.current = clamped;
    setCurrentTime(clamped);
    startTimeRef.current = performance.now();

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      renderCommercialFrame(ctx, canvas.width, canvas.height, ad, clamped / duration);
    }

    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const restartCommercial = () => {
    pausedAtRef.current = 0;
    setCurrentTime(0);
    startTimeRef.current = performance.now();
    setIsPlaying(true);
    if (ad.hasVoice && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(ad.voiceScript || ad.hook);
      u.rate = 0.95 * playbackSpeed;
      window.speechSynthesis.speak(u);
    }
  };

  const isVertical = activeRatio === '9:16';
  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(5,6,9,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0c0e14',
          border: '1.5px solid rgba(245,185,66,0.45)',
          borderRadius: '26px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: isVertical ? '440px' : '780px',
          width: '100%',
          boxShadow: '0 30px 100px rgba(0,0,0,0.95), 0 0 50px rgba(245,185,66,0.18)',
          position: 'relative',
        }}
      >
        {/* Top Header Row with Logo, Title, Sound Equalizer & Close */}
        <div style={{
          width: '100%',
          padding: '0.75rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: '#12151f',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              backgroundColor: '#F5B942', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(245,185,66,0.3)',
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #09090b' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: ad.themeColor, textTransform: 'uppercase', padding: '0.15rem 0.5rem', borderRadius: '50px', background: 'rgba(255,255,255,0.06)' }}>
                  {ad.badge}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Check size={10} /> 4K 60FPS
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit', lineHeight: 1.2, marginTop: '2px' }}>
                {ad.title}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Live Mini Equalizer */}
            {isPlaying && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.2rem 0.5rem', background: 'rgba(245,185,66,0.1)', borderRadius: '12px' }}>
                {[0.4, 0.8, 0.6, 1.0, 0.5].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: '2.5px',
                      height: `${12 * h}px`,
                      backgroundColor: '#F5B942',
                      borderRadius: '1px',
                      animation: `pulse 0.${6 + i * 2}s ease infinite alternate`,
                    }}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8',
                cursor: 'pointer', padding: '0.35rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Canvas Screen with Center Click-to-Play Pulse */}
        <div
          onClick={togglePlay}
          title="Click to Play / Pause"
          style={{
            width: '100%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#040507',
            padding: isVertical ? '0.5rem 0' : '0',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            width={isVertical ? 720 : 1280}
            height={isVertical ? 1280 : 720}
            style={{
              width: '100%',
              maxHeight: isVertical ? '58vh' : '48vh',
              objectFit: 'contain',
              display: 'block',
              transition: 'all 0.2s ease',
            }}
          />

          {/* Center Play / Pause Indicator on Click */}
          {showCenterIcon && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
              animation: 'scaleFade 0.5s ease-out forwards',
            }}>
              <div style={{
                width: '68px', height: '68px', borderRadius: '50%',
                backgroundColor: 'rgba(245,185,66,0.3)', backdropFilter: 'blur(10px)',
                border: '2px solid #F5B942',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isPlaying ? <Play size={28} fill="#F5B942" color="#F5B942" style={{ marginLeft: '4px' }} /> : <Pause size={28} color="#F5B942" />}
              </div>
            </div>
          )}

          {/* Floating Aspect Ratio Switcher Badge on Screen */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveRatio(activeRatio === '9:16' ? '16:9' : '9:16');
            }}
            title="Toggle between 9:16 Story and 16:9 Cinema"
            style={{
              position: 'absolute', top: '12px', right: '12px',
              backgroundColor: 'rgba(18,20,28,0.85)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(245,185,66,0.4)', borderRadius: '50px',
              padding: '0.25rem 0.65rem', color: '#F5B942', fontSize: '0.68rem',
              fontWeight: 800, fontFamily: 'Outfit', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            <Maximize size={10} /> {isVertical ? '📱 9:16 Vertical' : '🖥️ 16:9 Cinema'}
          </button>
        </div>

        {/* Interactive Scene Navigation Timeline Chips */}
        <div style={{
          width: '100%',
          padding: '0.55rem 1rem 0.4rem',
          backgroundColor: '#0f1118',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {scenes.map((s, idx) => {
            const nextTime = scenes[idx + 1]?.time || duration;
            const isCurrent = currentTime >= s.time && currentTime < nextTime;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => jumpToTime(s.time)}
                style={{
                  padding: '0.28rem 0.65rem',
                  borderRadius: '50px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  border: isCurrent ? '1.5px solid #F5B942' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: isCurrent ? 'rgba(245,185,66,0.18)' : 'rgba(255,255,255,0.03)',
                  color: isCurrent ? '#F5B942' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {s.label} ({s.time}s)
              </button>
            );
          })}
        </div>

        {/* Bottom Interactive Controls */}
        <div style={{
          width: '100%',
          padding: '0.85rem 1.15rem',
          backgroundColor: '#12151f',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          boxSizing: 'border-box',
        }}>
          {/* Interactive Seekable Slider Scrubber */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F5B942', minWidth: '35px', fontFamily: 'monospace' }}>
              0:{Math.floor(currentTime).toString().padStart(2, '0')}
            </span>

            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={(e) => jumpToTime(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '50px',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: '#F5B942',
                  backgroundImage: `linear-gradient(#F5B942, #F5B942)`,
                  backgroundSize: `${progressPercent}% 100%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>

            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#71717a', minWidth: '35px', fontFamily: 'monospace' }}>
              0:{duration}
            </span>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {/* Play / Pause */}
              <button
                type="button"
                onClick={togglePlay}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: '#F5B942', border: 'none', color: '#09090b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,185,66,0.3)',
                  transition: 'transform 0.15s ease',
                }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
              </button>

              {/* Replay */}
              <button
                type="button"
                onClick={restartCommercial}
                title="Replay from start"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={15} />
              </button>

              {/* Mute */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute' : 'Mute'}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: isMuted ? '#ef4444' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              {/* Speed Selector */}
              <div style={{ display: 'flex', gap: '2px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                {[1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    style={{
                      background: playbackSpeed === spd ? '#F5B942' : 'none',
                      color: playbackSpeed === spd ? '#09090b' : '#94a3b8',
                      border: 'none', borderRadius: '6px', fontSize: '0.65rem',
                      fontWeight: 800, padding: '0.2rem 0.4rem', cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Video Download Button */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={() => onDownload(ad)}
              style={{
                background: 'linear-gradient(135deg, #c8930a, #F5B942)',
                color: '#09090b',
                border: 'none',
                borderRadius: '50px',
                padding: '0.55rem 1.25rem',
                fontSize: '0.82rem',
                fontWeight: 900,
                fontFamily: 'Outfit',
                cursor: isDownloading ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 18px rgba(245,185,66,0.3)',
              }}
            >
              {isDownloading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
              {isDownloading ? 'Rendering MP4…' : 'Download Video'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STUDIO MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export const VideoAdsStudio = ({ adVideos, onAddCustomVideo, showToast, isMobile }) => {
  const videos = adVideos?.length ? adVideos : DEFAULT_AD_VIDEOS;
  const [activeFilter, setActiveFilter] = useState('all');
  const [generatingId, setGeneratingId] = useState(null);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [promptText, setPromptText] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('9:16');
  const [creatingNew, setCreatingNew] = useState(false);
  const [selectedVideoToWatch, setSelectedVideoToWatch] = useState(null);

  // Filter logic including flagship, human characters and motion graphics
  const filtered = activeFilter === 'all'
    ? videos
    : activeFilter === 'flagship'
    ? videos.filter(v => v.id === 'v0-cinematic-flagship' || v.category === 'flagship')
    : activeFilter === 'characters'
    ? videos.filter(v => v.category === 'characters' || v.badge?.toLowerCase().includes('human'))
    : activeFilter === 'motion'
    ? videos.filter(v => v.category === 'motion' || v.badge?.toLowerCase().includes('motion'))
    : videos.filter(v => v.category === activeFilter);

  const handleDownload = async (ad) => {
    setGeneratingId(ad.id);
    setGeneratingProgress(0);
    try {
      showToast?.(`🎬 Rendering "${ad.title}" complete video... please wait`, 'info');
      await generateAndDownloadVideo(ad, (p) => setGeneratingProgress(p));
      showToast?.(`✅ "${ad.title}" video downloaded successfully!`, 'success');
    } catch (err) {
      console.error('Video export error:', err);
      showToast?.('⚠️ Video render error. Please try in Chrome or Edge.', 'error');
    } finally {
      setGeneratingId(null);
      setGeneratingProgress(0);
    }
  };

  const handleCustomAd = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setCreatingNew(true);
    setTimeout(() => {
      const ad = {
        id: `vid-custom-${Date.now()}`,
        title: promptText.trim().slice(0, 48),
        category: 'custom',
        duration: 15,
        durationText: '0:15',
        aspectRatio: selectedFormat,
        badge: selectedFormat === '9:16' ? 'TikTok / Reel' : 'YouTube Landscape',
        hasVoice: false,
        musicStyle: 'luxury',
        themeColor: '#f5b942',
        accentGradient: 'linear-gradient(135deg, #1f1807 0%, #0c0e14 100%)',
        description: `Custom commercial: "${promptText.trim()}"`,
        hook: promptText.trim(),
        cta: 'BOOK OR SHOP NOW ➔',
        tags: ['CustomAd', 'StyleCorner'],
      };
      onAddCustomVideo?.(ad);
      showToast?.('✅ Custom commercial created and added to studio!', 'success');
      setPromptText('');
      setCreatingNew(false);
    }, 800);
  };

  return (
    <div>
      {/* Interactive Video Player Modal */}
      {selectedVideoToWatch && (
        <VideoAdPlayerModal
          ad={selectedVideoToWatch}
          onClose={() => setSelectedVideoToWatch(null)}
          onDownload={handleDownload}
          isDownloading={generatingId === selectedVideoToWatch.id}
        />
      )}

      {/* Studio Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,185,66,0.18) 0%, rgba(56,189,248,0.12) 60%, rgba(232,121,249,0.12) 100%)',
        border: '1.5px solid rgba(245,185,66,0.4)',
        borderRadius: '24px',
        padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(245,185,66,0.2)', border: '1px solid rgba(245,185,66,0.4)',
            borderRadius: '50px', padding: '0.3rem 0.85rem', marginBottom: '0.75rem',
            fontSize: '0.74rem', fontWeight: 800, color: '#f5b942',
            textTransform: 'uppercase', fontFamily: 'Outfit', letterSpacing: '0.04em',
          }}>
            <Sparkles size={13} /> AI Video Commercials Studio
          </div>

          <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem', fontFamily: 'Outfit' }}>
            11 StyleCorner Video Ads &amp; Cinematic Commercials
          </h2>

          <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, maxWidth: '750px' }}>
            Watch each video live directly on this screen or download high-definition commercials to your device.
            Featuring the <strong style={{ color: '#f5b942' }}>👑 Flagship 60s Cinematic Brand Film (Director's Cut)</strong>, the <strong style={{ color: '#f5b942' }}>Official StyleCorner Squircle Emblem</strong> across every video, <strong style={{ color: '#f5b942' }}>2 live animated human commercials</strong>, and <strong style={{ color: '#e879f9' }}>3 kinetic motion graphics commercials</strong>.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', color: '#f5b942', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Play size={12} fill="#f5b942" /> Tap Any Card to Watch Live
            </span>
            <span style={{ fontSize: '0.74rem', color: '#f5b942', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              👑 Flagship 60s Brand Film
            </span>
            <span style={{ fontSize: '0.74rem', color: '#e879f9', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              🧑 2 Animated Human Character Ads
            </span>
            <span style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={12} /> 3 Motion Graphics Commercials
            </span>
            <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Download size={12} /> Direct MP4 File Export
            </span>
          </div>
        </div>
      </div>

      {/* Custom Prompt Generator */}
      <form onSubmit={handleCustomAd} style={{
        background: '#151822',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
          <Video size={17} color="#f5b942" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'Outfit' }}>
            Generate Custom Ad From Your Prompt
          </h3>
        </div>

        {/* Quick Clickable Prompt Suggestion Chips */}
        <div style={{
          display: 'flex', gap: '0.4rem', overflowX: 'auto',
          paddingBottom: '0.55rem', marginBottom: '0.75rem',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}>
          {[
            { label: '👑 60s Luxury Gala Promo', text: '60s luxury Lagos gala commercial — knotless braids, frontal install & master fade', fmt: '9:16' },
            { label: '✂️ Master Barber Fade', text: 'Master barber razor taper fade session — Ikeja GRA salon & hot towel pampering', fmt: '9:16' },
            { label: '🪮 Knotless Goddess Braids', text: 'Painless knotless goddess braids commercial with gold hair cuffs — Lekki mobile service', fmt: '9:16' },
            { label: '💅 Russian Gel Manicure', text: 'Luxury chrome gel manicure & spa pedicure treatment — Victoria Island atelier', fmt: '9:16' },
            { label: '🛍️ Atelier Hair Serum', text: 'StyleCorner Atelier authentic organic hair growth oil & hydration serum launch', fmt: '16:9' },
            { label: '🤖 10s AI Stylist Matcher', text: 'Smart AI stylist matcher — instant match to top verified beauty specialists in Lagos', fmt: '9:16' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPromptText(chip.text);
                setSelectedFormat(chip.fmt);
              }}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '50px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'Outfit',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e4e4e7',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.65rem' }}>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. Master barber precision beard trim promo — Ikeja, Lagos..."
            style={{
              flex: 1, background: '#0c0e14', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '0.75rem 1rem', color: '#ffffff',
              fontSize: '0.85rem', fontFamily: 'Outfit', outline: 'none', minHeight: '44px',
            }}
          />
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            style={{
              background: '#0c0e14', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '0 0.85rem', color: '#ffffff',
              fontSize: '0.82rem', fontFamily: 'Outfit', minHeight: '44px', minWidth: '160px',
            }}
          >
            <option value="9:16">9:16 (TikTok / Reels / Story)</option>
            <option value="16:9">16:9 (YouTube / Banner)</option>
          </select>
          <button
            type="submit"
            disabled={creatingNew || !promptText.trim()}
            style={{
              minHeight: '44px', padding: '0 1.25rem',
              background: 'linear-gradient(135deg,#c8930a,#f5b942)',
              color: '#0c0e14', border: 'none', borderRadius: '12px',
              fontWeight: 900, fontFamily: 'Outfit', fontSize: '0.84rem',
              cursor: creatingNew || !promptText.trim() ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              whiteSpace: 'nowrap', opacity: !promptText.trim() ? 0.5 : 1,
            }}
          >
            {creatingNew ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
            {creatingNew ? 'Adding…' : 'Add to Studio'}
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex', gap: '0.4rem', overflowX: 'auto',
        paddingBottom: '0.4rem', marginBottom: '1.25rem',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {[
          { id: 'all', label: `All (${videos.length})` },
          { id: 'flagship', label: '👑 Master Film (1)' },
          { id: 'characters', label: '🧑 Animated Humans (2)' },
          { id: 'motion', label: '✨ Motion Graphics (3)' },
          { id: 'salon', label: '💇 Salon Booking' },
          { id: 'recruitment', label: '✂️ Expert Recruitment' },
          { id: 'store', label: '🛍️ Atelier Store' },
          { id: 'ai', label: '🤖 AI Matcher' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '0.42rem 0.95rem', borderRadius: '50px', whiteSpace: 'nowrap', flexShrink: 0,
              border: activeFilter === tab.id ? '1.5px solid #f5b942' : '1px solid rgba(255,255,255,0.08)',
              background: activeFilter === tab.id ? '#f5b942' : '#151822',
              color: activeFilter === tab.id ? '#0c0e14' : '#94a3b8',
              fontSize: '0.78rem', fontWeight: 800, fontFamily: 'Outfit', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Video Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}>
        {filtered.map(ad => {
          const isRend = generatingId === ad.id;
          return (
            <div
              key={ad.id}
              style={{
                background: '#151822',
                border: `1.5px solid ${isRend ? ad.themeColor : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Clickable Animated Thumbnail Strip */}
              <div
                onClick={() => setSelectedVideoToWatch(ad)}
                title="Tap to watch commercial"
                style={{
                  height: '195px',
                  background: ad.accentGradient || 'linear-gradient(135deg,#1f1807,#0c0e14)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}
              >
                {/* Top Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.04em', padding: '0.2rem 0.55rem', borderRadius: '5px',
                    background: 'rgba(0,0,0,0.65)', border: `1px solid ${ad.themeColor}55`, color: ad.themeColor,
                  }}>
                    {ad.badge}
                  </span>

                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.66rem', fontWeight: 800, padding: '0.2rem 0.55rem',
                    background: 'rgba(0,0,0,0.6)', borderRadius: '5px',
                    color: ad.hasVoice ? '#f5b942' : '#38bdf8',
                  }}>
                    {ad.hasVoice ? <><Mic size={10} /> Voice Narration</> : <><Music size={10} /> Luxury Music</>}
                  </span>
                </div>

                {/* Center Big Play Button (Triggers Player Modal) */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: `rgba(${ad.themeColor === '#38bdf8' ? '56,189,248' : ad.themeColor === '#e879f9' ? '232,121,249' : '245,185,66'},0.25)`,
                    border: `2px solid ${ad.themeColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
                  }}>
                    <Play size={22} fill={ad.themeColor} color={ad.themeColor} style={{ marginLeft: '2px' }} />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Outfit', lineHeight: 1.3 }}>
                    {ad.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px', fontWeight: 700 }}>
                    ▶ Tap to watch commercial
                  </div>
                </div>

                {/* Duration Badge */}
                <span style={{
                  position: 'absolute', bottom: '0.75rem', right: '0.85rem',
                  fontSize: '0.72rem', color: '#ffffff', fontWeight: 800,
                  background: 'rgba(0,0,0,0.7)', padding: '0.15rem 0.5rem', borderRadius: '5px',
                }}>
                  {ad.durationText || `0:${ad.duration}`}
                </span>
              </div>

              {/* Card Body */}
              <div style={{
                padding: '1.1rem', flex: 1, display: 'flex',
                flexDirection: 'column', justifyContent: 'space-between', gap: '0.9rem',
              }}>
                <div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 0.65rem' }}>
                    {ad.description}
                  </p>

                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '0.65rem 0.85rem',
                  }}>
                    <div style={{
                      fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase',
                      fontWeight: 800, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}>
                      {ad.hasVoice ? <Mic size={11} color="#f5b942" /> : <Volume2 size={11} color="#38bdf8" />}
                      {ad.hasVoice ? 'Voice Script Preview' : 'Commercial Hook'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.45 }}>
                      "{(ad.hook || '').slice(0, 110)}…"
                    </div>
                  </div>
                </div>

                {/* Progress bar during export */}
                {isRend && (
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '50px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ background: `linear-gradient(90deg, #c8930a, ${ad.themeColor})`, height: '100%', width: `${generatingProgress}%`, transition: 'width 0.2s ease', borderRadius: '50px' }} />
                  </div>
                )}

                {/* Two Action Buttons: Watch Commercial & Download Video */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedVideoToWatch(ad)}
                    style={{
                      minHeight: '44px', borderRadius: '12px',
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.8rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}
                  >
                    <Play size={14} fill="#ffffff" /> Watch Ad
                  </button>

                  <button
                    type="button"
                    disabled={isRend}
                    onClick={() => handleDownload(ad)}
                    style={{
                      minHeight: '44px', borderRadius: '12px', border: 'none',
                      background: isRend ? 'rgba(245,185,66,0.25)' : `linear-gradient(135deg, #c8930a, ${ad.themeColor === '#38bdf8' ? '#38bdf8' : ad.themeColor === '#e879f9' ? '#e879f9' : '#f5b942'})`,
                      color: '#0c0e14', fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.8rem',
                      cursor: isRend ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    }}
                  >
                    {isRend
                      ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> {generatingProgress}%</>
                      : <><Download size={13} /> Download</>
                    }
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleFade { 0% { transform: scale(0.6); opacity: 0; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        @keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default VideoAdsStudio;
