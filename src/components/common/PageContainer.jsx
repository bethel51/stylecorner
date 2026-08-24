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
}) => {
  return (
    <div className="app-viewport desktop-expanded">
      <AppHeader
        title={title}
        showBack={showBack}
        onOpenAiMatcher={onOpenAiMatcher}
        onOpenCart={onOpenCart}
      />
      <main className="page-scroll-container">
        <div className="page-content page-enter">{children}</div>
      </main>
      <BottomNavigation />
      <PwaInstallPrompt />
    </div>
  );
};
