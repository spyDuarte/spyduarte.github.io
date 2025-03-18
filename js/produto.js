// produto.js - JavaScript específico da página de produto

document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidade de tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe ativa de todos os botões
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe ativa ao botão clicado
            this.classList.add('active');
            
            // Esconde todos os conteúdos de tab
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Mostra o conteúdo do tab selecionado
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Funcionalidade do seletor de quantidade
    const minusBtn = document.querySelector('.quantity-btn:first-child');
    const plusBtn = document.querySelector('.quantity-btn:last-child');
    const quantityInput = document.querySelector('.quantity-input');
    
    minusBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
            updateTotalPrice();
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        quantityInput.value = value + 1;
        updateTotalPrice();
    });
    
    quantityInput.addEventListener('change', function() {
        if (this.value < 1) {
            this.value = 1;
        }
        updateTotalPrice();
    });
    
    // Funcionalidade dos botões de opções
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe ativa dos botões irmãos
            const siblings = Array.from(this.parentNode.children);
            siblings.forEach(sibling => sibling.classList.remove('active'));
            
            // Adiciona a classe ativa ao botão clicado
            this.classList.add('active');
            
            // Aqui você pode adicionar a lógica para atualizar os preços com base na opção selecionada
            updateTotalPrice();
        });
    });
    
    // Funcionalidade da galeria de miniaturas
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image img');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Define a imagem principal como a miniatura clicada
            const imgSrc = this.querySelector('img').getAttribute('src');
            mainImage.setAttribute('src', imgSrc);
            
            // Efeito visual de transição
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.style.opacity = '1';
            }, 100);
        });
    });
    
    // Função para atualizar o preço total
    function updateTotalPrice() {
        const basePrice = 3499.00; // Preço base do produto (poderia ser dinâmico)
        const quantity = parseInt(quantityInput.value);
        
        // Adicione lógica para ajustar o preço com base nas opções selecionadas
        let additionalCost = 0;
        
        // Exemplo: verificando a opção de resina selecionada
        const selectedResin = document.querySelector('.option-group:first-child .option-btn.active');
        if (selectedResin) {
            const resinType = selectedResin.textContent;
            if (resinType === 'Verde Esmeralda') additionalCost += 200;
            if (resinType === 'Turquesa') additionalCost += 150;
            if (resinType === 'Âmbar') additionalCost += 100;
        }
        
        // Exemplo: verificando o acabamento de madeira selecionado
        const selectedWood = document.querySelector('.option-group:nth-child(2) .option-btn.active');
        if (selectedWood) {
            const woodType = selectedWood.textContent;
            if (woodType === 'Rústico Escuro') additionalCost += 150;
            if (woodType === 'Tabaco') additionalCost += 200;
        }
        
        // Calcula o preço total
        const totalPrice = (basePrice + additionalCost) * quantity;
        
        // Atualiza o preço exibido
        const priceElement = document.querySelector('.product-price');
        if (priceElement) {
            priceElement.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        }
    }
    
    // Inicializa a página
    updateTotalPrice();
    
    // Adiciona o produto ao carrinho (simulação)
    const addToCartBtn = document.querySelector('.action-buttons .btn:first-child');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Pega as informações do produto
            const productTitle = document.querySelector('.product-title').textContent;
            const productPrice = document.querySelector('.product-price').textContent;
            const quantity = parseInt(quantityInput.value);
            
            // Optções selecionadas
            const resinOption = document.querySelector('.option-group:first-child .option-btn.active').textContent;
            const woodOption = document.querySelector('.option-group:nth-child(2) .option-btn.active').textContent;
            
            // Cria uma mensagem de confirmação
            const confirmationMessage = document.createElement('div');
            confirmationMessage.className = 'add-to-cart-confirmation';
            confirmationMessage.innerHTML = `
                <div class="confirmation-inner">
                    <div class="confirmation-header">
                        <h3>Produto adicionado ao carrinho</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="confirmation-content">
                        <div class="product-info">
                            <img src="${mainImage.getAttribute('src')}" alt="${productTitle}">
                            <div class="info">
                                <h4>${productTitle}</h4>
                                <p>Quantidade: ${quantity}</p>
                                <p>Resina: ${resinOption}</p>
                                <p>Acabamento: ${woodOption}</p>
                                <p class="price">${productPrice}</p>
                            </div>
                        </div>
                        <div class="confirmation-actions">
                            <a href="#" class="btn btn-outline">Continuar Comprando</a>
                            <a href="#" class="btn">Finalizar Compra</a>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(confirmationMessage);
            
            // Adiciona estilos inline para a confirmação
            const style = document.createElement('style');
            style.textContent = `
                .add-to-cart-confirmation {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }
                
                .confirmation-inner {
                    background-color: white;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                
                .confirmation-header {
                    padding: 20px;
                    background-color: var(--primary);
                    color: white;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .confirmation-header h3 {
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                }
                
                .confirmation-content {
                    padding: 20px;
                }
                
                .product-info {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .product-info img {
                    width: 100px;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                
                .info h4 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    color: var(--dark);
                }
                
                .info p {
                    margin: 5px 0;
                    color: #666;
                }
                
                .info .price {
                    font-weight: 600;
                    color: var(--primary);
                    font-size: 18px;
                }
                
                .confirmation-actions {
                    display: flex;
                    justify-content: space-between;
                    gap: 15px;
                }
                
                .confirmation-actions a {
                    flex: 1;
                    text-align: center;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @media (max-width: 576px) {
                    .product-info {
                        flex-direction: column;
                    }
                    
                    .confirmation-actions {
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Fechar a confirmação
            const closeBtn = confirmationMessage.querySelector('.close-btn');
            const continueShoppingBtn = confirmationMessage.querySelector('.btn-outline');
            
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(confirmationMessage);
            });
            
            continueShoppingBtn.addEventListener('click', function(e) {
                e.preventDefault();
                document.body.removeChild(confirmationMessage);
            });
        });
    }
});