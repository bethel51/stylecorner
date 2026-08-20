// Theme-aware color tokens for inline styles
// Use: const t = useThemeColors();  then color: t.text, backgroundColor: t.cardBg, etc.

import { useTheme } from '../context/ThemeContext';

const darkColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  bg: '#0d0d0d',
  surface: '#171717',
  cardBg: '#18181b',
  headerBg: 'rgba(18, 18, 18, 0.95)',
  border: 'rgba(255, 255, 255, 0.1)',
  inputBg: '#1f1f1f',
  pillBg: '#1f1f1f',
  pillActiveBg: '#d4af37',
  pillActiveText: '#000000',
  pillText: '#9ca3af',
  tabActiveBg: '#1f1f1f',
  tabActiveText: '#ffffff',
  tabText: '#6b7280',
  accent: '#d4af37',
  overlayBg: 'rgba(0,0,0,0.85)',
};

const lightColors = {
  text: '#171717',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  bg: '#faf9f6',
  surface: '#ffffff',
  cardBg: '#ffffff',
  headerBg: 'rgba(255, 255, 255, 0.96)',
  border: 'rgba(0, 0, 0, 0.08)',
  inputBg: '#ffffff',
  pillBg: '#ffffff',
  pillActiveBg: '#171717',
  pillActiveText: '#ffffff',
  pillText: '#6b7280',
  tabActiveBg: '#ffffff',
  tabActiveText: '#171717',
  tabText: '#6b7280',
  accent: '#b58d19',
  overlayBg: 'rgba(0,0,0,0.65)',
};

export const useThemeColors = () => {
  const { isDark } = useTheme();
  return isDark ? darkColors : lightColors;
};
