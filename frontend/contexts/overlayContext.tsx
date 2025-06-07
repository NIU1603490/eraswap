// contexts/OverlayContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface OverlayContextType {
  isOverlayVisible: boolean;
  setOverlayVisible: (visible: boolean, type?: 'settings' | 'post') => void;
  overlayType?: 'settings' | 'post' | null  ;

}

//create a context object for overlay  (default value is undefined)
const OverlayContext = createContext<OverlayContextType | undefined>(undefined);


//create a provider component for overlay context
//this component will wrap the part of the app that needs access to the overlay context
//it will provide the context value to its children
export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayType, setOverlayType] = useState<'settings' | 'post' | null>(null);

  const setOverlayVisible = (visible: boolean, type?: 'settings' | 'post') => {
    setIsOverlayVisible(visible);
    if (type) {
      setOverlayType(visible  ? type : null);
    }
  }

  return (
    <OverlayContext.Provider value={{ isOverlayVisible, setOverlayVisible, overlayType }}>
      {children}
    </OverlayContext.Provider>
  );
};

//
export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};