
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // .env dosyasındaki değişkenleri yükle
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // process.env.API_KEY kullanımını desteklemek için
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_KEY': JSON.stringify(env.VITE_SUPABASE_KEY || '')
    },
    server: {
      open: true, // Uygulama başladığında otomatik tarayıcıyı açar
      host: true
    }
  }
})
