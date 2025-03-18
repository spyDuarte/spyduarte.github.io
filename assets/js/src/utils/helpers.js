/**
 * Utility Helpers
 * Funções utilitárias para uso em todo o site
 */

/**
 * Formata um valor para exibição como preço em BRL
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export function formatPrice(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Formata uma data para exibição no formato brasileiro
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} - Data formatada
 */
export function formatDate(date) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formata uma data para exibição por extenso
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} - Data formatada por extenso
 */
export function formatLongDate(date) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Trunca um texto a um número máximo de caracteres
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} - Texto truncado
 */
export function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
}

/**
 * Gera um ID aleatório
 * @param {number} length - Comprimento do ID
 * @returns {string} - ID gerado
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return id;
}

/**
 * Obtém o valor de um parâmetro da URL
 * @param {string} param - Nome do parâmetro
 * @returns {string|null} - Valor do parâmetro ou null se não existir
 */
export function getUrlParam(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(param);
}

/**
 * Obtém as dimensões da viewport
 * @returns {Object} - Largura e altura da viewport
 */
export function getViewportSize() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
}

/**
 * Verifica se um elemento está visível na viewport
 * @param {HTMLElement} element - Elemento a ser verificado
 * @param {number} threshold - Percentual de visibilidade necessário (0-1)
 * @returns {boolean} - Se o elemento está visível
 */
export function isElementInViewport(element, threshold = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Verifica se pelo menos um threshold do elemento está na viewport
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const elementHeight = rect.bottom - rect.top;
    const visibleRatio = visibleHeight / elementHeight;
    
    return visibleRatio > threshold;
}

/**
 * Adiciona um listener para evento com debounce
 * @param {HTMLElement|Window} element - Elemento para adicionar o listener
 * @param {string} event - Nome do evento
 * @param {Function} callback - Função de callback
 * @param {number} delay - Tempo de espera em ms
 * @returns {Function} - Função para remover o listener
 */
export function addDebouncedEventListener(element, event, callback, delay = 200) {
    if (!element) return () => {};
    
    let timeout;
    const debouncedCallback = (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback(...args);
        }, delay);
    };
    
    element.addEventListener(event, debouncedCallback);
    
    return () => {
        element.removeEventListener(event, debouncedCallback);
    };
}

/**
 * Rola suavemente até um elemento
 * @param {HTMLElement|string} element - Elemento ou seletor para rolar até
 * @param {number} offset - Offset a partir do topo
 */
export function scrollToElement(element, offset = 0) {
    const targetElement = typeof element === 'string' 
        ? document.querySelector(element) 
        : element;
    
    if (!targetElement) return;
    
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Obtém o index de um elemento em uma NodeList
 * @param {HTMLElement} element - Elemento para buscar
 * @param {NodeList} nodeList - NodeList para buscar
 * @returns {number} - Index do elemento ou -1 se não encontrado
 */
export function getElementIndex(element, nodeList) {
    for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i] === element) return i;
    }
    return -1;
}

/**
 * Adiciona ou remove uma classe com base em uma condição
 * @param {HTMLElement} element - Elemento para modificar
 * @param {string} className - Nome da classe
 * @param {boolean} condition - Condição para adicionar/remover
 */
export function toggleClass(element, className, condition) {
    if (!element) return;
    
    if (condition) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

/**
 * Gera um slug a partir de uma string
 * @param {string} text - Texto para converter em slug
 * @returns {string} - Slug gerado
 */
export function slugify(text) {
    return text
        .toString()
        .normalize('NFD') // Normaliza acentos
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Substitui espaços por hifens
        .replace(/[^\w-]+/g, '') // Remove caracteres não-alfanuméricos
        .replace(/--+/g, '-'); // Substitui múltiplos hifens por um único
}

/**
 * Salva um objeto no localStorage
 * @param {string} key - Chave para armazenar
 * @param {Object} data - Dados a serem armazenados
 */
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

/**
 * Obtém um objeto do localStorage
 * @param {string} key - Chave para recuperar
 * @param {*} defaultValue - Valor padrão se a chave não existir
 * @returns {*} - Dados recuperados ou valor padrão
 */
export function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Erro ao ler do localStorage:', error);
        return defaultValue;
    }
}

/**
 * Adiciona texto com ícone
 * @param {HTMLElement} element - Elemento onde adicionar
 * @param {string} iconPath - Caminho do ícone SVG
 * @param {string} text - Texto a ser exibido
 */
export function addTextWithIcon(element, iconPath, text) {
    if (!element) return;
    
    element.innerHTML = `
        <img src="${iconPath}" alt="" width="16" height="16" class="icon">
        <span>${text}</span>
    `;
}

/**
 * Gera uma string de texto aleatório (placeholder)
 * @param {number} wordCount - Número de palavras
 * @returns {string} - Texto aleatório
 */
export function generateLoremIpsum(wordCount = 30) {
    const words = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
        'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'
    ];
    
    let result = '';
    
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        result += words[randomIndex] + ' ';
    }
    
    return result.trim();
}

/**
 * Verifica se é um dispositivo móvel
 * @returns {boolean} - Se é um dispositivo móvel
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Adiciona um efeito de clique ripple a um elemento
 * @param {HTMLElement} element - Elemento para adicionar o efeito
 */
export function addRippleEffect(element) {
    if (!element) return;
    
    element.addEventListener('click', function(e) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

/**
 * Verifica a força de uma senha
 * @param {string} password - Senha para verificar
 * @returns {Object} - Informações sobre a força da senha
 */
export function checkPasswordStrength(password) {
    if (!password) return { score: 0, message: 'Senha não fornecida' };
    
    let score = 0;
    const tests = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password)
    ];
    
    tests.forEach(test => {
        if (test) score++;
    });
    
    const messages = [
        'Muito fraca',
        'Fraca',
        'Razoável',
        'Boa',
        'Forte',
        'Excelente'
    ];
    
    return {
        score,
        message: messages[score]
    };
}

/**
 * Obtém cookies por nome
 * @param {string} name - Nome do cookie
 * @returns {string|null} - Valor do cookie ou null se não existir
 */
export function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    
    return null;
}

/**
 * Define um cookie
 * @param {string} name - Nome do cookie
 * @param {string} value - Valor do cookie
 * @param {number} days - Dias até expirar
 */
export function setCookie(name, value, days) {
    let expires = '';
    
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    
    document.cookie = name + '=' + value + expires + '; path=/; SameSite=Strict';
}

/**
 * Remove um cookie
 * @param {string} name - Nome do cookie
 */
export function deleteCookie(name) {
    setCookie(name, '', -1);
}