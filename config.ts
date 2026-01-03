
/**
 * workigomchat.online - Konfigürasyon
 */
export const CHAT_MODULE_CONFIG = {
  VERSION: '1.2.0',
  DOMAIN: 'localhost',
  BASE_URL: 'http://localhost:3000',
  
  // PocketBase bağlantı bilgileri
  // Yerel geliştirme ortamı için 127.0.0.1:8090 kullanıyoruz.
  POCKETBASE_URL: 'http://127.0.0.1:8090',
  
  AUTO_REFRESH_ON_VERSION_MISMATCH: false,
  DEBUG_MODE: true,
  STORAGE_PREFIX: 'workigom_chat_pb_'
};

if (typeof window !== 'undefined' && (window as any).WORKIGOM_CONFIG) {
  Object.assign(CHAT_MODULE_CONFIG, (window as any).WORKIGOM_CONFIG);
}
