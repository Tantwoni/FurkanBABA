
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Mail, FileText, Plus, Wallet, Trash2, Package, CreditCard, Building, Banknote, Calendar, Hash, Edit, Save, X } from 'lucide-react';
import { Contact, Invoice, TransactionType, Status, Product, InvoiceItem, Account, PaymentMethod, Check } from '../types';

interface ContactDetailProps {
  contact: Contact;
  invoices: Invoice[];
  products: Product[];
  accounts: Account[];
  onBack: () => void;
  onCreateInvoice: (invoice: Invoice) => void;
  onFinancialTransaction: (amount: number, description: string, type: TransactionType, accountId: string, method: PaymentMethod, checkDetails?: Partial<Check>) => void;
  onDeleteInvoice?: (id: string) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact?: (id: string) => void;
}

export const ContactDetail: React.FC<ContactDetailProps> = ({ 
  contact, 
  invoices, 
  products,
  accounts,
  onBack,
  onCreateInvoice,
  onFinancialTransaction,
  onDeleteInvoice,
  onUpdateContact,
  onDeleteContact
}) => {
  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices'>('overview');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(contact.name);
  const [editEmail, setEditEmail] = useState(contact.email);
  const [editPhone, setEditPhone] = useState(contact.phone);
  const [editBalance, setEditBalance] = useState(contact.balance.toString());

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  // Invoice Form State
  const [invItems, setInvItems] = useState<InvoiceItem[]>([]);
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDesc, setInvDesc] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [qty, setQty] = useState(1);

  // Cash Form State
  const [cashAmount, setCashAmount] = useState('');
  const [cashDesc, setCashDesc] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Check Specific Form State
  const [checkDueDate, setCheckDueDate] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');

  const contactInvoices = invoices.filter(i => i.contactId === contact.id);

  useEffect(() => {
    setEditName(contact.name);
    setEditEmail(contact.email);
    setEditPhone(contact.phone);
    setEditBalance(contact.balance.toString());
  }, [contact]);
  
  const handleSaveContact = () => {
    onUpdateContact({
        ...contact,
        name: editName,
        email: editEmail,
        phone: editPhone,
        balance: parseFloat(editBalance) || 0
    });
    setIsEditing(false);
  };

  // Invoice Logic
  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product || !itemPrice) return;

    const price = parseFloat(itemPrice);

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: price,
      total: qty * price
    };

    setInvItems([...invItems, newItem]);
    setSelectedProductId('');
    setItemPrice('');
    setQty(1);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...invItems];
    newItems.splice(index, 1);
    setInvItems(newItems);
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invItems.length === 0) return;

    const totalAmount = invItems.reduce((sum, item) => sum + item.total, 0);
    
    const newInvoice: Invoice = {
      id: `FTR-${Date.now()}`,
      contactId: contact.id,
      contactName: contact.name,
      date: invDate,
      dueDate: invDate, // Simplified
      amount: totalAmount,
      description: invDesc || (contact.type === 'Customer' ? 'Ürün Satışı' : 'Ürün Alımı'),
      status: Status.PENDING,
      type: contact.type === 'Customer' ? TransactionType.INCOME : TransactionType.EXPENSE,
      items: invItems
    };

    onCreateInvoice(newInvoice);
    setIsInvoiceModalOpen(false);
    setInvItems([]);
    setInvDesc('');
  };

  // Cash/Check Logic
  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for Accounts if not check
    if (paymentMethod !== 'CHECK_NOTE' && !selectedAccountId) return;
    
    // Validation for Check details
    if (paymentMethod === 'CHECK_NOTE') {
        if (!checkDueDate || !checkNumber || !checkBank) {
            alert("Lütfen çek bilgilerini (Vade, Banka, Çek No) eksiksiz giriniz.");
            return;
        }
    }

    const type = contact.type === 'Customer' ? TransactionType.INCOME : TransactionType.EXPENSE;
    
    const checkDetails = paymentMethod === 'CHECK_NOTE' ? {
        dueDate: checkDueDate,
        checkNumber: checkNumber,
        bankName: checkBank
    } : undefined;

    onFinancialTransaction(parseFloat(cashAmount), cashDesc, type, selectedAccountId, paymentMethod, checkDetails);
    
    // Reset
    setIsCashModalOpen(false);
    setCashAmount('');
    setCashDesc('');
    setSelectedAccountId('');
    setPaymentMethod('CASH');
    setCheckDueDate('');
    setCheckNumber('');
    setCheckBank('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        
        {isEditing ? (
            <div className="flex-1 grid gap-2">
                <input 
                    type="text"
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className="font-bold text-xl border border-slate-300 rounded px-2 py-1 w-full max-w-md focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Firma / Kişi Adı"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                     <input 
                        type="email"
                        value={editEmail} 
                        onChange={e => setEditEmail(e.target.value)} 
                        placeholder="E-posta Adresi" 
                        className="text-sm border border-slate-300 rounded px-2 py-1 w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none" 
                     />
                     <input 
                        type="tel"
                        value={editPhone} 
                        onChange={e => setEditPhone(e.target.value)} 
                        placeholder="Telefon No" 
                        className="text-sm border border-slate-300 rounded px-2 py-1 w-full sm:w-48 focus:ring-2 focus:ring-blue-500 outline-none" 
                     />
                </div>
            </div>
        ) : (
            <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">{contact.name}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors flex-shrink-0" title="Bilgileri Düzenle">
                        <Edit size={18} />
                    </button>
                    {onDeleteContact && (
                        <button 
                            onClick={() => onDeleteContact(contact.id)} 
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                            title="Sil"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-slate-500 text-sm mt-1">
                    <span className="flex items-center gap-1 truncate"><Mail size={14}/> {contact.email}</span>
                    <span className="flex items-center gap-1 truncate"><Phone size={14}/> {contact.phone}</span>
                </div>
            </div>
        )}

        {/* Right Side (Balance & Actions) */}
        <div className="ml-auto flex flex-col items-end gap-2">
             {isEditing ? (
                 <div className="flex flex-col items-end gap-2">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase hidden sm:inline">Bakiye (TL)</span>
                        <input
                            type="number"
                            step="0.01"
                            value={editBalance}
                            onChange={e => setEditBalance(e.target.value)}
                            className="text-right font-bold border border-slate-300 rounded px-2 py-1 w-24 sm:w-32 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                        />
                     </div>
                     <div className="flex gap-2">
                         <button onClick={handleSaveContact} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-sm font-medium">
                             <Save size={18}/> <span className="hidden sm:inline">Kaydet</span>
                         </button>
                         <button onClick={() => setIsEditing(false)} className="bg-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-300 flex items-center gap-1 text-sm font-medium">
                             <X size={18}/> <span className="hidden sm:inline">İptal</span>
                         </button>
                     </div>
                 </div>
             ) : (
                 <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-semibold hidden sm:block">Güncel Bakiye</p>
                    <p className={`text-lg sm:text-2xl font-bold ${contact.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {contact.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                 </div>
             )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pb-4 border-b border-slate-200">
        <button 
          onClick={() => setIsInvoiceModalOpen(true)}
          className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <FileText size={18} />
          {contact.type === 'Customer' ? 'Yeni Satış' : 'Yeni Alış'}
        </button>
        <button 
          onClick={() => setIsCashModalOpen(true)}
          className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
        >
          <Wallet size={18} />
          {contact.type === 'Customer' ? 'Tahsilat' : 'Ödeme'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          Genel Bakış
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === 'invoices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          Geçmiş İşlemler
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Kişi Bilgileri</h3>
              <div className="space-y-3">
                 <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Tür</span>
                    <span className="font-medium">{contact.type === 'Customer' ? 'Müşteri' : 'Tedarikçi'}</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Toplam İşlem Hacmi</span>
                    <span className="font-medium">
                        {contactInvoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Desktop Table */}
          <table className="w-full text-left text-sm hidden md:table">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Tarih</th>
                <th className="px-6 py-3 font-medium">Açıklama</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3 font-medium text-right">Tutar</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contactInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                  <td className="px-6 py-4 text-slate-600">{inv.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${inv.status === Status.PAID ? 'bg-emerald-100 text-emerald-700' : 
                        inv.status === Status.PENDING ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    {inv.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                     {onDeleteInvoice && (
                         <button onClick={() => onDeleteInvoice(inv.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                             <Trash2 size={14} />
                         </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden">
             {contactInvoices.map((inv) => (
                 <div key={inv.id} className="p-4 border-b border-slate-100 last:border-0">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-medium text-slate-800">{inv.description}</div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Calendar size={12}/> {inv.date}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-slate-800">{inv.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                             <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium 
                                ${inv.status === Status.PAID ? 'bg-emerald-100 text-emerald-700' : 
                                inv.status === Status.PENDING ? 'bg-amber-100 text-amber-700' : 
                                'bg-red-100 text-red-700'}`}>
                                {inv.status}
                             </span>
                        </div>
                     </div>
                     {onDeleteInvoice && (
                         <div className="text-right mt-2 pt-2 border-t border-slate-50">
                             <button onClick={() => onDeleteInvoice(inv.id)} className="text-xs text-red-500 flex items-center gap-1 justify-end ml-auto">
                                 <Trash2 size={12} /> Sil
                             </button>
                         </div>
                     )}
                 </div>
             ))}
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
               <h3 className="font-bold text-lg text-slate-800">
                 {contact.type === 'Customer' ? 'Satış Faturası Oluştur' : 'Alış Faturası Gir'}
               </h3>
               <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
             </div>
             <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                      <input type="date" value={invDate} onChange={e => setInvDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                      <input type="text" value={invDesc} onChange={e => setInvDesc(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Genel açıklama..." />
                   </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <h4 className="text-sm font-bold text-slate-700 mb-3">Kalem Ekle</h4>
                   <div className="flex flex-col md:flex-row gap-2 items-end">
                      <div className="flex-1 w-full">
                         <label className="block text-xs font-medium text-slate-500 mb-1">Ürün / Hizmet</label>
                         <select 
                           value={selectedProductId} 
                           onChange={e => setSelectedProductId(e.target.value)}
                           className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                         >
                           <option value="">Seçiniz</option>
                           {products.map(p => (
                             <option key={p.id} value={p.id}>
                               {p.name} {p.type === 'Product' ? `(Stok: ${p.stock})` : ''}
                             </option>
                           ))}
                         </select>
                      </div>
                      <div className="w-full md:w-32">
                         <label className="block text-xs font-medium text-slate-500 mb-1">
                             {contact.type === 'Customer' ? 'Satış Fiyatı' : 'Alış Fiyatı'} (TL)
                         </label>
                         <input 
                            type="number" 
                            step="0.01"
                            value={itemPrice}
                            placeholder="0.00"
                            onChange={e => setItemPrice(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold"
                         />
                      </div>
                      <div className="w-full md:w-24">
                         <label className="block text-xs font-medium text-slate-500 mb-1">Miktar</label>
                         <input 
                            type="number" 
                            min="1"
                            value={qty}
                            onChange={e => setQty(parseInt(e.target.value) || 1)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                         />
                      </div>
                      <button 
                        onClick={handleAddItem}
                        disabled={!selectedProductId || !itemPrice}
                        className="w-full md:w-auto p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
                      >
                         <Plus size={20} />
                      </button>
                   </div>
                </div>

                {/* Items List */}
                {invItems.length > 0 && (
                  <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 border-b">
                       <tr>
                         <th className="py-2">Ürün</th>
                         <th className="py-2 text-center">Miktar</th>
                         <th className="py-2 text-right">Birim Fiyat</th>
                         <th className="py-2 text-right">Tutar</th>
                         <th className="w-8"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {invItems.map((item, idx) => (
                         <tr key={idx}>
                            <td className="py-2">{item.productName}</td>
                            <td className="py-2 text-center">{item.quantity}</td>
                            <td className="py-2 text-right">{item.unitPrice} TL</td>
                            <td className="py-2 text-right font-bold">{item.total} TL</td>
                            <td className="py-2 text-right">
                               <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                    <tfoot className="border-t border-slate-300">
                       <tr>
                          <td colSpan={3} className="py-3 font-bold text-right">TOPLAM:</td>
                          <td className="py-3 text-right font-bold text-lg text-blue-600">
                             {invItems.reduce((s, i) => s + i.total, 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </td>
                          <td></td>
                       </tr>
                    </tfoot>
                  </table>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="flex-1 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={handleInvoiceSubmit}
                    disabled={invItems.length === 0}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    Faturayı Oluştur
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* CASH/CHECK TRANSACTION MODAL */}
      {isCashModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">
                 {contact.type === 'Customer' ? 'Tahsilat Ekle' : 'Ödeme Yap'}
               </h3>
               <button onClick={() => setIsCashModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
             </div>
             <form onSubmit={handleCashSubmit} className="p-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                   <p><strong>{contact.name}</strong> carisine işlem yapıyorsunuz.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (TL)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Yöntemi</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setPaymentMethod('CASH')} className={`p-2 text-sm border rounded-lg ${paymentMethod === 'CASH' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200'}`}>
                         <Banknote size={16} className="inline mr-1"/> Nakit
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('BANK_TRANSFER')} className={`p-2 text-sm border rounded-lg ${paymentMethod === 'BANK_TRANSFER' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200'}`}>
                         <Building size={16} className="inline mr-1"/> Havale
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('CREDIT_CARD')} className={`p-2 text-sm border rounded-lg ${paymentMethod === 'CREDIT_CARD' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200'}`}>
                         <CreditCard size={16} className="inline mr-1"/> Kredi Kartı
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('CHECK_NOTE')} className={`p-2 text-sm border rounded-lg ${paymentMethod === 'CHECK_NOTE' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-slate-200'}`}>
                         <FileText size={16} className="inline mr-1"/> Çek
                      </button>
                   </div>
                </div>

                {/* Conditional Inputs for Account or Check Details */}
                {paymentMethod !== 'CHECK_NOTE' ? (
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">İlgili Hesap</label>
                       <select 
                         required
                         value={selectedAccountId}
                         onChange={(e) => setSelectedAccountId(e.target.value)}
                         className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                       >
                         <option value="">Hesap Seçiniz</option>
                         {accounts.map(acc => (
                           <option key={acc.id} value={acc.id}>{acc.name} ({acc.type === 'POS' ? 'POS' : acc.type === 'BANK' ? 'Banka' : 'Kasa'} - {acc.balance} TL)</option>
                         ))}
                       </select>
                    </div>
                ) : (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 space-y-3">
                        <h4 className="font-bold text-orange-800 text-sm flex items-center gap-2"><FileText size={14}/> Çek Bilgileri</h4>
                        <div>
                            <label className="block text-xs font-medium text-orange-700 mb-1">Vade Tarihi</label>
                            <div className="relative">
                                <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-400" />
                                <input type="date" required value={checkDueDate} onChange={e => setCheckDueDate(e.target.value)} className="w-full pl-7 p-2 border border-orange-200 rounded-md text-sm focus:ring-2 focus:ring-orange-400 outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-orange-700 mb-1">Çek Numarası</label>
                                <input type="text" required value={checkNumber} onChange={e => setCheckNumber(e.target.value)} className="w-full p-2 border border-orange-200 rounded-md text-sm focus:ring-2 focus:ring-orange-400 outline-none" placeholder="Çek No" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-orange-700 mb-1">Banka</label>
                                <input type="text" required value={checkBank} onChange={e => setCheckBank(e.target.value)} className="w-full p-2 border border-orange-200 rounded-md text-sm focus:ring-2 focus:ring-orange-400 outline-none" placeholder="Örn: Akbank" />
                            </div>
                        </div>
                    </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                  <input 
                    required
                    type="text"
                    value={cashDesc}
                    onChange={e => setCashDesc(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Örn: Ekim ayı ödemesi"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCashModalOpen(false)}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                  >
                    Kaydet
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
