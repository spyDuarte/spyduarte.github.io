// Service Worker para ResinArt
// Proporciona funcionalidades de PWA e melhora a performance offline

const CACHE_NAME = 'resinart-cache-v1';

// Recursos para cache inicial
const INITIAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/catalogo.html',
  '/processo.html',
  '/assets/css/main.min.css',
  '/assets/js/main.min.js',
  '/assets/images/logo/resinart-logo.svg',
  '/assets/images/logo/resinart-logo-white.svg',
  '/site.webmanifest',
  '/assets/fonts/playfair-display/PlayfairDisplay-Regular.woff2',
  '/assets/fonts/playfair-display/PlayfairDisplay-Bold.woff2',
  '/assets/fonts/montserrat/Montserrat-Regular.woff2',
  '/assets/fonts/montserrat/Montserrat-Medium.woff2',
  '/assets/images/icons/favicon.ico',
  '/offline.html' // Página de fallback para quando estiver offline
];

// Páginas que serão cacheadas durante navegação
const CACHE_ON_VISIT = [
  '/produto.html',
  '/sobre.html',
  '/contato.html',
  '/blog/',
  '/faq.html'
];

// Recursos que serão sempre buscados na rede primeiro (estratégia network-first)
const NETWORK_FIRST_URLS = [
  '/api/'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  // Estratégia de pré-cache - armazena recursos importantes na instalação
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando recursos iniciais');
        return cache.addAll(INITIAL_CACHE_URLS);
      })
      .catch(error => {
        console.error('Falha ao cachear recursos iniciais:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  // Limpa caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Removendo cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  
  // Garante que o Service Worker tome controle imediatamente
  return self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ignora requisições de analytics e outras ferramentas externas
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Estratégia para arquivos de API (network-first)
  if (NETWORK_FIRST_URLS.some(networkUrl => url.pathname.startsWith(networkUrl))) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // Estratégia para páginas de navegação (cache-first, com fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationStrategy(event.request));
    return;
  }
  
  // Estratégia para recursos estáticos (cache-first)
  event.respondWith(cacheFirstStrategy(event.request));
});

// Estratégia Cache First para recursos estáticos
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Retorna do cache se disponível
    return cachedResponse;
  }
  
  try {
    // Tenta buscar da rede
    const networkResponse = await fetch(request);
    
    // Verifica se é uma resposta válida
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      // Cachear páginas adicionais conforme visitadas
      const url = new URL(request.url);
      if (CACHE_ON_VISIT.some(cacheUrl => url.pathname.endsWith(cacheUrl))) {
        console.log('Cacheando página visitada:', url.pathname);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Falha ao buscar da rede:', error);
    
    // Retorna fallback para imagens se necessário
    if (request.destination === 'image') {
      return caches.match('/assets/images/fallback-image.webp');
    }
    
    // Sem fallback para outros recursos
    return new Response('Recurso não disponível offline', {
      status: 503,
      statusText: 'Serviço Indisponível'
    });
  }
}

// Estratégia Network First para APIs e dados dinâmicos
async function networkFirstStrategy(request) {
  try {
    // Tenta buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    // Guarda no cache se for uma resposta válida
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Falha ao buscar da rede, tentando do cache:', error);
    
    // Tenta retornar do cache como fallback
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Sem rede e sem cache disponíveis
    return new Response(JSON.stringify({ 
      error: 'Dados não disponíveis offline' 
    }), {
      status: 503,
      statusText: 'Serviço Indisponível',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estratégia para navegação de páginas
async function navigationStrategy(request) {
  try {
    // Tenta buscar da rede primeiro para ter o conteúdo mais atualizado
    const networkResponse = await fetch(request);
    
    // Armazena no cache para uso offline
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('Falha na navegação, tentando do cache:', error);
    
    // Tenta retornar a página solicitada do cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tiver no cache, retorna a página offline
    return caches.match('/offline.html');
  }
}

// Sincronização em segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    event.waitUntil(syncForms());
  }
});

// Função para sincronizar formulários pendentes quando voltar online
async function syncForms() {
  try {
    // Recupera formulários armazenados localmente
    const pendingRequests = await getPendingRequests();
    
    // Tenta enviar cada formulário armazenado
    for (const request of pendingRequests) {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      // Remove o formulário enviado com sucesso
      await removePendingRequest(request.id);
      
      // Notifica o usuário sobre o envio bem-sucedido
      self.registration.showNotification('ResinArt', {
        body: 'Seu formulário foi enviado com sucesso!',
        icon: '/assets/images/icons/icon-192x192.png'
      });
    }
  } catch (error) {
    console.error('Falha na sincronização de formulários:', error);
  }
}

// Funções auxiliares para o IndexedDB
// Na implementação real, estas funções manipulariam o IndexedDB para armazenar
// e recuperar formulários pendentes
async function getPendingRequests() {
  // Implementação do IndexedDB aqui
  return [];
}

async function removePendingRequest(id) {
  // Implementação do IndexedDB aqui
}