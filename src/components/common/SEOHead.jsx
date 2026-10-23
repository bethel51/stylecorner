import { useEffect } from 'react';

/**
 * SEO Head Component — Dynamically sets document title, meta description,
 * canonical URL, and Open Graph tags for each page.
 * 
 * Since this is an SPA, we manage head tags via DOM manipulation.
 * This component cleans up after itself on unmount.
 */
export function SEOHead({ title, description, canonicalPath = '/', ogImage }) {
  useEffect(() => {
    const BASE_URL = 'https://stylecorner.world';
    const fullTitle = title
      ? `${title} | Style Corner`
      : 'Style Corner | Modern Grooming & Atelier Styling';
    const fullCanonical = `${BASE_URL}${canonicalPath}`;
    const fullDescription =
      description ||
      'Style Corner - Premium salon booking, specialist matching, digital wallet payments, and luxury grooming store.';
    const fullImage = ogImage
      ? (ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`)
      : `${BASE_URL}/images/stylecorner-salon-top.jpg`;

    // Title
    document.title = fullTitle;

    // Helper: set or create a meta tag
    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper: set or create a link tag
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard meta
    setMeta('name', 'description', fullDescription);

    // Canonical
    setLink('canonical', fullCanonical);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', fullDescription);
    setMeta('property', 'og:url', fullCanonical);
    setMeta('property', 'og:image', fullImage);

    // Twitter
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', fullDescription);
    setMeta('name', 'twitter:image', fullImage);

    // Cleanup — restore defaults on unmount
    return () => {
      document.title = 'Style Corner | Modern Grooming & Atelier Styling';
      setMeta('name', 'description', 'Style Corner - Premium salon booking, specialist matching, digital wallet payments, and luxury grooming store. Book appointments with elite barbers, wig technicians, and beauty experts in seconds.');
      setLink('canonical', `${BASE_URL}/`);
      setMeta('property', 'og:url', `${BASE_URL}/`);
    };
  }, [title, description, canonicalPath, ogImage]);

  return null;
}
