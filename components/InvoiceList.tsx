
import React, { useState } from 'react';
import { Plus, Search, Filter, Loader2, Sparkles, Receipt, Trash2, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Invoice, Status, TransactionType, Contact, Account, Product, InvoiceItem } from '../types';
import { generateInvoiceDescription } from '../services/geminiService';

interface InvoiceListProps {
  type: TransactionType;
  invoices: Invoice[];
  contacts: Contact[];
  products: Product[]; 
  accounts?: Account[];
  onAdd: (invoice: Invoice) => void;
  onToggleStatus: (id: string) => void; 
  onQuickExpense?: (description: string, amount: number, accountId: string, category: string) => void;
  onDelete?: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ type, invoices, contacts, products, accounts, onAdd, onToggleStatus, onQuickExpense, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Standard Invoice Form State
  const [contactId, setContactId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Item Logic State
  const [invItems, setInvItems] = useState<InvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [qty, setQty] = useState(1);

  // Quick Expense Form State
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expAccountId, setExpAccountId] = useState('');

  const filteredInvoices = invoices.filter(inv => 
    inv.type === type && 
    (inv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     inv.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Item Handling Logic ---
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

  const handleGenerateDescription = async () => {
    if (!description) return;
    setIsGeneratingAI(true);
    const enhanced = await generateInvoiceDescription(description);
    setDescription(enhanced);
    setIsGeneratingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invItems.length === 0) return;

    const contact = contacts.find(c => c.id === contactId);
    const totalAmount = invItems.reduce((sum, item) => sum + item.total, 0);

    const newInvoice: Invoice = {
      id: `FTR-${Date.now()}`,
      contactId,
      contactName: contact ? contact.name : 'Bilinmeyen',
      amount: totalAmount,
      date,
      dueDate: date, 
      description: description || (type === TransactionType.INCOME ? 'Ürün Satışı' : 'Ürün Alımı'),
      status: Status.PENDING,
      type,
      items: invItems
    };

    onAdd(newInvoice);
    setIsModalOpen(false);
    
    // Reset
    setContactId('');
    setInvItems([]);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(onQuickExpense && expAccountId) {
          onQuickExpense(expDesc, parseFloat(expAmount), expAccountId, expCategory);
          setIsQuickExpenseOpen(false);
          setExpDesc('');
          setExpAmount('');
          setExpCategory('');
          setExpAccountId('');
      }
  };

  const getStatusBadge = (status: Status) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium 
        ${status === Status.PAID ? 'bg-emerald-100 text-emerald-700' : 
          status === Status.PENDING ? 'bg-amber-100 text-amber-700' : 
          'bg-red-100 text-red-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{type === TransactionType.INCOME ? 'Satış Faturaları' : 'Masraflar & Giderler'}</h2>
          <p className="text-slate-500">Tüm {type === TransactionType.INCOME ? 'gelir' : 'masraf'} hareketlerinizi buradan yönetin.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            {type === TransactionType.EXPENSE && (
                <button 
                onClick={() => setIsQuickExpenseOpen(true)}
                className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                <Receipt size={18} />
                <span className="hidden sm:inline">Hızlı Masraf</span>
                <span className="sm:hidden">Masraf</span>
                </button>
            )}
            <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
            <Plus size={18} />
            {type === TransactionType.INCOME ? 'Yeni Fatura' : 'Fatura Gir'}
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700">
            <Filter size={18} />
            <span>Filtrele</span>
          </button>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Tarih</th>
                <th className="px-6 py-3 font-medium">{type === TransactionType.INCOME ? 'Müşteri' : 'Kişi / Kurum'}</th>
                <th className="px-6 py-3 font-medium">Açıklama</th>
                <th className="px-6 py-3 font-medium">Durum</th>
                <th className="px-6 py-3 font-medium text-right">Tutar</th>
                <th className="px-6 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{inv.contactName}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{inv.description}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    {inv.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {inv.status !== Status.PAID ? (
                            <button 
                                onClick={() => onToggleStatus(inv.id)}
                                className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                                title="Ödendi İşaretle"
                            >
                                <CheckCircle size={12} /> Ödendi
                            </button>
                        ) : (
                            <button 
                                onClick={() => onToggleStatus(inv.id)}
                                className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 flex items-center gap-1"
                                title="Bekliyor Yap"
                            >
                                <Clock size={12} /> İptal
                            </button>
                        )}
                        {onDelete && (
                             <button 
                             onClick={() => onDelete(inv.id)}
                             className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100 flex items-center gap-1"
                             title="Faturayı Sil"
                             >
                             <Trash2 size={12} />
                             </button>
                        )}
                      </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden">
           {filteredInvoices.map((inv) => (
             <div key={inv.id} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <div className="font-bold text-slate-800 text-base">{inv.contactName}</div>
                   <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                     <Calendar size={12} /> {inv.date}
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-slate-800">{inv.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div>
                   <div className="mt-1">{getStatusBadge(inv.status)}</div>
                 </div>
               </div>
               
               <div className="text-sm text-slate-600 mb-3 line-clamp-2">
                 {inv.description}
               </div>

               <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  {inv.status !== Status.PAID ? (
                      <button 
                          onClick={() => onToggleStatus(inv.id)}
                          className="flex-1 text-xs bg-emerald-50 text-emerald-700 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-2 font-medium"
                      >
                          <CheckCircle size={14} /> Ödendi İşaretle
                      </button>
                  ) : (
                      <button 
                          onClick={() => onToggleStatus(inv.id)}
                          className="flex-1 text-xs bg-slate-50 text-slate-600 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center gap-2 font-medium"
                      >
                          <Clock size={14} /> İptal Et
                      </button>
                  )}
                  {onDelete && (
                       <button 
                       onClick={() => onDelete(inv.id)}
                       className="w-10 h-9 flex items-center justify-center bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100"
                       >
                       <Trash2 size={16} />
                       </button>
                  )}
               </div>
             </div>
           ))}
           {filteredInvoices.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                Kayıt bulunamadı.
              </div>
           )}
        </div>
      </div>

      {/* STANDARD INVOICE MODAL (DETAILED) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-lg text-slate-800">
                {type === TransactionType.INCOME ? 'Yeni Fatura Ekle' : 'Tedarikçi Faturası Girişi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-4">
                  {type === TransactionType.INCOME 
                    ? 'Stoktan ürün düşmek için ürün seçimi yapmalısınız.' 
                    : 'Stoğa ürün eklemek için ürün seçimi yapmalısınız.'}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                    {type === TransactionType.INCOME ? 'Müşteri' : 'Tedarikçi'}
                    </label>
                    <select 
                    required
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                    <option value="">Seçiniz</option>
                    {contacts.filter(c => type === TransactionType.INCOME ? c.type === 'Customer' : c.type === 'Supplier').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tarih</label>
                    <input 
                    required
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Genel Açıklama</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateDescription}
                    disabled={!description || isGeneratingAI}
                    className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 disabled:opacity-50 font-medium"
                  >
                    {isGeneratingAI ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                    AI ile İyileştir
                  </button>
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Fatura genel açıklaması..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Item Selection Area */}
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
                             {type === TransactionType.INCOME ? 'Satış Fiyatı' : 'Alış Fiyatı'}
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
                        type="button"
                        onClick={handleAddItem}
                        disabled={!selectedProductId || !itemPrice}
                        className="w-full md:w-auto p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center"
                      >
                         <Plus size={20} />
                      </button>
                   </div>
                </div>

                {/* Added Items List */}
                {invItems.length > 0 ? (
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
                               <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
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
                ) : (
                    <div className="text-center py-4 text-slate-400 text-sm italic bg-slate-50 rounded-lg">
                        Henüz kalem eklenmedi.
                    </div>
                )}

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
                  disabled={invItems.length === 0}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Faturayı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK EXPENSE MODAL */}
      {isQuickExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Hızlı Masraf Fişi Gir</h3>
              <button onClick={() => setIsQuickExpenseOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleQuickExpenseSubmit} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-3 rounded-lg text-xs text-emerald-800 mb-4">
                  Masraf tutarı seçilen hesaptan (Kasa/Banka/Kredi Kartı) anında düşülecektir.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Masraf / Gider Adı</label>
                <input 
                  required
                  type="text" 
                  placeholder="Örn: Yemek, Taksi, Kırtasiye"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori (Opsiyonel)</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Genel Giderler"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (TL)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ödeme Yapılan Hesap</label>
                <select 
                  required
                  value={expAccountId}
                  onChange={(e) => setExpAccountId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">Hesap Seçiniz</option>
                  {accounts?.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.type === 'CREDIT_CARD' ? 'Kredi Kartı' : acc.type === 'BANK' ? 'Banka' : 'Kasa'}) - {acc.balance} TL</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsQuickExpenseOpen(false)}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Masrafı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
