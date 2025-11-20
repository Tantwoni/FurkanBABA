
import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Building, Banknote, Plus, RefreshCw, ArrowRight, X, Edit, Save, Calendar, User, Trash2 } from 'lucide-react';
import { CashTransaction, TransactionType, Account, AccountType } from '../types';

interface CashBankProps {
  accounts: Account[];
  transactions: CashTransaction[];
  onAddAccount: (account: Account) => void;
  onUpdateAccount: (account: Account) => void;
  onPosSettlement: (posAccountId: string, bankAccountId: string, amount: number, commissionRate: number) => void;
  onDeleteAccount?: (id: string) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const CashBank: React.FC<CashBankProps> = ({ accounts, transactions, onAddAccount, onUpdateAccount, onPosSettlement, onDeleteAccount, onDeleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  
  // New Account Form State
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('BANK');
  const [accBalance, setAccBalance] = useState('');

  // POS Settlement Form State
  const [posSourceId, setPosSourceId] = useState('');
  const [bankTargetId, setBankTargetId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [commissionRate, setCommissionRate] = useState('');

  // Detail Modal State
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Editing State
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [editAccName, setEditAccName] = useState('');
  const [editAccBalance, setEditAccBalance] = useState('');

  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
  const totalIn = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalOut = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount: Account = {
      id: `ACC-${Date.now()}`,
      name: accName,
      type: accType,
      currency: 'TRY',
      balance: parseFloat(accBalance) || 0
    };
    onAddAccount(newAccount);
    setIsModalOpen(false);
    setAccName('');
    setAccBalance('');
  };

  const handlePosSettlement = (e: React.FormEvent) => {
      e.preventDefault();
      onPosSettlement(
          posSourceId,
          bankTargetId,
          parseFloat(settleAmount),
          parseFloat(commissionRate) || 0
      );
      setIsPosModalOpen(false);
      setPosSourceId('');
      setBankTargetId('');
      setSettleAmount('');
      setCommissionRate('');
  };

  const openDetail = (acc: Account) => {
      setSelectedAccount(acc);
      setIsEditingAccount(false);
      setEditAccName(acc.name);
      setEditAccBalance(acc.balance.toString());
  };

  const saveAccountEdit = () => {
      if(selectedAccount && editAccName) {
          const updatedAccount = {
              ...selectedAccount,
              name: editAccName,
              balance: parseFloat(editAccBalance) || 0
          };
          onUpdateAccount(updatedAccount);
          setSelectedAccount(updatedAccount);
          setIsEditingAccount(false);
      }
  };

  const handleDeleteCurrentAccount = () => {
      if (selectedAccount && onDeleteAccount) {
          onDeleteAccount(selectedAccount.id);
          setSelectedAccount(null);
      }
  };

  const getIconForType = (type: AccountType) => {
    switch (type) {
      case 'BANK': return <Building size={20} />;
      case 'POS': return <CreditCard size={20} />;
      case 'CASH': return <Banknote size={20} />;
      case 'CREDIT_CARD': return <CreditCard size={20} className="text-red-600" />;
      default: return <Wallet size={20} />;
    }
  };

  const getColorForType = (type: AccountType) => {
    switch (type) {
      case 'BANK': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'POS': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'CASH': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'CREDIT_CARD': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const getTypeName = (type: AccountType) => {
      switch(type) {
          case 'BANK': return 'Banka';
          case 'POS': return 'POS Hesabı';
          case 'CASH': return 'Kasa';
          case 'CREDIT_CARD': return 'Kredi Kartı';
          default: return 'Hesap';
      }
  };

  const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const accountTransactions = selectedAccount ? transactions.filter(t => t.accountId === selectedAccount.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kasa & Banka</h2>
          <p className="text-slate-500">Nakit varlıklarınızı, kredi kartlarınızı ve POS hesaplarınızı yönetin</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <button 
            onClick={() => setIsPosModalOpen(true)}
            className="flex-1 sm:flex-none justify-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">POS Bloke Çözümü</span>
            <span className="sm:hidden">POS Virman</span>
            </button>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
            <Plus size={18} />
            <span className="hidden sm:inline">Yeni Hesap Ekle</span>
            <span className="sm:hidden">Ekle</span>
            </button>
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white/10 rounded-full">
             <Wallet size={32} className="text-blue-300" />
           </div>
           <div>
             <p className="text-slate-400 text-sm font-medium">TOPLAM VARLIKLAR (NET)</p>
             <h3 className="text-3xl font-bold">{totalAssets.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</h3>
           </div>
        </div>
        <div className="flex w-full sm:w-auto justify-between sm:justify-start gap-8 text-right sm:text-left border-t sm:border-t-0 border-slate-700 pt-4 sm:pt-0 mt-4 sm:mt-0">
           <div>
              <p className="text-slate-400 text-xs uppercase">Toplam Tahsilat</p>
              <p className="text-emerald-400 font-bold text-lg">+{totalIn.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
           </div>
           <div>
              <p className="text-slate-400 text-xs uppercase">Toplam Ödeme</p>
              <p className="text-red-400 font-bold text-lg">-{totalOut.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
           </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-lg">Hesaplarım</h3>
        <p className="text-xs text-slate-500 mb-3">Detaylı hareketleri görmek veya bakiye düzenlemek için hesap kartına tıklayınız.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map(acc => (
            <div 
                key={acc.id} 
                onClick={() => openDetail(acc)}
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getColorForType(acc.type)}`}>
                   {getIconForType(acc.type)}
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">{getTypeName(acc.type)}</span>
              </div>
              <h4 className="font-semibold text-slate-700 truncate" title={acc.name}>{acc.name}</h4>
              <p className={`text-2xl font-bold mt-2 ${acc.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {acc.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Son Genel Hareketler</h3>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Tarih</th>
                <th className="px-6 py-3 font-medium">Hesap</th>
                <th className="px-6 py-3 font-medium">İlgili Kişi/Masraf</th>
                <th className="px-6 py-3 font-medium">Açıklama</th>
                <th className="px-6 py-3 font-medium">Yöntem</th>
                <th className="px-6 py-3 font-medium text-right">Tutar</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTransactions.slice(0, 10).map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{trx.accountName}</td>
                  <td className="px-6 py-4 text-slate-600">{trx.contactName || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{trx.description}</td>
                  <td className="px-6 py-4">
                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {trx.paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : 
                         trx.paymentMethod === 'BANK_TRANSFER' ? 'Havale/EFT' : 
                         trx.paymentMethod === 'CHECK_NOTE' ? 'Çek/Senet' : 'Nakit'}
                     </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                      trx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {trx.type === TransactionType.INCOME ? '+' : '-'}{trx.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {onDeleteTransaction && (
                        <button 
                            onClick={() => onDeleteTransaction(trx.id)} 
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Henüz kasa hareketi yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden">
            {sortedTransactions.slice(0, 10).map((trx) => (
                <div key={trx.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-medium text-slate-800">{trx.description}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Calendar size={12} /> {trx.date} 
                                <span className="mx-1">•</span>
                                <Wallet size={12} /> {trx.accountName}
                            </div>
                        </div>
                        <div className={`font-bold text-right ${trx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                             {trx.type === TransactionType.INCOME ? '+' : '-'}{trx.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                         <div className="text-xs text-slate-600 flex items-center gap-1">
                             <User size={12}/> {trx.contactName || 'Cari Yok'}
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                {trx.paymentMethod === 'CREDIT_CARD' ? 'K.Kartı' : 
                                trx.paymentMethod === 'BANK_TRANSFER' ? 'Havale' : 
                                trx.paymentMethod === 'CHECK_NOTE' ? 'Çek' : 'Nakit'}
                            </span>
                            {onDeleteTransaction && (
                                <button onClick={() => onDeleteTransaction(trx.id)} className="text-slate-400 hover:text-red-600 p-1">
                                    <Trash2 size={14} />
                                </button>
                            )}
                         </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* ACCOUNT DETAIL MODAL */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
                 {/* Header */}
                 <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center relative">
                     <div className="flex items-center gap-3 w-full pr-12">
                        <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center border ${getColorForType(selectedAccount.type)}`}>
                            {getIconForType(selectedAccount.type)}
                        </div>
                        
                        {isEditingAccount ? (
                            <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center mr-8">
                                <input 
                                    type="text" 
                                    value={editAccName} 
                                    onChange={(e) => setEditAccName(e.target.value)}
                                    className="p-2 border border-slate-300 rounded-lg text-sm w-full sm:w-auto flex-1"
                                    placeholder="Hesap Adı"
                                />
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={editAccBalance} 
                                        onChange={(e) => setEditAccBalance(e.target.value)}
                                        className="p-2 border border-slate-300 rounded-lg text-sm w-32 font-bold text-right"
                                        placeholder="Bakiye"
                                    />
                                    <span className="text-sm font-bold text-slate-500">TL</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={saveAccountEdit} className="p-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"><Save size={18}/></button>
                                    <button onClick={() => setIsEditingAccount(false)} className="p-2 bg-slate-300 text-slate-600 rounded hover:bg-slate-400"><X size={18}/></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex justify-between items-center mr-8">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                                        {selectedAccount.name} 
                                        <button onClick={() => setIsEditingAccount(true)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        {onDeleteAccount && (
                                            <button 
                                                onClick={handleDeleteCurrentAccount} 
                                                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                                title="Hesabı Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </h3>
                                    <p className="text-sm text-slate-500">{getTypeName(selectedAccount.type)} Hareketleri</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Güncel Bakiye</p>
                                    <p className={`text-2xl font-bold ${selectedAccount.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                        {selectedAccount.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </p>
                                </div>
                            </div>
                        )}
                     </div>
                     <button onClick={() => setSelectedAccount(null)} className="text-slate-400 hover:text-slate-600 absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                 </div>
                 
                 {/* Mobile Balance Display in Modal */}
                 {!isEditingAccount && (
                     <div className="sm:hidden px-6 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                         <span className="text-xs text-slate-500 uppercase font-semibold">Güncel Bakiye</span>
                         <span className={`text-xl font-bold ${selectedAccount.balance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                             {selectedAccount.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                         </span>
                     </div>
                 )}

                 {/* Transaction List inside Modal */}
                 <div className="overflow-y-auto p-0 flex-1">
                    {/* Desktop Table */}
                    <table className="w-full text-left text-sm hidden md:table">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 font-medium">Tarih</th>
                                <th className="px-6 py-3 font-medium">İlgili Cari / Masraf</th>
                                <th className="px-6 py-3 font-medium">Açıklama</th>
                                <th className="px-6 py-3 font-medium">Yöntem</th>
                                <th className="px-6 py-3 font-medium text-right">Tutar</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {accountTransactions.map(trx => (
                                <tr key={trx.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800">{trx.contactName || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{trx.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                            {trx.paymentMethod === 'CREDIT_CARD' ? 'Kredi Kartı' : 
                                            trx.paymentMethod === 'BANK_TRANSFER' ? 'Havale/EFT' : 
                                            trx.paymentMethod === 'CHECK_NOTE' ? 'Çek/Senet' : 'Nakit'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${trx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {trx.type === TransactionType.INCOME ? '+' : '-'}{trx.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {onDeleteTransaction && (
                                            <button onClick={() => onDeleteTransaction(trx.id)} className="text-slate-400 hover:text-red-600 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {accountTransactions.length === 0 && (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-400 italic">Bu hesapta henüz işlem yapılmamış.</td></tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Mobile Card List inside Modal */}
                    <div className="md:hidden">
                        {accountTransactions.map(trx => (
                            <div key={trx.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-slate-800">{trx.description}</div>
                                        <div className="text-xs text-slate-500 mt-1">{trx.date} • {trx.contactName || '-'}</div>
                                    </div>
                                    <div className={`font-bold text-right ${trx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {trx.type === TransactionType.INCOME ? '+' : '-'}{trx.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                    </div>
                                </div>
                                {onDeleteTransaction && (
                                     <div className="text-right mt-2 border-t border-slate-50 pt-2">
                                        <button onClick={() => onDeleteTransaction(trx.id)} className="text-xs text-red-500 flex items-center gap-1 justify-end ml-auto">
                                            <Trash2 size={14} /> Sil
                                        </button>
                                     </div>
                                )}
                            </div>
                        ))}
                        {accountTransactions.length === 0 && (
                             <div className="p-12 text-center text-slate-400 italic">Bu hesapta henüz işlem yapılmamış.</div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">Yeni Hesap Ekle</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
             </div>
             <form onSubmit={handleAddAccount} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hesap Türü</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setAccType('BANK')}
                      className={`p-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all ${accType === 'BANK' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                       <Building size={20} />
                       Banka
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAccType('CREDIT_CARD')}
                      className={`p-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all ${accType === 'CREDIT_CARD' ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                       <CreditCard size={20} />
                       Kredi Kartı
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAccType('POS')}
                      className={`p-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all ${accType === 'POS' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                       <CreditCard size={20} />
                       POS Hesabı
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAccType('CASH')}
                      className={`p-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 transition-all ${accType === 'CASH' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                       <Banknote size={20} />
                       Nakit Kasa
                    </button>
                  </div>
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Hesap Adı</label>
                   <input 
                     required
                     type="text" 
                     placeholder="Örn: Şirket Kredi Kartı / Merkez Kasa"
                     value={accName}
                     onChange={(e) => setAccName(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Açılış Bakiyesi (TL)</label>
                   <input 
                     type="number" 
                     value={accBalance}
                     onChange={(e) => setAccBalance(e.target.value)}
                     placeholder="0.00"
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                   <p className="text-xs text-slate-400 mt-1">Kredi kartı borcu için eksi (-) bakiye girebilirsiniz.</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Kaydet
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* POS SETTLEMENT MODAL */}
      {isPosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">POS Bloke Çözümü / Virman</h3>
               <button onClick={() => setIsPosModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
             </div>
             <form onSubmit={handlePosSettlement} className="p-6 space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg text-purple-800 text-sm mb-4">
                    POS hesabındaki birikmiş bakiyeyi komisyon düşerek banka hesabına aktarır.
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Kaynak POS Hesabı</label>
                   <select required value={posSourceId} onChange={e => setPosSourceId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                       <option value="">Seçiniz</option>
                       {accounts.filter(a => a.type === 'POS').map(a => (
                           <option key={a.id} value={a.id}>{a.name} (Bakiye: {a.balance})</option>
                       ))}
                   </select>
                </div>
                
                <div className="flex justify-center text-slate-400">
                    <ArrowRight size={24} className="rotate-90 md:rotate-0" />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Hedef Banka Hesabı</label>
                   <select required value={bankTargetId} onChange={e => setBankTargetId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                       <option value="">Seçiniz</option>
                       {accounts.filter(a => a.type === 'BANK').map(a => (
                           <option key={a.id} value={a.id}>{a.name}</option>
                       ))}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Çözülecek Tutar</label>
                        <input required type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg font-bold" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Komisyon (%)</label>
                        <input required type="number" step="0.01" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="%1.50" />
                    </div>
                </div>
                
                {settleAmount && commissionRate && (
                    <div className="p-3 bg-slate-100 rounded-lg text-sm space-y-1">
                        <div className="flex justify-between">
                            <span>Komisyon Tutarı:</span>
                            <span className="text-red-600">-{((parseFloat(settleAmount) * parseFloat(commissionRate)) / 100).toFixed(2)} TL</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                            <span>Bankaya Geçecek:</span>
                            <span className="text-emerald-600">{(parseFloat(settleAmount) - ((parseFloat(settleAmount) * parseFloat(commissionRate)) / 100)).toFixed(2)} TL</span>
                        </div>
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsPosModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">İptal</button>
                  <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Aktarımı Yap</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
