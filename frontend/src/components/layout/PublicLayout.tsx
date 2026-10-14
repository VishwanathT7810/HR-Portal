import React, { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="ds-layout ds-overflow-x-hidden">
      <main className="ds-layout-main ds-w-full ds-overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
