/**
 * Carousel Component
 * Implementação de carrossel/slider para exibição de conteúdo
 */

/**
 * Inicializa carrosséis/sliders no site
 */
export function initCarousels() {
    // Inicializa carrossel de produtos
    initProductCarousel();
    
    // Inicializa slider de depoimentos
    initTestimonialSlider();
    
    // Inicializa slider de posts recomendados
    initPostsSlider();
    
    // Inicializa galeria de produto
    initProductGallery();
}

/**
 * Inicializa carrossel de produtos na página inicial e relacionados
 */
function initProductCarousel() {
    const carousels = document.querySelectorAll('.product-carousel');
    
    carousels.forEach(carousel => {
        if (!carousel) return;
        
        // Variáveis do carrossel
        const wrapper = carousel;
        const slides = carousel.querySelectorAll('.product-card');
        const totalSlides = slides.length;
        
        // Se tiver poucos slides, não precisa de controles
        if (totalSlides <= getVisibleSlides(carousel)) {
            return;
        }
        
        // Adiciona controles de navegação
        createNavigation(wrapper, slides, totalSlides);
        
        // Adiciona funcionalidade de arrastar (opcional)
        enableDragScroll(wrapper);
    });
}

/**
 * Inicializa slider de depoimentos
 */
function initTestimonialSlider() {
    const sliders = document.querySelectorAll('.testimonial-slider');
    
    sliders.forEach(slider => {
        if (!slider) return;
        
        // Variáveis do slider
        const slides = slider.querySelectorAll('.testimonial');
        const totalSlides = slides.length;
        
        // Se tiver apenas um slide, não precisa de controles
        if (totalSlides <= 1) {
            return;
        }
        
        // Inicializa o slider como carrossel
        let currentSlide = 0;
        
        // Adiciona wrapper para animação deslizante
        const slideWrapper = document.createElement('div');
        slideWrapper.className = 'testimonial-slides';
        
        // Move os slides para dentro do wrapper
        slides.forEach(slide => {
            slideWrapper.appendChild(slide);
        });
        
        slider.appendChild(slideWrapper);
        
        // Cria botões de navegação
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-nav prev';
        prevButton.setAttribute('aria-label', 'Anterior');
        prevButton.innerHTML = '<img src="/assets/images/icons/arrow-left.svg" alt="Anterior" width="24" height="24">';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'slider-nav next';
        nextButton.setAttribute('aria-label', 'Próximo');
        nextButton.innerHTML = '<img src="/assets/images/icons/arrow-right.svg" alt="Próximo" width="24" height="24">';
        
        slider.appendChild(prevButton);
        slider.appendChild(nextButton);
        
        // Cria indicadores
        const indicators = document.createElement('div');
        indicators.className = 'slider-indicators';
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = i === 0 ? 'indicator active' : 'indicator';
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.setAttribute('data-slide', i);
            
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
            
            indicators.appendChild(dot);
        }
        
        slider.appendChild(indicators);
        
        // Função para ir para um slide específico
        function goToSlide(index) {
            if (index < 0) {
                index = totalSlides - 1;
            } else if (index >= totalSlides) {
                index = 0;
            }
            
            currentSlide = index;
            slideWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Atualiza indicadores
            const dots = indicators.querySelectorAll('.indicator');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }
        
        // Event listeners para navegação
        prevButton.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
        
        nextButton.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
        
        // Auto play (opcional)
        let autoplayInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 5000);
        
        // Pausa o autoplay ao passar o mouse
        slider.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });
        
        slider.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(() => {
                goToSlide(currentSlide + 1);
            }, 5000);
        });
        
        // Touch events para mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const threshold = 50; // Mínimo de distância para considerar um swipe
            
            if (touchEndX < touchStartX - threshold) {
                // Swipe para esquerda (próximo)
                goToSlide(currentSlide + 1);
            } else if (touchEndX > touchStartX + threshold) {
                // Swipe para direita (anterior)
                goToSlide(currentSlide - 1);
            }
        }
    });
}

/**
 * Inicializa slider de posts recomendados
 */
function initPostsSlider() {
    const sliders = document.querySelectorAll('.posts-slider');
    
    sliders.forEach(slider => {
        if (!slider) return;
        
        // Variáveis do slider
        const slides = slider.querySelectorAll('.post-slide');
        const totalSlides = slides.length;
        
        // Se tiver poucos slides, não precisa de controles
        const visibleSlides = getVisibleSlides(slider);
        if (totalSlides <= visibleSlides) {
            return;
        }
        
        // Adiciona controles de navegação
        createNavigation(slider, slides, totalSlides);
        
        // Adiciona funcionalidade de arrastar
        enableDragScroll(slider);
    });
}

/**
 * Inicializa galeria de imagens na página de produto
 */
function initProductGallery() {
    const gallery = document.querySelector('.product-gallery');
    
    if (!gallery) return;
    
    const mainImage = gallery.querySelector('.main-image img');
    const thumbnails = gallery.querySelectorAll('.thumbnail');
    
    if (!mainImage || !thumbnails.length) return;
    
    // Adiciona eventos de clique nas thumbnails
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remove classe active de todas as thumbnails
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            
            // Adiciona classe active na thumbnail clicada
            this.classList.add('active');
            
            // Atualiza a imagem principal
            const imageUrl = this.getAttribute('data-image');
            
            if (imageUrl) {
                // Fade out/in para uma transição suave
                mainImage.style.opacity = '0';
                
                setTimeout(() => {
                    mainImage.setAttribute('src', imageUrl);
                    mainImage.style.opacity = '1';
                }, 300);
            }
        });
    });
    
    // Opcional: Zoom na imagem ao passar o mouse
    if (window.innerWidth >= 992) { // Apenas em telas maiores
        const imageContainer = gallery.querySelector('.main-image');
        
        imageContainer.addEventListener('mousemove', function(e) {
            const boundingRect = this.getBoundingClientRect();
            const x = e.clientX - boundingRect.left;
            const y = e.clientY - boundingRect.top;
            
            const xPercent = (x / boundingRect.width) * 100;
            const yPercent = (y / boundingRect.height) * 100;
            
            mainImage.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        });
        
        imageContainer.addEventListener('mouseenter', function() {
            mainImage.style.transform = 'scale(1.5)';
        });
        
        imageContainer.addEventListener('mouseleave', function() {
            mainImage.style.transform = 'scale(1)';
        });
    }
}

/**
 * Funções auxiliares
 */

/**
 * Cria botões de navegação para um carrossel
 */
function createNavigation(container, slides, totalSlides) {
    // Adiciona wrapper para os slides se ainda não existir
    let slideWrapper;
    
    if (!container.querySelector('.slides-wrapper')) {
        slideWrapper = document.createElement('div');
        slideWrapper.className = 'slides-wrapper';
        
        // Move os slides para dentro do wrapper
        Array.from(slides).forEach(slide => {
            slideWrapper.appendChild(slide);
        });
        
        container.appendChild(slideWrapper);
    } else {
        slideWrapper = container.querySelector('.slides-wrapper');
    }
    
    // Cria botões de navegação
    const prevButton = document.createElement('button');
    prevButton.className = 'slider-nav prev';
    prevButton.setAttribute('aria-label', 'Anterior');
    prevButton.innerHTML = '<img src="/assets/images/icons/arrow-left.svg" alt="Anterior" width="24" height="24">';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'slider-nav next';
    nextButton.setAttribute('aria-label', 'Próximo');
    nextButton.innerHTML = '<img src="/assets/images/icons/arrow-right.svg" alt="Próximo" width="24" height="24">';
    
    container.appendChild(prevButton);
    container.appendChild(nextButton);
    
    // Variáveis para controlar a navegação
    let currentPosition = 0;
    const slideWidth = 100 / getVisibleSlides(container);
    const maxPosition = Math.max(0, totalSlides - getVisibleSlides(container));
    
    // Função para mover o slider
    function moveSlider(position) {
        if (position < 0) {
            position = 0;
        } else if (position > maxPosition) {
            position = maxPosition;
        }
        
        currentPosition = position;
        slideWrapper.style.transform = `translateX(-${currentPosition * slideWidth}%)`;
        
        // Atualiza estados dos botões
        prevButton.disabled = currentPosition === 0;
        nextButton.disabled = currentPosition === maxPosition;
        
        // Adiciona classes visuais para botões desabilitados
        prevButton.classList.toggle('disabled', currentPosition === 0);
        nextButton.classList.toggle('disabled', currentPosition === maxPosition);
    }
    
    // Event listeners para navegação
    prevButton.addEventListener('click', () => {
        moveSlider(currentPosition - 1);
    });
    
    nextButton.addEventListener('click', () => {
        moveSlider(currentPosition + 1);
    });
    
    // Inicializa estado dos botões
    moveSlider(0);
    
    // Recalcula quando a janela é redimensionada
    window.addEventListener('resize', () => {
        const newVisibleSlides = getVisibleSlides(container);
        const newMaxPosition = Math.max(0, totalSlides - newVisibleSlides);
        
        // Ajusta a posição atual se necessário
        if (currentPosition > newMaxPosition) {
            moveSlider(newMaxPosition);
        }
    });
}

/**
 * Determina quantos slides devem ser visíveis baseado no tamanho da tela
 */
function getVisibleSlides(container) {
    // Valores padrão baseados em classes CSS ou atributos de dados
    if (container.classList.contains('product-carousel')) {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
    }
    
    if (container.classList.contains('posts-slider')) {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
    }
    
    // Default
    return 1;
}

/**
 * Adiciona funcionalidade de arrastar (drag) ao carrossel
 */
function enableDragScroll(container) {
    const slider = container.querySelector('.slides-wrapper') || container;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // Mouse events
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('dragging');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        
        // Previne seleção de texto durante o arrasto
        e.preventDefault();
    });
    
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('dragging');
    });
    
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('dragging');
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // Multiplicador para ajustar a velocidade do arrasto
        slider.scrollLeft = scrollLeft - walk;
        
        // Previne comportamento padrão para evitar conflitos
        e.preventDefault();
    });
    
    // Touch events
    slider.addEventListener('touchstart', (e) => {
        isDown = true;
        slider.classList.add('dragging');
        startX = e.touches[0].pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    }, { passive: true });
    
    slider.addEventListener('touchend', () => {
        isDown = false;
        slider.classList.remove('dragging');
    }, { passive: true });
    
    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    }, { passive: true });
}