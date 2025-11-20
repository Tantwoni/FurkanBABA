
import { Contact, Invoice, Product, Status, TransactionType, CashTransaction, Account, Check, CheckStatus, Loan } from "../types";

export const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Merkez Kasa (TL)', type: 'CASH', currency: 'TRY', balance: 5200 },
  { id: 'acc2', name: 'Garanti Bankası', type: 'BANK', currency: 'TRY', balance: 45000 },
  { id: 'acc3', name: 'Yapı Kredi POS', type: 'POS', currency: 'TRY', balance: 12500 },
  { id: 'acc4', name: 'İş Bankası', type: 'BANK', currency: 'TRY', balance: 2500 },
];

export const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Teknoloji A.Ş.', email: 'info@tekno.com', phone: '05551112233', type: 'Customer', balance: 15000 },
  { id: '2', name: 'Ofis Mobilyaları Ltd.', email: 'satis@ofis.com', phone: '05324445566', type: 'Supplier', balance: -5000 },
  { id: '3', name: 'Yazılım Çözümleri', email: 'contact@soft.com', phone: '02123334455', type: 'Customer', balance: 0 },
  { id: '4', name: 'Cloud Hosting Provider', email: 'support@cloud.com', phone: '08501234567', type: 'Supplier', balance: -1200 },
  { id: '5', name: 'Mehmet Demir (Şahıs)', email: 'mehmet@gmail.com', phone: '05001234567', type: 'Customer', balance: 2500 },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Yazılım Danışmanlığı (Saatlik)', vatRate: 20, type: 'Service' },
  { id: 'p2', name: 'Web Sitesi Tasarımı', vatRate: 20, type: 'Service' },
  { id: 'p3', name: 'Ergonomik Ofis Sandalyesi', vatRate: 10, type: 'Product', stock: 15, lastBuyPrice: 2500 },
  { id: 'p4', name: 'Kablosuz Klavye Seti', vatRate: 20, type: 'Product', stock: 42, lastBuyPrice: 850 },
];

export const MOCK_INVOICES: Invoice[] = [
  { 
    id: 'FTR-2023001', 
    contactId: '1', 
    contactName: 'Teknoloji A.Ş.', 
    date: '2023-10-01', 
    dueDate: '2023-10-15', 
    amount: 15000, 
    description: 'Yazılım Danışmanlık Hizmeti - Ekim', 
    status: Status.PAID, 
    type: TransactionType.INCOME,
    items: [
      { productId: 'p1', productName: 'Yazılım Danışmanlığı', quantity: 10, unitPrice: 1500, total: 15000 }
    ]
  },
  { 
    id: 'FTR-2023002', 
    contactId: '2', 
    contactName: 'Ofis Mobilyaları Ltd.', 
    date: '2023-10-05', 
    dueDate: '2023-10-20', 
    amount: 5000, 
    description: 'Yeni Ofis Sandalyeleri', 
    status: Status.PENDING, 
    type: TransactionType.EXPENSE,
    items: []
  },
  { 
    id: 'FTR-2023003', 
    contactId: '1', 
    contactName: 'Teknoloji A.Ş.', 
    date: '2023-11-01', 
    dueDate: '2023-11-15', 
    amount: 15000, 
    description: 'Yazılım Danışmanlık Hizmeti - Kasım', 
    status: Status.PENDING, 
    type: TransactionType.INCOME,
    items: []
  },
  { 
    id: 'FTR-2023004', 
    contactId: '4', 
    contactName: 'Cloud Hosting Provider', 
    date: '2023-11-03', 
    dueDate: '2023-11-10', 
    amount: 1200, 
    description: 'Sunucu Barındırma Ücreti', 
    status: Status.OVERDUE, 
    type: TransactionType.EXPENSE,
    items: []
  },
];

export const MOCK_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'CSH-001',
    date: '2023-10-02',
    contactId: '1',
    contactName: 'Teknoloji A.Ş.',
    accountId: 'acc2',
    accountName: 'Garanti Bankası',
    description: 'Ekim Ayı Hizmet Bedeli Tahsilatı',
    amount: 15000,
    type: TransactionType.INCOME,
    paymentMethod: 'BANK_TRANSFER'
  },
  {
    id: 'CSH-002',
    date: '2023-10-10',
    accountId: 'acc1',
    accountName: 'Merkez Kasa (TL)',
    description: 'Ofis Kırtasiye Gideri',
    amount: 350,
    type: TransactionType.EXPENSE,
    paymentMethod: 'CASH'
  }
];

export const MOCK_CHECKS: Check[] = [
  {
    id: 'CHK-001',
    contactId: '1',
    contactName: 'Teknoloji A.Ş.',
    date: '2023-11-01',
    dueDate: '2024-01-15',
    amount: 25000,
    checkNumber: 'TR-882341',
    bankName: 'Akbank',
    description: 'Proje Avansı',
    type: 'RECEIVED',
    status: CheckStatus.PORTFOLIO
  },
  {
    id: 'CHK-002',
    contactId: '2',
    contactName: 'Ofis Mobilyaları Ltd.',
    date: '2023-11-05',
    dueDate: '2023-12-20',
    amount: 8000,
    checkNumber: 'TR-991234',
    bankName: 'Garanti Bankası',
    description: 'Mobilya Ödemesi',
    type: 'GIVEN',
    status: CheckStatus.ISSUED
  }
];

export const MOCK_LOANS: Loan[] = [
  {
    id: 'LN-001',
    bankName: 'Garanti Bankası',
    loanName: 'İşletme Genişletme Kredisi',
    totalAmount: 120000,
    remainingAmount: 110000,
    startDate: '2023-09-15',
    status: 'ACTIVE',
    installments: [
      { id: 'INS-1', number: 1, dueDate: '2023-10-15', amount: 10000, status: 'PAID', paidDate: '2023-10-15' },
      { id: 'INS-2', number: 2, dueDate: '2023-11-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-3', number: 3, dueDate: '2023-12-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-4', number: 4, dueDate: '2024-01-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-5', number: 5, dueDate: '2024-02-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-6', number: 6, dueDate: '2024-03-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-7', number: 7, dueDate: '2024-04-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-8', number: 8, dueDate: '2024-05-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-9', number: 9, dueDate: '2024-06-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-10', number: 10, dueDate: '2024-07-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-11', number: 11, dueDate: '2024-08-15', amount: 10000, status: 'PENDING' },
      { id: 'INS-12', number: 12, dueDate: '2024-09-15', amount: 10000, status: 'PENDING' },
    ]
  }
];
