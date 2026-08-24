import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset main window scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Reset container scroll if overflow container is used
    const containers = document.querySelectorAll('.page-scroll-container, .page-content');
    containers.forEach((container) => {
      if (container) {
        container.scrollTop = 0;
      }
    });
  }, [pathname]);

  return null;
};
