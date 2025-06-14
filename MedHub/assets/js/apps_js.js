/**
 * MedResources - Apps Page JavaScript
 * Handles filtering, searching, and interactions for the apps page
 */

// ===== GLOBAL VARIABLES =====
let allApps = [];
let currentFilter = 'all';
let currentSort = 'name';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeAppsPage();
    loadAppsData();
    setupEventListeners();
    
    console.log('Apps page initialized');
});

// ===== APPS DATA =====
function loadAppsData() {
    // In a real application, this would come from an API
    allApps = [
        {
            id: 1,
            name: "Complete Anatomy 2024",
            category: "anatomy",
            rating: 4.9,
            reviews: 2500,
            description: "O aplicativo de anatomia 3D mais avançado, com modelos detalhados e realidade aumentada.",
            image: "../assets/images/apps/complete-anatomy.jpg",
            url: "https://apps.apple.com/app/complete-anatomy-platform/id1054948424",
            price: "R$ 89,90",
            priceValue: 89.90,
            isFree: false,
            platforms: ["iOS", "Android"],
            developer: "3D4Medical",
            size: "1.2 GB",
            version: "7.0.5",
            featured: true,
            tags: ["3D", "anatomia", "realidade aumentada", "medicina", "estudantes"],
            requirements: "iOS 13.0+ / Android 7.0+",
            languages: ["Português", "Inglês", "Espanhol"],
            lastUpdated: "2024-01-15"
        },
        {
            id: 2,
            name: "Medscape",
            category: "reference",
            rating: 4.7,
            reviews: 15000,
            description: "Referência médica completa com informações sobre medicamentos, diagnósticos e tratamentos.",
            image: "../assets/images/apps/medscape.jpg",
            url: "https://www.medscape.com/public/medscapeapp",
            price: "Gratuito",
            priceValue: 0,
            isFree: true,
            platforms: ["iOS", "Android"],
            developer: "WebMD Health Corp",
            size: "85 MB",
            version: "10.2.1",
            featured: true,
            tags: ["referência", "medicamentos", "diagnóstico", "tratamento", "profissionais"],
            requirements: "iOS 12.0+ / Android 6.0+",
            languages: ["Português", "Inglês"],
            lastUpdated: "2024-01-10"
        },
        {
            id: 3,
            name: "MDCalc",
            category: "calculator",
            rating: 4.8,
            reviews: 1200,
            description: "Mais de 600 calculadoras médicas, escores clínicos e algoritmos de diagnóstico.",
            image: "../assets/images/apps/mdcalc.jpg",
            url: "https://www.mdcalc.com/",
            price: "Gratuito",
            priceValue: 0,
            isFree: true,
            platforms: ["iOS", "Android", "Web"],
            developer: "MDCalc",
            size: "25 MB",
            version: "3.1.4",
            featured: true,
            tags: ["calculadora", "escores", "algoritmos", "diagnóstico", "clínica"],
            requirements: "iOS 11.0+ / Android 5.0+",
            languages: ["Inglês"],
            lastUpdated: "2024-01-08"
        },
        {
            id: 4,
            name: "Visible Body",
            category: "anatomy",
            rating: 4.6,
            reviews: 800,
            description: "Atlas de anatomia com modelos 3D interativos e animações.",
            image: "../assets/images/apps/visible-body.jpg",
            url: "https://www.visiblebody.com/",
            price: "R$ 45,90",
            priceValue: 45.90,
            isFree: false,
            platforms: ["iOS", "Android"],
            developer: "Visible Body",
            size: "650 MB",
            version: "2024.1.05",
            featured: false,
            tags: ["anatomia", "3D", "animações", "interativo", "educação"],
            requirements: "iOS 12.0+ / Android 6.0+",
            languages: ["Português", "Inglês"],
            lastUpdated: "2024-01-05"
        },
        {
            id: 5,
            name: "Epocrates",
            category: "reference",
            rating: 4.9,
            reviews: 5000,
            description: "Referência rápida para medicamentos e interações medicamentosas.",
            image: "../assets/images/apps/epocrates.jpg",
            url: "https://www.epocrates.com/",
            price: "Gratuito",
            priceValue: 0,
            isFree: true,
            platforms: ["iOS", "Android"],
            developer: "Epocrates Inc.",
            size: "120 MB",
            version: "24.1",
            featured: false,
            tags: ["medicamentos", "interações", "prescrição", "farmacologia", "referência"],
            requirements: "iOS 13.0+ / Android 7.0+",
            languages: ["Inglês"],
            lastUpdated: "2024-01-12"
        },
        {
            id: 6,
            name: "AnkiDroid",
            category: "study",
            rating: 4.8,
            reviews: 8000,
            description: "Sistema de repetição espaçada para memorização eficaz de conceitos médicos.",
            image: "../assets/images/apps/anki.jpg",
            url: "https://ankiweb.net/",
            price: "Gratuito",
            priceValue: 0,
            isFree: true,
            platforms: ["iOS", "Android"],
            developer: "AnkiDroid Open Source Team",
            size: "15 MB",
            version: "2.17.2",
            featured: false,
            tags: ["flashcards", "memorização", "repetição espaçada", "estudo", "aprendizagem"],
            requirements: "iOS 11.0+ / Android 5.0+",
            languages: ["Português", "Inglês", "Múltiplos"],
            lastUpdated: "2024-01-03"
        },
        {
            id: 7,
            name: "QxMD Calculate",
            category: "calculator",
            rating: 4.7,
            reviews: 600,
            description: "Calculadoras médicas essenciais para prática clínica diária.",
            image: "../assets/images/apps/qxmd.jpg",
            url: "https://qxmd.com/calculate",
            price: "Gratuito",
            priceValue: 0,
            isFree: true,
            platforms: ["iOS", "Android"],
            developer: "QxMD Medical Software",
            size: "45 MB",
            version: "4.2.1",
            featured: false,
            tags: ["calculadora", "clínica", "prática", "medicina", "ferramentas"],
            requirements: "iOS 12.0+ / Android 6.0+",
            languages: ["Inglês"],
            lastUpdated: "2024-01-07"
        },
        {
            id: 8,
            name: "Figure 1",
            category: "diagnostic",
            rating: 4.4,
            reviews: 1500,
            description: "Rede social médica para compartilhamento de casos clínicos.",
            image: "../assets/images/apps/figure1.jpg",
            url: "https://figure1.com/",
            price: "Gratuito",
            priceValue: 0,
            isFree: true,
            platforms: ["iOS", "Android"],
            developer: "Figure 1 Inc.",
            size: "95 MB",
            version: "8.1.2",
            featured: false,
            tags: ["casos clínicos", "rede social", "diagnóstico", "compartilhamento", "educação"],
            requirements: "iOS 13.0+ / Android 7.0+",
            languages: ["Inglês"],
            lastUpdated: "2024-01-01"
        }
        // Mais apps podem ser adicionados aqui
    ];
    
    displayApps(allApps);
    updateAppCount();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleAppSearch);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterApps(filter);
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sort-apps');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
}

// ===== FILTERING FUNCTIONS =====
function filterApps(category) {
    currentFilter = category;
    
    // Update active filter button
    updateActiveFilterButton(category);
    
    // Get filtered apps
    let filteredApps = getFilteredApps();
    
    // Apply current sort
    filteredApps = sortApps(filteredApps, currentSort);
    
    displayApps(filteredApps);
    updateAppCount(filteredApps.length);
    
    // Announce filter change for screen readers
    announce(`Filtrado por ${getCategoryName(category)}. ${filteredApps.length} aplicativos encontrados.`);
}

function updateActiveFilterButton(activeCategory) {
    // Remove active class from all buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    // Add active class to current button
    document.querySelector(`[data-filter="${activeCategory}"]`)?.classList.add('active');
}

function getCategoryName(category) {
    const categoryNames = {
        'all': 'Todos os aplicativos',
        'anatomy': 'Anatomia',
        'reference': 'Referência',
        'calculator': 'Calculadoras',
        'study': 'Estudo',
        'diagnostic': 'Diagnóstico'
    };
    return categoryNames[category] || category;
}

function getFilteredApps() {
    let filteredApps;
    
    if (currentFilter === 'all') {
        filteredApps = allApps;
    } else {
        filteredApps = allApps.filter(app => app.category === currentFilter);
    }
    
    // Apply search if exists
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
        filteredApps = searchApps(filteredApps, searchInput.value.trim());
    }
    
    return filteredApps;
}

// ===== SEARCH FUNCTIONS =====
function handleAppSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    
    let filteredApps = getFilteredApps();
    
    displayApps(filteredApps);
    updateAppCount(filteredApps.length);
    
    // Show no results message if needed
    if (filteredApps.length === 0 && query) {
        showNoResults(query);
    }
}

function searchApps(apps, query) {
    return apps.filter(app => {
        return app.name.toLowerCase().includes(query) ||
               app.description.toLowerCase().includes(query) ||
               app.developer.toLowerCase().includes(query) ||
               app.tags.some(tag => tag.toLowerCase().includes(query));
    });
}

function handleSearchKeydown(event) {
    if (event.key === 'Escape') {
        event.target.value = '';
        filterApps(currentFilter); // Reset to current filter
    }
}

// ===== SORTING FUNCTIONS =====
function handleSortChange(event) {
    currentSort = event.target.value;
    let filteredApps = getFilteredApps();
    filteredApps = sortApps(filteredApps, currentSort);
    displayApps(filteredApps);
}

function sortApps(apps, sortBy) {
    const sortedApps = [...apps];
    
    switch (sortBy) {
        case 'name':
            return sortedApps.sort((a, b) => a.name.localeCompare(b.name));
        case 'rating':
            return sortedApps.sort((a, b) => b.rating - a.rating);
        case 'price':
            return sortedApps.sort((a, b) => a.priceValue - b.priceValue);
        case 'category':
            return sortedApps.sort((a, b) => a.category.localeCompare(b.category));
        default:
            return sortedApps;
    }
}

// ===== DISPLAY FUNCTIONS =====
function displayApps(apps) {
    const appsGrid = document.getElementById('apps-grid');
    if (!appsGrid) return;
    
    // Clear current apps
    appsGrid.innerHTML = '';
    
    if (apps.length === 0) {
        showNoResults();
        return;
    }
    
    // Create app cards
    apps.forEach((app, index) => {
        const appCard = createAppCard(app, index);
        appsGrid.appendChild(appCard);
    });
    
    // Trigger animations
    animateAppCards();
}

function createAppCard(app, index) {
    const card = document.createElement('div');
    card.className = 'card app-item animate-fadeInUp';
    card.style.animationDelay = `${index * 0.1}s`;
    card.setAttribute('data-category', app.category);
    
    // Create platforms icons
    const platformsHtml = app.platforms.map(platform => {
        const iconMap = {
            'iOS': '../assets/images/icons/ios.png',
            'Android': '../assets/images/icons/android.png',
            'Web': '../assets/images/icons/web.png'
        };
        return `<img src="${iconMap[platform] || '../assets/images/icons/app.png'}" alt="${platform}" class="w-5 h-5" title="${platform}">`;
    }).join('');
    
    card.innerHTML = `
        <div class="relative">
            <img alt="${app.name}" class="card-image" src="${app.image}" loading="lazy"
                 onerror="this.src='../assets/images/placeholder-app.jpg'">
            <button class="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-blue-50 transition-colors favorite-btn"
                    onclick="toggleAppFavorite(${app.id}, this)" 
                    aria-label="Adicionar aos favoritos">
                <svg class="w-5 h-5 text-gray-400 hover:text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
            </button>
            ${app.featured ? '<div class="absolute top-2 left-2"><span class="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">⭐ Destaque</span></div>' : ''}
        </div>
        <div class="card-content">
            <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-1">${app.name}</h3>
            <p class="text-sm text-[var(--text-secondary)] mb-2">por ${app.developer}</p>
            <p class="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">${app.description}</p>
            
            <div class="flex items-center gap-2 mb-3">
                <span class="bg-${getCategoryColor(app.category)}-100 text-${getCategoryColor(app.category)}-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    ${getCategoryName(app.category)}
                </span>
                <div class="flex items-center">
                    ${generateStarRating(app.rating)}
                    <span class="text-sm text-gray-600 ml-1">(${app.rating})</span>
                </div>
            </div>
            
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold ${app.isFree ? 'text-green-600' : 'text-[var(--primary-color)]'}">${app.price}</span>
                <div class="flex gap-1">
                    ${platformsHtml}
                </div>
            </div>
            
            <div class="text-xs text-[var(--text-secondary)] mb-3">
                <div class="flex justify-between">
                    <span>Tamanho:</span>
                    <span>${app.size}</span>
                </div>
                <div class="flex justify-between">
                    <span>Versão:</span>
                    <span>${app.version}</span>
                </div>
            </div>
            
            <div class="flex gap-2">
                <a href="${app.url}" target="_blank" 
                   class="btn-primary font-medium py-2 px-4 rounded-md text-sm flex-1 text-center"
                   onclick="trackAppClick(${app.id})">
                    ${app.platforms.includes('Web') ? 'Acessar' : 'Download'}
                </a>
                <button onclick="viewAppDetails(${app.id})" 
                        class="btn-outline py-2 px-3 rounded-md text-sm">
                    Info
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function getCategoryColor(category) {
    const colors = {
        'anatomy': 'blue',
        'reference': 'green',
        'calculator': 'purple',
        'study': 'orange',
        'diagnostic': 'red'
    };
    return colors[category] || 'gray';
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span class="text-yellow-500">★</span>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHtml += '<span class="text-yellow-500">☆</span>';
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<span class="text-gray-300">☆</span>';
    }
    
    return starsHtml;
}

function showNoResults(query = '') {
    const appsGrid = document.getElementById('apps-grid');
    if (!appsGrid) return;
    
    appsGrid.innerHTML = `
        <div class="col-span-full text-center py-16">
            <div class="max-w-md mx-auto">
                <svg class="w-24 h-24 mx-auto mb-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-5.586L4.293 6.707A1 1 0 014 6V4z" clip-rule="evenodd"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                    ${query ? `Nenhum resultado para "${query}"` : 'Nenhum aplicativo encontrado'}
                </h3>
                <p class="text-gray-600 mb-6">
                    ${query ? 'Tente usar termos diferentes ou remover alguns filtros.' : 'Ajuste os filtros ou termo de busca.'}
                </p>
                <button onclick="clearFilters()" class="btn-primary px-6 py-2 rounded-md">
                    Limpar Filtros
                </button>
            </div>
        </div>
    `;
}

// ===== UTILITY FUNCTIONS =====
function updateAppCount(count = null) {
    const totalCount = count !== null ? count : allApps.length;
    const countElement = document.getElementById('app-count');
    
    if (countElement) {
        countElement.textContent = `${totalCount} aplicativo${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}`;
    }
}

function animateAppCards() {
    const appCards = document.querySelectorAll('.app-item');
    appCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function clearFilters() {
    // Reset search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Reset filter
    currentFilter = 'all';
    
    // Reset sort
    const sortSelect = document.getElementById('sort-apps');
    if (sortSelect) {
        sortSelect.value = 'name';
    }
    currentSort = 'name';
    
    // Update display
    filterApps('all');
    
    announce('Filtros limpos. Mostrando todos os aplicativos.');
}

function initializeAppsPage() {
    // Add app count display
    addAppCountDisplay();
    
    // Initialize favorites
    loadAppFavorites();
}

function addAppCountDisplay() {
    const appsSection = document.querySelector('#apps-grid').parentNode;
    const countDisplay = document.createElement('div');
    countDisplay.className = 'text-center mb-6';
    countDisplay.innerHTML = `<p id="app-count" class="text-[var(--text-secondary)]"></p>`;
    
    appsSection.insertBefore(countDisplay, document.getElementById('apps-grid'));
}

// ===== FAVORITES FUNCTIONALITY =====
function loadAppFavorites() {
    const favorites = JSON.parse(localStorage.getItem('medresources-app-favorites') || '[]');
    
    // Update UI for favorited apps
    favorites.forEach(appId => {
        const favoriteBtn = document.querySelector(`[onclick*="toggleAppFavorite(${appId}"]`);
        if (favoriteBtn) {
            markAsFavorite(favoriteBtn);
        }
    });
}

function toggleAppFavorite(appId, button) {
    let favorites = JSON.parse(localStorage.getItem('medresources-app-favorites') || '[]');
    const app = allApps.find(a => a.id === appId);
    
    if (!app) return;
    
    if (favorites.includes(appId)) {
        // Remove from favorites
        favorites = favorites.filter(id => id !== appId);
        unmarkAsFavorite(button);
        showNotification(`"${app.name}" removido dos favoritos`, 'success');
    } else {
        // Add to favorites
        favorites.push(appId);
        markAsFavorite(button);
        showNotification(`"${app.name}" adicionado aos favoritos`, 'success');
    }
    
    localStorage.setItem('medresources-app-favorites', JSON.stringify(favorites));
}

function markAsFavorite(button) {
    const icon = button.querySelector('svg');
    icon.classList.remove('text-gray-400');
    icon.classList.add('text-blue-500');
    button.setAttribute('aria-label', 'Remover dos favoritos');
}

function unmarkAsFavorite(button) {
    const icon = button.querySelector('svg');
    icon.classList.remove('text-blue-500');
    icon.classList.add('text-gray-400');
    button.setAttribute('aria-label', 'Adicionar aos favoritos');
}

// ===== APP DETAILS =====
function viewAppDetails(appId) {
    const app = allApps.find(a => a.id === appId);
    if (!app) return;
    
    // Create modal with app details
    const modal = createAppDetailsModal(app);
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.remove('hidden');
        modal.classList.add('animate-fadeIn');
        
        // Focus first interactive element
        const firstButton = modal.querySelector('button');
        if (firstButton) {
            firstButton.focus();
        }
    }, 10);
}

function createAppDetailsModal(app) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden';
    modal.onclick = (e) => {
        if (e.target === modal) closeAppDetails(modal);
    };
    
    const platformsHtml = app.platforms.map(platform => {
        const iconMap = {
            'iOS': '../assets/images/icons/ios.png',
            'Android': '../assets/images/icons/android.png',
            'Web': '../assets/images/icons/web.png'
        };
        return `
            <div class="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <img src="${iconMap[platform]}" alt="${platform}" class="w-6 h-6">
                <span class="text-sm font-medium">${platform}</span>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-[var(--text-primary)]">${app.name}</h2>
                <button onclick="closeAppDetails(this.closest('.fixed'))" 
                        class="text-gray-500 hover:text-gray-700 p-2"
                        aria-label="Fechar detalhes">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <img src="${app.image}" alt="${app.name}" class="w-full rounded-lg shadow-md mb-4"
                             onerror="this.src='../assets/images/placeholder-app.jpg'">
                        
                        <div class="space-y-4">
                            <div class="flex items-center gap-4">
                                ${generateStarRating(app.rating)}
                                <span class="text-lg font-medium">${app.rating}</span>
                                <span class="text-[var(--text-secondary)]">(${app.reviews} avaliações)</span>
                            </div>
                            
                            <div class="text-2xl font-bold ${app.isFree ? 'text-green-600' : 'text-[var(--primary-color)]'}">${app.price}</div>
                            
                            <div class="space-y-3">
                                <h4 class="font-semibold text-[var(--text-primary)]">Plataformas Disponíveis</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${platformsHtml}
                                </div>
                            </div>
                            
                            <div class="flex gap-3">
                                <a href="${app.url}" target="_blank" 
                                   class="btn-primary px-6 py-3 rounded-lg flex-1 text-center"
                                   onclick="trackAppClick(${app.id})">
                                    ${app.platforms.includes('Web') ? 'Acessar Site' : 'Baixar App'}
                                </a>
                                <button onclick="toggleAppFavorite(${app.id}, this)" 
                                        class="btn-outline p-3 rounded-lg">
                                    ♡
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Sobre o App</h3>
                            <p class="text-[var(--text-secondary)] leading-relaxed">${app.description}</p>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold mb-3">Informações Técnicas</h3>
                            <div class="grid grid-cols-1 gap-3 text-sm">
                                <div class="flex justify-between">
                                    <span class="font-medium">Desenvolvedor:</span>
                                    <span class="text-[var(--text-secondary)]">${app.developer}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-medium">Versão:</span>
                                    <span class="text-[var(--text-secondary)]">${app.version}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-medium">Tamanho:</span>
                                    <span class="text-[var(--text-secondary)]">${app.size}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-medium">Requisitos:</span>
                                    <span class="text-[var(--text-secondary)]">${app.requirements}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-medium">Idiomas:</span>
                                    <span class="text-[var(--text-secondary)]">${app.languages.join(', ')}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="font-medium">Última Atualização:</span>
                                    <span class="text-[var(--text-secondary)]">${formatDate(app.lastUpdated)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="text-lg font-semibold mb-3">Tags</h3>
                            <div class="flex flex-wrap gap-2">
                                ${app.tags.map(tag => `
                                    <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                        ${tag}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

function closeAppDetails(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('animate-fadeIn');
    
    // Remove modal after animation
    setTimeout(() => {
        modal.remove();
    }, 300);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// ===== ANALYTICS =====
function trackAppClick(appId) {
    const app = allApps.find(a => a.id === appId);
    if (app) {
        console.log(`App clicked: ${app.name} (ID: ${appId})`);
        
        // In a real application, send to analytics service
        // gtag('event', 'app_click', {
        //     app_id: appId,
        //     app_name: app.name,
        //     app_category: app.category
        // });
    }
}

// ===== LOAD MORE FUNCTIONALITY =====
function loadMoreApps() {
    // In a real application, this would load more apps from an API
    showNotification('Funcionalidade em desenvolvimento', 'info');
}

// Make functions available globally
window.filterApps = filterApps;
window.viewAppDetails = viewAppDetails;
window.toggleAppFavorite = toggleAppFavorite;
window.closeAppDetails = closeAppDetails;
window.trackAppClick = trackAppClick;
window.loadMoreApps = loadMoreApps;