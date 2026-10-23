import { useEffect } from 'react';

/**
 * SEO Head Component — Dynamically sets document title, meta description,
 * canonical URL, robots directives, and Open Graph / Twitter tags for each page.
 * 
 * Since this is an SPA, we manage head tags via DOM manipulation.
 * This component cleans up after itself on unmount.
 */
export function SEOHead({
  title,
  description,
  canonicalPath = '/',
  ogImage,
  type = 'website',
  noindex = false,
  keywords,
}) {
  useEffect(() => {
    const BASE_URL = 'https://stylecorner.world';
    const defaultTitle = 'Style Corner | Book Barbers, Hairstylists, Nail Techs & Lash Artists';
    const fullTitle = title ? `${title} | Style Corner` : defaultTitle;
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const fullCanonical = `${BASE_URL}${cleanPath === '/' ? '/' : cleanPath.replace(/\/$/, '')}`;
    const defaultDescription =
      'Book top-rated beauty professionals on Style Corner. Connect with verified barbers, hairstylists, wig installers, nail technicians, and lash artists for bespoke salon and grooming appointments.';
    const fullDescription = description || defaultDescription;
    const fullImage = ogImage
      ? (ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`)
      : `${BASE_URL}/images/stylecorner-salon-top.jpg`;
    const robotsDirective = noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

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
        el.setAttribute(rel, href);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard meta
    setMeta('name', 'description', fullDescription);
    setMeta('name', 'robots', robotsDirective);
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // Canonical
    setLink('canonical', fullCanonical);

    // Open Graph
    setMeta('property', 'og:site_name', 'Style Corner');
    setMeta('property', 'og:locale', 'en_US');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', fullDescription);
    setMeta('property', 'og:url', fullCanonical);
    setMeta('property', 'og:image', fullImage);

    // Twitter
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', fullDescription);
    setMeta('name', 'twitter:image', fullImage);

    // Cleanup — restore defaults on unmount
    return () => {
      document.title = defaultTitle;
      setMeta('name', 'description', defaultDescription);
      setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      setLink('canonical', `${BASE_URL}/`);
      setMeta('property', 'og:url', `${BASE_URL}/`);
      setMeta('property', 'og:title', defaultTitle);
      setMeta('property', 'og:description', defaultDescription);
    };
  }, [title, description, canonicalPath, ogImage, type, noindex, keywords]);

  return null;
}
