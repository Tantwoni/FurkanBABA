
import React from 'react';
import { Bell, User, Menu, CheckCircle, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  toggleSidebar: () => void;
  lastSaved?: Date;
  user: UserType | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, lastSaved, user, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-slate-100 rounded-md">
          <Menu size={24} className="text-slate-600" />
        </button>
        {/* Auto-save indicator */}
        {lastSaved && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100" title="Verileriniz tarayıcı hafızasına otomatik olarak kaydedilmektedir.">
                <CheckCircle size={14} />
                <span className="text-xs font-medium">Otomatik Kaydedildi</span>
            </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">{user?.fullName || 'Kullanıcı'}</p>
            <p className="text-xs text-slate-500">{user?.companyName || 'Şirket'}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User size={20} />
          </div>
          <button 
            onClick={onLogout}
            className="ml-2 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Çıkış Yap"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};