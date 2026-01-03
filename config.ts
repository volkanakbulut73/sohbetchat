
/**
 * workigomchat.online - Konfigürasyon
 */
export const CHAT_MODULE_CONFIG = {
  VERSION: '1.3.1',
  DOMAIN: 'localhost',
  BASE_URL: 'http://localhost:3000',
  
  // POCKETBASE (Sadece Chat/Mesajlaşma için)
  POCKETBASE_URL: 'http://127.0.0.1:8090',
  
  // SUPABASE (Kullanıcı Kayıt, Login ve Onay işlemleri için)
  // Lütfen kendi proje bilgilerinizi buraya girin.
  SUPABASE_URL: 'https://abunbqqxtpugsjfvvikj.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidW5icXF4dHB1Z3NqZnZ2aWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTcyNzksImV4cCI6MjA4MTg5MzI3OX0.ld29ijoxlkkCC2uNPnvc4aiTiMEhQvu2bfilH6IOIzo',
  
  // GOOGLE OAUTH
  // Eğer localhost'ta 403 hatası alıyorsanız, Google Cloud Console'dan 
  // http://localhost:3000 ve http://127.0.0.1:3000 adreslerini "Authorized JavaScript origins"e ekleyin.
  GOOGLE_CLIENT_ID: "444278057283-6dukljlihlpau48m625o2foulcnc04b3.apps.googleusercontent.com",

  AUTO_REFRESH_ON_VERSION_MISMATCH: false,
  DEBUG_MODE: true,
  STORAGE_PREFIX: 'workigom_chat_'
};

if (typeof window !== 'undefined' && (window as any).WORKIGOM_CONFIG) {
  Object.assign(CHAT_MODULE_CONFIG, (window as any).WORKIGOM_CONFIG);
}
