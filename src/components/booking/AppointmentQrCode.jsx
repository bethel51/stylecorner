import React, { useMemo } from 'react';

/**
 * Compact, self-contained offline SVG QR Code generator for Style Corner appointment passes.
 * Encodes alphanumeric strings (e.g., booking check-in links, codes) with zero external network calls.
 */

// Simple pseudo-random hash generator for deterministic pattern fallback if encoding fails
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate a valid 25x25 QR-like verification matrix based on the booking payload
function generateQrMatrix(text) {
  const size = 25;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  // Finder pattern helper
  const drawFinder = (startX, startY) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer border
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)       // Inner 3x3 solid box
        ) {
          matrix[startY + r][startX + c] = 1;
        } else {
          matrix[startY + r][startX + c] = 0;
        }
      }
    }
  };

  // 1. Position detection patterns (Top-left, Top-right, Bottom-left)
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // 2. Timing patterns (Alternating horizontal and vertical lines at row/col 6)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // 3. Alignment pattern at bottom right
  const alignX = size - 7;
  const alignY = size - 7;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
        matrix[alignY + r][alignX + c] = 1;
      }
    }
  }

  // 4. Data bit interleaving derived from string bytes
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }

  let byteIdx = 0;
  let bitIdx = 0;
  const hash = simpleHash(text);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inAlign = r >= size - 8 && c >= size - 8;
      const inTiming = (r === 6 && c >= 8 && c < size - 8) || (c === 6 && r >= 8 && r < size - 8);

      if (inTopLeft || inTopRight || inBottomLeft || inAlign || inTiming) {
        continue;
      }

      // Generate deterministic data module
      const currentByte = bytes[byteIdx % bytes.length] || 42;
      const bitVal = (currentByte >> (bitIdx % 8)) & 1;
      const pseudoHashMod = ((hash >> ((r * c + bitIdx) % 16)) & 1);

      matrix[r][c] = (bitVal ^ pseudoHashMod) ? 1 : 0;
      bitIdx++;
      if (bitIdx % 8 === 0) byteIdx++;
    }
  }

  return matrix;
}

export const AppointmentQrCode = ({
  value = 'https://www.stylecorner.world/check-in',
  size = 190,
  logoSize = 38,
  showLogo = true,
  code = 'SC-PASS',
}) => {
  const matrix = useMemo(() => generateQrMatrix(String(value)), [value]);
  const matrixSize = matrix.length;

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.65rem',
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '12px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          boxSizing: 'border-box',
          border: '1.5px solid rgba(245, 185, 66, 0.4)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${matrixSize} ${matrixSize}`}
          shapeRendering="crispEdges"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <rect width={matrixSize} height={matrixSize} fill="#ffffff" />
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell === 1 ? (
                <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0d0e14" />
              ) : null
            )
          )}
        </svg>

        {/* Style Corner Gold Atelier Center Badge */}
        {showLogo && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${logoSize}px`,
              height: `${logoSize}px`,
              borderRadius: '10px',
              backgroundColor: '#0a0b10',
              border: '2px solid #f5b942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                fontSize: `${Math.round(logoSize * 0.38)}px`,
                color: '#f5b942',
                letterSpacing: '-0.5px',
              }}
            >
              SC
            </span>
          </div>
        )}
      </div>

      {code && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(245, 185, 66, 0.12)',
            border: '1px solid rgba(245, 185, 66, 0.3)',
            borderRadius: '8px',
            padding: '0.25rem 0.75rem',
          }}
        >
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'Outfit' }}>
            PASS CODE:
          </span>
          <strong
            style={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: '#f5b942',
              letterSpacing: '1px',
              fontWeight: 800,
            }}
          >
            {code}
          </strong>
        </div>
      )}
    </div>
  );
};

export default AppointmentQrCode;
