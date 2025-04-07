import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BrainCapture } from '../components/brain/BrainCapture';

interface BrainCaptureContextType {
  enableCapture: (title: string, content?: string, url?: string) => void;
  disableCapture: () => void;
}

const BrainCaptureContext = createContext<BrainCaptureContextType | undefined>(undefined);

export function useBrainCapture() {
  const context = useContext(BrainCaptureContext);
  if (context === undefined) {
    throw new Error('useBrainCapture must be used within a BrainCaptureProvider');
  }
  return context;
}

interface BrainCaptureProviderProps {
  children: ReactNode;
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
}

export function BrainCaptureProvider({ 
  children, 
  position = "bottom-right" 
}: BrainCaptureProviderProps) {
  const [captureEnabled, setCaptureEnabled] = useState(false);
  const [captureData, setCaptureData] = useState({
    title: '',
    content: '',
    url: ''
  });

  const enableCapture = (title: string, content: string = '', url: string = window.location.href) => {
    setCaptureData({ title, content, url });
    setCaptureEnabled(true);
  };

  const disableCapture = () => {
    setCaptureEnabled(false);
  };

  return (
    <BrainCaptureContext.Provider value={{ enableCapture, disableCapture }}>
      {children}
      
      {captureEnabled && (
        <BrainCapture
          pageTitle={captureData.title}
          pageContent={captureData.content}
          pageUrl={captureData.url}
          position={position}
          onSaved={disableCapture}
        />
      )}
    </BrainCaptureContext.Provider>
  );
}
