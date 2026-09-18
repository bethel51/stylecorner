import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNavigation } from './BottomNavigation';
import { PwaInstallPrompt } from './PwaInstallPrompt';

export const PageContainer = ({
  title,
  showBack,
  onOpenAiMatcher,
  onOpenCart,
  children,
  desktopExpanded = true,
  hideHeader = false,
  hideNav = false,
  noPadding = false,
}) => {
  return (
    <div className="app-viewport desktop-expanded">
      {!hideHeader && (
        <AppHeader
          title={title}
          showBack={showBack}
          onOpenAiMatcher={onOpenAiMatcher}
          onOpenCart={onOpenCart}
        />
      )}
      <main
        className="page-scroll-container"
        style={hideHeader ? { paddingTop: 'env(safe-area-inset-top, 0px)' } : {}}
      >
        <div
          className="page-content page-enter"
          style={noPadding ? { padding: 0 } : {}}
        >
          {children}
        </div>
      </main>
      {!hideNav && <BottomNavigation />}
      <PwaInstallPrompt />
    </div>
  );
};
