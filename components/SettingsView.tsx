
import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, Save, Database, RefreshCw, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Invoice, Contact, Product, Account, CashTransaction, Check, Loan } from '../types';

interface SettingsViewProps {
  data: {
    invoices: Invoice[];
    contacts: Contact[];
    products: Product[];
    accounts: Account[];
    transactions: CashTransaction[];
    checks: Check[];
    loans?: Loan[];
  };
  onRestore: (data: any) => void;
  onReset?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ data, onRestore, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // --- EXPORT FUNCTIONS ---
  
  const exportToJSON = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `BizimHesap_Yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInvoicesToCSV = () => {
    // Simple CSV Generator for Invoices
    const headers = ['Fatura No', 'Tarih', 'Cari', 'Açıklama', 'Durum', 'Tür', 'Tutar'];
    const rows = data.invoices.map(inv => [
      inv.id,
      inv.date,
      inv.contactName,
      inv.description.replace(/,/g, ' '), // avoid CSV issues
      inv.status,
      inv.type === 'INCOME' ? 'Gelir' : 'Gider',
      inv.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Faturalar_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- IMPORT FUNCTION ---

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsedData = JSON.parse(json);
        
        // Basic validation checks
        if (!parsedData.invoices || !parsedData.contacts || !parsedData.accounts) {
          throw new Error("Geçersiz yedek dosyası formatı.");
        }

        onRestore(parsedData);
        setRestoreStatus('success');
        setStatusMsg('Veriler başarıyla geri yüklendi!');
      } catch (error) {
        console.error(error);
        setRestoreStatus('error');
        setStatusMsg('Dosya okunurken hata oluştu. Lütfen doğru JSON dosyasını seçtiğinizden emin olun.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ayarlar ve Yedekleme</h2>
        <p className="text-slate-500">Uygulama verilerinizi yönetin, yedekleyin veya geri yükleyin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* EXPORT SECTION */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Save size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Veri Yedekleme</h3>
              <p className="text-xs text-slate-500">Tüm verilerinizi bilgisayarınıza indirin.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={exportToJSON}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <Database className="text-slate-400 group-hover:text-blue-500" size={20} />
                <div className="text-left">
                  <p className="font-medium text-slate-700 group-hover:text-blue-700">Tam Yedek (JSON)</p>
                  <p className="text-xs text-slate-500">Geri yükleme için uygundur</p>
                </div>
              </div>
              <Download size={18} className="text-slate-400 group-hover:text-blue-600" />
            </button>

            <button 
              onClick={exportInvoicesToCSV}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-slate-400 group-hover:text-emerald-500" size={20} />
                <div className="text-left">
                  <p className="font-medium text-slate-700 group-hover:text-emerald-700">Faturaları İndir (Excel/CSV)</p>
                  <p className="text-xs text-slate-500">Excel'de görüntülemek için</p>
                </div>
              </div>
              <Download size={18} className="text-slate-400 group-hover:text-emerald-600" />
            </button>
          </div>
        </div>

        {/* IMPORT & RESET SECTION */}
        <div className="space-y-8">
          {/* Import */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <RefreshCw size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Veri Geri Yükleme</h3>
                <p className="text-xs text-slate-500">Daha önce alınan yedeği sisteme yükleyin.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm text-amber-800 flex items-start gap-2">
                 <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                 <p>
                   <strong>Dikkat:</strong> Geri yükleme işlemi mevcut tüm verilerinizi siler ve yedek dosyasındaki verileri yazar.
                 </p>
              </div>

              <div className="relative">
                 <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="restore-upload"
                 />
                 <label 
                    htmlFor="restore-upload"
                    className="w-full flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50 rounded-lg cursor-pointer transition-all text-slate-500 hover:text-purple-600 font-medium"
                 >
                    <Upload size={20} />
                    Yedek Dosyasını Seç (JSON)
                 </label>
              </div>

              {restoreStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm font-medium animate-fade-in">
                  <CheckCircle size={16} />
                  {statusMsg}
                </div>
              )}
               {restoreStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium animate-fade-in">
                  <AlertTriangle size={16} />
                  {statusMsg}
                </div>
              )}
            </div>
          </div>
          
          {/* RESET DATA */}
          {onReset && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
               <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-600">Tehlikeli Bölge</h3>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                  Uygulamayı ilk yüklendiği haline döndürür. Bu tarayıcıda saklanan <b>tüm verileriniz kalıcı olarak silinir.</b>
              </p>
              <button 
                onClick={onReset}
                className="w-full py-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg font-bold transition-colors"
              >
                Tüm Verileri Sıfırla (Fabrika Ayarları)
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
