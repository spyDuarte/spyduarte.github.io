/**
 * MedResources - Main JavaScript File
 * Handles all interactive functionality for the medical resources portal
 */

// ===== GLOBAL VARIABLES =====
let currentSlide = 0;
const totalSlides = 3;
let searchTimeout;
let favorites = JSON.parse(localStorage.getItem('medresources-favorites') || '[]');

// ===== DOM ELEMENTS =====
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
const searchInput = document.getElementById('search-input');
const favoritesBtn = document.getElementById('favorites-btn');
const carouselIndicators = document.querySelectorAll('.carousel-indicator');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeCarousel();
    initializeSearch();
    initializeFavorites();
    initializeAnimations();
    initializeAccessibility();
    
    // Log initialization
    console.log('MedResources initialized successfully');
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Mobile menu toggle
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    
    // Favorites functionality
    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', toggleFavoritesPanel);
    }
    
    // Carousel indicators
    carouselIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => goToSlide(index));
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });
    
    // External link handling
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', handleExternalLink);
    });
    
    // Form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', handleFormSubmission);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleGlobalKeydown);
    
    // Window events
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Focus management
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    if (mobileNav.classList.contains('hidden')) {
        showMobileMenu();
    } else {
        hideMobileMenu();
    }
}

function showMobileMenu() {
    mobileNav.classList.remove('hidden');
    mobileNav.classList.add('animate-fadeInDown');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    
    // Focus first menu item
    const firstMenuItem = mobileNav.querySelector('a');
    if (firstMenuItem) {
        firstMenuItem.focus();
    }
}

function hideMobileMenu() {
    mobileNav.classList.add('hidden');
    mobileNav.classList.remove('animate-fadeInDown');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
}

// ===== CAROUSEL FUNCTIONALITY =====
function initializeCarousel() {
    // Auto-advance carousel
    setInterval(nextSlide, 5000);
    
    // Touch/swipe support for mobile
    let startX, startY, distX, distY;
    const heroSection = document.querySelector('section[class*="relative h-"]');
    
    if (heroSection) {
        heroSection.addEventListener('touchstart', handleTouchStart);
        heroSection.addEventListener('touchmove', handleTouchMove);
        heroSection.addEventListener('touchend', handleTouchEnd);
    }
}

function goToSlide(slideIndex) {
    // Update current slide
    currentSlide = slideIndex;
    
    // Update indicators
    carouselIndicators.forEach((indicator, index) => {
        if (index === slideIndex) {
            indicator.classList.add('active');
            indicator.classList.remove('opacity-50');
        } else {
            indicator.classList.remove('active');
            indicator.classList.add('opacity-50');
        }
    });
    
    // Update slide content (if implementing multiple slides)
    updateSlideContent(slideIndex);
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % totalSlides;
    goToSlide(nextIndex);
}

function updateSlideContent(slideIndex) {
    const heroSection = document.querySelector('section[class*="relative h-"]');
    const heroTitle = heroSection?.querySelector('h2');
    const heroSubtitle = heroSection?.querySelector('p');
    
    const slides = [
        {
            title: 'Recursos Médicos Essenciais',
            subtitle: 'Descubra os melhores recursos para impulsionar seus estudos em medicina e se preparar para uma carreira de sucesso.'
        },
        {
            title: 'Aprenda com os Melhores',
            subtitle: 'Acesse uma curadoria especial de livros, aplicativos e ferramentas utilizadas pelos melhores estudantes e profissionais.'
        },
        {
            title: 'Prepare-se para o Futuro',
            subtitle: 'Desenvolva as habilidades necessárias para se destacar nos exames de residência e na prática clínica.'
        }
    ];
    
    if (heroTitle && heroSubtitle && slides[slideIndex]) {
        heroTitle.textContent = slides[slideIndex].title;
        heroSubtitle.textContent = slides[slideIndex].subtitle;
    }
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    // Initialize search suggestions
    loadSearchSuggestions();
}

function handleSearch(event) {
    clearTimeout(searchTimeout);
    const query = event.target.value.trim();
    
    if (query.length > 2) {
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    } else {
        clearSearchResults();
    }
}

function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const query = event.target.value.trim();
        if (query) {
            redirectToSearchResults(query);
        }
    }
    
    if (event.key === 'Escape') {
        event.target.value = '';
        clearSearchResults();
        event.target.blur();
    }
}

function performSearch(query) {
    // Simulate search API call
    console.log(`Searching for: ${query}`);
    
    // In a real implementation, this would make an API call
    const mockResults = generateMockSearchResults(query);
    displaySearchSuggestions(mockResults);
}

function generateMockSearchResults(query) {
    const allResources = [
        { title: 'Anatomia Humana', type: 'Livro', category: 'books' },
        { title: 'Complete Anatomy 3D', type: 'Aplicativo', category: 'apps' },
        { title: 'Anki Flashcards', type: 'Ferramenta', category: 'study-tools' },
        { title: 'USMLE Prep', type: 'Exame', category: 'exam-prep' },
        { title: 'Gray\'s Anatomy', type: 'Livro', category: 'books' },
        { title: 'Medscape', type: 'Aplicativo', category: 'apps' }
    ];
    
    return allResources.filter(resource => 
        resource.title.toLowerCase().includes(query.toLowerCase()) ||
        resource.type.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
}

function displaySearchSuggestions(results) {
    let suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!suggestionsContainer) {
        suggestionsContainer = createSearchSuggestionsContainer();
    }
    
    suggestionsContainer.innerHTML = '';
    
    if (results.length > 0) {
        results.forEach(result => {
            const suggestion = createSearchSuggestion(result);
            suggestionsContainer.appendChild(suggestion);
        });
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
}

function createSearchSuggestionsContainer() {
    const container = document.createElement('div');
    container.id = 'search-suggestions';
    container.className = 'absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 hidden';
    
    const searchContainer = searchInput.closest('label');
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(container);
    
    return container;
}

function createSearchSuggestion(result) {
    const suggestion = document.createElement('div');
    suggestion.className = 'p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0';
    suggestion.innerHTML = `
        <div class="font-medium text-gray-900">${result.title}</div>
        <div class="text-sm text-gray-500">${result.type}</div>
    `;
    
    suggestion.addEventListener('click', () => {
        searchInput.value = result.title;
        redirectToSearchResults(result.title);
    });
    
    return suggestion;
}

function clearSearchResults() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
    }
}

function redirectToSearchResults(query) {
    // In a real implementation, this would redirect to a search results page
    console.log(`Redirecting to search results for: ${query}`);
    // window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
}

function loadSearchSuggestions() {
    // Load popular search terms or recent searches
    console.log('Loading search suggestions...');
}

// ===== FAVORITES FUNCTIONALITY =====
function initializeFavorites() {
    updateFavoritesCount();
    
    // Add favorite buttons to resource cards
    document.querySelectorAll('.card').forEach(card => {
        addFavoriteButton(card);
    });
}

function toggleFavoritesPanel() {
    let favoritesPanel = document.getElementById('favorites-panel');
    
    if (!favoritesPanel) {
        favoritesPanel = createFavoritesPanel();
    }
    
    if (favoritesPanel.classList.contains('hidden')) {
        showFavoritesPanel(favoritesPanel);
    } else {
        hideFavoritesPanel(favoritesPanel);
    }
}

function createFavoritesPanel() {
    const panel = document.createElement('div');
    panel.id = 'favorites-panel';
    panel.className = 'fixed top-20 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 hidden';
    panel.innerHTML = `
        <div class="p-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Favoritos</h3>
        </div>
        <div class="p-4 max-h-96 overflow-y-auto" id="favorites-content">
            <!-- Favorites will be populated here -->
        </div>
    `;
    
    document.body.appendChild(panel);
    return panel;
}

function showFavoritesPanel(panel) {
    updateFavoritesContent();
    panel.classList.remove('hidden');
    panel.classList.add('animate-fadeInDown');
}

function hideFavoritesPanel(panel) {
    panel.classList.add('hidden');
    panel.classList.remove('animate-fadeInDown');
}

function addFavoriteButton(card) {
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-colors';
    favoriteBtn.innerHTML = `
        <svg class="w-5 h-5 text-gray-400 hover:text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
        </svg>
    `;
    
    // Make card container relative if not already
    card.style.position = 'relative';
    card.appendChild(favoriteBtn);
    
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(card, favoriteBtn);
    });
}

function toggleFavorite(card, button) {
    const cardTitle = card.querySelector('h3')?.textContent || 'Unknown Resource';
    const cardLink = card.querySelector('a')?.href || '#';
    
    const favoriteItem = {
        title: cardTitle,
        link: cardLink,
        timestamp: Date.now()
    };
    
    const existingIndex = favorites.findIndex(fav => fav.link === cardLink);
    
    if (existingIndex > -1) {
        // Remove from favorites
        favorites.splice(existingIndex, 1);
        button.querySelector('svg').classList.remove('text-red-500');
        button.querySelector('svg').classList.add('text-gray-400');
        showNotification('Removido dos favoritos', 'success');
    } else {
        // Add to favorites
        favorites.push(favoriteItem);
        button.querySelector('svg').classList.remove('text-gray-400');
        button.querySelector('svg').classList.add('text-red-500');
        showNotification('Adicionado aos favoritos', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('medresources-favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

function updateFavoritesCount() {
    const count = favorites.length;
    // Update favorites button badge if exists
    let badge = favoritesBtn?.querySelector('.badge');
    
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'badge absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
            favoritesBtn?.appendChild(badge);
        }
        badge.textContent = count > 99 ? '99+' : count;
    } else if (badge) {
        badge.remove();
    }
}

function updateFavoritesContent() {
    const favoritesContent = document.getElementById('favorites-content');
    
    if (!favoritesContent) return;
    
    if (favorites.length === 0) {
        favoritesContent.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
                <p>Nenhum favorito ainda</p>
                <p class="text-sm">Clique no coração para adicionar recursos</p>
            </div>
        `;
    } else {
        favoritesContent.innerHTML = favorites.map(favorite => `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div class="flex-1 min-w-0">
                    <a href="${favorite.link}" class="text-sm font-medium text-gray-900 hover:text-red-600 transition-colors truncate block">
                        ${favorite.title}
                    </a>
                    <p class="text-xs text-gray-500">${new Date(favorite.timestamp).toLocaleDateString()}</p>
                </div>
                <button onclick="removeFavorite('${favorite.link}')" class="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }
}

function removeFavorite(link) {
    favorites = favorites.filter(fav => fav.link !== link);
    localStorage.setItem('medresources-favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    updateFavoritesContent();
    showNotification('Removido dos favoritos', 'success');
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.querySelectorAll('.card, section').forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// ===== ACCESSIBILITY =====
function initializeAccessibility() {
    // Skip link
    addSkipLink();
    
    // ARIA labels
    updateAriaLabels();
    
    // Focus management
    setupFocusManagement();
    
    // Screen reader announcements
    createAnnouncementRegion();
}

function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

function updateAriaLabels() {
    // Add aria-labels to interactive elements
    document.querySelectorAll('button:not([aria-label])').forEach(button => {
        const text = button.textContent.trim() || button.title || 'Button';
        button.setAttribute('aria-label', text);
    });
    
    // Update navigation
    const nav = document.querySelector('nav');
    if (nav) {
        nav.setAttribute('aria-label', 'Navegação principal');
    }
}

function setupFocusManagement() {
    // Focus trap for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const activeModal = document.querySelector('.modal:not(.hidden)');
            if (activeModal) {
                trapFocus(e, activeModal);
            }
        }
    });
}

function createAnnouncementRegion() {
    const announcements = document.createElement('div');
    announcements.id = 'announcements';
    announcements.setAttribute('aria-live', 'polite');
    announcements.setAttribute('aria-atomic', 'true');
    announcements.className = 'sr-only';
    
    document.body.appendChild(announcements);
}

function announce(message) {
    const announcements = document.getElementById('announcements');
    if (announcements) {
        announcements.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            announcements.textContent = '';
        }, 1000);
    }
}

// ===== UTILITY FUNCTIONS =====
function handleSmoothScroll(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update URL without jumping
        history.pushState(null, null, targetId);
        
        // Focus management for accessibility
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
    }
}

function handleExternalLink(e) {
    // Track external link clicks
    const url = this.href;
    console.log(`External link clicked: ${url}`);
    
    // Add analytics tracking here if needed
    // gtag('event', 'click', { event_category: 'external_link', event_label: url });
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        showNotification('Formulário enviado com sucesso!', 'success');
        form.reset();
    }, 1500);
}

function handleGlobalKeydown(e) {
    // Global keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'k':
                e.preventDefault();
                searchInput?.focus();
                break;
            case '/':
                e.preventDefault();
                searchInput?.focus();
                break;
        }
    }
    
    // Escape key handling
    if (e.key === 'Escape') {
        // Close any open panels/modals
        hideMobileMenu();
        const favoritesPanel = document.getElementById('favorites-panel');
        if (favoritesPanel && !favoritesPanel.classList.contains('hidden')) {
            hideFavoritesPanel(favoritesPanel);
        }
    }
}

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Header shadow on scroll
    const header = document.querySelector('header');
    if (header) {
        if (scrollTop > 10) {
            header.classList.add('shadow-lg');
        } else {
            header.classList.remove('shadow-lg');
        }
    }
    
    // Back to top button
    let backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) {
        backToTopBtn = createBackToTopButton();
    }
    
    if (scrollTop > 500) {
        backToTopBtn.classList.remove('hidden');
        backToTopBtn.classList.add('animate-fadeIn');
    } else {
        backToTopBtn.classList.add('hidden');
        backToTopBtn.classList.remove('animate-fadeIn');
    }
}

function handleResize() {
    // Handle responsive behavior
    if (window.innerWidth >= 768) {
        hideMobileMenu();
    }
}

function handleFocusIn(e) {
    // Add focus styles
    e.target.classList.add('focus-visible');
}

function handleFocusOut(e) {
    // Remove focus styles
    e.target.classList.remove('focus-visible');
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
}

function handleTouchMove(e) {
    if (!startX || !startY) return;
    
    const touch = e.touches[0];
    distX = touch.clientX - startX;
    distY = touch.clientY - startY;
}

function handleTouchEnd(e) {
    if (!distX || !distY) return;
    
    // Determine swipe direction
    if (Math.abs(distX) > Math.abs(distY)) {
        if (distX > 50) {
            // Swipe right - previous slide
            const prevIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
            goToSlide(prevIndex);
        } else if (distX < -50) {
            // Swipe left - next slide
            nextSlide();
        }
    }
    
    // Reset values
    startX = startY = distX = distY = null;
}

function createBackToTopButton() {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.className = 'fixed bottom-8 right-8 bg-[var(--primary-color)] text-white p-3 rounded-full shadow-lg hover:bg-[var(--primary-dark)] transition-all duration-300 z-50 hidden';
    button.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
    `;
    button.setAttribute('aria-label', 'Voltar ao topo');
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(button);
    return button;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-fadeInDown ${getNotificationClass(type)}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-current opacity-70 hover:opacity-100">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Announce to screen readers
    announce(message);
}

function getNotificationClass(type) {
    const classes = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white'
    };
    
    return classes[type] || classes.info;
}

function trapFocus(e, container) {
    const focusableElements = container.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

// ===== GLOBAL FUNCTIONS =====
function scrollToCategories() {
    const categoriesSection = document.getElementById('categories');
    if (categoriesSection) {
        categoriesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/medresources/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // In production, you might want to send this to an error tracking service
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', function() {
    // Log performance metrics
    setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    }, 0);
});