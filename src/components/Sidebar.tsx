import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Agents', path: '/agents' },
    { name: 'Chat', path: '/chat' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Knowledge Base', path: '/brain' },
    { name: 'App Builder', path: '/app-builder' },
    { name: 'Studio', path: '/studio' },
    { name: 'Workflows', path: '/workflows' },
    { name: 'API Connect', path: '/api-connect' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">DeepCanvas</h1>
        <p className="text-sm text-gray-500">AI Hub</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 flex-col">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
                          (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block w-full px-3 py-2 rounded-md ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button className="flex items-center px-3 py-2 w-full text-left rounded-md text-gray-700 hover:bg-gray-100">
          Sign Out
        </button>
      </div>
    </div>
  );
}
