/**
 * ====================================
 * 🎰 CAÇA-NÍQUEL DA FORTUNA - SERVICE WORKER
 * ====================================
 * 
 * Arquivo: sw.js
 * Versão: 2.0.0
 * Descrição: Service Worker para funcionalidade offline e PWA
 * 
 * Funcionalidades:
 * - Cache de recursos estáticos
 * - Estratégia de cache offline-first
 * - Atualizações automáticas
 * - Background sync
 * - Push notifications (futuro)
 * 
 * ====================================
 */

'use strict';

// ====== CONFIGURAÇÃO DO CACHE ======
const CACHE_NAME = 'slot-fortune-v2.0.0';
const CACHE_VERSION = '2.0.0';
const DATA_CACHE_NAME = 'slot-fortune-data-v2.0.0';

// URLs para cache estático
const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './game.js',
  './navigation.js',
  './settings.js',
  './manifest.json',
  
  // Fontes externas
  'https://fonts.googleapis.com/css2?display=swap&family=Noto+Sans:wght@400;500;700;900&family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Orbitron:wght@400;700;900',
  'https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2',
  'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU79TR_G.woff2',
  
  // Scripts externos
  'https://cdn.tailwindcss.com',
  
  // Ícones e imagens (se houver)
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// URLs que devem sempre buscar da rede
const NETWORK_FIRST_URLS = [
  '/api/',
  'https://api.',
  'chrome-extension://'
];

// ====== EVENTOS DO SERVICE WORKER ======

/**
 * Evento de instalação
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Pre-cache recursos críticos
        const criticalResources = [
          './',
          './index.html',
          './styles.css',
          './game.js',
          './navigation.js',
          './settings.js'
        ];
        
        await cache.addAll(criticalResources);
        console.log('✅ Critical resources cached');
        
        // Cache outros recursos em background
        setTimeout(async () => {
          try {
            await cache.addAll(STATIC_CACHE_URLS.filter(url => !criticalResources.includes(url)));
            console.log('✅ Additional resources cached');
          } catch (error) {
            console.warn('⚠️ Some additional resources failed to cache:', error);
          }
        }, 1000);
        
        // Força ativação imediata
        self.skipWaiting();
        
      } catch (error) {
        console.error('❌ Service Worker installation failed:', error);
      }
    })()
  );
});

/**
 * Evento de ativação
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Limpar caches antigos
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('slot-fortune-') && 
          name !== CACHE_NAME && 
          name !== DATA_CACHE_NAME
        );
        
        await Promise.all(
          oldCaches.map(name => caches.delete(name))
        );
        
        if (oldCaches.length > 0) {
          console.log('🗑️ Old caches cleaned:', oldCaches);
        }
        
        // Tomar controle imediato
        await self.clients.claim();
        
        console.log('✅ Service Worker activated');
        
        // Notificar clientes sobre atualização
        notifyClients('SW_UPDATED', { version: CACHE_VERSION });
        
      } catch (error) {
        console.error('❌ Service Worker activation failed:', error);
      }
    })()
  );
});

/**
 * Evento de fetch - intercepta requisições
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar chrome-extension e outros protocolos especiais
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Estratégia baseada no tipo de recurso
  if (shouldUseNetworkFirst(request.url)) {
    event.respondWith(networkFirst(request));
  } else if (isDataRequest(request.url)) {
    event.respondWith(networkOnly(request));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

/**
 * Evento de sync - para funcionalidades futuras
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-save') {
    event.waitUntil(handleBackgroundSave());
  }
});

/**
 * Evento de push - para notificações futuras
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nova notificação do Caça-níquel da Fortuna!',
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-72x72.png',
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Abrir Jogo'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || '🎰 Caça-níquel da Fortuna',
        options
      )
    );
  }
});

/**
 * Evento de click na notificação
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ====== ESTRATÉGIAS DE CACHE ======

/**
 * Cache first - para recursos estáticos
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Atualizar cache em background se o recurso estiver desatualizado
      updateCacheInBackground(request);
      return cachedResponse;
    }
    
    // Se não está no cache, busca da rede
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('⚠️ Cache first failed:', error);
    
    // Fallback para página offline se disponível
    if (request.destination === 'document') {
      const offlinePage = await caches.match('./index.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // Retornar resposta de erro
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network first - para recursos dinâmicos
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('⚠️ Network request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Network only - para recursos que não devem ser cached
 */
async function networkOnly(request) {
  return fetch(request);
}

// ====== FUNÇÕES AUXILIARES ======

/**
 * Verifica se deve usar network first
 */
function shouldUseNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some(pattern => url.includes(pattern));
}

/**
 * Verifica se é requisição de dados
 */
function isDataRequest(url) {
  return url.includes('/api/') || 
         url.includes('?data=') || 
         url.includes('.json') ||
         url.includes('localStorage') ||
         url.includes('sessionStorage');
}

/**
 * Atualiza cache em background
 */
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse);
      console.log('🔄 Cache updated in background:', request.url);
    }
  } catch (error) {
    console.warn('⚠️ Background cache update failed:', error);
  }
}

/**
 * Handle background save
 */
async function handleBackgroundSave() {
  try {
    // Implementar lógica de save em background se necessário
    console.log('💾 Background save completed');
  } catch (error) {
    console.error('❌ Background save failed:', error);
  }
}

/**
 * Notifica clientes
 */
function notifyClients(type, data) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type,
        data,
        timestamp: Date.now()
      });
    });
  });
}

/**
 * Limpa caches expirados
 */
async function cleanExpiredCaches() {
  try {
    const cacheNames = await caches.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    for (const cacheName of cacheNames) {
      if (cacheName.startsWith('slot-fortune-data-')) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          const dateHeader = response.headers.get('date');
          
          if (dateHeader) {
            const cacheDate = new Date(dateHeader).getTime();
            if (now - cacheDate > maxAge) {
              await cache.delete(request);
              console.log('🗑️ Expired cache entry removed:', request.url);
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Cache cleanup failed:', error);
  }
}

// ====== UTILITÁRIOS DE DIAGNÓSTICO ======

/**
 * Obtém informações do cache
 */
async function getCacheInfo() {
  try {
    const cacheNames = await caches.keys();
    const info = {};
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      info[name] = {
        count: keys.length,
        urls: keys.map(req => req.url)
      };
    }
    
    return info;
  } catch (error) {
    console.error('❌ Error getting cache info:', error);
    return {};
  }
}

/**
 * Força atualização do cache
 */
async function forceUpdateCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    for (const url of STATIC_CACHE_URLS) {
      try {
        const response = await fetch(url, { cache: 'reload' });
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to update cache for ${url}:`, error);
      }
    }
    
    console.log('🔄 Cache force updated');
    notifyClients('CACHE_UPDATED', { timestamp: Date.now() });
    
  } catch (error) {
    console.error('❌ Force cache update failed:', error);
  }
}

// ====== MENSAGENS DOS CLIENTES ======

/**
 * Handle mensagens dos clientes
 */
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage({ type: 'CACHE_INFO', data: info });
      });
      break;
      
    case 'FORCE_UPDATE_CACHE':
      forceUpdateCache();
      break;
      
    case 'CLEAN_EXPIRED_CACHES':
      cleanExpiredCaches();
      break;
      
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    default:
      console.log('📨 Unknown message type:', type);
  }
});

// ====== LIMPEZA PERIÓDICA ======

// Executar limpeza a cada 24 horas
setInterval(() => {
  cleanExpiredCaches();
}, 24 * 60 * 60 * 1000);

// ====== LOGS INICIAIS ======
console.log('🎰 Slot Fortune Service Worker loaded');
console.log(`📦 Cache version: ${CACHE_VERSION}`);
console.log(`🗂️ Cache name: ${CACHE_NAME}`);