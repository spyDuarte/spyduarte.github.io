/**
 * Product Page JavaScript
 * Funcionalidades específicas para a página de produto
 */

document.addEventListener('DOMContentLoaded', function() {
    // Galeria de imagens
    initImageGallery();
    
    // Tabs de informação
    initProductTabs();
    
    // Personalização de produto
    initProductCustomization();
    
    // Lista de desejos
    initWishlistButton();
    
    // Compartilhamento social
    initSocialSharing();
});

/**
 * Inicializa a galeria de imagens com troca de imagens
 */
function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('current-image');
    
    if (!thumbnails.length || !mainImage) return;
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Atualiza a imagem principal
            const newImageSrc = this.getAttribute('data-image');
            mainImage.src = newImageSrc;
            
            // Atualiza a classe active
            thumbnails.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Inicializa as abas de informações de produto
 */
function initProductTabs() {
    const tabHeaders = document.querySelectorAll('.tab-header');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabHeaders.length || !tabContents.length) return;
    
    tabHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove a classe active de todas as abas
            tabHeaders.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            
            // Adiciona a classe active à aba clicada
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Inicializa a personalização de produto
 */
function initProductCustomization() {
    const colorOption = document.getElementById('color-option');
    const sizeOption = document.getElementById('size-option');
    const baseOption = document.getElementById('base-option');
    
    if (!colorOption && !sizeOption && !baseOption) return;
    
    // Aqui seria implementada a lógica para atualizar o preço baseado nas opções
    // ou preparar os dados para o formulário de pedido
    const updatePrice = () => {
        // Esta função seria implementada para calcular o preço baseado nas opções selecionadas
        console.log('Opções atualizadas:', {
            cor: colorOption ? colorOption.value : null,
            tamanho: sizeOption ? sizeOption.value : null,
            base: baseOption ? baseOption.value : null
        });
    };
    
    // Adiciona listeners para atualizar as opções
    if (colorOption) colorOption.addEventListener('change', updatePrice);
    if (sizeOption) sizeOption.addEventListener('change', updatePrice);
    if (baseOption) baseOption.addEventListener('change', updatePrice);
}

/**
 * Inicializa o botão de adicionar aos favoritos
 */
function initWishlistButton() {
    const wishlistButton = document.querySelector('.btn-wishlist');
    
    if (!wishlistButton) return;
    
    wishlistButton.addEventListener('click', function() {
        // Implementação simples - em um site real, isso enviaria uma solicitação de API
        // ou armazenaria a informação em localStorage
        this.classList.toggle('active');
        
        const productId = getProductIdFromUrl();
        const wishlist = getWishlistFromStorage();
        
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
    
    // Verifica se o produto já está na lista de desejos
    const productId = getProductIdFromUrl();
    const wishlist = getWishlistFromStorage();
    
    if (wishlist.includes(productId)) {
        wishlistButton.classList.add('active');
    }
}

/**
 * Inicializa botões de compartilhamento social
 */
function initSocialSharing() {
    const shareButtons = document.querySelectorAll('.social-share a');
    
    if (!shareButtons.length) return;
    
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.getAttribute('data-platform');
            let shareUrl = '';
            
            switch (platform) {
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
                    break;
                case 'pinterest':
                    const mainImage = document.getElementById('current-image');
                    const imageUrl = mainImage ? encodeURIComponent(mainImage.src) : '';
                    shareUrl = `https://pinterest.com/pin/create/button/?url=${pageUrl}&media=${imageUrl}&description=${pageTitle}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${pageTitle}&body=Confira%20este%20produto:%20${pageUrl}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

/**
 * Funções auxiliares
 */

// Obtém o ID do produto da URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || '';
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