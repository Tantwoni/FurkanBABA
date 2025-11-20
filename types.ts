
export enum TransactionType {
  INCOME = 'INCOME', // Gelir (Satış / Tahsilat)
  EXPENSE = 'EXPENSE' // Gider (Alış / Ödeme)
}

export enum Status {
  PAID = 'Ödendi',
  PENDING = 'Bekliyor',
  OVERDUE = 'Gecikmiş'
}

export type AccountType = 'CASH' | 'BANK' | 'POS' | 'CREDIT_CARD';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK_NOTE';

export enum CheckStatus {
  PORTFOLIO = 'Portföyde', // Bizdeki müşteri çeki
  COLLECTED = 'Tahsil Edildi', // Bankadan parası alındı
  ISSUED = 'Verildi', // Tedarikçiye verdiğimiz çek
  PAID = 'Ödendi', // Bankadan ödemesi yapıldı
  BOUNCED = 'Karşılıksız', // Sorunlu
  FACTORED = 'Faktöring' // Kırdırıldı
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  password?: string; 
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Customer' | 'Supplier';
  balance: number; // + Alacaklı, - Borçlu
}

export interface Product {
  id: string;
  name: string;
  vatRate: number;
  type: 'Product' | 'Service';
  stock?: number;
  lastBuyPrice?: number; // Son alış fiyatı (Listede göstermek için)
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  contactId: string; // Masraflarda boş olabilir veya 'OTHER' olabilir
  contactName: string;
  date: string;
  dueDate: string;
  amount: number;
  description: string;
  status: Status;
  type: TransactionType;
  items?: InvoiceItem[];
}

export interface CashTransaction {
  id: string;
  date: string;
  contactId?: string; // Eğer bir cariye bağlıysa
  contactName?: string;
  accountId: string; // Hangi hesaba girdiği/çıktığı
  accountName: string;
  description: string;
  amount: number;
  type: TransactionType; // INCOME (Tahsilat), EXPENSE (Ödeme)
  paymentMethod: PaymentMethod;
}

export interface Check {
  id: string;
  contactId: string;
  contactName: string;
  date: string; // İşlem tarihi
  dueDate: string; // Vade tarihi
  amount: number;
  checkNumber: string;
  bankName: string;
  description: string;
  type: 'RECEIVED' | 'GIVEN'; // Alınan (Müşteri) veya Verilen (Tedarikçi)
  status: CheckStatus;
}

export interface LoanInstallment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING';
  paidDate?: string;
}

export interface Loan {
  id: string;
  bankName: string; // Kredinin çekildiği banka
  loanName: string; // Örn: Araç Kredisi, İhtiyaç Kredisi
  totalAmount: number; // Toplam Geri Ödeme Tutarı (Faizli)
  remainingAmount: number; // Kalan Borç
  startDate: string;
  installments: LoanInstallment[];
  status: 'ACTIVE' | 'COMPLETED';
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingReceivables: number;
  cashBalance: number;
}

export type Page = 'dashboard' | 'sales' | 'expenses' | 'customers' | 'suppliers' | 'products' | 'cash-bank' | 'checks' | 'loans' | 'reports' | 'settings';
