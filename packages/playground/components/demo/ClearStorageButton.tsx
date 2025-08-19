'use client';

import { OnchainKitComponent } from '@/types/onchainkit';
import { useContext } from 'react';
import { AppContext } from '../AppProvider';

export function ClearStorageButton() {
  const { setActiveComponent } = useContext(AppContext);

  const clearStorageAndSetLanding = () => {
    // Clear all OnchainKit localStorage entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ock-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Set to Landing Page
    setActiveComponent?.(OnchainKitComponent.LandingPage);
    
    // Reload to ensure clean state
    window.location.reload();
  };

  return (
    <button
      onClick={clearStorageAndSetLanding}
      className="text-xs text-blue-400 hover:text-blue-300 underline"
    >
      Reset to Landing Page
    </button>
  );
}
