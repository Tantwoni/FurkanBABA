
import React from 'react';
import { Invoice, CashTransaction, TransactionType } from '../types';
import { TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react';

interface ReportsViewProps {
  invoices: Invoice[];
  transactions: CashTransaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ invoices, transactions }) => {
  
  // --- Date Helpers ---
  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Monday
    firstDayOfWeek.setHours(0, 0, 0, 0);
    return d >= firstDayOfWeek;
  };

  const isThisMonth = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  // --- Calculations ---

  // 1. Collections (Tahsilat) -> CashTransactions Type: INCOME
  const collections = transactions.filter(t => t.type === TransactionType.INCOME);
  const colDaily = collections.filter(t => isToday(t.date)).reduce((sum, t) => sum + t.amount, 0);
  const colWeekly = collections.filter(t => isThisWeek(t.date)).reduce((sum, t) => sum + t.amount, 0);
  const colMonthly = collections.filter(t => isThisMonth(t.date)).reduce((sum, t) => sum + t.amount, 0);

  // 2. Sales (Satış) -> Invoices Type: INCOME
  const sales = invoices.filter(i => i.type === TransactionType.INCOME);
  const saleDaily = sales.filter(i => isToday(i.date)).reduce((sum, i) => sum + i.amount, 0);
  const saleWeekly = sales.filter(i => isThisWeek(i.date)).reduce((sum, i) => sum + i.amount, 0);
  const saleMonthly = sales.filter(i => isThisMonth(i.date)).reduce((sum, i) => sum + i.amount, 0);

  // 3. Expenses (Masraf) -> Invoices Type: EXPENSE
  const expenses = invoices.filter(i => i.type === TransactionType.EXPENSE);
  const expDaily = expenses.filter(i => isToday(i.date)).reduce((sum, i) => sum + i.amount, 0);
  const expWeekly = expenses.filter(i => isThisWeek(i.date)).reduce((sum, i) => sum + i.amount, 0);
  const expMonthly = expenses.filter(i => isThisMonth(i.date)).reduce((sum, i) => sum + i.amount, 0);

  const ReportCard = ({ title, amount, subTitle, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase mb-1">{title}</p>
        <h4 className={`text-xl font-bold ${colorClass}`}>{amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h4>
        <p className="text-xs text-slate-400 mt-1">{subTitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Finansal Raporlar</h2>
        <p className="text-slate-500">Periyodik tahsilat, satış ve masraf analizleri</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TAHSİLAT SÜTUNU */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                <Wallet className="text-emerald-600" />
                <h3 className="font-bold text-slate-800">Tahsilat Raporu (Nakit Girişi)</h3>
            </div>
            <ReportCard 
                title="Bugün Tahsil Edilen"
                subTitle="Bugünkü kasa/banka girişleri"
                amount={colDaily}
                icon={Calendar}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
            />
            <ReportCard 
                title="Bu Hafta Tahsil Edilen"
                subTitle="Bu haftaki kasa/banka girişleri"
                amount={colWeekly}
                icon={Calendar}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
            />
            <ReportCard 
                title="Bu Ay Tahsil Edilen"
                subTitle="Bu ayki kasa/banka girişleri"
                amount={colMonthly}
                icon={Calendar}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
            />
        </div>

        {/* SATIŞ SÜTUNU */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
                <TrendingUp className="text-blue-600" />
                <h3 className="font-bold text-slate-800">Satış (Ciro) Raporu</h3>
            </div>
            <ReportCard 
                title="Bugünkü Satışlar"
                subTitle="Bugün kesilen faturalar"
                amount={saleDaily}
                icon={Calendar}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
            />
            <ReportCard 
                title="Bu Haftaki Satışlar"
                subTitle="Bu hafta kesilen faturalar"
                amount={saleWeekly}
                icon={Calendar}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
            />
            <ReportCard 
                title="Bu Ayki Satışlar"
                subTitle="Bu ay kesilen faturalar"
                amount={saleMonthly}
                icon={Calendar}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
            />
        </div>

        {/* MASRAF SÜTUNU */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-red-200">
                <TrendingDown className="text-red-600" />
                <h3 className="font-bold text-slate-800">Masraf Raporu</h3>
            </div>
            <ReportCard 
                title="Bugünkü Masraflar"
                subTitle="Bugün girilen giderler"
                amount={expDaily}
                icon={Calendar}
                colorClass="text-red-600"
                bgClass="bg-red-50"
            />
            <ReportCard 
                title="Bu Haftaki Masraflar"
                subTitle="Bu hafta girilen giderler"
                amount={expWeekly}
                icon={Calendar}
                colorClass="text-red-600"
                bgClass="bg-red-50"
            />
            <ReportCard 
                title="Bu Ayki Masraflar"
                subTitle="Bu ay girilen giderler"
                amount={expMonthly}
                icon={Calendar}
                colorClass="text-red-600"
                bgClass="bg-red-50"
            />
        </div>

      </div>
    </div>
  );
};