import React from 'react';
import { FileDown, Image as ImageIcon, Check, Copy } from 'lucide-react';
import { QrWorldSvg, QrRecruitSvg } from './QrCodeSvgs';

/* ═══════════════════════════════════════════════════════════════
   PHONE SHOWCASE FLYER CARD — StyleCorner × Peacelogs Reference
   3 variants: girl-1 (customer), boy-1 (expert), girl-2 (VIP)
   Layout: Header pill → Big headline → Hero (char + phone + pills)
           → Trust bar → Action buttons
═══════════════════════════════════════════════════════════════ */

/* ── Floating pill component ── */
const FloatingPill = ({ text, side, index, total, gold }) => {
  const baseDelay = index * 0.18;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: gold
          ? 'rgba(245,185,66,0.13)'
          : 'rgba(255,255,255,0.07)',
        border: gold
          ? '1px solid rgba(245,185,66,0.55)'
          : '1px solid rgba(255,255,255,0.14)',
        borderRadius: '100px',
        padding: '5px 13px',
        fontSize: 'clamp(9px, 1.7vw, 11.5px)',
        fontWeight: 600,
        color: gold ? '#F5B942' : '#e2e8f0',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
        boxShadow: gold
          ? '0 4px 18px rgba(245,185,66,0.18)'
          : '0 4px 14px rgba(0,0,0,0.4)',
        animation: `pillFloat${index % 3} 3s ${baseDelay}s ease-in-out infinite`,
        letterSpacing: '0.01em',
      }}
    >
      {text}
    </div>
  );
};

/* ── SVG: Girl 1 (natural braids, dark skin, holding phone up) ── */
const GirlOneChar = () => (
  <svg width="200" height="320" viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Neck */}
    <rect x="88" y="112" width="24" height="28" rx="8" fill="#6B3A2A"/>
    {/* Head */}
    <ellipse cx="100" cy="90" rx="36" ry="38" fill="#6B3A2A"/>
    {/* Face highlight */}
    <ellipse cx="100" cy="88" rx="28" ry="30" fill="#7A4535"/>
    {/* Eyes */}
    <ellipse cx="88" cy="85" rx="5" ry="6" fill="#1a0a00"/>
    <ellipse cx="112" cy="85" rx="5" ry="6" fill="#1a0a00"/>
    <ellipse cx="89.5" cy="83.5" rx="1.5" ry="2" fill="white"/>
    <ellipse cx="113.5" cy="83.5" rx="1.5" ry="2" fill="white"/>
    {/* Smile */}
    <path d="M89 100 Q100 112 111 100" stroke="#4a1a0a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Lips */}
    <ellipse cx="100" cy="103" rx="10" ry="4.5" fill="#c0392b" opacity="0.85"/>
    {/* Braids — thick cornrow-style */}
    <path d="M68 80 Q60 50 72 20" stroke="#2d1008" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M78 72 Q74 40 82 10" stroke="#2d1008" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M88 68 Q88 35 92 5" stroke="#3b1510" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M100 67 Q102 33 100 3" stroke="#2d1008" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M112 68 Q114 34 110 4" stroke="#3b1510" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M122 72 Q128 40 120 12" stroke="#2d1008" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M132 80 Q142 52 130 22" stroke="#2d1008" strokeWidth="9" fill="none" strokeLinecap="round"/>
    {/* Braid bun / base */}
    <ellipse cx="100" cy="58" rx="36" ry="14" fill="#2d1008" opacity="0.9"/>
    {/* Gold braid cuff accent */}
    <rect x="63" y="62" width="12" height="4" rx="2" fill="#F5B942" opacity="0.8"/>
    <rect x="125" y="62" width="12" height="4" rx="2" fill="#F5B942" opacity="0.8"/>
    {/* Shoulders / top of body - crop-top blue */}
    <path d="M50 140 Q50 168 50 200 L150 200 Q150 168 150 140 Q130 128 100 128 Q70 128 50 140Z" fill="#1d3a6e"/>
    {/* Neckline gold trim */}
    <path d="M78 130 Q100 138 122 130" stroke="#F5B942" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Left arm reaching forward to hold phone */}
    <path d="M52 155 Q30 165 22 188 Q18 200 24 212 Q30 220 38 218 Q42 216 48 208" stroke="#6B3A2A" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M52 155 Q30 165 22 188 Q18 200 24 212 Q30 220 38 218 Q42 216 48 208" stroke="#7A4535" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Right arm reaching forward */}
    <path d="M148 155 Q170 165 178 188 Q182 200 176 212 Q170 220 162 218 Q158 216 152 208" stroke="#6B3A2A" strokeWidth="22" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M148 155 Q170 165 178 188 Q182 200 176 212 Q170 220 162 218 Q158 216 152 208" stroke="#7A4535" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Left hand fingers */}
    <ellipse cx="42" cy="213" rx="7" ry="12" fill="#6B3A2A" transform="rotate(-20,42,213)"/>
    <ellipse cx="52" cy="218" rx="6" ry="11" fill="#6B3A2A" transform="rotate(-10,52,218)"/>
    <ellipse cx="62" cy="220" rx="6" ry="10" fill="#6B3A2A"/>
    <ellipse cx="72" cy="219" rx="6" ry="9" fill="#6B3A2A" transform="rotate(10,72,219)"/>
    {/* Right hand fingers */}
    <ellipse cx="158" cy="213" rx="7" ry="12" fill="#6B3A2A" transform="rotate(20,158,213)"/>
    <ellipse cx="148" cy="218" rx="6" ry="11" fill="#6B3A2A" transform="rotate(10,148,218)"/>
    <ellipse cx="138" cy="220" rx="6" ry="10" fill="#6B3A2A"/>
    <ellipse cx="128" cy="219" rx="6" ry="9" fill="#6B3A2A" transform="rotate(-10,128,219)"/>
    {/* Gold rings — left hand */}
    <rect x="36" y="206" width="12" height="3.5" rx="1.75" fill="#F5B942"/>
    <rect x="46" y="210" width="12" height="3.5" rx="1.75" fill="#F5B942" opacity="0.85"/>
    {/* Gold bangles left wrist */}
    <ellipse cx="36" cy="216" rx="9" ry="3.5" stroke="#F5B942" strokeWidth="2.5" fill="none"/>
    <ellipse cx="36" cy="221" rx="9" ry="3" stroke="#C8930A" strokeWidth="2" fill="none"/>
    {/* Gold rings — right hand */}
    <rect x="152" y="206" width="12" height="3.5" rx="1.75" fill="#F5B942"/>
    <rect x="142" y="210" width="12" height="3.5" rx="1.75" fill="#F5B942" opacity="0.85"/>
    {/* Nail art — manicured gold-tipped nails */}
    <ellipse cx="42" cy="204" rx="5" ry="2.5" fill="#F5B942" transform="rotate(-20,42,204)"/>
    <ellipse cx="52" cy="208" rx="5" ry="2.5" fill="#e91e8c" transform="rotate(-10,52,208)"/>
    <ellipse cx="62" cy="209" rx="5" ry="2.5" fill="#F5B942"/>
    <ellipse cx="72" cy="208" rx="4.5" ry="2.5" fill="#e91e8c" transform="rotate(10,72,208)"/>
    <ellipse cx="158" cy="204" rx="5" ry="2.5" fill="#F5B942" transform="rotate(20,158,204)"/>
    <ellipse cx="148" cy="208" rx="5" ry="2.5" fill="#e91e8c" transform="rotate(10,148,208)"/>
    <ellipse cx="138" cy="209" rx="5" ry="2.5" fill="#F5B942"/>
    <ellipse cx="128" cy="208" rx="4.5" ry="2.5" fill="#e91e8c" transform="rotate(-10,128,208)"/>
    {/* Earrings */}
    <circle cx="65" cy="100" r="3" fill="#F5B942"/>
    <ellipse cx="65" cy="106" rx="2" ry="4" fill="#F5B942" opacity="0.8"/>
    <circle cx="135" cy="100" r="3" fill="#F5B942"/>
    <ellipse cx="135" cy="106" rx="2" ry="4" fill="#F5B942" opacity="0.8"/>
  </svg>
);

/* ── SVG: Boy (fade cut, dark skin, barber-style) ── */
const BoyChar = () => (
  <svg width="200" height="320" viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Neck */}
    <rect x="86" y="114" width="28" height="26" rx="8" fill="#5C3020"/>
    {/* Head — slightly broader */}
    <ellipse cx="100" cy="90" rx="38" ry="36" fill="#5C3020"/>
    <ellipse cx="100" cy="88" rx="30" ry="28" fill="#6B3A2A"/>
    {/* Eyes */}
    <ellipse cx="87" cy="86" rx="5.5" ry="6" fill="#0d0500"/>
    <ellipse cx="113" cy="86" rx="5.5" ry="6" fill="#0d0500"/>
    <ellipse cx="88.5" cy="84" rx="1.8" ry="2.2" fill="white"/>
    <ellipse cx="114.5" cy="84" rx="1.8" ry="2.2" fill="white"/>
    {/* Eyebrows */}
    <path d="M80 78 Q87 74 95 78" stroke="#2d1008" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M105 78 Q113 74 120 78" stroke="#2d1008" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Smile / confident smirk */}
    <path d="M90 100 Q100 110 110 100" stroke="#3a1505" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Lips */}
    <ellipse cx="100" cy="102" rx="9" ry="4" fill="#8B3A2A" opacity="0.9"/>
    {/* Fade haircut — sharp top */}
    <ellipse cx="100" cy="64" rx="36" ry="30" fill="#1a0a00"/>
    {/* Fade line */}
    <path d="M63 85 Q65 75 68 70" stroke="#1a0a00" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M137 85 Q135 75 132 70" stroke="#1a0a00" strokeWidth="8" fill="none" strokeLinecap="round"/>
    {/* Gold fade-line detail */}
    <path d="M66 88 Q66 82 70 78" stroke="#F5B942" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M134 88 Q134 82 130 78" stroke="#F5B942" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
    {/* Beard / stubble */}
    <path d="M78 108 Q100 118 122 108" stroke="#1a0a00" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.6"/>
    {/* Body — barber polo navy */}
    <path d="M46 142 Q46 168 46 200 L154 200 Q154 168 154 142 Q132 128 100 128 Q68 128 46 142Z" fill="#0a1f3f"/>
    {/* Collar detail */}
    <path d="M82 130 L100 138 L118 130" stroke="#F5B942" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Left arm big forward */}
    <path d="M48 158 Q26 170 20 194 Q16 208 22 218 Q28 226 40 222 Q46 218 52 210" stroke="#5C3020" strokeWidth="24" fill="none" strokeLinecap="round"/>
    <path d="M48 158 Q26 170 20 194 Q16 208 22 218 Q28 226 40 222 Q46 218 52 210" stroke="#6B3A2A" strokeWidth="14" fill="none" strokeLinecap="round"/>
    {/* Right arm */}
    <path d="M152 158 Q174 170 180 194 Q184 208 178 218 Q172 226 160 222 Q154 218 148 210" stroke="#5C3020" strokeWidth="24" fill="none" strokeLinecap="round"/>
    <path d="M152 158 Q174 170 180 194 Q184 208 178 218 Q172 226 160 222 Q154 218 148 210" stroke="#6B3A2A" strokeWidth="14" fill="none" strokeLinecap="round"/>
    {/* Left hand fingers */}
    <ellipse cx="44" cy="216" rx="8" ry="13" fill="#5C3020" transform="rotate(-20,44,216)"/>
    <ellipse cx="55" cy="222" rx="7" ry="12" fill="#5C3020" transform="rotate(-8,55,222)"/>
    <ellipse cx="66" cy="224" rx="7" ry="11" fill="#5C3020"/>
    <ellipse cx="77" cy="222" rx="6" ry="10" fill="#5C3020" transform="rotate(10,77,222)"/>
    {/* Right hand fingers */}
    <ellipse cx="156" cy="216" rx="8" ry="13" fill="#5C3020" transform="rotate(20,156,216)"/>
    <ellipse cx="145" cy="222" rx="7" ry="12" fill="#5C3020" transform="rotate(8,145,222)"/>
    <ellipse cx="134" cy="224" rx="7" ry="11" fill="#5C3020"/>
    <ellipse cx="123" cy="222" rx="6" ry="10" fill="#5C3020" transform="rotate(-10,123,222)"/>
    {/* Watch — left wrist */}
    <rect x="32" y="212" width="20" height="12" rx="4" fill="#1a1a2e" stroke="#F5B942" strokeWidth="2"/>
    <rect x="35" y="215" width="14" height="6" rx="2" fill="#0d6efd"/>
    {/* Gold ring */}
    <rect x="54" y="212" width="14" height="3.5" rx="1.75" fill="#F5B942"/>
    {/* Nails */}
    <ellipse cx="44" cy="203" rx="6" ry="3" fill="#2d1008" transform="rotate(-20,44,203)"/>
    <ellipse cx="55" cy="209" rx="5.5" ry="2.8" fill="#2d1008" transform="rotate(-8,55,209)"/>
    <ellipse cx="66" cy="211" rx="5.5" ry="2.8" fill="#2d1008"/>
    <ellipse cx="77" cy="209" rx="5" ry="2.8" fill="#2d1008" transform="rotate(10,77,209)"/>
    <ellipse cx="156" cy="203" rx="6" ry="3" fill="#2d1008" transform="rotate(20,156,203)"/>
    <ellipse cx="145" cy="209" rx="5.5" ry="2.8" fill="#2d1008" transform="rotate(8,145,209)"/>
    <ellipse cx="134" cy="211" rx="5.5" ry="2.8" fill="#2d1008"/>
    <ellipse cx="123" cy="209" rx="5" ry="2.8" fill="#2d1008" transform="rotate(-10,123,209)"/>
  </svg>
);

/* ── SVG: Girl 2 (goddess locs, glam, VIP) ── */
const GirlTwoChar = () => (
  <svg width="200" height="320" viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Neck */}
    <rect x="88" y="110" width="24" height="30" rx="8" fill="#8B5E3C"/>
    {/* Head */}
    <ellipse cx="100" cy="88" rx="35" ry="37" fill="#8B5E3C"/>
    <ellipse cx="100" cy="86" rx="28" ry="29" fill="#9B6E4C"/>
    {/* Eyes — winged liner glam */}
    <ellipse cx="87" cy="84" rx="5.5" ry="5.5" fill="#0d0500"/>
    <ellipse cx="113" cy="84" rx="5.5" ry="5.5" fill="#0d0500"/>
    <ellipse cx="88.5" cy="82.5" rx="1.8" ry="2" fill="white"/>
    <ellipse cx="114.5" cy="82.5" rx="1.8" ry="2" fill="white"/>
    {/* Winged eyeliner */}
    <path d="M80 82 Q87 78 94 82" stroke="#0d0500" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M80 82 L76 78" stroke="#0d0500" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M106 82 Q113 78 120 82" stroke="#0d0500" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M120 82 L124 78" stroke="#0d0500" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Lips — bold */}
    <ellipse cx="100" cy="102" rx="11" ry="5.5" fill="#d4145a"/>
    <path d="M89 100 L100 94 L111 100" fill="#d4145a"/>
    {/* Lash extensions */}
    <path d="M82 80 L79 74" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    <path d="M85 78 L83 71" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    <path d="M88 77 L87 70" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    <path d="M91 77 L91 70" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    <path d="M118 80 L121 74" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    <path d="M115 78 L117 71" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    <path d="M112 77 L113 70" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    <path d="M109 77 L109 70" stroke="#0d0500" strokeWidth="1.2" fill="none"/>
    {/* Goddess locs — thick, long flowing */}
    <path d="M68 82 Q50 55 56 20" stroke="#4a2c0a" strokeWidth="11" fill="none" strokeLinecap="round"/>
    <path d="M76 74 Q62 42 66 8" stroke="#3d200a" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M86 70 Q78 36 80 2" stroke="#4a2c0a" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M96 68 Q92 32 92 0" stroke="#3d200a" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M104 68 Q108 32 108 0" stroke="#4a2c0a" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M114 70 Q122 36 120 2" stroke="#3d200a" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M124 74 Q138 42 134 8" stroke="#4a2c0a" strokeWidth="9" fill="none" strokeLinecap="round"/>
    <path d="M132 82 Q150 55 144 20" stroke="#3d200a" strokeWidth="11" fill="none" strokeLinecap="round"/>
    {/* Locs base */}
    <ellipse cx="100" cy="60" rx="38" ry="16" fill="#3d200a" opacity="0.95"/>
    {/* Gold locs cuffs (multiple) */}
    <rect x="56" y="55" width="14" height="4" rx="2" fill="#F5B942"/>
    <rect x="56" y="60" width="14" height="3" rx="1.5" fill="#C8930A" opacity="0.7"/>
    <rect x="130" y="55" width="14" height="4" rx="2" fill="#F5B942"/>
    <rect x="130" y="60" width="14" height="3" rx="1.5" fill="#C8930A" opacity="0.7"/>
    <rect x="88" y="50" width="12" height="3.5" rx="1.75" fill="#F5B942" opacity="0.9"/>
    <rect x="100" y="50" width="12" height="3.5" rx="1.75" fill="#F5B942" opacity="0.9"/>
    {/* Body — glam burgundy/rose */}
    <path d="M48 140 Q48 168 48 200 L152 200 Q152 168 152 140 Q130 126 100 126 Q70 126 48 140Z" fill="#6d1c38"/>
    {/* Off-shoulder strap gold */}
    <path d="M48 142 Q64 134 80 130" stroke="#F5B942" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M152 142 Q136 134 120 130" stroke="#F5B942" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Left arm reaching */}
    <path d="M50 152 Q28 166 22 192 Q18 206 24 216 Q32 226 44 220 Q50 216 56 208" stroke="#8B5E3C" strokeWidth="22" fill="none" strokeLinecap="round"/>
    <path d="M50 152 Q28 166 22 192 Q18 206 24 216 Q32 226 44 220 Q50 216 56 208" stroke="#9B6E4C" strokeWidth="13" fill="none" strokeLinecap="round"/>
    {/* Right arm */}
    <path d="M150 152 Q172 166 178 192 Q182 206 176 216 Q168 226 156 220 Q150 216 144 208" stroke="#8B5E3C" strokeWidth="22" fill="none" strokeLinecap="round"/>
    <path d="M150 152 Q172 166 178 192 Q182 206 176 216 Q168 226 156 220 Q150 216 144 208" stroke="#9B6E4C" strokeWidth="13" fill="none" strokeLinecap="round"/>
    {/* Left hand fingers */}
    <ellipse cx="43" cy="212" rx="7" ry="12" fill="#8B5E3C" transform="rotate(-20,43,212)"/>
    <ellipse cx="53" cy="218" rx="6.5" ry="11" fill="#8B5E3C" transform="rotate(-8,53,218)"/>
    <ellipse cx="63" cy="220" rx="6" ry="10" fill="#8B5E3C"/>
    <ellipse cx="73" cy="218" rx="6" ry="9" fill="#8B5E3C" transform="rotate(10,73,218)"/>
    {/* Right hand fingers */}
    <ellipse cx="157" cy="212" rx="7" ry="12" fill="#8B5E3C" transform="rotate(20,157,212)"/>
    <ellipse cx="147" cy="218" rx="6.5" ry="11" fill="#8B5E3C" transform="rotate(8,147,218)"/>
    <ellipse cx="137" cy="220" rx="6" ry="10" fill="#8B5E3C"/>
    <ellipse cx="127" cy="218" rx="6" ry="9" fill="#8B5E3C" transform="rotate(-10,127,218)"/>
    {/* Bangles — stacked gold + rose */}
    <ellipse cx="38" cy="215" rx="10" ry="4" stroke="#F5B942" strokeWidth="2.5" fill="none"/>
    <ellipse cx="38" cy="220" rx="10" ry="3.5" stroke="#C8930A" strokeWidth="2" fill="none"/>
    <ellipse cx="38" cy="225" rx="10" ry="3" stroke="#d4145a" strokeWidth="1.5" fill="none"/>
    <ellipse cx="162" cy="215" rx="10" ry="4" stroke="#F5B942" strokeWidth="2.5" fill="none"/>
    <ellipse cx="162" cy="220" rx="10" ry="3.5" stroke="#C8930A" strokeWidth="2" fill="none"/>
    <ellipse cx="162" cy="225" rx="10" ry="3" stroke="#d4145a" strokeWidth="1.5" fill="none"/>
    {/* Nails — glam pink-gold */}
    <ellipse cx="43" cy="200" rx="5.5" ry="2.8" fill="#d4145a" transform="rotate(-20,43,200)"/>
    <ellipse cx="53" cy="206" rx="5" ry="2.5" fill="#F5B942" transform="rotate(-8,53,206)"/>
    <ellipse cx="63" cy="208" rx="5" ry="2.5" fill="#d4145a"/>
    <ellipse cx="73" cy="206" rx="4.5" ry="2.5" fill="#F5B942" transform="rotate(10,73,206)"/>
    <ellipse cx="157" cy="200" rx="5.5" ry="2.8" fill="#d4145a" transform="rotate(20,157,200)"/>
    <ellipse cx="147" cy="206" rx="5" ry="2.5" fill="#F5B942" transform="rotate(8,147,206)"/>
    <ellipse cx="137" cy="208" rx="5" ry="2.5" fill="#d4145a"/>
    <ellipse cx="127" cy="206" rx="4.5" ry="2.5" fill="#F5B942" transform="rotate(-10,127,206)"/>
    {/* Dangling earrings — gold chain-style */}
    <circle cx="64" cy="98" r="3.5" fill="#F5B942"/>
    <line x1="64" y1="101" x2="64" y2="108" stroke="#F5B942" strokeWidth="1.5"/>
    <ellipse cx="64" cy="111" rx="3" ry="4.5" fill="#F5B942" opacity="0.9"/>
    <circle cx="136" cy="98" r="3.5" fill="#F5B942"/>
    <line x1="136" y1="101" x2="136" y2="108" stroke="#F5B942" strokeWidth="1.5"/>
    <ellipse cx="136" cy="111" rx="3" ry="4.5" fill="#F5B942" opacity="0.9"/>
  </svg>
);

/* ── StyleCorner gold squircle logo ── */
const SCLogoMini = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="url(#scGrad)"/>
    <rect x="6" y="6" width="20" height="20" rx="5" fill="#08090C" opacity="0.75"/>
    <defs>
      <linearGradient id="scGrad" x1="0" y1="0" x2="32" y2="32">
        <stop offset="0%" stopColor="#FFF3C4"/>
        <stop offset="45%" stopColor="#F5B942"/>
        <stop offset="100%" stopColor="#8C6000"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ══════════════════════════════════════════════════
   MAIN EXPORTED COMPONENT
══════════════════════════════════════════════════ */
export const PhoneShowcaseFlyerCard = React.forwardRef(({
  flyer,
  onSavePdf,
  onSaveImage,
  onCopyLink,
  copied,
  savingPdf,
}, ref) => {
  const isGirl1 = flyer.characterType === 'girl-1';
  const isBoy   = flyer.characterType === 'boy-1';
  const isGirl2 = flyer.characterType === 'girl-2';

  const accentColor  = flyer.accentGold || '#F5B942';
  const accentDark   = '#C8930A';
  const bgColor      = '#07080c';

  const leftPills  = flyer.floatingPillsLeft  || [];
  const rightPills = flyer.floatingPillsRight || [];

  return (
    <div
      ref={ref}
      className="print-card phone-showcase-card"
      data-design={flyer.id}
      style={{
        width: '100%',
        backgroundColor: bgColor,
        backgroundImage:
          'radial-gradient(ellipse at 50% 35%, #1c1608 0%, #0f1119 55%, #040508 100%)',
        borderRadius: '28px',
        border: `1.5px solid rgba(245,185,66,0.30)`,
        boxShadow:
          '0 40px 120px rgba(0,0,0,0.97), 0 0 60px rgba(245,185,66,0.10)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 1.5rem 0',
        boxSizing: 'border-box',
        color: '#ffffff',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── Keyframe styles injected once ── */}
      <style>{`
        @keyframes pillFloat0 {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes pillFloat1 {
          0%,100% { transform: translateY(-4px); }
          50% { transform: translateY(4px); }
        }
        @keyframes pillFloat2 {
          0%,100% { transform: translateY(3px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes phonePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(245,185,66,0.38); }
          50% { box-shadow: 0 0 0 10px rgba(245,185,66,0); }
        }
        @keyframes bgOrb {
          0%,100% { opacity: 0.18; transform: scale(1); }
          50% { opacity: 0.28; transform: scale(1.1); }
        }
      `}</style>

      {/* Top gold bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: `linear-gradient(90deg, transparent, ${accentColor}, ${accentDark}, ${accentColor}, transparent)`,
        zIndex: 10,
      }}/>

      {/* Background glow orb */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translateX(-50%)',
        width: '65%', height: '45%',
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(245,185,66,0.10) 0%, transparent 70%)`,
        animation: 'bgOrb 4s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 1,
      }}/>

      {/* ════ HEADER AREA ════ */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem 1.5rem 0',
        boxSizing: 'border-box',
        zIndex: 5,
        position: 'relative',
      }}>
        {/* Brand pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          backgroundColor: 'rgba(15,17,25,0.95)',
          border: `1.5px solid rgba(245,185,66,0.50)`,
          borderRadius: '100px',
          padding: '0.35rem 1.1rem 0.35rem 0.45rem',
          marginBottom: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.55)',
        }}>
          <SCLogoMini size={28}/>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: accentColor, letterSpacing: '0.08em', lineHeight: 1.1 }}>
              {flyer.badgeTop || 'STYLECORNER NIGERIA'}
            </div>
            <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', lineHeight: 1.1 }}>
              {flyer.badgeSub || 'LAGOS & IBADAN'}
            </div>
          </div>
        </div>

        {/* Big headline */}
        <h2 style={{
          margin: '0 0 0.4rem',
          fontWeight: 900,
          fontSize: 'clamp(1.35rem, 5.5vw, 1.85rem)',
          lineHeight: 1.18,
          textAlign: 'center',
          letterSpacing: '-0.01em',
          color: '#fff',
        }}>
          {flyer.headlineWhite || 'Get Everything You Need'}{' '}
          <span style={{
            color: accentColor,
            display: 'inline',
          }}>
            {flyer.headlineGold || 'From One Place.'}
          </span>
        </h2>

        {/* Sub-description */}
        <p style={{
          margin: '0',
          fontSize: 'clamp(0.7rem, 2.4vw, 0.82rem)',
          lineHeight: 1.55,
          textAlign: 'center',
          color: 'rgba(210,220,240,0.75)',
          maxWidth: '380px',
          fontWeight: 400,
        }}>
          {flyer.description || ''}
        </p>
      </div>

      {/* ════ HERO: Character + Phone + Floating Pills ════ */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '360px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginTop: '0.5rem',
        zIndex: 5,
      }}>

        {/* LEFT PILLS COLUMN */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '32%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '0.55rem',
          paddingLeft: '0.7rem',
          zIndex: 8,
        }}>
          {leftPills.map((pill, i) => (
            <FloatingPill key={i} text={pill} side="left" index={i} total={leftPills.length} gold={i % 2 === 0}/>
          ))}
        </div>

        {/* CENTER: Character SVG + Phone overlay */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          width: '36%',
          minWidth: '160px',
          zIndex: 7,
        }}>
          {/* Character */}
          <div style={{ position: 'relative', zIndex: 6, marginBottom: '-8px' }}>
            {isGirl1 && <GirlOneChar/>}
            {isBoy   && <BoyChar/>}
            {isGirl2 && <GirlTwoChar/>}
          </div>

          {/* Phone — overlaid in character's hands */}
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90px',
            height: '155px',
            borderRadius: '14px',
            border: `3px solid ${accentColor}`,
            backgroundColor: '#ffffff',
            boxShadow: `0 0 0 1.5px ${accentDark}, 0 12px 40px rgba(0,0,0,0.7), 0 0 30px rgba(245,185,66,0.3)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: 'phonePulse 2.5s ease-in-out infinite',
            zIndex: 9,
          }}>
            {/* Phone notch */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '28px', height: '6px', borderRadius: '0 0 4px 4px',
              backgroundColor: '#08090C',
            }}/>

            {/* Phone screen content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '10px 4px 4px',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(160deg, #fff8e8 0%, #ffffff 100%)',
            }}>
              {/* Mini logo */}
              <div style={{
                width: '22px', height: '22px', borderRadius: '5px',
                background: 'linear-gradient(135deg, #F5B942, #C8930A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2px',
              }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2.5px', backgroundColor: '#08090C' }}/>
              </div>
              <div style={{ fontSize: '6px', fontWeight: 800, color: '#08090C', letterSpacing: '0.04em', textAlign: 'center' }}>
                STYLECORNER
              </div>

              {/* QR code */}
              <div style={{ width: '60px', height: '60px' }}>
                {flyer.qrType === 'recruit'
                  ? <QrRecruitSvg size={60}/>
                  : <QrWorldSvg size={60}/>
                }
              </div>

              <div style={{
                fontSize: '5px', fontWeight: 700, color: '#08090C',
                letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.3,
                opacity: 0.8,
              }}>
                SCAN TO {flyer.qrType === 'recruit' ? 'JOIN' : 'BOOK'}
              </div>
            </div>
          </div>

          {/* Callout dashed oval */}
          <div style={{
            position: 'absolute',
            top: '55px',
            right: '-28px',
            zIndex: 11,
          }}>
            <svg width="86" height="44" viewBox="0 0 86 44">
              <ellipse cx="43" cy="22" rx="40" ry="18" stroke={accentColor} strokeWidth="1.6" strokeDasharray="4 3" fill="rgba(245,185,66,0.08)"/>
              <text x="43" y="26" textAnchor="middle" fill={accentColor} fontSize="8" fontWeight="700" fontFamily="Outfit,sans-serif">
                {flyer.calloutText || 'Join Us Now!!'}
              </text>
            </svg>
            {/* Arrow cursor */}
            <div style={{
              position: 'absolute', bottom: '-10px', left: '12px',
              fontSize: '14px', transform: 'rotate(10deg)',
            }}>↖</div>
          </div>
        </div>

        {/* RIGHT PILLS COLUMN */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '32%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '0.55rem',
          paddingRight: '0.7rem',
          zIndex: 8,
        }}>
          {rightPills.map((pill, i) => (
            <FloatingPill key={i} text={pill} side="right" index={i} total={rightPills.length} gold={i % 2 === 1}/>
          ))}
        </div>
      </div>

      {/* ════ TRUST BAR ════ */}
      <div style={{
        width: '90%',
        display: 'flex',
        justifyContent: 'center',
        gap: '0.9rem',
        flexWrap: 'wrap',
        margin: '0.75rem 0',
        padding: '0.6rem 1rem',
        backgroundColor: 'rgba(245,185,66,0.06)',
        border: `1px solid rgba(245,185,66,0.18)`,
        borderRadius: '14px',
        zIndex: 5,
        position: 'relative',
      }}>
        {(flyer.trustPoints || []).map((pt, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: 'clamp(0.62rem, 1.8vw, 0.72rem)',
            fontWeight: 600,
            color: 'rgba(230,230,230,0.88)',
          }}>
            <span>{pt.icon}</span>
            <span>{pt.text}</span>
          </div>
        ))}
      </div>

      {/* ════ URL STRIP ════ */}
      <div style={{
        fontSize: 'clamp(0.65rem, 1.9vw, 0.75rem)',
        fontWeight: 700,
        color: accentColor,
        letterSpacing: '0.06em',
        marginBottom: '0.75rem',
        zIndex: 5,
        position: 'relative',
        opacity: 0.85,
      }}>
        {flyer.cardUrl || 'www.stylecorner.world'}
      </div>

      {/* ════ ACTION BUTTONS ════ */}
      <div style={{
        display: 'flex',
        gap: '0.55rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '0 1rem',
        zIndex: 5,
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* PDF */}
        <button
          onClick={onSavePdf}
          disabled={savingPdf}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            border: 'none',
            background: savingPdf
              ? 'rgba(245,185,66,0.25)'
              : `linear-gradient(135deg, ${accentColor}, ${accentDark})`,
            color: savingPdf ? accentColor : '#08090C',
            fontWeight: 800,
            fontSize: '0.72rem',
            letterSpacing: '0.03em',
            cursor: savingPdf ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          <FileDown size={13}/>
          {savingPdf ? 'Saving…' : 'Save PDF'}
        </button>

        {/* PNG */}
        <button
          onClick={onSaveImage}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            border: '1.5px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.72rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          <ImageIcon size={13}/>
          Save PNG
        </button>

        {/* Copy Link */}
        <button
          onClick={onCopyLink}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            border: copied ? '1.5px solid #22c55e' : '1.5px solid rgba(255,255,255,0.12)',
            backgroundColor: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
            color: copied ? '#22c55e' : 'rgba(255,255,255,0.7)',
            fontWeight: 700,
            fontSize: '0.72rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.25s',
          }}
        >
          {copied ? <Check size={13}/> : <Copy size={13}/>}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Bottom gold bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3.5px',
        background: `linear-gradient(90deg, transparent, ${accentDark}, ${accentColor}, ${accentDark}, transparent)`,
        zIndex: 10,
      }}/>
    </div>
  );
});

PhoneShowcaseFlyerCard.displayName = 'PhoneShowcaseFlyerCard';
export default PhoneShowcaseFlyerCard;
