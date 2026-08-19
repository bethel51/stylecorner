import React from 'react';
import { PopupModal } from './PopupModal';

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  return (
    <PopupModal isOpen={isOpen} onClose={onClose} title={title}>
      {children}
    </PopupModal>
  );
};

