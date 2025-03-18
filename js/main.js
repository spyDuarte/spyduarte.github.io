// main.js - JavaScript compartilhado entre todas as páginas

document.addEventListener('DOMContentLoaded', function() {
    // Adiciona classe ao cabeçalho ao rolar
    const header = document.querySelector('header');
    const scrollThreshold = 50;
    
    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // Inicializa o header no carregamento
    handleScroll();
    
    // Mobile menu toggle
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<span></span><span></span><span></span>';
    
    const headerContent = document.querySelector('.header-content');
    const nav = document.querySelector('nav');
    
    // Adiciona o botão apenas em dispositivos móveis via JS
    if (window.innerWidth <= 768) {
        headerContent.appendChild(mobileMenuToggle);
        
        // Cria o overlay para o menu
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        // Adiciona estilos para o botão de menu
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-toggle {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 30px;
                height: 20px;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                z-index: 5;
            }
            
            .mobile-menu-toggle span {
                display: block;
                width: 100%;
                height: 2px;
                background-color: var(--dark);
                transition: all 0.3s ease;
            }
            
            .mobile-menu-toggle.active span:nth-child(1) {
                transform: translateY(9px) rotate(45deg);
            }
            
            .mobile-menu-toggle.active span:nth-child(2) {
                opacity: 0;
            }
            
            .mobile-menu-toggle.active span:nth-child(3) {
                transform: translateY(-9px) rotate(-45deg);
            }
        `;
        document.head.appendChild(style);
        
        // Abre/fecha o menu
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Fecha o menu ao clicar no overlay
        overlay.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            nav.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Fecha o menu ao clicar em um link
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                nav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Smooth scroll para links de âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Verifica se o link não está dentro do menu mobile (para evitar conflitos)
            if (!this.closest('nav') || window.innerWidth > 768) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                
                // Verifica se o ID existe na página atual
                if (document.querySelector(targetId)) {
                    // Calcula o offset para não esconder o conteúdo sob o header fixo
                    const headerHeight = header.offsetHeight;
                    const targetElement = document.querySelector(targetId);
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = targetPosition - headerHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    // Se o ID não existe, deve ser em outra página
                    window.location.href = 'index.html' + targetId;
                }
            }
        });
    });

    // Marca links de navegação como ativos com base na seção visível
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    function highlightNavigation() {
        // Obtem a posição atual de rolagem
        let scrollPosition = window.scrollY + header.offsetHeight + 100;
        
        // Verifica cada seção para ver se está visível
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove classe active de todos os links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Adiciona classe active ao link correspondente
                document.querySelector('nav ul li a[href="#' + sectionId + '"]')?.classList.add('active');
            }
        });
    }
    
    // Ativa a função no carregamento da página e durante o scroll
    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', highlightNavigation);
        highlightNavigation();
    }

    // Animação de fade-in para elementos quando entram na viewport
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length > 0) {
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        fadeElements.forEach(element => {
            fadeInObserver.observe(element);
        });
    }

    // Adiciona classe .fade-in a elementos que podem se beneficiar de animações
    const animatableElements = document.querySelectorAll('.section-title, .product-card, .about-image, .about-text, .testimonial-card');
    
    animatableElements.forEach(element => {
        if (!element.classList.contains('fade-in')) {
            element.classList.add('fade-in');
        }
    });

    // Mensagem de confirmação ao enviar formulários
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validação básica
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                // Remove mensagens de erro existentes
                const existingError = field.parentElement.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
                
                // Remove classe de erro
                field.classList.remove('error');
                
                // Verifica se o campo está vazio
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Cria mensagem de erro
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'Este campo é obrigatório';
                    field.parentElement.appendChild(errorMessage);
                    
                    // Adiciona estilos para o erro
                    if (!document.querySelector('style[data-form-validation]')) {
                        const style = document.createElement('style');
                        style.setAttribute('data-form-validation', 'true');
                        style.textContent = `
                            .error {
                                border-color: var(--error) !important;
                                background-color: rgba(244, 67, 54, 0.05);
                            }
                            
                            .error-message {
                                color: var(--error);
                                font-size: 0.85rem;
                                margin-top: 5px;
                                animation: fadeIn 0.3s ease;
                            }
                            
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
                
                // Validação específica para e-mail
                if (field.type === 'email' && field.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value.trim())) {
                        isValid = false;
                        field.classList.add('error');
                        
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.textContent = 'Por favor, insira um e-mail válido';
                        field.parentElement.appendChild(errorMessage);
                    }
                }
            });
            
            // Se todos os campos estiverem válidos, procede com o envio
            if (isValid) {
                // Simulação de envio
                const submitButton = form.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="loading-spinner"></span> Enviando...';
                
                // Adiciona estilos para o spinner
                if (!document.querySelector('style[data-spinner]')) {
                    const style = document.createElement('style');
                    style.setAttribute('data-spinner', 'true');
                    style.textContent = `
                        .loading-spinner {
                            display: inline-block;
                            width: 16px;
                            height: 16px;
                            margin-right: 8px;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 50%;
                            border-top-color: white;
                            animation: spin 0.8s linear infinite;
                            vertical-align: middle;
                        }
                        
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                        
                        .success-message {
                            background-color: var(--success);
                            color: white;
                            padding: 15px;
                            margin-top: 20px;
                            border-radius: var(--radius-md);
                            text-align: center;
                            animation: slideDown 0.5s ease;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        }
                        
                        .success-message .close-btn {
                            background: none;
                            border: none;
                            color: white;
                            font-size: 18px;
                            cursor: pointer;
                            opacity: 0.8;
                            transition: opacity 0.3s ease;
                        }
                        
                        .success-message .close-btn:hover {
                            opacity: 1;
                        }
                        
                        @keyframes slideDown {
                            from {
                                opacity: 0;
                                transform: translateY(-20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Simulação de chamada de API
                setTimeout(() => {
                    form.reset();
                    submitButton.innerHTML = '<span class="check-icon">✓</span> Enviado com Sucesso!';
                    
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }, 2000);
                    
                    // Exibe mensagem de sucesso
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.innerHTML = `
                        <span>Mensagem enviada com sucesso! Entraremos em contato em breve.</span>
                        <button class="close-btn">&times;</button>
                    `;
                    form.appendChild(successMessage);
                    
                    // Botão para fechar a mensagem
                    const closeBtn = successMessage.querySelector('.close-btn');
                    closeBtn.addEventListener('click', () => {
                        successMessage.remove();
                    });
                    
                    // Remove a mensagem após 5 segundos
                    setTimeout(() => {
                        if (form.contains(successMessage)) {
                            successMessage.remove();
                        }
                    }, 5000);
                }, 1500);
            }
        });
    });

    // Back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '<i class="arrow-up"></i>';
    document.body.appendChild(backToTopButton);
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('active');
        } else {
            backToTopButton.classList.remove('active');
        }
    });

    // Adiciona estilos inline para o botão back-to-top
    if (!document.querySelector('style[data-back-to-top]')) {
        const style = document.createElement('style');
        style.setAttribute('data-back-to-top', 'true');
        style.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: var(--primary);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 99;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            .back-to-top.active {
                opacity: 1;
                transform: translateY(0);
            }
            
            .back-to-top:hover {
                background-color: var(--primary-light);
                transform: translateY(-3px);
            }
            
            .back-to-top .arrow-up {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 12px solid white;
            }
            
            @media (max-width: 768px) {
                .back-to-top {
                    bottom: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Adicionar scroll indicator na hero section se existir
    const heroSection = document.querySelector('.hero');
    
    if (heroSection && !document.querySelector('.hero-scroll-indicator')) {
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'hero-scroll-indicator';
        scrollIndicator.innerHTML = `
            <span>Rolar para baixo</span>
            <div class="mouse"></div>
        `;
        heroSection.appendChild(scrollIndicator);
        
        // Scroll para próxima seção quando clicar no indicador
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('section:not(.hero)');
            if (nextSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = nextSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetPosition - headerHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Adiciona recursos de acessibilidade
    // Focus visible
    const styleAccessibility = document.createElement('style');
    styleAccessibility.textContent = `
        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        select:focus-visible {
            outline: 3px solid var(--primary-light);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(styleAccessibility);
    
    // Preencher automaticamente elementos dinâmicos
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = currentYear;
    });
    
    // Atualize o copyright no footer
    const copyrightElement = document.querySelector('.footer-bottom p');
    if (copyrightElement && copyrightElement.textContent.includes('2025')) {
        copyrightElement.textContent = copyrightElement.textContent.replace('2025', currentYear);
    }
});