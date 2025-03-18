/**
 * Navigation Component
 * Manipula o comportamento da navegação e menu mobile
 */

/**
 * Inicializa o comportamento do cabeçalho
 */
export function initHeader() {
    // Adiciona classe ao cabeçalho quando rolar a página
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.site-header');
        
        if (!header) return;
        
        if (window.scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Verifica o estado inicial (caso a página já esteja com scroll)
    if (window.scrollY > 0) {
        document.querySelector('.site-header')?.classList.add('scrolled');
    }
}

/**
 * Inicializa o menu mobile
 */
export function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('main-menu');
    
    if (!menuToggle || !mainMenu) return;
    
    // Toggle do menu mobile
    menuToggle.addEventListener('click', function() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainMenu.classList.toggle('active');
        
        // Adiciona/remove a classe no body para previnir scroll quando o menu estiver aberto
        document.body.classList.toggle('menu-open', !isExpanded);
    });
    
    // Fecha o menu ao clicar em qualquer item do menu (em mobile)
    const menuItems = mainMenu.querySelectorAll('a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Verifica se é uma visualização mobile (baseado no elemento toggle ser visível)
            if (getComputedStyle(menuToggle).display !== 'none') {
                menuToggle.setAttribute('aria-expanded', 'false');
                mainMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });
    
    // Fecha o menu ao pressionar a tecla Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mainMenu.classList.contains('active')) {
            menuToggle.setAttribute('aria-expanded', 'false');
            mainMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Fecha o menu ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mainMenu.classList.contains('active')) {
            menuToggle.setAttribute('aria-expanded', 'false');
            mainMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

/**
 * Inicializa submenus em desktop e mobile
 * (Se o site tiver submenus na navegação)
 */
export function initSubmenus() {
    const hasSubmenuItems = document.querySelectorAll('.menu-item-has-children');
    
    if (!hasSubmenuItems.length) return;
    
    hasSubmenuItems.forEach(item => {
        // Adiciona toggle button para submenus
        const submenuToggle = document.createElement('button');
        submenuToggle.className = 'submenu-toggle';
        submenuToggle.setAttribute('aria-expanded', 'false');
        submenuToggle.innerHTML = '<span class="sr-only">Expandir</span><span class="icon"></span>';
        
        item.insertBefore(submenuToggle, item.querySelector('.sub-menu'));
        
        // Evento de clique para mostrar/ocultar submenu
        submenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            const submenu = this.nextElementSibling;
            
            if (submenu) {
                if (isExpanded) {
                    submenu.classList.remove('active');
                    // Fecha submenus aninhados
                    const nestedSubmenus = submenu.querySelectorAll('.sub-menu.active');
                    nestedSubmenus.forEach(nested => nested.classList.remove('active'));
                    
                    const nestedToggles = submenu.querySelectorAll('.submenu-toggle[aria-expanded="true"]');
                    nestedToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
                } else {
                    // Fecha outros submenus abertos no mesmo nível
                    const siblingSubmenus = item.parentNode.querySelectorAll('.sub-menu.active');
                    siblingSubmenus.forEach(sibling => {
                        if (sibling !== submenu) {
                            sibling.classList.remove('active');
                            const siblingToggle = sibling.previousElementSibling;
                            if (siblingToggle && siblingToggle.classList.contains('submenu-toggle')) {
                                siblingToggle.setAttribute('aria-expanded', 'false');
                            }
                        }
                    });
                    
                    submenu.classList.add('active');
                }
            }
        });
        
        // Para desktop - comportamento hover
        if (window.innerWidth > 768) {
            item.addEventListener('mouseenter', function() {
                this.querySelector('.sub-menu')?.classList.add('active');
                this.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', 'true');
            });
            
            item.addEventListener('mouseleave', function() {
                this.querySelector('.sub-menu')?.classList.remove('active');
                this.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', 'false');
            });
        }
    });
    
    // Fecha todos os submenus ao clicar fora do menu
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.menu')) {
            const activeSubmenus = document.querySelectorAll('.sub-menu.active');
            const expandedToggles = document.querySelectorAll('.submenu-toggle[aria-expanded="true"]');
            
            activeSubmenus.forEach(submenu => submenu.classList.remove('active'));
            expandedToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
        }
    });
}

/**
 * Inicializa a navegação ativa - destaca item atual
 */
export function initActiveNavigation() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu a');
    
    menuItems.forEach(item => {
        const itemPath = item.getAttribute('href');
        
        // Se o caminho do item corresponder ao caminho atual (ou for a página inicial)
        if (
            (itemPath === '/' && currentPath === '/') ||
            (itemPath !== '/' && currentPath.includes(itemPath))
        ) {
            // Adiciona classe ao item do menu
            item.parentElement.classList.add('current-menu-item');
            
            // Se o item estiver dentro de um submenu, marca o item pai também
            const parentMenuItem = item.closest('.menu-item-has-children');
            if (parentMenuItem) {
                parentMenuItem.classList.add('current-menu-parent');
            }
        }
    });
}