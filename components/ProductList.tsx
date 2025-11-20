
import React, { useState } from 'react';
import { Plus, Search, Package, Layers, Edit, History, ArrowUpRight, ArrowDownRight, X, Trash2 } from 'lucide-react';
import { Product, Invoice, TransactionType } from '../types';

interface ProductListProps {
  products: Product[];
  invoices: Invoice[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete?: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, invoices, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail/Edit Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailTab, setDetailTab] = useState<'history' | 'edit'>('history');
  const [editName, setEditName] = useState('');

  // New Product Form State
  const [name, setName] = useState('');
  const [vatRate, setVatRate] = useState('18');
  const [type, setType] = useState<'Product' | 'Service'>('Product');
  const [stock, setStock] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: `PRD-${Date.now()}`,
      name,
      vatRate: parseFloat(vatRate),
      type,
      stock: type === 'Product' && stock ? parseInt(stock) : undefined,
      lastBuyPrice: 0
    };
    onAdd(newProduct);
    setIsModalOpen(false);
    // Reset Form
    setName(''); setStock('');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(selectedProduct) {
          onUpdate({...selectedProduct, name: editName});
          setSelectedProduct(null);
      }
  };

  const openDetail = (p: Product) => {
      setSelectedProduct(p);
      setEditName(p.name);
      setDetailTab('history');
  };

  // Helper to extract history from invoices
  const getProductHistory = (productId: string) => {
      const history: {
          date: string;
          contactName: string;
          type: TransactionType;
          quantity: number;
          price: number;
      }[] = [];

      invoices.forEach(inv => {
          inv.items?.forEach(item => {
              if(item.productId === productId) {
                  history.push({
                      date: inv.date,
                      contactName: inv.contactName,
                      type: inv.type,
                      quantity: item.quantity,
                      price: item.unitPrice
                  });
              }
          });
      });
      
      // Sort by date desc
      return history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ürünler ve Hizmetler</h2>
          <p className="text-slate-500">Stok takibi ve hizmet tanımları</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={18} />
          Yeni Ürün/Hizmet
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Ürün adı ile ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Ürün/Hizmet Adı</th>
                <th className="px-6 py-3 font-medium">Tür</th>
                <th className="px-6 py-3 font-medium">KDV</th>
                <th className="px-6 py-3 font-medium text-right">Mevcut Stok</th>
                <th className="px-6 py-3 font-medium text-right">Son Alış Fiyatı</th>
                <th className="px-6 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  onClick={() => openDetail(product)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${product.type === 'Product' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                      {product.type === 'Product' ? <Package size={12} /> : <Layers size={12} />}
                      {product.type === 'Product' ? 'Ürün' : 'Hizmet'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">%{product.vatRate}</td>
                  <td className="px-6 py-4 text-right">
                    {product.type === 'Product' 
                      // Fix: Show 0 Adet if undefined but it IS a product
                      ? <span className={`font-bold ${((product.stock || 0) < 10) ? 'text-red-600' : 'text-slate-800'}`}>{product.stock || 0} Adet</span>
                      : <span className="text-slate-400">-</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {product.lastBuyPrice ? product.lastBuyPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {onDelete && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} 
                            className="p-1 text-slate-300 hover:text-red-600 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
            {filteredProducts.map((product) => (
                <div 
                    key={product.id} 
                    onClick={() => openDetail(product)}
                    className="p-4 border-b border-slate-100 last:border-0 active:bg-slate-50 relative"
                >
                    {onDelete && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} 
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 transition-colors z-10"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <div className="flex justify-between items-start mb-2 pr-8">
                        <div className="font-bold text-slate-800">{product.name}</div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${product.type === 'Product' ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                           {product.type === 'Product' ? 'Ürün' : 'Hizmet'}
                        </span>
                    </div>
                    <div className="flex justify-between items-end text-sm mt-2">
                        <div>
                            <div className="text-xs text-slate-500">KDV: %{product.vatRate}</div>
                            <div className="text-xs text-slate-500 mt-1">Son Alış: {product.lastBuyPrice ? product.lastBuyPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'}</div>
                        </div>
                        {product.type === 'Product' && (
                            <div className={`font-bold ${((product.stock || 0) < 10) ? 'text-red-600' : 'text-slate-800'}`}>
                                {product.stock || 0} Adet
                            </div>
                        )}
                    </div>
                </div>
            ))}
             {filteredProducts.length === 0 && (
                 <div className="p-8 text-center text-slate-400 text-sm">
                     Kayıt bulunamadı.
                 </div>
             )}
        </div>
      </div>

      {/* NEW PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Yeni Ürün/Hizmet Tanımla</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
                <div className="flex rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setType('Product')}
                    className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${type === 'Product' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                  >
                    Ürün
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Service')}
                    className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${type === 'Service' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                  >
                    Hizmet
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ürün/Hizmet Adı</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ürün ismi giriniz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">KDV (%)</label>
                  <select 
                    value={vatRate}
                    onChange={(e) => setVatRate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="0">%0</option>
                    <option value="1">%1</option>
                    <option value="10">%10</option>
                    <option value="20">%20</option>
                  </select>
                </div>
                {type === 'Product' && (
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Stok Adedi</label>
                    <input 
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                    />
                    </div>
                )}
              </div>
              
              <p className="text-xs text-slate-500 italic">
                 * Alış ve satış fiyatları fatura oluşturulurken girilecektir.
              </p>

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

      {/* DETAIL / EDIT MODAL */}
      {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 truncate max-w-md">{selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={24}/>
              </button>
            </div>
            
            <div className="flex border-b border-slate-200">
                <button 
                   onClick={() => setDetailTab('history')}
                   className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${detailTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Hareket Geçmişi
                </button>
                <button 
                   onClick={() => setDetailTab('edit')}
                   className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${detailTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Düzenle
                </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
                {detailTab === 'history' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-emerald-600 flex items-center gap-2 mb-3"><ArrowDownRight size={20}/> Alış Geçmişi (Girişler)</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm hidden md:table">
                                    <thead className="bg-slate-50 text-slate-500 text-left">
                                        <tr>
                                            <th className="p-3">Tarih</th>
                                            <th className="p-3">Tedarikçi</th>
                                            <th className="p-3 text-center">Miktar</th>
                                            <th className="p-3 text-right">Alış Fiyatı</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {getProductHistory(selectedProduct.id).filter(h => h.type === TransactionType.EXPENSE).map((h, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 text-slate-600">{h.date}</td>
                                                <td className="p-3 font-medium">{h.contactName}</td>
                                                <td className="p-3 text-center">{h.quantity}</td>
                                                <td className="p-3 text-right">{h.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {/* Mobile List */}
                                <div className="md:hidden divide-y divide-slate-100">
                                     {getProductHistory(selectedProduct.id).filter(h => h.type === TransactionType.EXPENSE).map((h, idx) => (
                                         <div key={idx} className="p-3 text-sm">
                                             <div className="flex justify-between mb-1">
                                                 <span className="font-bold">{h.contactName}</span>
                                                 <span>{h.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                             </div>
                                             <div className="flex justify-between text-slate-500 text-xs">
                                                 <span>{h.date}</span>
                                                 <span>{h.quantity} Adet</span>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                                {getProductHistory(selectedProduct.id).filter(h => h.type === TransactionType.EXPENSE).length === 0 && (
                                    <div className="p-4 text-center text-slate-400 text-sm">Kayıt yok.</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-blue-600 flex items-center gap-2 mb-3"><ArrowUpRight size={20}/> Satış Geçmişi (Çıkışlar)</h4>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm hidden md:table">
                                    <thead className="bg-slate-50 text-slate-500 text-left">
                                        <tr>
                                            <th className="p-3">Tarih</th>
                                            <th className="p-3">Müşteri</th>
                                            <th className="p-3 text-center">Miktar</th>
                                            <th className="p-3 text-right">Satış Fiyatı</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {getProductHistory(selectedProduct.id).filter(h => h.type === TransactionType.INCOME).map((h, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 text-slate-600">{h.date}</td>
                                                <td className="p-3 font-medium">{h.contactName}</td>
                                                <td className="p-3 text-center">{h.quantity}</td>
                                                <td className="p-3 text-right">{h.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                 {/* Mobile List */}
                                <div className="md:hidden divide-y divide-slate-100">
                                     {getProductHistory(selectedProduct.id).filter(h => h.type === TransactionType.INCOME).map((h, idx) => (
                                         <div key={idx} className="p-3 text-sm">
                                             <div className="flex justify-between mb-1">
                                                 <span className="font-bold">{h.contactName}</span>
                                                 <span>{h.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                             </div>
                                             <div className="flex justify-between text-slate-500 text-xs">
                                                 <span>{h.date}</span>
                                                 <span>{h.quantity} Adet</span>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                                {getProductHistory(selectedProduct.id).filter(h => h.type === TransactionType.INCOME).length === 0 && (
                                    <div className="p-4 text-center text-slate-400 text-sm">Kayıt yok.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {detailTab === 'edit' && (
                    <form onSubmit={handleUpdateSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ürün Adı</label>
                            <input 
                                type="text" 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)} 
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="bg-amber-50 p-3 rounded text-amber-800 text-sm">
                            Stok adedi ve fiyat bilgileri sadece fatura işlemleri ile güncellenir. Buradan sadece isim değişikliği yapabilirsiniz.
                        </div>
                        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Değişiklikleri Kaydet
                        </button>
                    </form>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
