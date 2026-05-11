import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Fuel, Car, BarChart3, Plus, LogOut } from 'lucide-react';
import { api } from '../api';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: BarChart3, label: '总览' },
    { path: '/vehicles', icon: Car, label: '车辆' },
    { path: '/records', icon: Fuel, label: '记录' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50">
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-blue-600">
            <Fuel className="w-7 h-7" />
            <span>油耗助手</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            to="/records/new"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            记一笔
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 lg:ml-60 xl:ml-64">
        {/* Mobile Header — hidden on desktop */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-blue-600">
              <Fuel className="w-6 h-6" />
              <span>油耗助手</span>
            </Link>
            <Link
              to="/records/new"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              记一笔
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 lg:py-6 lg:px-8">
          {children}
        </main>

        {/* Mobile Bottom Nav — hidden on desktop */}
        <nav className="lg:hidden bg-white border-t border-gray-200 sticky bottom-0 z-50">
          <div className="max-w-2xl mx-auto flex">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                    active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
