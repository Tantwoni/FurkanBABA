
import React from 'react';
import { LayoutDashboard, FileText, ShoppingCart, Users, Settings, Package, Truck, Landmark, ScrollText, PieChart, CreditCard } from 'lucide-react';
import { Page, User } from '../types';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Özet Durum', icon: LayoutDashboard },
    { id: 'reports', label: 'Raporlar', icon: PieChart },
    { id: 'sales', label: 'Satışlar (Gelir)', icon: FileText },
    { id: 'expenses', label: 'Masraflar', icon: ShoppingCart },
    { id: 'cash-bank', label: 'Kasa & Banka', icon: Landmark },
    { id: 'checks', label: 'Çek & Senet', icon: ScrollText },
    { id: 'loans', label: 'Krediler', icon: CreditCard },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'suppliers', label: 'Tedarikçiler', icon: Truck },
    { id: 'products', label: 'Ürünler / Hizmetler', icon: Package },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
                {user?.companyName?.substring(0,1).toUpperCase() || 'B'}
            </div>
            <span className="text-lg font-bold tracking-tight truncate" title={user?.companyName}>
                {user?.companyName || 'BizimHesap'}
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id as Page);
                  setIsOpen(false); // Close sidebar on mobile after click
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button 
            onClick={() => {
                setActivePage('settings');
                setIsOpen(false);
            }}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${activePage === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
            `}
          >
            <Settings size={20} />
            Ayarlar & Yedekleme
          </button>
        </div>
      </aside>
    </>
  );
};