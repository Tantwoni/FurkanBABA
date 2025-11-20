
import { supabase } from '../lib/supabase';
import { Invoice, Contact, Product, Account, CashTransaction, Check, Loan, User } from '../types';

/*
  SUPABASE TABLO YAPISI ÖNERİSİ:
  
  1. contacts (id, user_id, name, email, phone, type, balance)
  2. products (id, user_id, name, vatRate, type, stock, lastBuyPrice)
  3. accounts (id, user_id, name, type, currency, balance)
  4. invoices (id, user_id, contactId, contactName, date, dueDate, amount, description, status, type, items (JSONB))
  5. transactions (id, user_id, date, contactId, contactName, accountId, accountName, description, amount, type, paymentMethod)
  6. checks (id, user_id, contactId, contactName, date, dueDate, amount, checkNumber, bankName, description, type, status)
  7. loans (id, user_id, bankName, loanName, totalAmount, remainingAmount, startDate, status, installments (JSONB))
*/

export const SupabaseService = {
  
  // --- AUTH ---

  async login(email: string) {
    // Magic Link ile giriş (Şifresiz) veya Şifreli giriş için Auth componenti kullanılmalı.
    // Bu servis sadece yardımcı metodlar içerir.
    return supabase.auth.signInWithOtp({ email });
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    
    // User metadata'dan isim/şirket bilgisini al
    const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        fullName: session.user.user_metadata?.full_name || 'Kullanıcı',
        companyName: session.user.user_metadata?.company_name || 'Şirketim'
    };
    return user;
  },

  // --- DATA FETCHING ---

  async fetchAllData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı.');

    // Tüm verileri paralel çek
    const [
      { data: contacts },
      { data: products },
      { data: accounts },
      { data: invoices },
      { data: transactions },
      { data: checks },
      { data: loans }
    ] = await Promise.all([
      supabase.from('contacts').select('*').eq('user_id', user.id),
      supabase.from('products').select('*').eq('user_id', user.id),
      supabase.from('accounts').select('*').eq('user_id', user.id),
      supabase.from('invoices').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('checks').select('*').eq('user_id', user.id),
      supabase.from('loans').select('*').eq('user_id', user.id)
    ]);

    return {
      contacts: contacts || [],
      products: products || [],
      accounts: accounts || [],
      invoices: invoices || [],
      transactions: transactions || [],
      checks: checks || [],
      loans: loans || []
    };
  },

  // --- CRUD OPERATIONS ---

  // CONTACTS
  async addContact(contact: Contact, userId: string) {
    const { error } = await supabase.from('contacts').insert([{ ...contact, user_id: userId }]);
    if (error) throw error;
  },
  async updateContact(contact: Contact) {
    // user_id güvenlik için RLS (Row Level Security) ile Supabase tarafında kontrol edilmeli
    const { id, ...updates } = contact;
    const { error } = await supabase.from('contacts').update(updates).eq('id', id);
    if (error) throw error;
  },
  async deleteContact(id: string) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
  },

  // PRODUCTS
  async addProduct(product: Product, userId: string) {
    const { error } = await supabase.from('products').insert([{ ...product, user_id: userId }]);
    if (error) throw error;
  },
  async updateProduct(product: Product) {
    const { id, ...updates } = product;
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
  },
  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // ACCOUNTS
  async addAccount(account: Account, userId: string) {
    const { error } = await supabase.from('accounts').insert([{ ...account, user_id: userId }]);
    if (error) throw error;
  },
  async updateAccount(account: Account) {
    const { id, ...updates } = account;
    const { error } = await supabase.from('accounts').update(updates).eq('id', id);
    if (error) throw error;
  },
  async deleteAccount(id: string) {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  },

  // INVOICES
  async addInvoice(invoice: Invoice, userId: string) {
    // items array'i JSONB olarak saklanır
    const { error } = await supabase.from('invoices').insert([{ ...invoice, user_id: userId }]);
    if (error) throw error;
  },
  async updateInvoiceStatus(id: string, status: string) {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (error) throw error;
  },
  async deleteInvoice(id: string) {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
  },

  // TRANSACTIONS
  async addTransaction(trx: CashTransaction, userId: string) {
    const { error } = await supabase.from('transactions').insert([{ ...trx, user_id: userId }]);
    if (error) throw error;
  },
  async deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  // CHECKS (Yeni Eklendi)
  async addCheck(check: Check, userId: string) {
      const { error } = await supabase.from('checks').insert([{ ...check, user_id: userId }]);
      if (error) throw error;
  },
  async updateCheckStatus(id: string, status: string) {
      const { error } = await supabase.from('checks').update({ status }).eq('id', id);
      if (error) throw error;
  },
  async deleteCheck(id: string) {
      const { error } = await supabase.from('checks').delete().eq('id', id);
      if (error) throw error;
  },

  // LOANS (Yeni Eklendi)
  async addLoan(loan: Loan, userId: string) {
      // installments JSONB olarak saklanır
      const { error } = await supabase.from('loans').insert([{ ...loan, user_id: userId }]);
      if (error) throw error;
  },
  async updateLoan(loan: Loan) {
      const { id, ...updates } = loan;
      const { error } = await supabase.from('loans').update(updates).eq('id', id);
      if (error) throw error;
  },
  async deleteLoan(id: string) {
      const { error } = await supabase.from('loans').delete().eq('id', id);
      if (error) throw error;
  }
};
