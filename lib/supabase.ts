import { createClient } from '@supabase/supabase-js';

// ----------------------------------------------------------------------------
// LÜTFEN SUPABASE PROJE BİLGİLERİNİZİ .env DOSYASINA VEYA BURAYA GİRİNİZ
// ----------------------------------------------------------------------------

const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  try {
    // @ts-ignore
    return import.meta.env?.[key];
  } catch (e) {
    return undefined;
  }
};

// Geçerli URL kontrolü
const isValidUrl = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};

let supabaseUrl = getEnv('VITE_SUPABASE_URL');
let supabaseKey = getEnv('VITE_SUPABASE_KEY');

let isDemo = false;

// Eğer URL yoksa veya geçersizse, uygulamanın çökmesini önlemek için dummy URL kullan.
// Bu sayede uygulama açılır, ancak veri işlemleri hata verir (beyaz ekran yerine uyarı alırsınız).
if (!supabaseUrl || !isValidUrl(supabaseUrl)) {
  console.warn('UYARI: Supabase URL bulunamadı veya geçersiz. Uygulamanın çökmemesi için geçici placeholder kullanılıyor. Lütfen .env dosyanızı veya Vercel ayarlarınızı kontrol edin.');
  supabaseUrl = 'https://placeholder.supabase.co';
  isDemo = true;
}

if (!supabaseKey) {
  supabaseKey = 'placeholder-key';
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export const isDemoMode = isDemo;