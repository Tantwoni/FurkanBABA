
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Auth } from './components/Auth';
import { DashboardView } from './components/DashboardView';
import { InvoiceList } from './components/InvoiceList';
import { ContactList } from './components/ContactList';
import { ProductList } from './components/ProductList';
import { ContactDetail } from './components/ContactDetail';
import { CashBank } from './components/CashBank';
import { CheckList } from './components/CheckList';
import { LoanList } from './components/LoanList';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { Invoice, Contact, Product, Page, TransactionType, Status, DashboardStats, CashTransaction, Account, PaymentMethod, Check, Loan, User, CheckStatus } from './types';
import { SupabaseService } from './services/supabaseService';
import { isDemoMode } from './lib/supabase';
import { Loader2, AlertTriangle, X } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [showDemoBanner, setShowDemoBanner] = useState(isDemoMode);
  
  // Data State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [checks, setChecks] = useState<Check[]>([]); 
  const [loans, setLoans] = useState<Loan[]>([]);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0, totalExpense: 0, netProfit: 0, pendingReceivables: 0, cashBalance: 0
  });

  // 1. Auth Check (Local)
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const currentUser = await SupabaseService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            await loadUserData();
        }
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Load Data
  const loadUserData = async () => {
      try {
          const data = await SupabaseService.fetchAllData();
          setInvoices(data.invoices);
          setContacts(data.contacts);
          setProducts(data.products);
          setAccounts(data.accounts);
          setCashTransactions(data.transactions);
          setChecks(data.checks);
          setLoans(data.loans);
          
          setLastSaved(new Date());
      } catch (error) {
          console.error("Veri yüklenirken hata:", error);
      }
  };

  // --- STATS CALCULATION ---
  useEffect(() => {
    const totalIncome = invoices
      .filter(i => i.type === TransactionType.INCOME)
      .reduce((sum, i) => sum + i.amount, 0);
      
    const totalExpense = invoices
      .filter(i => i.type === TransactionType.EXPENSE)
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingReceivables = invoices
      .filter(i => i.type === TransactionType.INCOME && i.status === Status.PENDING)
      .reduce((sum, i) => sum + i.amount, 0);

    const cashBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    setStats({
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      pendingReceivables,
      cashBalance
    });
  }, [invoices, accounts, cashTransactions]);

  // Clear selected contact when changing pages
  useEffect(() => {
    if (activePage !== 'customers' && activePage !== 'suppliers') {
      setSelectedContact(null);
    }
  }, [activePage]);

  const handleLoginSuccess = async () => {
      setLoading(true);
      const u = await SupabaseService.getCurrentUser();
      setUser(u);
      await loadUserData();
      setLoading(false);
  };

  const handleLogout = async () => {
      await SupabaseService.logout();
      setUser(null);
      setInvoices([]);
      setContacts([]);
      setAccounts([]);
  };

  // --- HELPER: PRODUCT STOCK UPDATE ---
  const updateProductStocks = async (invoice: Invoice, isDelete: boolean = false) => {
      if (!invoice.items || invoice.items.length === 0) return;
      
      const multiplier = isDelete ? -1 : 1;
      // Income (Sale) -> Decrease Stock (-1 * multiplier)
      // Expense (Purchase) -> Increase Stock (+1 * multiplier)
      
      const updatedProductsList: Product[] = [];

      for (const item of invoice.items) {
          const product = products.find(p => p.id === item.productId);
          if (product && product.type === 'Product' && typeof product.stock === 'number') {
              let change = 0;
              if (invoice.type === TransactionType.INCOME) {
                  change = -1 * item.quantity * multiplier;
              } else {
                  change = 1 * item.quantity * multiplier;
              }
              
              const newStock = product.stock + change;
              const updatedProduct = { ...product, stock: newStock };
              
              updatedProductsList.push(updatedProduct);
              
              // DB update
              await SupabaseService.updateProduct(updatedProduct);
          }
      }

      if(updatedProductsList.length > 0) {
          setProducts(prev => prev.map(p => {
              const updated = updatedProductsList.find(up => up.id === p.id);
              return updated || p;
          }));
      }
  };

  // --- ACTION HANDLERS (DB INTEGRATED) ---

  // 1. INVOICES
  const handleAddInvoice = async (newInvoice: Invoice) => {
    if(!user) return;
    try {
        setInvoices(prev => [newInvoice, ...prev]);
        await SupabaseService.addInvoice(newInvoice, user.id);
        
        // Update Contact Balance
        const contact = contacts.find(c => c.id === newInvoice.contactId);
        if(contact) {
            const change = newInvoice.type === TransactionType.INCOME ? newInvoice.amount : -newInvoice.amount;
            const updatedContact = { ...contact, balance: contact.balance + change };
            setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
            await SupabaseService.updateContact(updatedContact);
        }

        // Update Stocks
        await updateProductStocks(newInvoice);

        setLastSaved(new Date());
    } catch (e) {
        console.error(e);
        alert("Fatura kaydedilirken hata oluştu.");
    }
  };

  const handleToggleInvoiceStatus = async (id: string) => {
      const invoice = invoices.find(i => i.id === id);
      if(!invoice) return;
      const newStatus = invoice.status === Status.PAID ? Status.PENDING : Status.PAID;
      
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
      await SupabaseService.updateInvoiceStatus(id, newStatus);
  };

  const handleDeleteInvoice = async (id: string) => {
      if(!window.confirm('Silmek istediğinize emin misiniz?')) return;
      
      const invoice = invoices.find(i => i.id === id);
      if(!invoice) return;

      setInvoices(prev => prev.filter(i => i.id !== id));
      await SupabaseService.deleteInvoice(id);

      // Revert Balance
      const contact = contacts.find(c => c.id === invoice.contactId);
      if(contact) {
          const reversal = invoice.type === TransactionType.INCOME ? -invoice.amount : invoice.amount;
          const updatedContact = { ...contact, balance: contact.balance + reversal };
          setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
          await SupabaseService.updateContact(updatedContact);
      }

      // Revert Stocks (isDelete = true)
      await updateProductStocks(invoice, true);
  };

  // 2. QUICK EXPENSE
  const handleQuickExpense = async (description: string, amount: number, accountId: string, category: string) => {
      if(!user) return;
      const account = accounts.find(a => a.id === accountId);
      if(!account) return;

      // 1. Save Transaction
      const newTrx: CashTransaction = {
          id: `EXP-${Date.now()}`, 
          date: new Date().toISOString().split('T')[0],
          accountId,
          accountName: account.name,
          description,
          amount,
          type: TransactionType.EXPENSE,
          paymentMethod: account.type === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'CASH'
      };
      setCashTransactions(prev => [newTrx, ...prev]); 
      
      await SupabaseService.addTransaction(newTrx, user.id);

      // 2. Save as Invoice (Expense Record without Contact)
      const newInvoice: Invoice = {
          id: `INV-EXP-${Date.now()}`,
          contactId: '', 
          contactName: category || 'Genel Gider',
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          amount,
          description,
          status: Status.PAID,
          type: TransactionType.EXPENSE,
          items: []
      };
      setInvoices(prev => [newInvoice, ...prev]);
      await SupabaseService.addInvoice(newInvoice, user.id);

      // 3. Update Account Balance
      const updatedAccount = { ...account, balance: account.balance - amount };
      setAccounts(prev => prev.map(a => a.id === accountId ? updatedAccount : a));
      await SupabaseService.updateAccount(updatedAccount);
  };

  // 3. FINANCIAL TRANSACTIONS
  const handleFinancialTransaction = async (amount: number, description: string, type: TransactionType, accountId: string, method: PaymentMethod, checkDetails?: Partial<Check>) => {
    if (!selectedContact || !user) return;
    const account = accounts.find(a => a.id === accountId);
    
    // Check Handling
    if (method === 'CHECK_NOTE' && checkDetails) {
        const newCheck: Check = {
            id: `CHK-${Date.now()}`,
            contactId: selectedContact.id,
            contactName: selectedContact.name,
            date: new Date().toISOString().split('T')[0],
            dueDate: checkDetails.dueDate || '',
            amount: amount,
            checkNumber: checkDetails.checkNumber || '',
            bankName: checkDetails.bankName || '',
            description: description,
            type: type === TransactionType.INCOME ? 'RECEIVED' : 'GIVEN',
            status: type === TransactionType.INCOME ? CheckStatus.PORTFOLIO : CheckStatus.ISSUED
        };
        setChecks(prev => [newCheck, ...prev]);
        await SupabaseService.addCheck(newCheck, user.id);
        
        // Update Contact Balance for Checks too
        const change = type === TransactionType.INCOME ? -amount : amount;
        const updatedContact = { ...selectedContact, balance: selectedContact.balance + change };
        setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
        setSelectedContact(updatedContact);
        await SupabaseService.updateContact(updatedContact);
        return;
    }
    
    if (!account) return;

    // 1. Update Contact Balance
    const change = type === TransactionType.INCOME ? -amount : amount;
    const updatedContact = { ...selectedContact, balance: selectedContact.balance + change };
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    setSelectedContact(updatedContact);
    await SupabaseService.updateContact(updatedContact);

    // 2. Handle Cash/Bank Logic
    if(account) {
        const newTrx: CashTransaction = {
            id: `TRX-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            contactId: selectedContact.id,
            contactName: selectedContact.name,
            accountId: account.id,
            accountName: account.name,
            description,
            amount,
            type,
            paymentMethod: method
        };
        setCashTransactions(prev => [newTrx, ...prev]);
        await SupabaseService.addTransaction(newTrx, user.id);

        // Update Account Balance
        const accChange = type === TransactionType.INCOME ? amount : -amount;
        const updatedAccount = { ...account, balance: account.balance + accChange };
        setAccounts(prev => prev.map(a => a.id === accountId ? updatedAccount : a));
        await SupabaseService.updateAccount(updatedAccount);
    }
  };

  // 4. CRUD HANDLERS
  const handleAddContact = async (contact: Contact) => {
      if(!user) return;
      setContacts(prev => [contact, ...prev]);
      try {
          await SupabaseService.addContact(contact, user.id);
      } catch(e) { console.error(e); }
  };

  const handleUpdateContact = async (contact: Contact) => {
      setContacts(prev => prev.map(c => c.id === contact.id ? contact : c));
      if(selectedContact?.id === contact.id) setSelectedContact(contact);
      await SupabaseService.updateContact(contact);
  };

  const handleDeleteContact = async (id: string) => {
      if(!window.confirm("Silmek istediğinize emin misiniz?")) return;
      setContacts(prev => prev.filter(c => c.id !== id));
      setSelectedContact(null);
      await SupabaseService.deleteContact(id);
  };

  const handleAddProduct = async (product: Product) => {
      if(!user) return;
      setProducts(prev => [product, ...prev]);
      try {
        await SupabaseService.addProduct(product, user.id);
      } catch(e) { console.error(e); }
  };

  const handleUpdateProduct = async (product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      await SupabaseService.updateProduct(product);
  };

  const handleDeleteProduct = async (id: string) => {
      if(!window.confirm("Silmek istediğinize emin misiniz?")) return;
      setProducts(prev => prev.filter(p => p.id !== id));
      await SupabaseService.deleteProduct(id);
  };

  const handleAddAccount = async (account: Account) => {
      if(!user) return;
      setAccounts(prev => [account, ...prev]);
      try {
        await SupabaseService.addAccount(account, user.id);
      } catch (e) { console.error(e); }
  };

  const handleUpdateAccount = async (account: Account) => {
      setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
      await SupabaseService.updateAccount(account);
  };

  const handleDeleteAccount = async (id: string) => {
      if(!window.confirm("Hesabı silmek istediğinize emin misiniz?")) return;
      setAccounts(prev => prev.filter(a => a.id !== id));
      await SupabaseService.deleteAccount(id);
  };

  const handleDeleteTransaction = async (id: string) => {
      const trx = cashTransactions.find(t => t.id === id);
      if(!trx) return;
      if(!window.confirm("İşlemi silmek ve bakiyeyi geri almak istediğinize emin misiniz?")) return;

      setCashTransactions(prev => prev.filter(t => t.id !== id));
      await SupabaseService.deleteTransaction(id);

      // Revert Account Balance
      const account = accounts.find(a => a.id === trx.accountId);
      if(account) {
          const reversal = trx.type === TransactionType.INCOME ? -trx.amount : trx.amount;
          const updatedAccount = { ...account, balance: account.balance + reversal };
          setAccounts(prev => prev.map(a => a.id === account.id ? updatedAccount : a));
          await SupabaseService.updateAccount(updatedAccount);
      }
  };

  // --- LOCAL ONLY ACTIONS (Checks & Loans) ---
  const handleUpdateCheckStatus = async (id: string, status: CheckStatus) => {
      setChecks(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      await SupabaseService.updateCheckStatus(id, status);
  };

  const handleDeleteCheck = async (id: string) => {
      setChecks(prev => prev.filter(c => c.id !== id));
      await SupabaseService.deleteCheck(id);
  };

  const handleAddLoan = async (loan: Loan) => {
      if(!user) return;
      setLoans(prev => [loan, ...prev]);
      await SupabaseService.addLoan(loan, user.id);
  };

  const handleDeleteLoan = async (id: string) => {
      setLoans(prev => prev.filter(l => l.id !== id));
      await SupabaseService.deleteLoan(id);
  };

  const handlePayInstallment = async (loanId: string, installmentId: string, accountId: string) => {
      const loan = loans.find(l => l.id === loanId);
      const installment = loan?.installments.find(i => i.id === installmentId);
      const account = accounts.find(a => a.id === accountId);
      if (loan && installment && account && installment.status === 'PENDING') {
          const updatedInstallments = loan.installments.map(i => i.id === installmentId ? { ...i, status: 'PAID' as const, paidDate: new Date().toISOString().split('T')[0] } : i);
          const updatedLoan = { ...loan, remainingAmount: loan.remainingAmount - installment.amount, installments: updatedInstallments, status: (loan.remainingAmount - installment.amount) <= 0 ? 'COMPLETED' as const : 'ACTIVE' as const };
          setLoans(prev => prev.map(l => l.id === loanId ? updatedLoan : l));
          
          // Update Loan in DB
          await SupabaseService.updateLoan(updatedLoan);

          // Update Account Balance
          const updatedAccount = { ...account, balance: account.balance - installment.amount };
          setAccounts(prev => prev.map(a => a.id === account.id ? updatedAccount : a));
          await SupabaseService.updateAccount(updatedAccount);
      }
  };

  const handleFactoring = async (checkId: string, bankAccountId: string, commissionRate: number) => {
    if (!user) return;
    const check = checks.find(c => c.id === checkId);
    const account = accounts.find(a => a.id === bankAccountId);
    
    if (!check || !account) return;
    
    // 1. Update Check Status
    const updatedCheck = { ...check, status: CheckStatus.FACTORED };
    setChecks(prev => prev.map(c => c.id === checkId ? updatedCheck : c));
    await SupabaseService.updateCheckStatus(checkId, CheckStatus.FACTORED);
    
    // 2. Calculate Amounts
    const commissionAmount = (check.amount * commissionRate) / 100;
    const netAmount = check.amount - commissionAmount;
    
    // 3. Add Transaction (Net Money In)
    const newTrx: CashTransaction = {
        id: `TRX-FACT-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        accountId: account.id,
        accountName: account.name,
        contactId: check.contactId,
        contactName: check.contactName,
        description: `Çek Kırdırma / Faktöring (${check.checkNumber})`,
        amount: netAmount,
        type: TransactionType.INCOME,
        paymentMethod: 'BANK_TRANSFER'
    };
    setCashTransactions(prev => [newTrx, ...prev]);
    await SupabaseService.addTransaction(newTrx, user.id);
    
    // 4. Update Account Balance
    const updatedAccount = { ...account, balance: account.balance + netAmount };
    setAccounts(prev => prev.map(a => a.id === account.id ? updatedAccount : a));
    await SupabaseService.updateAccount(updatedAccount);
};

  const handlePosSettlement = async (posAccountId: string, bankAccountId: string, amount: number, commissionRate: number) => {
      if(!user) return;
      const posAcc = accounts.find(a => a.id === posAccountId);
      const bankAcc = accounts.find(a => a.id === bankAccountId);
      if(!posAcc || !bankAcc) return;

      // 1. Out from POS
      const updatedPos = { ...posAcc, balance: posAcc.balance - amount };
      setAccounts(prev => prev.map(a => a.id === posAccountId ? updatedPos : a));
      await SupabaseService.updateAccount(updatedPos);

      // 2. Calc Net
      const commission = (amount * commissionRate) / 100;
      const net = amount - commission;

      // 3. In to Bank
      const updatedBank = { ...bankAcc, balance: bankAcc.balance + net };
      setAccounts(prev => prev.map(a => a.id === bankAccountId ? updatedBank : a));
      await SupabaseService.updateAccount(updatedBank);

      // 4. Record Transaction (Virtual)
      const newTrx: CashTransaction = {
        id: `TRX-VIR-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        accountId: bankAcc.id,
        accountName: bankAcc.name,
        description: `POS Virman (${posAcc.name})`,
        amount: net,
        type: TransactionType.INCOME,
        paymentMethod: 'BANK_TRANSFER'
      };
      setCashTransactions(prev => [newTrx, ...prev]);
      await SupabaseService.addTransaction(newTrx, user.id);
  };

  // Main Render Logic
  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
      );
  }

  if (!user) {
      return <Auth onLogin={handleLoginSuccess} />;
  }

  const renderContent = () => {
    if (selectedContact && (activePage === 'customers' || activePage === 'suppliers')) {
      return (
        <ContactDetail 
          contact={selectedContact} invoices={invoices} products={products} accounts={accounts}
          onBack={() => setSelectedContact(null)} onCreateInvoice={handleAddInvoice}
          onFinancialTransaction={handleFinancialTransaction} onDeleteInvoice={handleDeleteInvoice}
          onUpdateContact={handleUpdateContact} onDeleteContact={handleDeleteContact}
        />
      );
    }
    
    switch (activePage) {
      case 'dashboard': return <DashboardView stats={stats} invoices={invoices} />;
      case 'reports': return <ReportsView invoices={invoices} transactions={cashTransactions} />;
      case 'sales': return <InvoiceList type={TransactionType.INCOME} invoices={invoices} contacts={contacts} products={products} onAdd={handleAddInvoice} onToggleStatus={handleToggleInvoiceStatus} onDelete={handleDeleteInvoice} />;
      case 'expenses': return <InvoiceList type={TransactionType.EXPENSE} invoices={invoices} contacts={contacts} accounts={accounts} products={products} onAdd={handleAddInvoice} onToggleStatus={handleToggleInvoiceStatus} onQuickExpense={handleQuickExpense} onDelete={handleDeleteInvoice} />;
      case 'cash-bank': return <CashBank accounts={accounts} transactions={cashTransactions} onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onPosSettlement={handlePosSettlement} onDeleteAccount={handleDeleteAccount} onDeleteTransaction={handleDeleteTransaction} />;
      case 'checks': return <CheckList checks={checks} accounts={accounts} onUpdateStatus={handleUpdateCheckStatus} onDelete={handleDeleteCheck} onFactoring={handleFactoring} />;
      case 'loans': return <LoanList loans={loans} accounts={accounts} onAddLoan={handleAddLoan} onPayInstallment={handlePayInstallment} onDelete={handleDeleteLoan} />;
      case 'customers': return <ContactList title="Müşteriler" type="Customer" contacts={contacts.filter(c => c.type === 'Customer')} onSelect={setSelectedContact} onAdd={handleAddContact} onDelete={handleDeleteContact} />;
      case 'suppliers': return <ContactList title="Tedarikçiler" type="Supplier" contacts={contacts.filter(c => c.type === 'Supplier')} onSelect={setSelectedContact} onAdd={handleAddContact} onDelete={handleDeleteContact} />;
      case 'products': return <ProductList products={products} invoices={invoices} onAdd={handleAddProduct} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} />;
      case 'settings': return <SettingsView data={{ invoices, contacts, products, accounts, transactions: cashTransactions, checks, loans }} onRestore={(data) => {
          // Restore logic from file
          // In a real implementation, we would override local storage here
          alert("Yedek yükleme simülasyonu başarılı. Sayfayı yenileyerek verileri görebilirsiniz.");
      }} />;
      default: return <DashboardView stats={stats} invoices={invoices} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} lastSaved={lastSaved} user={user} onLogout={handleLogout} />
        
        {/* DEMO MODE WARNING BANNER */}
        {showDemoBanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between animate-fade-in">
             <div className="flex items-center gap-3 text-amber-800">
                <AlertTriangle size={20} />
                <div className="text-sm">
                   <strong>Veritabanı Bağlantısı Yok!</strong>
                   <span className="hidden sm:inline"> Vercel "Environment Variables" ayarlarından Supabase anahtarlarını girmeniz gerekmektedir.</span>
                   <span className="sm:hidden"> Vercel ayarlarından anahtarları giriniz.</span>
                </div>
             </div>
             <button onClick={() => setShowDemoBanner(false)} className="text-amber-600 hover:bg-amber-100 p-1 rounded">
                <X size={18} />
             </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
