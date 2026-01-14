import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="mobile-frame shadow-2xl rounded-[2.5rem] border-8 border-slate-800 relative overflow-hidden bg-background">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50" />
        
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 pt-2 z-40">
          <span className="text-xs font-medium text-foreground">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-foreground rounded-sm relative">
              <div className="absolute inset-0.5 bg-foreground rounded-sm" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="h-[844px] overflow-y-auto overflow-x-hidden scrollbar-hide pt-12 pb-20">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
