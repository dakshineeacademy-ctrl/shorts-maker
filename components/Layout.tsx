import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-[#0f172a] overflow-hidden text-slate-100">
      {children}
    </div>
  );
};

export default Layout;
