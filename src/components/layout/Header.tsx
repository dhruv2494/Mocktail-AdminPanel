import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title: string;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
  const { admin } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="mr-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search..."
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center">
            {admin?.avatar ? (
              <img
                className="h-8 w-8 rounded-full"
                src={admin.avatar}
                alt={admin.name}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">
                  {admin?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};