import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Menu } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  footerVariant?: 'default' | 'minimal';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showFooter = true,
  footerVariant = 'default',
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Sidebar - Show for all pages */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile menu button - fixed position for better UX, hidden when sidebar is open */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="min-h-full w-full pt-14 lg:pt-0">
            {children}
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <Footer variant={footerVariant} />
        )}
      </div>
    </div>
  );
};