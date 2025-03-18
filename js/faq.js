// faq.js - JavaScript específico da página de FAQ

document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Toggle da classe ativa na questão
            this.classList.toggle('active');
            
            // Toggle da classe ativa na resposta
            const answer = this.nextElementSibling;
            answer.classList.toggle('active');
        });
    });
    
    // Filtros de categoria
    const categoryButtons = document.querySelectorAll('.category-button');
    const faqCategories = document.querySelectorAll('.faq-category');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe ativa de todos os botões
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona a classe ativa ao botão clicado
            this.classList.add('active');
            
            // Obtém a categoria
            const category = this.getAttribute('data-category');
            
            // Mostra/esconde categorias
            if (category === 'all') {
                faqCategories.forEach(cat => cat.style.display = 'block');
            } else {
                faqCategories.forEach(cat => {
                    if (cat.id === category) {
                        cat.style.display = 'block';
                    } else {
                        cat.style.display = 'none';
                    }
                });
            }
        });
    });
    
    // Funcionalidade de busca
    const searchInput = document.getElementById('faq-search');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Se o termo de busca estiver vazio, reseta a visualização
        if (searchTerm === '') {
            // Mostra todas as categorias
            faqCategories.forEach(cat => cat.style.display = 'block');
            
            // Reseta os botões de categoria
            categoryButtons.forEach(btn => {
                if (btn.getAttribute('data-category') === 'all') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Reseta as questões
            faqQuestions.forEach(question => {
                question.parentElement.style.display = 'block';
                question.classList.remove('active');
                question.nextElementSibling.classList.remove('active');
            });
            
            return;
        }
        
        // Mostra todas as categorias para a busca
        faqCategories.forEach(cat => cat.style.display = 'block');
        
        // Define o botão 'todas' como ativo
        categoryButtons.forEach(btn => {
            if (btn.getAttribute('data-category') === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Procura nas perguntas e respostas
        let hasResults = false;
        
        faqQuestions.forEach(question => {
            const questionText = question.textContent.toLowerCase();
            const answerText = question.nextElementSibling.textContent.toLowerCase();
            const faqItem = question.parentElement;
            
            if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                faqItem.style.display = 'block';
                question.classList.add('active');
                question.nextElementSibling.classList.add('active');
                
                // Destaca os termos encontrados
                highlightText(question, searchTerm);
                highlightText(question.nextElementSibling, searchTerm);
                
                hasResults = true;
            } else {
                faqItem.style.display = 'none';
            }
        });
        
        // Mostra mensagem se não houver resultados
        const noResultsMessage = document.getElementById('no-results-message');
        
        if (!hasResults) {
            if (!noResultsMessage) {
                const message = document.createElement('div');
                message.id = 'no-results-message';
                message.className = 'no-results';
                message.innerHTML = `
                    <p>Nenhum resultado encontrado para "<strong>${searchTerm}</strong>".</p>
                    <p>Tente termos diferentes ou entre em contato conosco para obter ajuda.</p>
                `;
                
                const faqContainer = document.querySelector('.faq-container');
                faqContainer.appendChild(message);
                
                // Adiciona estilos inline para a mensagem
                const style = document.createElement('style');
                style.textContent = `
                    .no-results {
                        text-align: center;
                        padding: 40px 20px;
                        background-color: #f9f9f9;
                        border-radius: 8px;
                        margin-top: 30px;
                    }
                    
                    .no-results p {
                        margin-bottom: 10px;
                        color: #666;
                    }
                    
                    .no-results strong {
                        color: var(--primary);
                    }
                `;
                document.head.appendChild(style);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    });
    
    // Função para destacar o texto encontrado
    function highlightText(element, term) {
        const text = element.innerHTML;
        const regex = new RegExp(term, 'gi');
        
        // Evita re-destacar texto já destacado
        if (!text.includes('<mark>')) {
            element.innerHTML = text.replace(regex, match => `<mark>${match}</mark>`);
            
            // Adiciona estilos inline para o destaque
            const style = document.createElement('style');
            style.textContent = `
                mark {
                    background-color: #ffe066;
                    padding: 0 2px;
                    border-radius: 2px;
                }
            `;
            
            if (!document.querySelector('style[data-highlight]')) {
                style.setAttribute('data-highlight', 'true');
                document.head.appendChild(style);
            }
        }
    }
    
    // Função para scroll automático até a questão quando clicada em um link direto
    function jumpToQuestion() {
        if (window.location.hash) {
            const questionId = window.location.hash.substring(1);
            const targetQuestion = document.getElementById(questionId);
            
            if (targetQuestion) {
                // Abre a questão
                targetQuestion.classList.add('active');
                targetQuestion.nextElementSibling.classList.add('active');
                
                // Scroll até a questão com um pequeno atraso
                setTimeout(() => {
                    targetQuestion.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            }
        }
    }
    
    // Executa o scroll quando a página é carregada
    jumpToQuestion();
});