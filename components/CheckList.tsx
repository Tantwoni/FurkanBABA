
import React, { useState } from 'react';
import { ScrollText, Calendar, User, ArrowUpRight, ArrowDownRight, Building, Hash, CheckCircle, XCircle, Percent, Trash2 } from 'lucide-react';
import { Check, CheckStatus, Account } from '../types';

interface CheckListProps {
  checks: Check[];
  accounts?: Account[];
  onUpdateStatus?: (id: string, status: CheckStatus) => void;
  onFactoring?: (checkId: string, bankAccountId: string, commissionRate: number) => void;
  onDelete?: (id: string) => void;
}

export const CheckList: React.FC<CheckListProps> = ({ checks, accounts, onUpdateStatus, onFactoring, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  // Factoring Modal State
  const [isFactoringModalOpen, setIsFactoringModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  const [factoringRate, setFactoringRate] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');

  const filteredChecks = checks.filter(c => 
    activeTab === 'received' ? c.type === 'RECEIVED' : c.type === 'GIVEN'
  );

  const totalAmount = filteredChecks.reduce((sum, c) => sum + c.amount, 0);

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case CheckStatus.PORTFOLIO: return 'bg-blue-100 text-blue-700';
      case CheckStatus.COLLECTED: return 'bg-emerald-100 text-emerald-700';
      case CheckStatus.ISSUED: return 'bg-amber-100 text-amber-700';
      case CheckStatus.PAID: return 'bg-gray-100 text-gray-700';
      case CheckStatus.BOUNCED: return 'bg-red-100 text-red-700';
      case CheckStatus.FACTORED: return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const openFactoringModal = (check: Check) => {
      setSelectedCheck(check);
      setIsFactoringModalOpen(true);
      setFactoringRate('');
      setSelectedBankId('');
  };

  const handleFactoringSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedCheck && onFactoring && selectedBankId && factoringRate) {
          onFactoring(selectedCheck.id, selectedBankId, parseFloat(factoringRate));
          setIsFactoringModalOpen(false);
          setSelectedCheck(null);
      }
  };

  const renderActions = (check: Check) => {
      if (!onUpdateStatus) return null;
      
      if (check.type === 'RECEIVED') {
          return (
              <div className="flex gap-2 justify-end">
                  {check.status === CheckStatus.PORTFOLIO && (
                    <>
                        <button 
                        onClick={() => openFactoringModal(check)}
                        className="flex-1 sm:flex-none px-2 py-1 text-purple-600 hover:bg-purple-50 rounded flex items-center justify-center gap-1 bg-purple-50 border border-purple-200" 
                        title="Faktöring (Kırdır)"
                        >
                        <Percent size={14} /> <span className="text-xs font-bold">Kırdır</span>
                        </button>
                        <button onClick={() => onUpdateStatus(check.id, CheckStatus.COLLECTED)} className="flex-1 sm:flex-none px-2 py-1 text-emerald-600 hover:bg-emerald-50 rounded flex items-center justify-center border border-emerald-200" title="Tahsil Et">
                             <CheckCircle size={18} /> <span className="sm:hidden ml-1 text-xs">Tahsil Et</span>
                        </button>
                        <button onClick={() => onUpdateStatus(check.id, CheckStatus.BOUNCED)} className="flex-1 sm:flex-none px-2 py-1 text-red-600 hover:bg-red-50 rounded flex items-center justify-center border border-red-200" title="Karşılıksız">
                             <XCircle size={18} /> <span className="sm:hidden ml-1 text-xs">Karşılıksız</span>
                        </button>
                    </>
                  )}
                  {check.status === CheckStatus.COLLECTED && <span className="text-emerald-500 text-xs font-medium">Tahsil Edildi</span>}
                  {check.status === CheckStatus.FACTORED && <span className="text-purple-500 text-xs font-medium">Faktöring Yapıldı</span>}
                  
                  {onDelete && (
                      <button onClick={() => onDelete(check.id)} className="text-slate-400 hover:text-red-600 p-1 ml-2">
                          <Trash2 size={16}/>
                      </button>
                  )}
              </div>
          );
      } else {
          return (
              <div className="flex gap-2 justify-end">
                 {check.status === CheckStatus.ISSUED && (
                    <button onClick={() => onUpdateStatus(check.id, CheckStatus.PAID)} className="flex-1 sm:flex-none px-2 py-1 text-slate-600 hover:bg-slate-50 rounded flex items-center justify-center border border-slate-200" title="Ödendi Olarak İşaretle">
                        <CheckCircle size={18} /> <span className="sm:hidden ml-1 text-xs">Ödendi İşaretle</span>
                    </button>
                 )}
                 {check.status === CheckStatus.PAID && <span className="text-slate-500 text-xs font-medium">Ödendi</span>}
                 
                 {onDelete && (
                      <button onClick={() => onDelete(check.id)} className="text-slate-400 hover:text-red-600 p-1 ml-2">
                          <Trash2 size={16}/>
                      </button>
                  )}
              </div>
          );
      }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Çek ve Senetler</h2>
          <p className="text-slate-500">Alınan ve verilen çeklerin portföy yönetimi</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-right min-w-[120px]">
          <p className="text-xs text-slate-500 uppercase font-bold">TOPLAM</p>
          <p className="text-xl font-bold text-slate-800">{totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-2 sm:px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'received' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <ArrowDownRight size={18} className="text-emerald-500" />
          Alınan <span className="hidden sm:inline">Çekler</span>
        </button>
        <button 
          onClick={() => setActiveTab('given')}
          className={`pb-3 px-2 sm:px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'given' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <ArrowUpRight size={18} className="text-red-500" />
          Verilen <span className="hidden sm:inline">Çekler</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Vade Tarihi</th>
                <th className="px-6 py-3 font-medium">Cari Adı</th>
                <th className="px-6 py-3 font-medium">Banka / Çek No</th>
                <th className="px-6 py-3 font-medium">Açıklama</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3 font-medium text-right">Tutar</th>
                <th className="px-6 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecks.map((check) => (
                <tr key={check.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Calendar size={16} className="text-slate-400" />
                      {check.dueDate}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 pl-6">Giriş: {check.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      <span className="text-slate-800 font-medium">{check.contactName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-slate-700"><Building size={14} className="text-slate-400"/> {check.bankName}</span>
                      <span className="flex items-center gap-1 text-slate-500 text-xs mt-1"><Hash size={12}/> {check.checkNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{check.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(check.status)}`}>
                      {check.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    {check.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {renderActions(check)}
                  </td>
                </tr>
              ))}
              {filteredChecks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <ScrollText size={40} className="opacity-20" />
                      <p>Kayıtlı çek bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden">
            {filteredChecks.map((check) => (
                <div key={check.id} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="font-bold text-slate-800">{check.contactName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Calendar size={12} /> Vade: {check.dueDate}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <Building size={12} /> {check.bankName} ({check.checkNumber})
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="font-bold text-slate-800 text-lg">{check.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                             <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(check.status)}`}>
                                {check.status}
                             </span>
                        </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        {renderActions(check)}
                    </div>
                </div>
            ))}
            {filteredChecks.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    <ScrollText size={40} className="mx-auto opacity-20 mb-2" />
                    <p>Kayıtlı çek bulunamadı.</p>
                </div>
            )}
        </div>
      </div>

      {/* FACTORING MODAL */}
      {isFactoringModalOpen && selectedCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Çek Faktöring İşlemi</h3>
                    <button onClick={() => setIsFactoringModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                <form onSubmit={handleFactoringSubmit} className="p-6 space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex justify-between text-sm text-purple-900 mb-1">
                            <span>Çek Tutarı:</span>
                            <span className="font-bold">{selectedCheck.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                        </div>
                        <div className="text-xs text-purple-700">
                            {selectedCheck.bankName} - {selectedCheck.checkNumber} - Vade: {selectedCheck.dueDate}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Komisyon / Faiz Oranı (%)</label>
                        <input 
                            required 
                            type="number" 
                            step="0.01" 
                            value={factoringRate} 
                            onChange={e => setFactoringRate(e.target.value)} 
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="%4.5" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Paranın Yatacağı Banka</label>
                        <select 
                            required 
                            value={selectedBankId} 
                            onChange={e => setSelectedBankId(e.target.value)} 
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="">Seçiniz</option>
                            {accounts?.filter(a => a.type === 'BANK').map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                        </select>
                    </div>

                    {factoringRate && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Kesinti Tutarı:</span>
                                <span className="text-red-600 font-medium">
                                    -{((selectedCheck.amount * parseFloat(factoringRate)) / 100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold">
                                <span className="text-slate-800">Hesaba Geçecek:</span>
                                <span className="text-emerald-600">
                                    {(selectedCheck.amount - (selectedCheck.amount * parseFloat(factoringRate)) / 100).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsFactoringModalOpen(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">İptal</button>
                        <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">İşlemi Tamamla</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
