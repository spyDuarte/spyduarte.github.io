/**
 * API Utilities
 * Funções para interagir com endpoints da API
 */

/**
 * URL base para APIs
 */
const API_BASE_URL = '/api';

/**
 * Método para requisições GET
 * @param {string} endpoint - Endpoint da API
 * @param {Object} params - Parâmetros de query string (opcional)
 * @returns {Promise<Object>} - Dados da resposta
 */
export async function get(endpoint, params = {}) {
    // Constrói a query string se houver parâmetros
    const queryString = Object.keys(params).length 
        ? '?' + new URLSearchParams(params).toString() 
        : '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}${queryString}`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Método para requisições POST
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a serem enviados
 * @returns {Promise<Object>} - Dados da resposta
 */
export async function post(endpoint, data = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao enviar para ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Método para envio de formulários com FormData (suporta upload de arquivos)
 * @param {string} endpoint - Endpoint da API
 * @param {FormData} formData - Dados do formulário
 * @returns {Promise<Object>} - Dados da resposta
 */
export async function submitForm(endpoint, formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Erro ao enviar formulário para ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Busca produtos do catálogo com opção de filtros
 * @param {Object} filters - Filtros a serem aplicados
 * @returns {Promise<Array>} - Lista de produtos
 */
export async function getProducts(filters = {}) {
    return get('products.json', filters);
}

/**
 * Busca detalhes de um produto específico
 * @param {string} productId - ID do produto
 * @returns {Promise<Object>} - Dados do produto
 */
export async function getProductDetails(productId) {
    const products = await get('products.json');
    return products.find(product => product.id === productId) || null;
}

/**
 * Busca depoimentos de clientes
 * @returns {Promise<Array>} - Lista de depoimentos
 */
export async function getTestimonials() {
    return get('testimonials.json');
}

/**
 * Envia um formulário de contato
 * @param {FormData} formData - Dados do formulário de contato
 * @returns {Promise<Object>} - Resposta do servidor
 */
export async function sendContactForm(formData) {
    return submitForm('contact.php', formData);
}

/**
 * Inscreve um email na newsletter
 * @param {string} email - Email para inscrição
 * @returns {Promise<Object>} - Resposta do servidor
 */
export async function subscribeNewsletter(email) {
    return post('newsletter.php', { email });
}

/**
 * Busca perguntas frequentes (FAQ) com categorias
 * @param {string} category - Categoria opcional para filtrar
 * @returns {Promise<Array>} - Lista de FAQs
 */
export async function getFaqs(category = '') {
    const params = category ? { category } : {};
    return get('faqs.json', params);
}

/**
 * Simula uma API para casos em que o servidor está indisponível
 * útil para desenvolvimento ou demonstrações offline
 */
export const mockApi = {
    /**
     * Dados simulados de produtos
     */
    products: [
        {
            id: 'mesa-rio-azul',
            name: 'Mesa Rio Azul',
            description: 'Mesa de centro com desenho de rio em resina azul turquesa',
            price: 3890,
            type: 'mesa-centro',
            material: 'madeira',
            color: 'azul',
            dimensions: '100 x 60 x 45 cm',
            woodType: 'Imbuia',
            resinType: 'Epóxi',
            images: [
                '/assets/images/products/mesa-rio-azul.webp',
                '/assets/images/products/mesa-rio-azul-detalhe1.webp',
                '/assets/images/products/mesa-rio-azul-detalhe2.webp',
                '/assets/images/products/mesa-rio-azul-ambiente.webp'
            ],
            featured: true,
            new: true
        },
        {
            id: 'mesa-oceano',
            name: 'Mesa Oceano',
            description: 'Mesa de jantar com efeito de ondas oceânicas em resina',
            price: 6750,
            type: 'mesa-jantar',
            material: 'metal',
            color: 'azul',
            dimensions: '180 x 90 x 76 cm',
            woodType: 'Carvalho',
            resinType: 'Epóxi',
            images: [
                '/assets/images/products/mesa-oceano.webp'
            ],
            featured: true,
            new: false
        },
        {
            id: 'mesa-galaxia',
            name: 'Mesa Galáxia',
            description: 'Mesa lateral com efeito de galáxia em resina roxa e azul',
            price: 2450,
            type: 'mesa-lateral',
            material: 'madeira',
            color: 'roxo',
            dimensions: '60 x 60 x 55 cm',
            woodType: 'Cedro',
            resinType: 'Epóxi',
            images: [
                '/assets/images/products/mesa-galaxia.webp'
            ],
            featured: true,
            new: false
        }
    ],
    
    /**
     * Dados simulados de depoimentos
     */
    testimonials: [
        {
            id: 1,
            name: 'Mariana Silva',
            location: 'São Paulo, SP',
            text: 'A mesa ficou simplesmente espetacular! Todos que visitam nossa casa se encantam com ela. É realmente uma obra de arte funcional.',
            image: '/assets/images/testimonials/cliente1.webp'
        },
        {
            id: 2,
            name: 'Rafael Mendes',
            location: 'Rio de Janeiro, RJ',
            text: 'O processo de encomenda foi simples e a ResinArt entregou exatamente o que eu imaginava. A qualidade do acabamento é impecável.',
            image: '/assets/images/testimonials/cliente2.webp'
        },
        {
            id: 3,
            name: 'Paulo Oliveira',
            location: 'Curitiba, PR',
            text: 'Como arquiteto, procuro peças únicas para meus projetos e a ResinArt nunca me decepciona. A capacidade de personalização e o profissionalismo da equipe são excelentes.',
            image: '/assets/images/testimonials/cliente3.webp'
        }
    ],
    
    /**
     * Retorna todos os produtos ou aplica filtros se fornecidos
     */
    getProducts(filters = {}) {
        let filteredProducts = [...this.products];
        
        // Aplica filtros se houver
        if (filters.type) {
            filteredProducts = filteredProducts.filter(p => p.type === filters.type);
        }
        
        if (filters.material) {
            filteredProducts = filteredProducts.filter(p => p.material === filters.material);
        }
        
        if (filters.color) {
            filteredProducts = filteredProducts.filter(p => p.color === filters.color);
        }
        
        if (filters.price) {
            const [min, max] = filters.price.split('-').map(p => parseInt(p));
            filteredProducts = filteredProducts.filter(p => {
                if (max) {
                    return p.price >= min && p.price <= max;
                } else {
                    return p.price >= min;
                }
            });
        }
        
        return Promise.resolve(filteredProducts);
    },
    
    /**
     * Retorna detalhes de um produto pelo ID
     */
    getProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        return Promise.resolve(product || null);
    },
    
    /**
     * Retorna todos os depoimentos
     */
    getTestimonials() {
        return Promise.resolve(this.testimonials);
    },
    
    /**
     * Simula envio de formulário de contato
     */
    sendContactForm(formData) {
        console.log('Formulário de contato enviado:', Object.fromEntries(formData));
        
        // Simula um atraso de rede e retorna sucesso
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
                });
            }, 1000);
        });
    },
    
    /**
     * Simula inscrição na newsletter
     */
    subscribeNewsletter(email) {
        console.log('Inscrição na newsletter:', email);
        
        // Simula um atraso de rede e retorna sucesso
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Email cadastrado com sucesso!'
                });
            }, 500);
        });
    }
};

/**
 * Função para usar a API real ou mock dependendo da disponibilidade
 * @param {Function} apiFunction - Função da API real
 * @param {Function} mockFunction - Função da API mock
 * @param {Array} args - Argumentos para passar para a função
 * @returns {Promise} - Resultado da API
 */
export async function safeApiCall(apiFunction, mockFunction, ...args) {
    try {
        return await apiFunction(...args);
    } catch (error) {
        console.warn('Fallback para mock API devido a erro:', error);
        return mockFunction(...args);
    }
}