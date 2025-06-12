/*
 * =========================================================================
 * LOJA DOS UNIVERSITÁRIOS - JAVASCRIPT PRINCIPAL
 * =========================================================================
 * Sistema de e-commerce completo voltado para estudantes universitários
 * Autor: Claude AI
 * Versão: 1.0.0
 * =========================================================================
 */

class LojaUniversitarios {
    constructor() {
        this.cart = this.loadCart();
        this.user = this.loadUser();
        this.favorites = this.loadFavorites();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartCount();
        this.setupSearchFunctionality();
        this.setupProductFilters();
        this.setupFormValidation();
        this.setupAnimations();
        this.checkStudentDiscount();
    }

    // =====================================================================
    // GERENCIAMENTO DO CARRINHO
    // =====================================================================

    loadCart() {
        const savedCart = localStorage.getItem('loja_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('loja_cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.cart.push({
                ...product,
                quantity: product.quantity || 1,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.showNotification(`${product.name} adicionado ao carrinho!`, 'success');
        this.animateCartButton();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Item removido do carrinho', 'info');
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getCartCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    animateCartButton() {
        const cartButtons = document.querySelectorAll('[onclick*="cart"]');
        cartButtons.forEach(button => {
            button.classList.add('animate-pulse');
            setTimeout(() => {
                button.classList.remove('animate-pulse');
            }, 1000);
        });
    }

    // =====================================================================
    // GERENCIAMENTO DE USUÁRIO
    // =====================================================================

    loadUser() {
        const savedUser = localStorage.getItem('loja_user');
        return savedUser ? JSON.parse(savedUser) : null;
    }

    saveUser(userData) {
        this.user = userData;
        localStorage.setItem('loja_user', JSON.stringify(userData));
    }

    isLoggedIn() {
        return this.user !== null;
    }

    checkStudentDiscount() {
        if (this.user && this.user.isStudent) {
            this.showStudentBenefits();
        }
    }

    showStudentBenefits() {
        const benefitsElements = document.querySelectorAll('.student-benefits');
        benefitsElements.forEach(element => {
            element.style.display = 'block';
        });
    }

    // =====================================================================
    // GERENCIAMENTO DE FAVORITOS
    // =====================================================================

    loadFavorites() {
        const savedFavorites = localStorage.getItem('loja_favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    }

    saveFavorites() {
        localStorage.setItem('loja_favorites', JSON.stringify(this.favorites));
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showNotification('Removido dos favoritos', 'info');
        } else {
            this.favorites.push(productId);
            this.showNotification('Adicionado aos favoritos!', 'success');
        }
        
        this.saveFavorites();
        this.updateFavoriteButtons();
    }

    isFavorite(productId) {
        return this.favorites.includes(productId);
    }

    updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('[data-favorite]');
        favoriteButtons.forEach(button => {
            const productId = button.getAttribute('data-favorite');
            const isFav = this.isFavorite(productId);
            
            button.classList.toggle('favorited', isFav);
            button.innerHTML = isFav ? '❤️' : '🤍';
        });
    }

    // =====================================================================
    // BUSCA E FILTROS
    // =====================================================================

    setupSearchFunctionality() {
        const searchInputs = document.querySelectorAll('input[type="search"]');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', this.debounce((e) => {
                this.performSearch(e.target.value);
            }, 300));
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                }
            });
        });
    }

    performSearch(query) {
        if (query.length < 2) return;
        
        // Simular busca (em uma aplicação real, seria uma chamada à API)
        const results = this.searchProducts(query);
        this.displaySearchResults(results);
    }

    searchProducts(query) {
        const allProducts = [
            { id: 1, name: 'Cálculo I - Stewart', category: 'livros', price: 89.90 },
            { id: 2, name: 'Física Universitária', category: 'livros', price: 145.90 },
            { id: 3, name: 'Mochila Executiva', category: 'material', price: 149.90 },
            { id: 4, name: 'Notebook Dell', category: 'eletronicos', price: 2499.90 },
            { id: 5, name: 'Caneca Térmica', category: 'decoracao', price: 39.90 }
        ];
        
        return allProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    setupProductFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.applyFilter(filter);
                this.updateActiveFilter(e.target);
            });
        });
    }

    applyFilter(filter) {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            
            if (filter === 'todos' || category === filter) {
                card.style.display = 'block';
                card.classList.add('animate-fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateActiveFilter(activeButton) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.classList.remove('filter-active');
        });
        
        activeButton.classList.add('filter-active');
    }

    // =====================================================================
    // VALIDAÇÃO DE FORMULÁRIOS
    // =====================================================================

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
            
            // Validação em tempo real
            const inputs = form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let message = '';
        
        // Validações básicas
        if (field.required && !value) {
            isValid = false;
            message = 'Este campo é obrigatório';
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'E-mail inválido';
        } else if (type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            message = 'Telefone inválido';
        } else if (field.name === 'cpf' && value && !this.isValidCPF(value)) {
            isValid = false;
            message = 'CPF inválido';
        }
        
        this.displayFieldValidation(field, isValid, message);
        return isValid;
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    isValidPhone(phone) {
        const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return regex.test(phone);
    }

    isValidCPF(cpf) {
        // Simplificado - implementação básica
        cpf = cpf.replace(/[^\d]+/g, '');
        return cpf.length === 11;
    }

    displayFieldValidation(field, isValid, message) {
        // Remove validações anteriores
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        field.classList.remove('border-red-500', 'border-green-500');
        
        if (isValid) {
            field.classList.add('border-green-500');
        } else {
            field.classList.add('border-red-500');
            
            if (message) {
                const errorElement = document.createElement('p');
                errorElement.className = 'field-error text-red-500 text-sm mt-1';
                errorElement.textContent = message;
                field.parentNode.appendChild(errorElement);
            }
        }
    }

    // =====================================================================
    // ANIMAÇÕES E EFEITOS VISUAIS
    // =====================================================================

    setupAnimations() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadingStates();
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.1 });
        
        const animatedElements = document.querySelectorAll('.product-card, .card, .section');
        animatedElements.forEach(el => observer.observe(el));
    }

    setupHoverEffects() {
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    setupLoadingStates() {
        const buttons = document.querySelectorAll('button[type="submit"]');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.showButtonLoading(button);
            });
        });
    }

    showButtonLoading(button) {
        const originalText = button.textContent;
        button.textContent = 'Carregando...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    }

    // =====================================================================
    // NOTIFICAÇÕES
    // =====================================================================

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Estilos inline para garantir funcionamento
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 1rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            min-width: 300px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        // Cores baseadas no tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.backgroundColor = colors[type];
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Configurar fechamento
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Auto-remover
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);
    }

    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // =====================================================================
    // UTILITÁRIOS
    // =====================================================================

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    formatPrice(price) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    }

    // =====================================================================
    // EVENT LISTENERS GLOBAIS
    // =====================================================================

    setupEventListeners() {
        // Smooth scroll para links âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', (e) => {
            const dropdowns = document.querySelectorAll('.dropdown.open');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });
        });
        
        // Atualizar header no scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (header) {
                header.classList.toggle('scrolled', window.scrollY > 50);
            }
        });
    }
}

// =====================================================================
// FUNÇÕES ESPECÍFICAS DA PÁGINA
// =====================================================================

// Funções para a página de produto
function increaseQuantity() {
    const qtyElement = document.getElementById('quantity');
    if (qtyElement) {
        const currentQty = parseInt(qtyElement.textContent);
        qtyElement.textContent = currentQty + 1;
    }
}

function decreaseQuantity() {
    const qtyElement = document.getElementById('quantity');
    if (qtyElement) {
        const currentQty = parseInt(qtyElement.textContent);
        if (currentQty > 1) {
            qtyElement.textContent = currentQty - 1;
        }
    }
}

// Funções para tabs
function showTab(tabName) {
    // Esconder todas as tabs
    const tabs = document.querySelectorAll('[id$="-tab"]');
    tabs.forEach(tab => tab.classList.add('hidden'));
    
    // Remover classe ativa de todos os botões
    const buttons = document.querySelectorAll('[onclick^="showTab"]');
    buttons.forEach(button => {
        button.classList.remove('tab-active');
        button.classList.add('text-gray-500');
    });
    
    // Mostrar tab selecionada
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Adicionar classe ativa ao botão clicado
    if (event && event.target) {
        event.target.classList.add('tab-active');
        event.target.classList.remove('text-gray-500');
    }
}

// Função para adicionar ao carrinho (compatibilidade)
function addToCart(product) {
    if (window.loja) {
        window.loja.addToCart(product);
    } else {
        console.log('Produto adicionado:', product);
        alert(`${product.name || 'Produto'} adicionado ao carrinho!`);
    }
}

// =====================================================================
// INICIALIZAÇÃO
// =====================================================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.loja = new LojaUniversitarios();
    
    // Funcionalidades específicas para CEP
    const cepInputs = document.querySelectorAll('input[placeholder*="CEP"]');
    cepInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.length >= 8) {
                // Simular consulta de CEP
                setTimeout(() => {
                    const enderecoInput = document.querySelector('input[placeholder*="Rua"]');
                    const bairroInput = document.querySelector('input[placeholder*="Bairro"]');
                    const cidadeInput = document.querySelector('input[placeholder*="Cidade"]');
                    
                    if (enderecoInput && !enderecoInput.value) {
                        enderecoInput.value = 'Rua das Flores';
                        bairroInput.value = 'Centro';
                        cidadeInput.value = 'São Paulo';
                        
                        window.loja.showNotification('Endereço preenchido automaticamente!', 'success');
                    }
                }, 500);
            }
        });
    });
    
    // Máscara para telefone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4,5})(\d{4})/, '$1-$2');
            e.target.value = value;
        });
    });
    
    // Máscara para CPF
    const cpfInputs = document.querySelectorAll('input[name="cpf"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    });
});

// Exportar para uso global
window.LojaUniversitarios = LojaUniversitarios;
