// main.js - Ponto de entrada principal usando ES Modules

// Importação de módulos
import { initNavigation } from './modules/navigation.js';
import { initParallax } from './modules/parallax.js';
import { initRevealAnimations } from './modules/animations.js';
import { initProductCards } from './modules/products.js';
import { initGallery } from './modules/gallery.js';
import { initForms } from './modules/forms.js';
import { initThemeToggle } from './modules/theme.js';
import { loadDynamicSections } from './modules/dynamic-sections.js';
import { setupAccessibility } from './modules/accessibility.js';
import { trackPageMetrics } from './modules/analytics.js';
import { setupServiceWorker } from './modules/service-worker.js';

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Configuração inicial
    const config = {
        animationSpeed: 'normal', // 'slow', 'normal', 'fast'
        enableParallax: true,
        loadDynamicContent: true,
        debug: false
    };
    
    // Console de depuração personalizado
    const logger = {
        log: (...args) => {
            if (config.debug) console.log('%cLD Studio', 'color: #1c5d7d; font-weight: bold;', ...args);
        },
        error: (...args) => console.error('%cLD Studio', 'color: #e74c3c; font-weight: bold;', ...args),
        warn: (...args) => console.warn('%cLD Studio', 'color: #e09f3e; font-weight: bold;', ...args),
        info: (...args) => {
            if (config.debug) console.info('%cLD Studio', 'color: #4ecae9; font-weight: bold;', ...args);
        }
    };

    // Inicialização dos módulos
    try {
        logger.info('Inicializando aplicação...');
        
        // Verifica suporte a recursos modernos
        const features = {
            intersectionObserver: 'IntersectionObserver' in window,
            webp: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
            webgl: (() => {
                try {
                    return !!window.WebGLRenderingContext && 
                           !!document.createElement('canvas').getContext('experimental-webgl');
                } catch(e) {
                    return false;
                }
            })(),
            touchEvents: 'ontouchstart' in window
        };
        
        logger.info('Detecção de recursos:', features);
        
        // Adiciona classes ao HTML para facilitar o CSS condicional
        const html = document.documentElement;
        Object.entries(features).forEach(([feature, supported]) => {
            html.classList.toggle(`has-${feature}`, supported);
        });
        
        // Inicializa componentes
        initNavigation();
        
        if (features.intersectionObserver) {
            initRevealAnimations();
        } else {
            // Fallback para navegadores sem suporte a IntersectionObserver
            document.querySelectorAll('.fade-in, .reveal-section').forEach(el => {
                el.classList.add('visible');
            });
        }
        
        if (config.enableParallax && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            initParallax();
        }
        
        initProductCards();
        initForms();
        initThemeToggle();
        setupAccessibility();
        
        // Carrega conteúdo dinâmico
        if (config.loadDynamicContent) {
            loadDynamicSections()
                .then(() => {
                    // Inicializa componentes em conteúdo carregado dinamicamente
                    initGallery();
                })
                .catch(error => {
                    logger.error('Erro ao carregar seções dinâmicas:', error);
                });
        }
        
        // Inicializa o service worker para recursos offline
        setupServiceWorker();
        
        // Analytics e métricas de performance
        trackPageMetrics();
        
        // Esconde o loader quando tudo estiver pronto
        hideLoader();
        
        logger.info('Aplicação inicializada com sucesso!');
    } catch (error) {
        logger.error('Erro na inicialização:', error);
        // Fallback de segurança para esconder o loader mesmo em caso de erro
        hideLoader();
    }
});

// Função para esconder o loader
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            // Remove o loader do DOM após a animação terminar
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 500);
        }, 500);
    }
}

// Gerenciamento avançado de carregamento de recursos
window.addEventListener('load', function() {
    // Carrega recursos não críticos após a página inicial carregar
    setTimeout(() => {
        // Pré-carrega páginas prováveis de navegação
        const pagesToPreload = ['catalogo.html', 'processo.html', 'faq.html'];
        
        if ('connection' in navigator) {
            // Só pré-carrega em conexões rápidas
            if (navigator.connection.effectiveType === '4g') {
                pagesToPreload.forEach(page => {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = page;
                    document.head.appendChild(link);
                });
            }
        } else {
            // Fallback para navegadores sem API de Network Information
            pagesToPreload.forEach(page => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = page;
                document.head.appendChild(link);
            });
        }
        
        // Carrega scripts não críticos
        loadNonCriticalScripts();
    }, 3000); // Delay para garantir que a página principal já carregou
});

// Carrega scripts não críticos para funcionalidades avançadas
function loadNonCriticalScripts() {
    // Chat de atendimento
    const chatScript = document.createElement('script');
    chatScript.src = '/assets/js/vendor/chat.min.js';
    chatScript.async = true;
    document.body.appendChild(chatScript);
    
    // Implementação de Analytics avançados
    if (localStorage.getItem('cookiesAccepted') === 'true') {
        const analyticsScript = document.createElement('script');
        analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX';
        analyticsScript.async = true;
        document.body.appendChild(analyticsScript);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXX', { 'anonymize_ip': true });
    }
}

// Exportação para uso em outros módulos
export { hideLoader };