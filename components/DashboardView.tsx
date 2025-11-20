import React from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, FileText, UserPlus, CreditCard } from 'lucide-react';
import { DashboardStats, Invoice } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  invoices: Invoice[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, invoices }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Özet Durum</h2>
          <p className="text-slate-500">Finansal durumunuzun anlık özeti</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                <Plus size={16} />
                <span className="hidden sm:inline">Yeni İşlem</span>
            </button>
        </div>
      </div>

      {/* Quick Actions - Hızlı İşlemler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={20} />
            </div>
            <span className="font-medium text-slate-700 text-sm">Satış Faturası</span>
        </button>
        <button className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wallet size={20} />
            </div>
            <span className="font-medium text-slate-700 text-sm">Tahsilat Ekle</span>
        </button>
        <button className="bg-white p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                <CreditCard size={20} />
            </div>
            <span className="font-medium text-slate-700 text-sm">Gider/Masraf</span>
        </button>
        <button className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <UserPlus size={20} />
            </div>
            <span className="font-medium text-slate-700 text-sm">Müşteri Ekle</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Gelir</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalIncome.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Gider</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalExpense.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Nakit</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {stats.netProfit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Wallet size={20} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Alacaklar</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingReceivables.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500"></div>
        </div>
      </div>

      {/* Recent Transactions Section - Full Width */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Son İşlemler
        </h3>
        <div className="space-y-4">
          {invoices.slice(0, 8).map(inv => (
            <div key={inv.id} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 group hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${inv.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {inv.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[150px] sm:max-w-md">{inv.contactName}</p>
                  <p className="text-xs text-slate-500">{inv.date} • {inv.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold block ${inv.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {inv.type === 'INCOME' ? '+' : '-'}{inv.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="text-xs text-slate-400">{inv.status}</span>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Henüz işlem kaydı bulunmamaktadır.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};