/**
 * FAQ Page JavaScript
 * Funcionalidades específicas para a página de Perguntas Frequentes (FAQ)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o acordeão das perguntas
    initFaqAccordion();
    
    // Inicializa o filtro por categorias
    initCategoryFilter();
    
    // Inicializa a busca por palavra-chave
    initFaqSearch();
});

/**
 * Inicializa o acordeão (expand/collapse) das perguntas
 */
function initFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (!faqQuestions.length) return;
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Toggle da classe active na pergunta
            this.classList.toggle('active');
            
            // Expande ou colapsa a resposta
            const answer = this.nextElementSibling;
            
            if (this.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });
    
    // Abre a primeira pergunta por padrão
    const firstQuestion = faqQuestions[0];
    if (firstQuestion) {
        firstQuestion.classList.add('active');
        const firstAnswer = firstQuestion.nextElementSibling;
        firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
    }
    
    // Verifica se há um hash na URL para abrir diretamente uma pergunta específica
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetQuestion = document.getElementById(targetId);
        
        if (targetQuestion) {
            // Expande o grupo de FAQ se necessário
            const parentGroup = targetQuestion.closest('.faq-group');
            if (parentGroup) {
                // Rola para o início do grupo
                parentGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Expande a pergunta específica após um pequeno delay
                setTimeout(() => {
                    targetQuestion.classList.add('active');
                    const targetAnswer = targetQuestion.nextElementSibling;
                    targetAnswer.style.maxHeight = targetAnswer.scrollHeight + 'px';
                }, 500);
            }
        }
    }
}

/**
 * Inicializa o filtro por categorias
 */
function initCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-button');
    const faqGroups = document.querySelectorAll('.faq-group');
    
    if (!categoryButtons.length || !faqGroups.length) return;
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe active de todos os botões
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe active ao botão clicado
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Filtra os grupos de FAQ
            if (category === 'all') {
                // Mostra todos os grupos
                faqGroups.forEach(group => group.style.display = '');
            } else {
                // Mostra apenas o grupo selecionado
                faqGroups.forEach(group => {
                    if (group.id === category) {
                        group.style.display = '';
                    } else {
                        group.style.display = 'none';
                    }
                });
            }
            
            // Redefine a mensagem de "não encontrado"
            document.querySelector('.faq-not-found').style.display = '';
        });
    });
}

/**
 * Inicializa a busca por palavra-chave
 */
function initFaqSearch() {
    const searchForm = document.getElementById('faq-search-form');
    const searchInput = document.getElementById('faq-search');
    
    if (!searchForm || !searchInput) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // Também realiza a busca ao digitar (com debounce)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        const faqGroups = document.querySelectorAll('.faq-group');
        const notFoundMessage = document.querySelector('.faq-not-found');
        let resultsFound = false;
        
        // Redefine a classe active nos botões de categoria
        const allCategoryButton = document.querySelector('.category-button[data-category="all"]');
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        if (allCategoryButton) allCategoryButton.classList.add('active');
        
        // Mostra todos os grupos para a busca
        faqGroups.forEach(group => group.style.display = '');
        
        // Se a busca estiver vazia, mostra todas as perguntas
        if (searchTerm === '') {
            faqItems.forEach(item => {
                item.style.display = '';
                
                // Colapsa as respostas
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                
                if (question && answer) {
                    question.classList.remove('active');
                    answer.style.maxHeight = '0';
                }
            });
            
            resultsFound = true;
        } else {
            // Filtra as perguntas baseado no termo de busca
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                
                if (!question || !answer) return;
                
                const questionText = question.textContent.toLowerCase();
                const answerText = answer.textContent.toLowerCase();
                
                if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                    item.style.display = '';
                    resultsFound = true;
                    
                    // Expande as respostas que correspondem à busca
                    question.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    
                    // Destaca os termos de busca (opcional)
                    highlightSearchTerm(question, searchTerm);
                    highlightSearchTerm(answer, searchTerm);
                } else {
                    item.style.display = 'none';
                }
            });
        }
        
        // Verifica se há grupos sem itens visíveis e os oculta
        faqGroups.forEach(group => {
            const visibleItems = group.querySelectorAll('.faq-item[style="display: ;"]');
            if (visibleItems.length === 0) {
                group.style.display = 'none';
            }
        });
        
        // Mostra ou oculta a mensagem de "não encontrado"
        if (resultsFound || searchTerm === '') {
            notFoundMessage.style.display = 'none';
        } else {
            notFoundMessage.style.display = 'block';
        }
    }
    
    /**
     * Destaca o termo de busca no texto (opcional)
     */
    function highlightSearchTerm(element, term) {
        if (!element || !term) return;
        
        // Esta implementação é simplificada e serve apenas como exemplo
        // Em produção, seria melhor usar uma solução mais robusta para manipulação de DOM
        
        const originalHTML = element.innerHTML;
        const regex = new RegExp(`(${term})`, 'gi');
        const newHTML = originalHTML.replace(regex, '<mark>$1</mark>');
        
        element.innerHTML = newHTML;
    }
}