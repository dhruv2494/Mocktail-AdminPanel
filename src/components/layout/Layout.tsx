import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { clsx } from 'clsx';

const pageTitle: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Student Management',
  '/test-series': 'Test Series Management',
  '/questions': 'Question Bank',
  '/pdfs': 'PDF Management',
  '/categories': 'Category Management',
  '/analytics': 'Analytics',
  '/performance': 'Performance Reports',
  '/settings': 'Settings',
};

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const currentTitle = pageTitle[location.pathname] || 'Admin Panel';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Header 
          title={currentTitle} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};