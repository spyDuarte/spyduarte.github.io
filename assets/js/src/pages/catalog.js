/**
 * Catalog Page JavaScript
 * Funcionalidades específicas para a página de catálogo
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os filtros de catálogo
    initCatalogFilters();
    
    // Inicializa botões de favoritos
    initWishlistButtons();
    
    // Verifica se há parâmetros de filtro na URL e aplica
    applyFiltersFromUrl();
});

/**
 * Inicializa os filtros do catálogo
 */
function initCatalogFilters() {
    const typeFilter = document.getElementById('type-filter');
    const materialFilter = document.getElementById('material-filter');
    const colorFilter = document.getElementById('color-filter');
    const priceFilter = document.getElementById('price-filter');
    const applyButton = document.getElementById('apply-filters');
    const clearButton = document.getElementById('clear-filters');
    
    if (!applyButton || !clearButton) return;
    
    // Botão de aplicar filtros
    applyButton.addEventListener('click', function() {
        applyFilters();
    });
    
    // Botão de limpar filtros
    clearButton.addEventListener('click', function() {
        if (typeFilter) typeFilter.value = '';
        if (materialFilter) materialFilter.value = '';
        if (colorFilter) colorFilter.value = '';
        if (priceFilter) priceFilter.value = '';
        
        applyFilters();
    });
}

/**
 * Aplica os filtros selecionados aos produtos
 */
function applyFilters() {
    const typeFilter = document.getElementById('type-filter');
    const materialFilter = document.getElementById('material-filter');
    const colorFilter = document.getElementById('color-filter');
    const priceFilter = document.getElementById('price-filter');
    
    const typeValue = typeFilter ? typeFilter.value : '';
    const materialValue = materialFilter ? materialFilter.value : '';
    const colorValue = colorFilter ? colorFilter.value : '';
    const priceValue = priceFilter ? priceFilter.value : '';
    
    // Atualiza a URL com os parâmetros de filtro
    const urlParams = new URLSearchParams();
    if (typeValue) urlParams.set('type', typeValue);
    if (materialValue) urlParams.set('material', materialValue);
    if (colorValue) urlParams.set('color', colorValue);
    if (priceValue) urlParams.set('price', priceValue);
    
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.pushState({}, '', newUrl);
    
    // Filtra os produtos
    filterProducts(typeValue, materialValue, colorValue, priceValue);
}

/**
 * Aplica os filtros aos produtos
 */
function filterProducts(type, material, color, price) {
    const products = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    products.forEach(product => {
        let visible = true;
        
        // Filtro por tipo
        if (type && product.getAttribute('data-type') !== type) {
            visible = false;
        }
        
        // Filtro por material
        if (visible && material && product.getAttribute('data-material') !== material) {
            visible = false;
        }
        
        // Filtro por cor
        if (visible && color && product.getAttribute('data-color') !== color) {
            visible = false;
        }
        
        // Filtro por preço
        if (visible && price) {
            const productPrice = parseInt(product.getAttribute('data-price'), 10) || 0;
            const [minPrice, maxPrice] = price.split('-').map(p => p === '+' ? Infinity : parseInt(p, 10));
            
            if (productPrice < minPrice || (maxPrice !== Infinity && productPrice > maxPrice)) {
                visible = false;
            }
        }
        
        // Aplica visibilidade ao produto
        if (visible) {
            product.style.display = '';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    
    // Atualiza mensagem de resultados
    updateFilterResults(visibleCount);
}

/**
 * Atualiza a mensagem de resultados de filtro
 */
function updateFilterResults(count) {
    let resultsElement = document.querySelector('.filter-results');
    
    if (!resultsElement) {
        resultsElement = document.createElement('div');
        resultsElement.className = 'filter-results';
        const container = document.querySelector('.catalog-products .container');
        if (container) {
            container.insertBefore(resultsElement, container.firstChild);
        }
    }
    
    resultsElement.textContent = count === 0 
        ? 'Nenhum produto encontrado. Tente outros filtros.' 
        : `${count} produto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}.`;
    
    if (count === 0) {
        resultsElement.classList.add('no-results');
    } else {
        resultsElement.classList.remove('no-results');
    }
}

/**
 * Verifica e aplica filtros da URL
 */
function applyFiltersFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const typeFilter = document.getElementById('type-filter');
    const materialFilter = document.getElementById('material-filter');
    const colorFilter = document.getElementById('color-filter');
    const priceFilter = document.getElementById('price-filter');
    
    // Define os filtros com base nos parâmetros da URL
    if (typeFilter && urlParams.has('type')) {
        typeFilter.value = urlParams.get('type');
    }
    
    if (materialFilter && urlParams.has('material')) {
        materialFilter.value = urlParams.get('material');
    }
    
    if (colorFilter && urlParams.has('color')) {
        colorFilter.value = urlParams.get('color');
    }
    
    if (priceFilter && urlParams.has('price')) {
        priceFilter.value = urlParams.get('price');
    }
    
    // Aplica os filtros se houver parâmetros na URL
    if (urlParams.has('type') || urlParams.has('material') || urlParams.has('color') || urlParams.has('price')) {
        filterProducts(
            urlParams.get('type') || '',
            urlParams.get('material') || '',
            urlParams.get('color') || '',
            urlParams.get('price') || ''
        );
    }
}

/**
 * Inicializa os botões de favoritos
 */
function initWishlistButtons() {
    const wishlistButtons = document.querySelectorAll('.btn-wishlist');
    const wishlist = getWishlistFromStorage();
    
    wishlistButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        if (!productCard) return;
        
        const productId = getProductIdFromCard(productCard);
        
        // Marca produtos que já estão na lista de desejos
        if (wishlist.includes(productId)) {
            button.classList.add('active');
        }
        
        // Adiciona evento de clique
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                // Adiciona à lista de desejos
                if (!wishlist.includes(productId)) {
                    wishlist.push(productId);
                    showNotification('Produto adicionado aos favoritos');
                }
            } else {
                // Remove da lista de desejos
                const index = wishlist.indexOf(productId);
                if (index > -1) {
                    wishlist.splice(index, 1);
                    showNotification('Produto removido dos favoritos');
                }
            }
            
            // Salva a lista de desejos atualizada
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        });
    });
}

/**
 * Funções auxiliares
 */

// Obtém o ID do produto a partir do card
function getProductIdFromCard(productCard) {
    // Busca o link para a página do produto e extrai o ID da URL
    const productLink = productCard.querySelector('a[href*="produto.html"]');
    if (productLink) {
        const href = productLink.getAttribute('href');
        const match = href.match(/[?&]id=([^&]*)/);
        return match ? match[1] : '';
    }
    return '';
}

// Obtém a lista de desejos do localStorage
function getWishlistFromStorage() {
    const wishlistJson = localStorage.getItem('wishlist');
    return wishlistJson ? JSON.parse(wishlistJson) : [];
}

// Exibe uma notificação na tela
function showNotification(message) {
    // Implementação simples - em um site real, isso seria mais elaborado
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove a notificação após 2 segundos
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}