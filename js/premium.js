// premium.js - Funcionalidades avançadas e efeitos premium

document.addEventListener('DOMContentLoaded', function() {
    // Loader elegante
    const loader = document.createElement('div');
    loader.className = 'premium-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM50 15C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15Z" fill="url(#paint0_linear)"/>
                    <path d="M30 40L30 60L40 60L40 40L30 40Z" fill="#1c5d7d"/>
                    <path d="M45 40L45 60L75 60L75 50L55 50L55 40L45 40Z" fill="#1c5d7d"/>
                    <defs>
                        <linearGradient id="paint0_linear" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#1c5d7d"/>
                            <stop offset="1" stop-color="#e09f3e"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div class="loader-bar">
                <div class="loader-progress"></div>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
    
    // Remove o loader após o carregamento
    window.addEventListener('load', function() {
        setTimeout(function() {
            loader.classList.add('loaded');
            setTimeout(function() {
                document.body.removeChild(loader);
            }, 600);
        }, 1000);
    });
    
    // Progress Bar de rolagem
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
    
    // Atualiza a barra de progresso com base na rolagem
    function updateProgressBar() {
        const scrollPosition = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (scrollPosition / scrollHeight) * 100;
        progressBar.style.width = scrollPercentage + '%';
    }
    
    window.addEventListener('scroll', updateProgressBar);
    
    // Efeito de parallax avançado
    const parallaxContainers = document.querySelectorAll('.parallax-container');
    
    if (parallaxContainers.length > 0) {
        parallaxContainers.forEach(container => {
            const deepLayers = container.querySelectorAll('.parallax-deep');
            const mediumLayers = container.querySelectorAll('.parallax-medium');
            const shallowLayers = container.querySelectorAll('.parallax-shallow');
            
            window.addEventListener('mousemove', function(e) {
                const x = e.clientX;
                const y = e.clientY;
                
                const containerRect = container.getBoundingClientRect();
                
                if (y >= containerRect.top && y <= containerRect.bottom &&
                    x >= containerRect.left && x <= containerRect.right) {
                    
                    const xRelative = (x - containerRect.left) / containerRect.width - 0.5;
                    const yRelative = (y - containerRect.top) / containerRect.height - 0.5;
                    
                    deepLayers.forEach(layer => {
                        layer.style.transform = `translate(${xRelative * -30}px, ${yRelative * -30}px)`;
                    });
                    
                    mediumLayers.forEach(layer => {
                        layer.style.transform = `translate(${xRelative * -20}px, ${yRelative * -20}px)`;
                    });
                    
                    shallowLayers.forEach(layer => {
                        layer.style.transform = `translate(${xRelative * -10}px, ${yRelative * -10}px)`;
                    });
                }
            });
        });
    }
    
    // Transformar elementos em parallax se tiverem a classe
    const heroSection = document.querySelector('.hero');
    if (heroSection && !heroSection.classList.contains('parallax-container')) {
        heroSection.classList.add('parallax-container');
        
        // Cria as camadas de parallax
        const heroContent = heroSection.querySelector('.hero-content');
        if (heroContent) {
            heroContent.classList.add('parallax-shallow');
        }
        
        // Adiciona elementos decorativos para parallax
        const decorativeDots = document.createElement('div');
        decorativeDots.className = 'decorative-dots parallax-deep';
        decorativeDots.style.top = '10%';
        decorativeDots.style.right = '10%';
        heroSection.appendChild(decorativeDots);
        
        const decorativeShape = document.createElement('div');
        decorativeShape.className = 'decorative-shape parallax-medium';
        decorativeShape.style.bottom = '-150px';
        decorativeShape.style.left = '-100px';
        heroSection.appendChild(decorativeShape);
        
        const decorativeShape2 = document.createElement('div');
        decorativeShape2.className = 'decorative-shape parallax-deep';
        decorativeShape2.style.top = '-150px';
        decorativeShape2.style.right = '-100px';
        heroSection.appendChild(decorativeShape2);
    }
    
    // Efeito de revelação de seção
    const revealSections = document.querySelectorAll('.reveal-section');
    
    if (revealSections.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });
        
        revealSections.forEach(section => {
            revealObserver.observe(section);
        });
    }
    
    // Aprimorar seções existentes para usar os efeitos premium
    document.querySelectorAll('.section-title h2').forEach(title => {
        title.classList.add('premium-heading');
    });
    
    document.querySelectorAll('.btn').forEach(button => {
        if (!button.classList.contains('btn-outline') && !button.classList.contains('btn-secondary')) {
            button.classList.add('btn-premium');
        }
    });
    
    // Melhorar cards de produtos
    document.querySelectorAll('.product-card').forEach(card => {
        // Somente transforme cards que não foram já transformados
        if (!card.classList.contains('premium-product-card')) {
            // Clona os elementos internos para reestilização
            const cardImage = card.querySelector('.product-image');
            const cardInfo = card.querySelector('.product-info');
            const productTitle = card.querySelector('.product-title');
            const productPrice = card.querySelector('.product-price');
            const productDescription = card.querySelector('.product-description');
            const viewButton = card.querySelector('.btn');
            
            // Cria o novo layout premium
            card.classList.add('premium-product-card');
            cardImage.classList.add('premium-product-image');
            
            // Adiciona overlay
            const overlay = document.createElement('div');
            overlay.className = 'premium-product-overlay';
            cardImage.appendChild(overlay);
            
            // Ajusta o info
            cardInfo.classList.add('premium-product-info');
            productTitle.classList.add('premium-product-title');
            productPrice.classList.add('premium-product-price');
            productDescription.classList.add('premium-product-description');
            
            // Reorganiza os botões
            if (viewButton) {
                const actions = document.createElement('div');
                actions.className = 'premium-product-actions';
                
                const newButton = document.createElement('button');
                newButton.className = 'premium-product-btn';
                newButton.innerHTML = viewButton.innerHTML;
                newButton.addEventListener('click', function() {
                    window.location.href = viewButton.getAttribute('href');
                });
                
                const wishlist = document.createElement('button');
                wishlist.className = 'premium-product-wishlist';
                wishlist.innerHTML = '<i class="fas fa-heart"></i>';
                wishlist.addEventListener('click', function(e) {
                    e.stopPropagation();
                    this.classList.toggle('active');
                    
                    // Feedback visual
                    if (this.classList.contains('active')) {
                        this.style.color = '#e74c3c';
                        this.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                        
                        // Mostrar notificação
                        showNotification('Produto adicionado aos favoritos!');
                    } else {
                        this.style.color = '';
                        this.style.backgroundColor = '';
                        
                        // Mostrar notificação
                        showNotification('Produto removido dos favoritos.');
                    }
                });
                
                actions.appendChild(newButton);
                actions.appendChild(wishlist);
                
                // Remove o botão antigo
                viewButton.remove();
                
                // Adiciona os novos botões
                cardInfo.appendChild(actions);
            }
        }
    });
    
    // Função para notificações toast
    function showNotification(message, type = 'success') {
        // Remover notificações existentes
        const existingNotifications = document.querySelectorAll('.toast-notification');
        existingNotifications.forEach(notification => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `toast-notification ${type}`;
        notification.innerHTML = `
            <div class="toast-icon">
                ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>'}
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;
        document.body.appendChild(notification);
        
        // Adicionar estilos para a notificação
        const notificationStyles = document.createElement('style');
        notificationStyles.textContent = `
            .toast-notification {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background-color: white;
                color: #333;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                min-width: 300px;
                z-index: 1000;
                transform: translateY(100px);
                opacity: 0;
                animation: slideUpFade 0.3s forwards;
            }
            
            .toast-notification.hiding {
                animation: slideDownFade 0.3s forwards;
            }
            
            .toast-notification.success .toast-icon {
                color: #4CAF50;
            }
            
            .toast-notification.error .toast-icon {
                color: #F44336;
            }
            
            .toast-notification.warning .toast-icon {
                color: #FFC107;
            }
            
            .toast-icon {
                margin-right: 15px;
                font-size: 24px;
            }
            
            .toast-message {
                flex: 1;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #999;
                transition: color 0.3s;
            }
            
            .toast-close:hover {
                color: #333;
            }
            
            @keyframes slideUpFade {
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideDownFade {
                to {
                    transform: translateY(100px);
                    opacity: 0;
                }
            }
            
            @media (max-width: 576px) {
                .toast-notification {
                    left: 20px;
                    right: 20px;
                    min-width: auto;
                }
            }
        `;
        
        if (!document.querySelector('style[data-toast-styles]')) {
            notificationStyles.setAttribute('data-toast-styles', 'true');
            document.head.appendChild(notificationStyles);
        }
        
        // Fechar notificação após 4 segundos
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // Fechar notificação ao clicar no X
        const closeButton = notification.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.parentNode.removeChild(notification);
            }, 300);
        });
    }
    
    // Adicionar seção de benefícios após a seção de produtos em destaque
    const featuredSection = document.querySelector('.featured');
    if (featuredSection && !document.querySelector('.benefits-section')) {
        const benefitsSection = document.createElement('section');
        benefitsSection.className = 'benefits-section reveal-section';
        benefitsSection.innerHTML = `
            <div class="container">
                <div class="section-title">
                    <h2>Por que escolher a LD Studio?</h2>
                    <p>Descubra o que nos torna únicos e por que nossos clientes confiam em nós para criar peças exclusivas.</p>
                </div>
                <div class="benefits-container">
                    <div class="benefit-item">
                        <div class="benefit-icon">
                            <i class="fas fa-gem"></i>
                        </div>
                        <h3 class="benefit-title">Design Exclusivo</h3>
                        <p class="benefit-description">Cada peça é única e desenvolvida com design exclusivo que se adapta ao seu espaço e personalidade.</p>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-icon">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <h3 class="benefit-title">Qualidade Premium</h3>
                        <p class="benefit-description">Utilizamos apenas materiais de alta qualidade e técnicas avançadas para garantir durabilidade e beleza.</p>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-icon">
                            <i class="fas fa-leaf"></i>
                        </div>
                        <h3 class="benefit-title">Sustentabilidade</h3>
                        <p class="benefit-description">Comprometidos com o meio ambiente, usamos madeiras certificadas e processos de baixo impacto ambiental.</p>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-icon">
                            <i class="fas fa-hands"></i>
                        </div>
                        <h3 class="benefit-title">Artesanal</h3>
                        <p class="benefit-description">Cada peça é produzida artesanalmente com cuidado e atenção aos mínimos detalhes para resultados impecáveis.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Inserir após a seção de produtos em destaque
        featuredSection.parentNode.insertBefore(benefitsSection, featuredSection.nextSibling);
    }
    
    // Transforma elementos com classe 'float-animation'
    document.querySelectorAll('.float-animation').forEach(element => {
        // Adiciona efeito de flutuação com delay aleatório
        element.style.animationDelay = Math.random() * 2 + 's';
    });
    
    // Adicionar galeria premium após seção sobre
    const aboutSection = document.querySelector('.about');
    if (aboutSection && !document.querySelector('.gallery-section')) {
        const gallerySection = document.createElement('section');
        gallerySection.className = 'gallery-section section-padding';
        gallerySection.innerHTML = `
            <div class="container">
                <div class="section-title">
                    <h2>Nossa Galeria</h2>
                    <p>Explore nossa coleção de trabalhos finalizados e inspire-se para o seu próximo projeto.</p>
                </div>
                <div class="premium-gallery">
                    <div class="gallery-item large" data-caption="Mesa de Jantar Aurora">
                        <img src="images/produtos/mesa-jantar-aurora.jpg" alt="Mesa de Jantar Aurora" class="gallery-image">
                        <div class="gallery-overlay">
                            <div class="gallery-caption">Mesa de Jantar Aurora</div>
                        </div>
                    </div>
                    <div class="gallery-item" data-caption="Mesa de Centro Oceano">
                        <img src="images/produtos/mesa-centro-oceano.jpg" alt="Mesa de Centro Oceano" class="gallery-image">
                        <div class="gallery-overlay">
                            <div class="gallery-caption">Mesa de Centro Oceano</div>
                        </div>
                    </div>
                    <div class="gallery-item" data-caption="Aparador Cosmos">
                        <img src="images/produtos/aparador-cosmos.jpg" alt="Aparador Cosmos" class="gallery-image">
                        <div class="gallery-overlay">
                            <div class="gallery-caption">Aparador Cosmos</div>
                        </div>
                    </div>
                    <div class="gallery-item medium" data-caption="Detalhe de Acabamento">
                        <img src="images/processo/acabamento.jpg" alt="Detalhe de Acabamento" class="gallery-image">
                        <div class="gallery-overlay">
                            <div class="gallery-caption">Detalhe de Acabamento</div>
                        </div>
                    </div>
                    <div class="gallery-item" data-caption="Mesa Lateral Esmeralda">
                        <img src="images/produtos/mesa-lateral-esmeralda.jpg" alt="Mesa Lateral Esmeralda" class="gallery-image">
                        <div class="gallery-overlay">
                            <div class="gallery-caption">Mesa Lateral Esmeralda</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para visualização de imagens -->
            <div class="gallery-modal">
                <div class="modal-content">
                    <img src="" alt="" class="modal-image">
                    <button class="modal-close">&times;</button>
                    <div class="modal-caption"></div>
                    <div class="modal-nav">
                        <button class="modal-prev"><i class="fas fa-chevron-left"></i></button>
                        <button class="modal-next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        `;
        
        // Inserir após a seção sobre
        aboutSection.parentNode.insertBefore(gallerySection, aboutSection.nextSibling);
        
        // Implementar funcionalidade da galeria
        const galleryItems = document.querySelectorAll('.gallery-item');
        const galleryModal = document.querySelector('.gallery-modal');
        const modalImage = document.querySelector('.modal-image');
        const modalCaption = document.querySelector('.modal-caption');
        const modalClose = document.querySelector('.modal-close');
        const modalPrev = document.querySelector('.modal-prev');
        const modalNext = document.querySelector('.modal-next');
        
        let currentImageIndex = 0;
        
        // Abrir o modal ao clicar em uma imagem
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const imageSrc = item.querySelector('.gallery-image').getAttribute('src');
                const imageAlt = item.querySelector('.gallery-image').getAttribute('alt');
                const imageCaption = item.getAttribute('data-caption');
                
                modalImage.setAttribute('src', imageSrc);
                modalImage.setAttribute('alt', imageAlt);
                modalCaption.textContent = imageCaption;
                
                galleryModal.classList.add('open');
                document.body.style.overflow = 'hidden';
                
                currentImageIndex = index;
            });
        });
        
        // Fechar o modal
        modalClose.addEventListener('click', () => {
            galleryModal.classList.remove('open');
            document.body.style.overflow = '';
        });
        
        // Fechar o modal ao clicar fora da imagem
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                galleryModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
        
        // Navegação para a imagem anterior
        modalPrev.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
            updateModalImage();
        });
        
        // Navegação para a próxima imagem
        modalNext.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
            updateModalImage();
        });
        
        // Atualizar a imagem no modal
        function updateModalImage() {
            const item = galleryItems[currentImageIndex];
            const imageSrc = item.querySelector('.gallery-image').getAttribute('src');
            const imageAlt = item.querySelector('.gallery-image').getAttribute('alt');
            const imageCaption = item.getAttribute('data-caption');
            
            modalImage.style.opacity = '0';
            
            setTimeout(() => {
                modalImage.setAttribute('src', imageSrc);
                modalImage.setAttribute('alt', imageAlt);
                modalCaption.textContent = imageCaption;
                modalImage.style.opacity = '1';
            }, 300);
        }
        
        // Navegação pelo teclado
        document.addEventListener('keydown', (e) => {
            if (galleryModal.classList.contains('open')) {
                if (e.key === 'Escape') {
                    galleryModal.classList.remove('open');
                    document.body.style.overflow = '';
                } else if (e.key === 'ArrowLeft') {
                    currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
                    updateModalImage();
                } else if (e.key === 'ArrowRight') {
                    currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
                    updateModalImage();
                }
            }
        });
    }
    
    // Implementar cursor personalizado
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
        
        // Atualizar posição do cursor
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            if (!cursor.classList.contains('active')) {
                cursor.classList.add('active');
            }
        });
        
        // Efeito de hover em elementos interativos
        const interactiveElements = document.querySelectorAll('a, button, .product-card, .gallery-item');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
            
            element.addEventListener('mousedown', () => {
                cursor.classList.add('click');
            });
            
            element.addEventListener('mouseup', () => {
                cursor.classList.remove('click');
            });
        });
        
        // Desativar cursor quando sair da janela
        document.addEventListener('mouseout', (e) => {
            if (e.relatedTarget === null) {
                cursor.classList.remove('active');
            }
        });
    }
    
    // Adicionar seletor de tema
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = `
        <button class="theme-btn" data-theme="light" title="Tema Claro">
            <i class="fas fa-sun"></i>
        </button>
        <button class="theme-btn" data-theme="dark" title="Tema Escuro">
            <i class="fas fa-moon"></i>
        </button>
        <button class="theme-btn" data-theme="high-contrast" title="Alto Contraste">
            <i class="fas fa-adjust"></i>
        </button>
    `;
    document.body.appendChild(themeToggle);
    
    // Estilos para o seletor de tema
    const themeStyles = document.createElement('style');
    themeStyles.textContent = `
        .theme-toggle {
            position: fixed;
            bottom: 30px;
            left: 30px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 999;
        }
        
        .theme-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: white;
            border: none;
            color: var(--dark);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .theme-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .theme-btn.active {
            background-color: var(--primary);
            color: white;
        }
        
        @media (max-width: 768px) {
            .theme-toggle {
                bottom: 20px;
                left: 20px;
            }
            
            .theme-btn {
                width: 35px;
                height: 35px;
            }
        }
    `;
    document.head.appendChild(themeStyles);
    
    // Funcionalidade do seletor de tema
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    // Verificar se há tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        
        themeButtons.forEach(button => {
            if (button.getAttribute('data-theme') === savedTheme) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    } else {
        // Tema padrão é luz
        themeButtons[0].classList.add('active');
    }
    
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            
            // Remover todas as classes de tema
            document.body.classList.remove('dark-mode', 'high-contrast');
            
            // Remover classe ativa de todos os botões
            themeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe ativa ao botão clicado
            button.classList.add('active');
            
            // Aplicar tema selecionado
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else if (theme === 'high-contrast') {
                document.body.classList.add('high-contrast');
                localStorage.setItem('theme', 'high-contrast');
            } else {
                localStorage.removeItem('theme');
            }
            
            // Notificar o usuário
            showNotification(`Tema ${theme === 'light' ? 'claro' : theme === 'dark' ? 'escuro' : 'alto contraste'} ativado.`);
        });
    });
    
    // Ajustar o hero com efeito de partículas 3D se não houver
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 992) {
        // Verificar se já tem o efeito
        if (!document.querySelector('.particles-container')) {
            // Criar o container de partículas
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'particles-container';
            hero.appendChild(particlesContainer);
            
            // Adicionar estilos para as partículas
            const particlesStyles = document.createElement('style');
            particlesStyles.textContent = `
                .particles-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    z-index: 1;
                }
                
                .particle {
                    position: absolute;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.5);
                    pointer-events: none;
                    z-index: 1;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 2;
                }
            `;
            document.head.appendChild(particlesStyles);
            
            // Criar as partículas
            for (let i = 0; i < 100; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Tamanho aleatório
                const size = Math.random() * 5 + 1;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                
                // Posição aleatória
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                
                // Opacidade aleatória
                particle.style.opacity = Math.random() * 0.7 + 0.3;
                
                // Animação aleatória
                const duration = Math.random() * 20 + 10;
                const delay = Math.random() * 5;
                
                particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
                
                particlesContainer.appendChild(particle);
            }
            
            // Efeito de parallax para as partículas
            hero.addEventListener('mousemove', (e) => {
                const x = e.clientX;
                const y = e.clientY;
                
                const xPercent = x / window.innerWidth;
                const yPercent = y / window.innerHeight;
                
                const particles = document.querySelectorAll('.particle');
                particles.forEach(particle => {
                    const size = parseFloat(particle.style.width);
                    const depth = size / 5; // Partículas maiores parecem mais próximas
                    
                    const translateX = (xPercent - 0.5) * 70 * depth;
                    const translateY = (yPercent - 0.5) * 70 * depth;
                    
                    particle.style.transform = `translate(${translateX}px, ${translateY}px)`;
                });
            });
        }
    }
});