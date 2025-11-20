
import React, { useState } from 'react';
import { Phone, Mail, Building, Plus, Search, User, ArrowRight, Trash2 } from 'lucide-react';
import { Contact } from '../types';

interface ContactListProps {
  title: string;
  type: 'Customer' | 'Supplier';
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  onAdd: (contact: Contact) => void;
  onDelete?: (id: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({ title, type, contacts, onSelect, onAdd, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newContact: Contact = {
          id: `${type === 'Customer' ? 'CUST' : 'SUP'}-${Date.now()}`,
          name,
          email,
          phone,
          type,
          balance: initialBalance ? parseFloat(initialBalance) : 0
      };
      onAdd(newContact);
      setIsModalOpen(false);
      
      // Reset
      setName('');
      setEmail('');
      setPhone('');
      setInitialBalance('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-500">Kayıtlı {title.toLowerCase()} listesi ve bakiye durumları</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Yeni {type === 'Customer' ? 'Müşteri' : 'Tedarikçi'} Ekle
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`${title} ara...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map(contact => (
          <div 
            key={contact.id} 
            onClick={() => onSelect(contact)}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative group"
          >
            {onDelete && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(contact.id);
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors z-10"
                    title="Sil"
                >
                    <Trash2 size={16} />
                </button>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'Customer' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {type === 'Customer' ? <User size={24} /> : <Building size={24} />}
              </div>
              <div className="text-right pr-8 sm:pr-0">
                 <p className="text-xs text-slate-400 font-medium mb-1">GÜNCEL BAKİYE</p>
                 <span className={`text-sm font-bold ${contact.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {contact.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                 </span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1 truncate" title={contact.name}>{contact.name}</h3>
            
            <div className="space-y-3 pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={16} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} className="text-slate-400 flex-shrink-0" />
                <span>{contact.phone}</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                <ArrowRight size={20} />
            </div>
          </div>
        ))}
        
        {filteredContacts.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">Kayıt bulunamadı.</p>
          </div>
        )}
      </div>

      {/* NEW CONTACT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-lg text-slate-800">Yeni {type === 'Customer' ? 'Müşteri' : 'Tedarikçi'} Ekle</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Firma / Kişi Adı</label>
                   <input 
                     required
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="Örn: ABC Yazılım Ltd. Şti."
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">E-Posta Adresi</label>
                   <input 
                     type="email" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="ornek@sirket.com"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                   <input 
                     type="tel" 
                     value={phone}
                     onChange={(e) => setPhone(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="05XX XXX XX XX"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Açılış Bakiyesi (TL)</label>
                   <input 
                     type="number" 
                     step="0.01"
                     value={initialBalance}
                     onChange={(e) => setInitialBalance(e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="0.00"
                   />
                   <p className="text-xs text-slate-400 mt-1">
                     {type === 'Customer' ? 'Alacaklı' : 'Borçlu'} isek pozitif değer, aksi halde negatif değer giriniz.
                   </p>
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
    </div>
  );
};
