// main.js - Funcionalidades principais do site Printify

class PrintifyApp {
    constructor() {
      this.cart = JSON.parse(localStorage.getItem('printify_cart')) || [];
      this.init();
    }
  
    init() {
      this.setupEventListeners();
      this.updateCartCount();
      this.setupSearch();
      this.setupFilters();
      this.setupMobileMenu();
    }
  
    // ===== CARRINHO DE COMPRAS =====
    addToCart(product) {
      const existingItem = this.cart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.cart.push({ ...product, quantity: 1 });
      }
      
      this.saveCart();
      this.updateCartCount();
      this.showCartNotification(product.name);
    }
  
    removeFromCart(productId) {
      this.cart = this.cart.filter(item => item.id !== productId);
      this.saveCart();
      this.updateCartCount();
      this.renderCartPage();
    }
  
    updateQuantity(productId, newQuantity) {
      const item = this.cart.find(item => item.id === productId);
      if (item) {
        item.quantity = Math.max(0, newQuantity);
        if (item.quantity === 0) {
          this.removeFromCart(productId);
        } else {
          this.saveCart();
          this.renderCartPage();
        }
      }
    }
  
    saveCart() {
      localStorage.setItem('printify_cart', JSON.stringify(this.cart));
    }
  
    updateCartCount() {
      const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
      const cartBadges = document.querySelectorAll('.cart-count, [data-cart-count]');
      cartBadges.forEach(badge => {
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'block' : 'none';
      });
    }
  
    showCartNotification(productName) {
      // Cria notificação temporária
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span>${productName} adicionado ao carrinho!</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Anima a entrada
      setTimeout(() => notification.classList.remove('translate-x-full'), 100);
      
      // Remove após 3 segundos
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
    }
  
    // ===== BUSCA =====
    setupSearch() {
      const searchInputs = document.querySelectorAll('input[placeholder*="Search"], input[placeholder*="search"]');
      
      searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
          this.performSearch(e.target.value);
        });
      });
    }
  
    performSearch(query) {
      if (window.location.pathname.includes('products.html')) {
        this.filterProducts(query);
      }
    }
  
    filterProducts(query) {
      const productCards = document.querySelectorAll('.grid > div');
      
      productCards.forEach(card => {
        const title = card.querySelector('p')?.textContent.toLowerCase() || '';
        const shouldShow = title.includes(query.toLowerCase());
        card.style.display = shouldShow ? 'block' : 'none';
      });
    }
  
    // ===== FILTROS =====
    setupFilters() {
      const filterButtons = document.querySelectorAll('button:has(p:contains("Category")), button:has(p:contains("Price")), button:has(p:contains("Color")), button:has(p:contains("Material"))');
      
      filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleFilter(button);
        });
      });
    }
  
    toggleFilter(button) {
      // Implementação básica de toggle visual
      button.classList.toggle('bg-red-50');
      button.classList.toggle('text-red-600');
      button.classList.toggle('border-red-500');
    }
  
    // ===== MENU MOBILE =====
    setupMobileMenu() {
      const menuToggle = document.querySelector('button[aria-label="Menu"]');
      const mobileMenu = document.createElement('div');
      mobileMenu.className = 'lg:hidden fixed inset-0 bg-white z-50 transform translate-x-full transition-transform duration-300';
      mobileMenu.innerHTML = `
        <div class="p-4">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-bold">Menu</h2>
            <button class="close-menu text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <nav class="space-y-4">
            <a href="index.html" class="block py-2 text-lg">Home</a>
            <a href="products.html" class="block py-2 text-lg">Shop</a>
            <a href="cart.html" class="block py-2 text-lg">Cart</a>
            <a href="profile.html" class="block py-2 text-lg">Profile</a>
          </nav>
        </div>
      `;
  
      document.body.appendChild(mobileMenu);
  
      if (menuToggle) {
        menuToggle.addEventListener('click', () => {
          mobileMenu.classList.remove('translate-x-full');
        });
      }
  
      mobileMenu.querySelector('.close-menu').addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
      });
    }
  
    // ===== RENDERIZAÇÃO DO CARRINHO =====
    renderCartPage() {
      if (!window.location.pathname.includes('cart.html')) return;
  
      const cartContainer = document.querySelector('.divide-y');
      if (!cartContainer) return;
  
      cartContainer.innerHTML = '';
  
      if (this.cart.length === 0) {
        cartContainer.innerHTML = `
          <div class="text-center py-12">
            <p class="text-gray-500 text-lg mb-4">Seu carrinho está vazio</p>
            <a href="products.html" class="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              Continuar Comprando
            </a>
          </div>
        `;
        return;
      }
  
      this.cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'flex flex-col sm:flex-row items-start gap-6 p-6 hover:bg-gray-50 transition-colors';
        cartItem.innerHTML = `
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-24 sm:size-28 flex-shrink-0"
               style="background-image: url('${item.image}')"></div>
          <div class="flex-1">
            <p class="text-gray-800 text-lg font-semibold leading-normal mb-1">${item.name}</p>
            <p class="text-gray-600 text-sm font-normal leading-normal">Quantidade: ${item.quantity}</p>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="app.updateQuantity('${item.id}', ${item.quantity - 1})" 
                      class="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100">-</button>
              <span class="w-12 text-center">${item.quantity}</span>
              <button onclick="app.updateQuantity('${item.id}', ${item.quantity + 1})" 
                      class="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100">+</button>
            </div>
            <button onclick="app.removeFromCart('${item.id}')" 
                    class="text-sm font-medium text-red-500 hover:text-red-700 transition-colors mt-3">
              Remover
            </button>
          </div>
          <div class="shrink-0 text-right sm:text-left mt-4 sm:mt-0">
            <p class="text-gray-800 text-lg font-semibold leading-normal">$${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        `;
        cartContainer.appendChild(cartItem);
      });
  
      this.updateCartTotals();
    }
  
    updateCartTotals() {
      const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = subtotal > 100 ? 0 : 5;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;
  
      const subtotalElement = document.querySelector('[data-subtotal]');
      const shippingElement = document.querySelector('[data-shipping]');
      const taxElement = document.querySelector('[data-tax]');
      const totalElement = document.querySelector('[data-total]');
  
      if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
      if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
      if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
      if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }
  
    // ===== EVENT LISTENERS =====
    setupEventListeners() {
      // Botões de "Add to Cart"
      document.addEventListener('click', (e) => {
        if (e.target.matches('button:contains("Add to Cart")') || e.target.closest('button')?.textContent.includes('Add to Cart')) {
          e.preventDefault();
          
          // Dados mock do produto - em produção viria de uma API
          const productData = {
            id: Date.now().toString(),
            name: 'Produto 3D',
            price: 29.99,
            image: 'https://via.placeholder.com/200'
          };
          
          this.addToCart(productData);
        }
      });
  
      // Inicialização específica por página
      if (window.location.pathname.includes('cart.html')) {
        this.renderCartPage();
      }
    }
  }
  
  // Inicializar aplicação quando DOM estiver pronto
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new PrintifyApp();
  });
  
  // Funções utilitárias globais
  window.addToCart = (productData) => {
    window.app.addToCart(productData);
  };
  
  window.removeFromCart = (productId) => {
    window.app.removeFromCart(productId);
  };
  
  // Smooth scroll para navegação
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });