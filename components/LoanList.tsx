
import React, { useState } from 'react';
import { CreditCard, Plus, Calendar, Building, CheckCircle, AlertCircle, Wallet, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Loan, LoanInstallment, Account } from '../types';

interface LoanListProps {
  loans: Loan[];
  accounts: Account[];
  onAddLoan: (loan: Loan) => void;
  onPayInstallment: (loanId: string, installmentId: string, accountId: string) => void;
  onDelete?: (id: string) => void;
}

export const LoanList: React.FC<LoanListProps> = ({ loans, accounts, onAddLoan, onPayInstallment, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  
  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean, loanId: string, installmentId: string, amount: number} | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // New Loan Form
  const [bankName, setBankName] = useState('');
  const [loanName, setLoanName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('12');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(totalAmount);
    const count = parseInt(installmentsCount);
    const monthlyAmount = amount / count;
    
    const installments: LoanInstallment[] = [];
    const start = new Date(startDate);

    for(let i = 0; i < count; i++) {
        const dueDate = new Date(start);
        dueDate.setMonth(start.getMonth() + i);
        
        installments.push({
            id: `INS-${Date.now()}-${i}`,
            number: i + 1,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: monthlyAmount,
            status: 'PENDING'
        });
    }

    const newLoan: Loan = {
        id: `LN-${Date.now()}`,
        bankName,
        loanName,
        totalAmount: amount,
        remainingAmount: amount,
        startDate,
        status: 'ACTIVE',
        installments
    };

    onAddLoan(newLoan);
    setIsModalOpen(false);
    // Reset
    setBankName(''); setLoanName(''); setTotalAmount(''); setInstallmentsCount('12');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(paymentModal && selectedAccountId) {
          onPayInstallment(paymentModal.loanId, paymentModal.installmentId, selectedAccountId);
          setPaymentModal(null);
          setSelectedAccountId('');
      }
  };

  const toggleExpand = (id: string) => {
      if (expandedLoanId === id) setExpandedLoanId(null);
      else setExpandedLoanId(id);
  };

  const getTotalDebt = () => loans.reduce((sum, l) => sum + l.remainingAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Krediler</h2>
          <p className="text-slate-500">Banka kredileri ve taksit ödeme planları</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-right">
                <p className="text-xs text-slate-500 uppercase font-bold">TOPLAM KALAN BORÇ</p>
                <p className="text-xl font-bold text-red-600">{getTotalDebt().toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors h-full"
            >
                <Plus size={18} />
                Yeni Kredi Ekle
            </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loans.map(loan => (
            <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Loan Header */}
                <div 
                    className="p-4 flex flex-col sm:flex-row justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors relative"
                    onClick={() => toggleExpand(loan.id)}
                >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`p-3 rounded-full ${loan.remainingAmount > 0 ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Building size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">{loan.bankName}</h3>
                            <p className="text-sm text-slate-500">{loan.loanName}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase">Toplam Tutar</p>
                            <p className="font-bold text-slate-700">{loan.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase">Kalan Borç</p>
                            <p className={`font-bold ${loan.remainingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {loan.remainingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {onDelete && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(loan.id);
                                    }}
                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Krediyi Sil"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <div className="text-slate-400">
                                {expandedLoanId === loan.id ? <ChevronUp /> : <ChevronDown />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Installments Table (Expanded) */}
                {expandedLoanId === loan.id && (
                    <div className="border-t border-slate-100 bg-slate-50 p-4">
                        <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
                            <Calendar size={16}/> Ödeme Planı
                        </h4>
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2">Taksit No</th>
                                        <th className="px-4 py-2">Vade Tarihi</th>
                                        <th className="px-4 py-2 text-right">Tutar</th>
                                        <th className="px-4 py-2 text-center">Durum</th>
                                        <th className="px-4 py-2 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loan.installments.map(ins => (
                                        <tr key={ins.id} className={ins.status === 'PAID' ? 'bg-emerald-50/30' : ''}>
                                            <td className="px-4 py-3 text-slate-600">{ins.number} / {loan.installments.length}</td>
                                            <td className={`px-4 py-3 font-medium ${
                                                new Date(ins.dueDate) < new Date() && ins.status === 'PENDING' 
                                                ? 'text-red-600' : 'text-slate-700'
                                            }`}>
                                                {ins.dueDate}
                                                {new Date(ins.dueDate) < new Date() && ins.status === 'PENDING' && (
                                                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">Gecikti</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-700">
                                                {ins.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {ins.status === 'PAID' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                                        <CheckCircle size={12} /> Ödendi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                                        <AlertCircle size={12} /> Bekliyor
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {ins.status === 'PENDING' && (
                                                    <button 
                                                        onClick={() => setPaymentModal({
                                                            isOpen: true, 
                                                            loanId: loan.id, 
                                                            installmentId: ins.id, 
                                                            amount: ins.amount
                                                        })}
                                                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        Ödeme Yap
                                                    </button>
                                                )}
                                                {ins.status === 'PAID' && ins.paidDate && (
                                                    <span className="text-xs text-slate-400">
                                                        {ins.paidDate} tarihinde ödendi
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        ))}

        {loans.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                 <CreditCard size={48} className="mx-auto text-slate-300 mb-3" />
                 <p className="text-slate-500">Henüz kayıtlı kredi bulunmamaktadır.</p>
                 <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-medium hover:underline">
                     Yeni Kredi Ekle
                 </button>
             </div>
        )}
      </div>

      {/* NEW LOAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-fade-in">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">Yeni Kredi Tanımla</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
             </div>
             <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Banka Adı</label>
                   <input 
                     required
                     type="text" 
                     placeholder="Örn: Garanti Bankası"
                     value={bankName}
                     onChange={(e) => setBankName(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Kredi Tanımı</label>
                   <input 
                     required
                     type="text" 
                     placeholder="Örn: İşletme Kredisi"
                     value={loanName}
                     onChange={(e) => setLoanName(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Toplam Geri Ödeme (TL)</label>
                        <input 
                            required
                            type="number" 
                            step="0.01"
                            placeholder="Faiz dahil toplam"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Taksit Sayısı</label>
                        <input 
                            required
                            type="number" 
                            value={installmentsCount}
                            onChange={(e) => setInstallmentsCount(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">İlk Taksit Tarihi</label>
                   <input 
                     required
                     type="date" 
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>

                {totalAmount && installmentsCount && (
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex justify-between font-bold">
                        <span>Aylık Taksit Tutarı:</span>
                        <span>{(parseFloat(totalAmount) / parseInt(installmentsCount)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">İptal</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Krediyi Oluştur</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800">Taksit Ödemesi Yap</h3>
                 <button onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
               </div>
               <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                  <div className="text-center py-2">
                      <p className="text-slate-500 text-sm">Ödenecek Tutar</p>
                      <p className="text-2xl font-bold text-slate-800">{paymentModal.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  </div>
  
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Ödemenin Yapılacağı Hesap</label>
                     <select 
                       required
                       value={selectedAccountId}
                       onChange={(e) => setSelectedAccountId(e.target.value)}
                       className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                       <option value="">Hesap Seçiniz</option>
                       {accounts.map(acc => (
                         <option key={acc.id} value={acc.id}>{acc.name} ({acc.balance} TL)</option>
                       ))}
                     </select>
                  </div>
  
                  <div className="bg-amber-50 p-3 rounded-lg text-xs text-amber-800">
                      Ödeme onayı verildiğinde ilgili hesaptan tutar düşülecek ve taksit ödendi olarak işaretlenecektir.
                  </div>
  
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setPaymentModal(null)} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">İptal</button>
                    <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Ödemeyi Onayla</button>
                  </div>
               </form>
            </div>
          </div>
      )}

    </div>
  );
};
