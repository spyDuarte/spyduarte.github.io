/**
 * Forms Component
 * Manipula validação e envio de formulários no site
 */

/**
 * Inicializa a validação e comportamentos de formulários
 */
export function initForms() {
    // Inicializa validação para todos os formulários com a classe .validate-form
    const forms = document.querySelectorAll('.validate-form, #contact-form, .newsletter-form, #faq-search-form');
    
    forms.forEach(form => {
        if (!form) return;
        
        // Adiciona validação no envio do formulário
        form.addEventListener('submit', function(e) {
            // Previne envio direto para validar primeiro
            if (!form.classList.contains('no-validate')) {
                e.preventDefault();
                
                if (validateForm(form)) {
                    // Se validação bem-sucedida, verifica se temos recursos offline
                    if ('serviceWorker' in navigator && 'SyncManager' in window) {
                        trySubmitWithBackgroundSync(form);
                    } else {
                        // Fallback para envio tradicional
                        form.submit();
                    }
                }
            }
        });
        
        // Validação em tempo real para campos
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // Validação ao sair do campo
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            // Remove erro ao começar a digitar novamente
            input.addEventListener('input', function() {
                if (input.classList.contains('error')) {
                    input.classList.remove('error');
                    const errorMessage = input.parentNode.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.remove();
                    }
                }
            });
        });
    });
    
    // Inicializa máscaras para campos específicos
    initInputMasks();
    
    // Inicializa comportamento para upload de arquivos
    initFileUploads();
    
    // Inicializa limites de caracteres em textareas
    initCharacterLimits();
}

/**
 * Valida um formulário completo
 * @param {HTMLFormElement} form - Formulário a ser validado
 * @return {Boolean} - Indicador se a validação passou
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select');
    let isValid = true;
    
    // Remove mensagens de erro anteriores
    const previousErrors = form.querySelectorAll('.error-message');
    previousErrors.forEach(error => error.remove());
    
    // Valida cada campo
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Valida um campo específico
 * @param {HTMLElement} field - Campo a ser validado
 * @return {Boolean} - Indicador se a validação passou
 */
function validateField(field) {
    // Skip se o campo estiver desabilitado ou for do tipo hidden/submit
    if (field.disabled || field.type === 'hidden' || field.type === 'submit') {
        return true;
    }
    
    // Remove mensagens de erro anteriores
    const previousError = field.parentNode.querySelector('.error-message');
    if (previousError) {
        previousError.remove();
    }
    
    field.classList.remove('error');
    let isValid = true;
    let errorMessage = '';
    
    // Valida campos obrigatórios
    if (field.required && field.value.trim() === '') {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
    }
    
    // Validações específicas por tipo
    else if (field.type === 'email' && field.value.trim() !== '') {
        // Regex simples para validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Por favor, insira um email válido.';
        }
    }
    
    else if (field.type === 'tel' && field.value.trim() !== '') {
        // Validação básica de telefone (adaptar conforme necessário)
        const phoneRegex = /^(\+?\d{1,3}[- ]?)?\(?\d{2}\)?[- ]?\d{4,5}[- ]?\d{4}$/;
        if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Por favor, insira um telefone válido.';
        }
    }
    
    // Validação personalizada por atributo data
    else if (field.dataset.minLength && field.value.length < parseInt(field.dataset.minLength)) {
        isValid = false;
        errorMessage = `Este campo deve ter pelo menos ${field.dataset.minLength} caracteres.`;
    }
    
    // Validação para concordância com termos
    else if (field.type === 'checkbox' && field.name === 'consent' && !field.checked) {
        isValid = false;
        errorMessage = 'Você precisa concordar com os termos para continuar.';
    }
    
    // Validação para arquivos
    else if (field.type === 'file' && field.files.length > 0) {
        // Verificação de tamanho de arquivo
        if (field.dataset.maxSize && field.files[0].size > parseInt(field.dataset.maxSize) * 1024 * 1024) {
            isValid = false;
            errorMessage = `O arquivo deve ter no máximo ${field.dataset.maxSize}MB.`;
        }
        
        // Verificação de tipo de arquivo
        if (field.accept) {
            const acceptedTypes = field.accept.split(',').map(type => type.trim());
            const fileType = field.files[0].type;
            const fileExtension = '.' + field.files[0].name.split('.').pop().toLowerCase();
            
            // Verifica se o tipo do arquivo ou sua extensão estão entre os aceitos
            const isAccepted = acceptedTypes.some(type => {
                return fileType.includes(type.replace('*', '')) || type === fileExtension;
            });
            
            if (!isAccepted) {
                isValid = false;
                errorMessage = 'Formato de arquivo não permitido.';
            }
        }
    }
    
    // Se não for válido, adiciona classe de erro e mensagem
    if (!isValid) {
        field.classList.add('error');
        
        // Cria e insere a mensagem de erro
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        
        // Adiciona a mensagem após o campo
        field.parentNode.appendChild(errorElement);
    }
    
    return isValid;
}

/**
 * Tenta enviar o formulário usando Background Sync do Service Worker
 * quando disponível, para funcionalidade offline
 */
function trySubmitWithBackgroundSync(form) {
    // Verifica se o navegador suporta recursos necessários
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
        form.submit();
        return;
    }
    
    // Coleta os dados do formulário
    const formData = new FormData(form);
    const formObject = {};
    
    formData.forEach((value, key) => {
        formObject[key] = value;
    });
    
    // Armazena os dados no IndexedDB para processamento posterior
    // Isso é uma simplificação - em produção usaria uma biblioteca para IndexedDB
    localStorage.setItem('pending_form_' + Date.now(), JSON.stringify({
        url: form.action,
        method: form.method,
        data: formObject,
        timestamp: Date.now()
    }));
    
    // Registra uma tarefa de sincronização
    navigator.serviceWorker.ready
        .then(registration => {
            return registration.sync.register('submit-form');
        })
        .then(() => {
            // Exibe mensagem de sucesso para o usuário
            showFormMessage(form, 'Seu formulário foi salvo e será enviado automaticamente quando houver conexão.', 'success');
            
            // Limpa o formulário
            form.reset();
        })
        .catch(err => {
            // Fallback para envio tradicional em caso de erro
            console.error('Falha na sincronização em segundo plano:', err);
            form.submit();
        });
}

/**
 * Inicializa máscaras para campos específicos
 */
function initInputMasks() {
    // Máscara para telefone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove caracteres não numéricos
            let value = e.target.value.replace(/\D/g, '');
            
            // Aplica formatação conforme o número de dígitos
            if (value.length <= 2) {
                // Apenas DDD
                e.target.value = value;
            } else if (value.length <= 6) {
                // DDD + Primeiros dígitos
                e.target.value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            } else if (value.length <= 10) {
                // Telefone fixo
                e.target.value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
            } else {
                // Celular
                e.target.value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
            }
        });
    });
}

/**
 * Inicializa comportamento para upload de arquivos
 */
function initFileUploads() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Atualiza o texto do label com o nome do arquivo selecionado
            const fileNameElement = input.parentNode.querySelector('.file-name');
            
            if (fileNameElement) {
                if (input.files.length > 0) {
                    fileNameElement.textContent = input.files[0].name;
                    fileNameElement.style.display = 'block';
                } else {
                    fileNameElement.textContent = '';
                    fileNameElement.style.display = 'none';
                }
            }
        });
    });
}

/**
 * Inicializa contagem de caracteres em textareas
 */
function initCharacterLimits() {
    const textareas = document.querySelectorAll('textarea[maxlength]');
    
    textareas.forEach(textarea => {
        // Cria contador
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        updateCounter(textarea, counter);
        
        // Insere após o textarea
        textarea.parentNode.appendChild(counter);
        
        // Atualiza contador ao digitar
        textarea.addEventListener('input', function() {
            updateCounter(textarea, counter);
        });
    });
    
    function updateCounter(textarea, counter) {
        const maxLength = textarea.getAttribute('maxlength');
        const currentLength = textarea.value.length;
        const remaining = maxLength - currentLength;
        
        counter.textContent = `${currentLength}/${maxLength} caracteres`;
        
        // Destaca quando estiver próximo do limite
        if (remaining < 20) {
            counter.classList.add('near-limit');
        } else {
            counter.classList.remove('near-limit');
        }
    }
}

/**
 * Exibe uma mensagem após o envio do formulário
 */
export function showFormMessage(form, message, type = 'success') {
    // Busca ou cria o container de mensagens
    let messageContainer = form.querySelector('.form-messages');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'form-messages';
        form.prepend(messageContainer);
    }
    
    // Limpa o container
    messageContainer.innerHTML = '';
    messageContainer.className = `form-messages ${type}`;
    
    // Adiciona a mensagem
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
    
    // Rola até a mensagem
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Opcionalmente define um timeout para sumir
    if (type === 'success') {
        setTimeout(() => {
            messageContainer.style.opacity = '0';
            setTimeout(() => {
                messageContainer.style.display = 'none';
                messageContainer.style.opacity = '1';
            }, 300);
        }, 5000);
    }
}