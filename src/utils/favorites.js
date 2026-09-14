// Unified Favorites storage and listener utility
const FAVORITES_KEY = 'stylecorner_favorites';

export const getFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading favorites:', err);
    return {};
  }
};

export const getFavoritesCount = () => {
  const favs = getFavorites();
  return Object.values(favs).filter(Boolean).length;
};

export const isFavorite = (id) => {
  if (!id) return false;
  const favs = getFavorites();
  return Boolean(favs[id]);
};

export const toggleFavorite = (id) => {
  if (!id) return false;
  const favs = getFavorites();
  const next = !favs[id];
  if (next) {
    favs[id] = true;
  } else {
    delete favs[id];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    window.dispatchEvent(new CustomEvent('favorites_changed', { detail: { id, isFavorite: next, count: Object.keys(favs).length } }));
  } catch (err) {
    console.error('Error saving favorites:', err);
  }
  return next;
};

export const subscribeToFavorites = (callback) => {
  const handler = (e) => {
    callback(getFavorites(), getFavoritesCount(), e?.detail);
  };
  window.addEventListener('favorites_changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('favorites_changed', handler);
    window.removeEventListener('storage', handler);
  };
};
