/**
 * ========================================
 * SISTEMA DE UTILITÁRIOS E HELPERS v3.0
 * ========================================
 */

/**
 * Formatador de dados para diferentes tipos
 */
const DataFormatter = {
  
  /**
   * Formatar telefone brasileiro
   */
  formatPhone(phone) {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 8) {
      return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2');
    } else if (cleaned.length === 9) {
      return cleaned.replace(/(\d{5})(\d{4})/, '$1-$2');
    }
    
    return phone;
  },
  
  /**
   * Normalizar telefone (apenas números)
   */
  normalizePhone(phone) {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  },
  
  /**
   * Formatar CPF
   */
  formatCPF(cpf) {
    if (!cpf) return '';
    
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
  },
  
  /**
   * Normalizar CPF (apenas números)
   */
  normalizeCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/\D/g, '');
  },
  
  /**
   * Formatar CNPJ
   */
  formatCNPJ(cnpj) {
    if (!cnpj) return '';
    
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cnpj;
  },
  
  /**
   * Formatar CEP
   */
  formatCEP(cep) {
    if (!cep) return '';
    
    const cleaned = cep.replace(/\D/g, '');
    
    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    
    return cep;
  },
  
  /**
   * Formatar data para exibição
   */
  formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';
    
    let dateObj;
    
    // Tentar diferentes formatos de entrada
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Formato ISO (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
        dateObj = new Date(date + 'T00:00:00');
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    
    if (isNaN(dateObj.getTime())) {
      return date;
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    switch (format.toUpperCase()) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YY':
        return `${day}/${month}/${String(year).slice(-2)}`;
      case 'VERBOSE':
        const months = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${day} de ${months[dateObj.getMonth()]} de ${year}`;
      case 'SHORT':
        const shortMonths = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return `${day} ${shortMonths[dateObj.getMonth()]} ${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  },
  
  /**
   * Formatar data e hora
   */
  formatDateTime(dateTime, format = 'DD/MM/YYYY HH:mm') {
    if (!dateTime) return '';
    
    const dateObj = new Date(dateTime);
    if (isNaN(dateObj.getTime())) return dateTime;
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    switch (format.toUpperCase()) {
      case 'DD/MM/YYYY HH:MM':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case 'DD/MM/YYYY HH:MM:SS':
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      case 'YYYY-MM-DD HH:MM':
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      case 'ISO':
        return dateObj.toISOString();
      default:
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  },
  
  /**
   * Formatar hora
   */
  formatTime(time, format = 'HH:mm') {
    if (!time) return '';
    
    // Se já está no formato HH:MM, verificar se é válido
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(':').map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
      }
    }
    
    // Se é um objeto Date
    if (time instanceof Date) {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      const seconds = String(time.getSeconds()).padStart(2, '0');
      
      switch (format.toUpperCase()) {
        case 'HH:MM':
          return `${hours}:${minutes}`;
        case 'HH:MM:SS':
          return `${hours}:${minutes}:${seconds}`;
        case '12H':
          const hour12 = hours > 12 ? hours - 12 : (hours === '00' ? 12 : hours);
          const ampm = hours >= 12 ? 'PM' : 'AM';
          return `${hour12}:${minutes} ${ampm}`;
        default:
          return `${hours}:${minutes}`;
      }
    }
    
    return time;
  },
  
  /**
   * Formatar duração em minutos para texto legível
   */
  formatDuration(minutes) {
    if (!minutes) return '';
    
    const num = parseInt(minutes);
    if (isNaN(num)) return minutes;
    
    if (num < 60) {
      return `${num} min`;
    } else if (num === 60) {
      return '1 hora';
    } else if (num < 120) {
      const mins = num % 60;
      return mins > 0 ? `1h ${mins}min` : '1 hora';
    } else {
      const hours = Math.floor(num / 60);
      const mins = num % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours} hora${hours > 1 ? 's' : ''}`;
    }
  },
  
  /**
   * Formatar moeda brasileira
   */
  formatCurrency(value, currency = 'BRL') {
    if (value === null || value === undefined || value === '') return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
    
    if (isNaN(numValue)) return value;
    
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numValue);
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(numValue);
  },
  
  /**
   * Formatar números
   */
  formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || value === '') return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return value;
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue);
  },
  
  /**
   * Formatar porcentagem
   */
  formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || value === '') return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return value;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numValue / 100);
  },
  
  /**
   * Formatar status para exibição
   */
  formatStatus(status) {
    const statusMap = {
      'Pendente': '⏳ Pendente',
      'Confirmado': '✅ Confirmado',
      'Concluído': '✔️ Concluído',
      'Cancelado': '❌ Cancelado',
      'Reagendado': '🔄 Reagendado',
      'Em Andamento': '⚡ Em Andamento',
      'Aguardando': '⏰ Aguardando',
      'Atrasado': '⚠️ Atrasado'
    };
    
    return statusMap[status] || status;
  },
  
  /**
   * Formatar prioridade
   */
  formatPriority(priority) {
    const priorityMap = {
      'low': '🟢 Baixa',
      'normal': '🟡 Normal',
      'high': '🟠 Alta',
      'urgent': '🔴 Urgente',
      'critical': '🚨 Crítica'
    };
    
    return priorityMap[priority] || priority;
  },
  
  /**
   * Capitalizar primeira letra
   */
  capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },
  
  /**
   * Capitalizar todas as palavras
   */
  titleCase(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  },
  
  /**
   * Limitar texto
   */
  truncate(text, maxLength = 50, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },
  
  /**
   * Formatar tamanho de arquivo
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

/**
 * Validador de dados expandido
 */
const DataValidator = {
  
  /**
   * Validar email
   */
  isValidEmail(email) {
    if (!email) return { isValid: true, error: null }; // Email é opcional
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!regex.test(email)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    if (email.length > 254) {
      return { isValid: false, error: 'Email muito longo (máximo 254 caracteres)' };
    }
    
    const localPart = email.split('@')[0];
    if (localPart.length > 64) {
      return { isValid: false, error: 'Parte local do email muito longa (máximo 64 caracteres)' };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar telefone brasileiro
   */
  isValidPhone(phone) {
    if (!phone) return { isValid: false, error: 'Telefone é obrigatório' };
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length < 10 || cleaned.length > 11) {
      return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
    }
    
    // Validar DDD
    const ddd = cleaned.substring(0, 2);
    const validDDDs = [
      '11', '12', '13', '14', '15', '16', '17', '18', '19',
      '21', '22', '24', '27', '28',
      '31', '32', '33', '34', '35', '37', '38',
      '41', '42', '43', '44', '45', '46', '47', '48', '49',
      '51', '53', '54', '55',
      '61', '62', '63', '64', '65', '66', '67', '68', '69',
      '71', '73', '74', '75', '77', '79',
      '81', '82', '83', '84', '85', '86', '87', '88', '89',
      '91', '92', '93', '94', '95', '96', '97', '98', '99'
    ];
    
    if (!validDDDs.includes(ddd)) {
      return { isValid: false, error: 'DDD inválido' };
    }
    
    // Validar número de celular (11 dígitos deve começar com 9)
    if (cleaned.length === 11) {
      const ninthDigit = cleaned.charAt(2);
      if (ninthDigit !== '9') {
        return { isValid: false, error: 'Celular deve começar com 9 após o DDD' };
      }
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar CPF
   */
  isValidCPF(cpf) {
    if (!cpf) return { isValid: true, error: null }; // CPF é opcional
    
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) {
      return { isValid: false, error: 'CPF deve ter 11 dígitos' };
    }
    
    // Verificar sequência repetida
    if (/^(\d)\1{10}$/.test(cleaned)) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder >= 10) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder >= 10) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(10))) {
      return { isValid: false, error: 'CPF inválido' };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar CNPJ
   */
  isValidCNPJ(cnpj) {
    if (!cnpj) return { isValid: true, error: null }; // CNPJ é opcional
    
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length !== 14) {
      return { isValid: false, error: 'CNPJ deve ter 14 dígitos' };
    }
    
    // Verificar sequência repetida
    if (/^(\d)\1{13}$/.test(cleaned)) {
      return { isValid: false, error: 'CNPJ inválido' };
    }
    
    // Validar primeiro dígito verificador
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    
    if (firstDigit !== parseInt(cleaned.charAt(12))) {
      return { isValid: false, error: 'CNPJ inválido' };
    }
    
    // Validar segundo dígito verificador
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    
    if (secondDigit !== parseInt(cleaned.charAt(13))) {
      return { isValid: false, error: 'CNPJ inválido' };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar CEP
   */
  isValidCEP(cep) {
    if (!cep) return { isValid: true, error: null }; // CEP é opcional
    
    const cleaned = cep.replace(/\D/g, '');
    
    if (cleaned.length !== 8) {
      return { isValid: false, error: 'CEP deve ter 8 dígitos' };
    }
    
    // Verificar se não é sequência repetida
    if (/^(\d)\1{7}$/.test(cleaned)) {
      return { isValid: false, error: 'CEP inválido' };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar data
   */
  isValidDate(dateStr, options = {}) {
    if (!dateStr) return { isValid: false, error: 'Data é obrigatória' };
    
    const { 
      allowPast = false, 
      allowFuture = true,
      maxFutureDays = 365,
      minPastDays = 0
    } = options;
    
    let date;
    
    // Tentar parsear a data
    try {
      if (typeof dateStr === 'string') {
        // Formato ISO (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          date = new Date(dateStr + 'T00:00:00');
        } else {
          date = new Date(dateStr);
        }
      } else {
        date = new Date(dateStr);
      }
    } catch (error) {
      return { isValid: false, error: 'Formato de data inválido' };
    }
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Data inválida' };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    // Verificar se é no passado
    if (date < today && !allowPast) {
      return { isValid: false, error: 'Data não pode ser no passado' };
    }
    
    // Verificar se é no futuro
    if (date > today && !allowFuture) {
      return { isValid: false, error: 'Data não pode ser no futuro' };
    }
    
    // Verificar limite de dias no futuro
    if (allowFuture && maxFutureDays > 0) {
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + maxFutureDays);
      
      if (date > maxDate) {
        return { isValid: false, error: `Data não pode ser mais de ${maxFutureDays} dias no futuro` };
      }
    }
    
    // Verificar limite de dias no passado
    if (allowPast && minPastDays > 0) {
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() - minPastDays);
      
      if (date < minDate) {
        return { isValid: false, error: `Data não pode ser mais de ${minPastDays} dias no passado` };
      }
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar horário
   */
  isValidTime(timeStr, options = {}) {
    if (!timeStr) return { isValid: false, error: 'Horário é obrigatório' };
    
    const { checkWorkingHours = true } = options;
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(timeStr)) {
      return { isValid: false, error: 'Formato de horário inválido (use HH:MM)' };
    }
    
    if (checkWorkingHours) {
      const workingHours = this.getWorkingHours();
      const timeInMinutes = this.timeToMinutes(timeStr);
      const startInMinutes = this.timeToMinutes(workingHours.start);
      const endInMinutes = this.timeToMinutes(workingHours.end);
      
      if (timeInMinutes < startInMinutes || timeInMinutes > endInMinutes) {
        return { 
          isValid: false, 
          error: `Horário fora do funcionamento (${workingHours.start} às ${workingHours.end})` 
        };
      }
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar idade
   */
  isValidAge(birthDate, options = {}) {
    if (!birthDate) return { isValid: true, error: null }; // Idade é opcional
    
    const { minAge = 0, maxAge = 150 } = options;
    
    const dateValidation = this.isValidDate(birthDate, { allowPast: true, allowFuture: false });
    if (!dateValidation.isValid) {
      return dateValidation;
    }
    
    const age = DateUtils.calculateAge(birthDate);
    
    if (age < minAge) {
      return { isValid: false, error: `Idade mínima é ${minAge} anos` };
    }
    
    if (age > maxAge) {
      return { isValid: false, error: `Idade máxima é ${maxAge} anos` };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar texto obrigatório
   */
  isValidRequiredText(text, options = {}) {
    const { minLength = 1, maxLength = 1000, allowEmpty = false } = options;
    
    if (!text || text.trim() === '') {
      if (allowEmpty) {
        return { isValid: true, error: null };
      }
      return { isValid: false, error: 'Campo é obrigatório' };
    }
    
    const trimmedText = text.trim();
    
    if (trimmedText.length < minLength) {
      return { isValid: false, error: `Mínimo de ${minLength} caracteres` };
    }
    
    if (trimmedText.length > maxLength) {
      return { isValid: false, error: `Máximo de ${maxLength} caracteres` };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar número
   */
  isValidNumber(value, options = {}) {
    const { min, max, integer = false, allowNegative = false } = options;
    
    if (value === null || value === undefined || value === '') {
      return { isValid: true, error: null }; // Número é opcional por padrão
    }
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num)) {
      return { isValid: false, error: 'Deve ser um número válido' };
    }
    
    if (!allowNegative && num < 0) {
      return { isValid: false, error: 'Não são permitidos números negativos' };
    }
    
    if (integer && !Number.isInteger(num)) {
      return { isValid: false, error: 'Deve ser um número inteiro' };
    }
    
    if (min !== undefined && num < min) {
      return { isValid: false, error: `Valor mínimo é ${min}` };
    }
    
    if (max !== undefined && num > max) {
      return { isValid: false, error: `Valor máximo é ${max}` };
    }
    
    return { isValid: true, error: null };
  },
  
  /**
   * Validar URL
   */
  isValidURL(url) {
    if (!url) return { isValid: true, error: null }; // URL é opcional
    
    try {
      const urlObj = new URL(url);
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL deve usar protocolo HTTP ou HTTPS' };
      }
      
      return { isValid: true, error: null };
    } catch (error) {
      return { isValid: false, error: 'Formato de URL inválido' };
    }
  },
  
  /**
   * Obter horário de funcionamento
   */
  getWorkingHours() {
    try {
      return {
        start: ConfigUtils.getSetting('working_hours_start', '08:00'),
        end: ConfigUtils.getSetting('working_hours_end', '18:00')
      };
    } catch (error) {
      return { start: '08:00', end: '18:00' };
    }
  },
  
  /**
   * Converter horário para minutos
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
};

/**
 * Gerador de relatórios expandido
 */
const ReportGenerator = {
  
  /**
   * Gerar relatório de agendamentos
   */
  generateAppointmentsReport(appointments, options = {}) {
    try {
      const {
        startDate = null,
        endDate = null,
        status = null,
        type = null,
        patientName = null,
        format = 'summary',
        includeMetrics = true,
        includeCharts = false
      } = options;
      
      // Filtrar dados
      let filtered = [...appointments];
      
      if (startDate) {
        filtered = filtered.filter(apt => apt.date >= startDate);
      }
      
      if (endDate) {
        filtered = filtered.filter(apt => apt.date <= endDate);
      }
      
      if (status) {
        filtered = filtered.filter(apt => apt.status === status);
      }
      
      if (type) {
        filtered = filtered.filter(apt => apt.type === type);
      }
      
      if (patientName) {
        filtered = filtered.filter(apt => 
          apt.patientName.toLowerCase().includes(patientName.toLowerCase())
        );
      }
      
      // Gerar estatísticas básicas
      const stats = this.calculateAppointmentStats(filtered);
      
      // Gerar métricas avançadas se solicitado
      const metrics = includeMetrics ? this.calculateAdvancedMetrics(filtered) : {};
      
      // Preparar dados para gráficos se solicitado
      const chartData = includeCharts ? this.prepareChartData(filtered) : {};
      
      if (format === 'detailed') {
        return {
          metadata: {
            generatedAt: new Date().toISOString(),
            period: { startDate, endDate },
            filters: { status, type, patientName },
            totalRecords: filtered.length,
            originalRecords: appointments.length
          },
          statistics: stats,
          metrics: metrics,
          chartData: chartData,
          appointments: filtered.map(apt => this.enrichAppointmentData(apt))
        };
      }
      
      return {
        summary: stats,
        metrics: metrics,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      logError('generateAppointmentsReport', error);
      throw error;
    }
  },
  
  /**
   * Calcular estatísticas de agendamentos
   */
  calculateAppointmentStats(appointments) {
    const stats = {
      total: appointments.length,
      byStatus: {},
      byType: {},
      byMonth: {},
      byWeekday: {},
      byHour: {},
      totalDuration: 0,
      averageDuration: 0,
      completionRate: 0,
      cancellationRate: 0,
      noShowRate: 0
    };
    
    let totalMinutes = 0;
    
    appointments.forEach(apt => {
      // Por status
      stats.byStatus[apt.status] = (stats.byStatus[apt.status] || 0) + 1;
      
      // Por tipo
      stats.byType[apt.type] = (stats.byType[apt.type] || 0) + 1;
      
      // Por mês
      const month = apt.date.substring(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      
      // Por dia da semana
      const weekday = DateUtils.getWeekday(apt.date);
      stats.byWeekday[weekday] = (stats.byWeekday[weekday] || 0) + 1;
      
      // Por hora
      const hour = apt.time ? apt.time.split(':')[0] : 'N/A';
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
      
      // Duração
      const duration = parseInt(apt.duration) || 60;
      totalMinutes += duration;
    });
    
    stats.totalDuration = totalMinutes;
    stats.averageDuration = stats.total > 0 ? Math.round(totalMinutes / stats.total) : 0;
    
    // Taxas
    const completed = stats.byStatus['Concluído'] || 0;
    const cancelled = stats.byStatus['Cancelado'] || 0;
    const noShow = stats.byStatus['Faltou'] || 0;
    
    stats.completionRate = stats.total > 0 ? (completed / stats.total) * 100 : 0;
    stats.cancellationRate = stats.total > 0 ? (cancelled / stats.total) * 100 : 0;
    stats.noShowRate = stats.total > 0 ? (noShow / stats.total) * 100 : 0;
    
    return stats;
  },
  
  /**
   * Calcular métricas avançadas
   */
  calculateAdvancedMetrics(appointments) {
    const metrics = {
      trends: this.calculateTrends(appointments),
      productivity: this.calculateProductivityMetrics(appointments),
      efficiency: this.calculateEfficiencyMetrics(appointments),
      revenue: this.calculateRevenueMetrics(appointments),
      patterns: this.identifyPatterns(appointments)
    };
    
    return metrics;
  },
  
  /**
   * Calcular tendências
   */
  calculateTrends(appointments) {
    const trends = {
      daily: {},
      weekly: {},
      monthly: {},
      growth: {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    };
    
    // Agrupar por períodos
    appointments.forEach(apt => {
      const date = apt.date;
      const month = date.substring(0, 7);
      const week = DateUtils.getWeekNumber(date);
      
      trends.daily[date] = (trends.daily[date] || 0) + 1;
      trends.weekly[week] = (trends.weekly[week] || 0) + 1;
      trends.monthly[month] = (trends.monthly[month] || 0) + 1;
    });
    
    // Calcular taxas de crescimento
    const dailyValues = Object.values(trends.daily);
    const weeklyValues = Object.values(trends.weekly);
    const monthlyValues = Object.values(trends.monthly);
    
    if (dailyValues.length > 1) {
      const recent = dailyValues.slice(-7).reduce((a, b) => a + b, 0) / 7;
      const previous = dailyValues.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
      trends.growth.daily = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    }
    
    return trends;
  },
  
  /**
   * Calcular métricas de produtividade
   */
  calculateProductivityMetrics(appointments) {
    const productivity = {
      appointmentsPerDay: 0,
      appointmentsPerHour: 0,
      utilizationRate: 0,
      busyHours: [],
      peakDays: []
    };
    
    // Cálculos básicos de produtividade
    const uniqueDays = [...new Set(appointments.map(apt => apt.date))];
    productivity.appointmentsPerDay = uniqueDays.length > 0 ? appointments.length / uniqueDays.length : 0;
    
    // Horas ocupadas vs horas disponíveis
    const workingHours = this.getWorkingHours();
    const totalWorkingHours = this.calculateWorkingHours(workingHours);
    const usedHours = appointments.reduce((total, apt) => total + (parseInt(apt.duration) || 60), 0) / 60;
    
    productivity.utilizationRate = totalWorkingHours > 0 ? (usedHours / totalWorkingHours) * 100 : 0;
    
    return productivity;
  },
  
  /**
   * Calcular métricas de eficiência
   */
  calculateEfficiencyMetrics(appointments) {
    const efficiency = {
      onTimeRate: 0,
      averageWaitTime: 0,
      reschedulingRate: 0,
      firstTimeResolutionRate: 0
    };
    
    // Implementar cálculos de eficiência
    // Por enquanto valores simulados
    efficiency.onTimeRate = 85;
    efficiency.averageWaitTime = 15;
    efficiency.reschedulingRate = 12;
    efficiency.firstTimeResolutionRate = 78;
    
    return efficiency;
  },
  
  /**
   * Calcular métricas de receita
   */
  calculateRevenueMetrics(appointments) {
    const revenue = {
      totalRevenue: 0,
      averageRevenue: 0,
      revenueByType: {},
      revenueByMonth: {},
      projectedRevenue: 0
    };
    
    // Tabela de preços padrão
    const priceTable = this.getPriceTable();
    
    appointments.forEach(apt => {
      const price = priceTable[apt.type] || 100;
      
      if (apt.status === 'Concluído') {
        revenue.totalRevenue += price;
        revenue.revenueByType[apt.type] = (revenue.revenueByType[apt.type] || 0) + price;
        
        const month = apt.date.substring(0, 7);
        revenue.revenueByMonth[month] = (revenue.revenueByMonth[month] || 0) + price;
      }
    });
    
    revenue.averageRevenue = appointments.length > 0 ? revenue.totalRevenue / appointments.length : 0;
    
    return revenue;
  },
  
  /**
   * Identificar padrões
   */
  identifyPatterns(appointments) {
    const patterns = {
      busyDays: [],
      busyHours: [],
      seasonality: {},
      patientBehavior: {}
    };
    
    // Identificar dias mais movimentados
    const dayCount = {};
    appointments.forEach(apt => {
      const weekday = DateUtils.getWeekdayName(apt.date);
      dayCount[weekday] = (dayCount[weekday] || 0) + 1;
    });
    
    patterns.busyDays = Object.entries(dayCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day, count]) => ({ day, count }));
    
    // Identificar horários mais movimentados
    const hourCount = {};
    appointments.forEach(apt => {
      if (apt.time) {
        const hour = apt.time.split(':')[0];
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      }
    });
    
    patterns.busyHours = Object.entries(hourCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hour, count]) => ({ hour, count }));
    
    return patterns;
  },
  
  /**
   * Preparar dados para gráficos
   */
  prepareChartData(appointments) {
    const chartData = {
      statusDistribution: [],
      typeDistribution: [],
      monthlyTrend: [],
      hourlyDistribution: []
    };
    
    // Distribuição por status
    const statusCount = {};
    appointments.forEach(apt => {
      statusCount[apt.status] = (statusCount[apt.status] || 0) + 1;
    });
    
    chartData.statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
      label: status,
      value: count,
      percentage: (count / appointments.length) * 100
    }));
    
    // Distribuição por tipo
    const typeCount = {};
    appointments.forEach(apt => {
      typeCount[apt.type] = (typeCount[apt.type] || 0) + 1;
    });
    
    chartData.typeDistribution = Object.entries(typeCount).map(([type, count]) => ({
      label: type,
      value: count,
      percentage: (count / appointments.length) * 100
    }));
    
    return chartData;
  },
  
  /**
   * Enriquecer dados do agendamento
   */
  enrichAppointmentData(apt) {
    return {
      ...apt,
      formattedDate: DataFormatter.formatDate(apt.date),
      formattedTime: DataFormatter.formatTime(apt.time),
      formattedDuration: DataFormatter.formatDuration(apt.duration),
      formattedStatus: DataFormatter.formatStatus(apt.status),
      formattedPhone: DataFormatter.formatPhone(apt.phone),
      weekday: DateUtils.getWeekdayName(apt.date),
      isToday: DateUtils.isToday(apt.date),
      isPast: DateUtils.isPast(apt.date),
      daysFromNow: DateUtils.daysBetween(new Date(), apt.date)
    };
  },
  
  /**
   * Gerar relatório de pacientes
   */
  generatePatientsReport(patients, options = {}) {
    try {
      const {
        includeInactive = false,
        format = 'summary'
      } = options;
      
      let filtered = [...patients];
      
      if (!includeInactive) {
        filtered = filtered.filter(p => p.status !== 'inativo');
      }
      
      const stats = {
        total: filtered.length,
        active: filtered.filter(p => p.status === 'ativo').length,
        inactive: filtered.filter(p => p.status === 'inativo').length,
        newThisMonth: 0,
        averageAppointments: 0,
        topPatients: [],
        ageDistribution: {},
        genderDistribution: {},
        locationDistribution: {}
      };
      
      const currentMonth = new Date().toISOString().substring(0, 7);
      let totalAppointments = 0;
      
      filtered.forEach(patient => {
        // Pacientes novos este mês
        if (patient.firstAppointment && patient.firstAppointment.startsWith(currentMonth)) {
          stats.newThisMonth++;
        }
        
        totalAppointments += patient.totalAppointments || 0;
        
        // Distribuição por idade (se disponível)
        if (patient.birthDate) {
          const age = DateUtils.calculateAge(patient.birthDate);
          const ageGroup = this.getAgeGroup(age);
          stats.ageDistribution[ageGroup] = (stats.ageDistribution[ageGroup] || 0) + 1;
        }
      });
      
      stats.averageAppointments = stats.total > 0 ? Math.round(totalAppointments / stats.total) : 0;
      
      // Top 10 pacientes por número de consultas
      stats.topPatients = filtered
        .sort((a, b) => (b.totalAppointments || 0) - (a.totalAppointments || 0))
        .slice(0, 10)
        .map(p => ({
          name: p.name,
          phone: DataFormatter.formatPhone(p.phone),
          totalAppointments: p.totalAppointments || 0,
          lastAppointment: DataFormatter.formatDate(p.lastAppointment),
          value: this.calculatePatientValue(p)
        }));
      
      if (format === 'detailed') {
        return {
          metadata: {
            generatedAt: new Date().toISOString(),
            includeInactive
          },
          statistics: stats,
          patients: filtered.map(p => this.enrichPatientData(p))
        };
      }
      
      return {
        summary: stats,
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      logError('generatePatientsReport', error);
      throw error;
    }
  },
  
  /**
   * Enriquecer dados do paciente
   */
  enrichPatientData(patient) {
    return {
      ...patient,
      formattedPhone: DataFormatter.formatPhone(patient.phone),
      formattedCPF: DataFormatter.formatCPF(patient.cpf),
      formattedLastAppointment: DataFormatter.formatDate(patient.lastAppointment),
      age: patient.birthDate ? DateUtils.calculateAge(patient.birthDate) : null,
      daysSinceLastAppointment: patient.lastAppointment ? 
        DateUtils.daysBetween(new Date(), patient.lastAppointment) : null,
      isRecent: patient.lastAppointment ? 
        DateUtils.daysBetween(new Date(), patient.lastAppointment) <= 30 : false,
      value: this.calculatePatientValue(patient)
    };
  },
  
  /**
   * Gerar relatório financeiro
   */
  generateFinancialReport(appointments, options = {}) {
    try {
      const { 
        priceTable = {},
        period = 'month',
        currency = 'BRL'
      } = options;
      
      const prices = { ...this.getPriceTable(), ...priceTable };
      
      const stats = {
        totalRevenue: 0,
        confirmedRevenue: 0,
        pendingRevenue: 0,
        lostRevenue: 0,
        revenueByType: {},
        revenueByMonth: {},
        revenueByStatus: {},
        averageTicket: 0,
        projections: {}
      };
      
      appointments.forEach(apt => {
        const price = prices[apt.type] || 100;
        
        stats.totalRevenue += price;
        
        // Por status
        stats.revenueByStatus[apt.status] = (stats.revenueByStatus[apt.status] || 0) + price;
        
        switch (apt.status) {
          case 'Confirmado':
          case 'Concluído':
            stats.confirmedRevenue += price;
            break;
          case 'Pendente':
            stats.pendingRevenue += price;
            break;
          case 'Cancelado':
            stats.lostRevenue += price;
            break;
        }
        
        // Por tipo
        stats.revenueByType[apt.type] = (stats.revenueByType[apt.type] || 0) + price;
        
        // Por mês
        const month = apt.date.substring(0, 7);
        stats.revenueByMonth[month] = (stats.revenueByMonth[month] || 0) + price;
      });
      
      stats.averageTicket = appointments.length > 0 ? stats.totalRevenue / appointments.length : 0;
      
      // Formatação de moeda
      Object.keys(stats).forEach(key => {
        if (key.includes('Revenue') || key === 'averageTicket') {
          stats[key + 'Formatted'] = DataFormatter.formatCurrency(stats[key], currency);
        }
      });
      
      return {
        summary: stats,
        priceTable: prices,
        currency,
        generatedAt: new Date().toISOString(),
        disclaimer: 'Valores estimados baseados na tabela de preços configurada'
      };
      
    } catch (error) {
      logError('generateFinancialReport', error);
      throw error;
    }
  },
  
  /**
   * Utilitários auxiliares
   */
  getWorkingHours() {
    return {
      start: ConfigUtils.getSetting('working_hours_start', '08:00'),
      end: ConfigUtils.getSetting('working_hours_end', '18:00')
    };
  },
  
  calculateWorkingHours(workingHours) {
    const start = DataValidator.timeToMinutes(workingHours.start);
    const end = DataValidator.timeToMinutes(workingHours.end);
    return (end - start) / 60;
  },
  
  getPriceTable() {
    return {
      'Primeira Consulta': 150,
      'Retorno': 80,
      'Limpeza': 120,
      'Tratamento': 200,
      'Emergência': 180,
      'Ortodontia': 300,
      'Implante': 800,
      'Cirurgia': 500,
      'Prótese': 600,
      'Extração': 150,
      'Avaliação': 100,
      'Manutenção': 60
    };
  },
  
  getAgeGroup(age) {
    if (age < 18) return '0-17';
    if (age < 30) return '18-29';
    if (age < 45) return '30-44';
    if (age < 60) return '45-59';
    return '60+';
  },
  
  calculatePatientValue(patient) {
    const baseValue = (patient.totalAppointments || 0) * 100;
    const recencyBonus = patient.lastAppointment && 
      DateUtils.daysBetween(new Date(), patient.lastAppointment) <= 90 ? 50 : 0;
    return baseValue + recencyBonus;
  }
};

/**
 * Exportador de dados expandido
 */
const DataExporter = {
  
  /**
   * Exportar agendamentos para CSV
   */
  exportAppointmentsToCSV(appointments, options = {}) {
    try {
      const {
        includeHeaders = true,
        delimiter = ',',
        encoding = 'UTF-8',
        dateFormat = 'DD/MM/YYYY'
      } = options;
      
      const headers = [
        'ID',
        'Paciente',
        'Telefone',
        'Email',
        'CPF',
        'Data',
        'Horário',
        'Tipo',
        'Duração (min)',
        'Status',
        'Prioridade',
        'Observações',
        'Criado em',
        'Atualizado em'
      ];
      
      const rows = appointments.map(apt => [
        apt.id || '',
        apt.patientName || '',
        DataFormatter.formatPhone(apt.phone) || '',
        apt.email || '',
        DataFormatter.formatCPF(apt.cpf) || '',
        DataFormatter.formatDate(apt.date, dateFormat) || '',
        DataFormatter.formatTime(apt.time) || '',
        apt.type || '',
        apt.duration || '',
        apt.status || '',
        apt.priority || '',
        (apt.notes || '').replace(/[\r\n]/g, ' '),
        DataFormatter.formatDateTime(apt.createdAt) || '',
        DataFormatter.formatDateTime(apt.updatedAt) || ''
      ]);
      
      let csvContent = '';
      
      if (includeHeaders) {
        csvContent += headers.map(h => `"${h}"`).join(delimiter) + '\n';
      }
      
      csvContent += rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(delimiter)
      ).join('\n');
      
      return {
        success: true,
        content: csvContent,
        filename: `agendamentos_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv;charset=' + encoding,
        recordCount: rows.length
      };
      
    } catch (error) {
      logError('exportAppointmentsToCSV', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Exportar pacientes para CSV
   */
  exportPatientsToCSV(patients, options = {}) {
    try {
      const {
        includeHeaders = true,
        delimiter = ',',
        encoding = 'UTF-8'
      } = options;
      
      const headers = [
        'Nome',
        'Telefone',
        'Email',
        'CPF',
        'Data Nascimento',
        'Idade',
        'Endereço',
        'Total de Consultas',
        'Última Consulta',
        'Primeira Consulta',
        'Status',
        'Observações'
      ];
      
      const rows = patients.map(patient => [
        patient.name || '',
        DataFormatter.formatPhone(patient.phone) || '',
        patient.email || '',
        DataFormatter.formatCPF(patient.cpf) || '',
        DataFormatter.formatDate(patient.birthDate) || '',
        patient.birthDate ? DateUtils.calculateAge(patient.birthDate) : '',
        patient.address || '',
        patient.totalAppointments || 0,
        DataFormatter.formatDate(patient.lastAppointment) || '',
        DataFormatter.formatDate(patient.firstAppointment) || '',
        patient.status || '',
        (patient.notes || '').replace(/[\r\n]/g, ' ')
      ]);
      
      let csvContent = '';
      
      if (includeHeaders) {
        csvContent += headers.map(h => `"${h}"`).join(delimiter) + '\n';
      }
      
      csvContent += rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(delimiter)
      ).join('\n');
      
      return {
        success: true,
        content: csvContent,
        filename: `pacientes_${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv;charset=' + encoding,
        recordCount: rows.length
      };
      
    } catch (error) {
      logError('exportPatientsToCSV', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Exportar relatório para JSON
   */
  exportReportToJSON(reportData, reportType = 'report') {
    try {
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          reportType: reportType,
          version: CONFIG.VERSION || '3.0.0'
        },
        data: reportData
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      
      return {
        success: true,
        content: jsonContent,
        filename: `${reportType}_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json',
        size: jsonContent.length
      };
      
    } catch (error) {
      logError('exportReportToJSON', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Criar arquivo no Google Drive
   */
  createFileInDrive(content, filename, mimeType = 'text/csv', folderId = null) {
    try {
      const blob = Utilities.newBlob(content, mimeType, filename);
      
      let file;
      if (folderId) {
        const folder = DriveApp.getFolderById(folderId);
        file = folder.createFile(blob);
      } else {
        file = DriveApp.createFile(blob);
      }
      
      return {
        success: true,
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        fileName: filename,
        size: DataFormatter.formatFileSize(blob.getBytes().length)
      };
      
    } catch (error) {
      logError('createFileInDrive', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Exportar dados para Google Sheets
   */
  exportToGoogleSheets(data, sheetName = 'Exported Data') {
    try {
      const spreadsheet = SpreadsheetApp.create(`Export_${sheetName}_${new Date().toISOString().split('T')[0]}`);
      const sheet = spreadsheet.getActiveSheet();
      sheet.setName(sheetName);
      
      if (data.length > 0) {
        const range = sheet.getRange(1, 1, data.length, data[0].length);
        range.setValues(data);
        
        // Formatar cabeçalho
        const headerRange = sheet.getRange(1, 1, 1, data[0].length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('#ffffff');
        
        // Auto-resize columns
        sheet.autoResizeColumns(1, data[0].length);
      }
      
      return {
        success: true,
        spreadsheetId: spreadsheet.getId(),
        spreadsheetUrl: spreadsheet.getUrl(),
        sheetName: sheetName,
        recordCount: data.length
      };
      
    } catch (error) {
      logError('exportToGoogleSheets', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

/**
 * Utilitários de data expandidos
 */
const DateUtils = {
  
  /**
   * Adicionar dias úteis
   */
  addBusinessDays(date, days) {
    let result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      
      // Verificar se não é fim de semana (0 = domingo, 6 = sábado)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return result;
  },
  
  /**
   * Verificar se é dia útil
   */
  isBusinessDay(date) {
    const day = new Date(date).getDay();
    return day !== 0 && day !== 6;
  },
  
  /**
   * Obter próximo dia útil
   */
  getNextBusinessDay(date = new Date()) {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    while (!this.isBusinessDay(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1);
    }
    
    return nextDay;
  },
  
  /**
   * Calcular idade
   */
  calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },
  
  /**
   * Obter nome do dia da semana
   */
  getWeekdayName(date) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date(date).getDay()];
  },
  
  /**
   * Obter abreviação do dia da semana
   */
  getWeekdayShort(date) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[new Date(date).getDay()];
  },
  
  /**
   * Obter número do dia da semana
   */
  getWeekday(date) {
    return new Date(date).getDay();
  },
  
  /**
   * Obter número da semana do ano
   */
  getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  },
  
  /**
   * Verificar se é hoje
   */
  isToday(date) {
    const today = new Date().toISOString().split('T')[0];
    const checkDate = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return checkDate === today;
  },
  
  /**
   * Verificar se é no passado
   */
  isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  },
  
  /**
   * Verificar se é no futuro
   */
  isFuture(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  },
  
  /**
   * Calcular dias entre duas datas
   */
  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  },
  
  /**
   * Formatar período
   */
  formatPeriod(startDate, endDate) {
    const start = DataFormatter.formatDate(startDate);
    const end = DataFormatter.formatDate(endDate);
    
    if (start === end) {
      return start;
    }
    
    return `${start} a ${end}`;
  },
  
  /**
   * Obter início do mês
   */
  getMonthStart(date = new Date()) {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
  },
  
  /**
   * Obter fim do mês
   */
  getMonthEnd(date = new Date()) {
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    return end;
  },
  
  /**
   * Obter início da semana
   */
  getWeekStart(date = new Date()) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  },
  
  /**
   * Obter fim da semana
   */
  getWeekEnd(date = new Date()) {
    const end = new Date(date);
    const day = end.getDay();
    const diff = end.getDate() + (6 - day);
    end.setDate(diff);
    end.setHours(23, 59, 59, 999);
    return end;
  },
  
  /**
   * Gerar array de datas entre duas datas
   */
  getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  },
  
  /**
   * Verificar se é feriado
   */
  isHoliday(date) {
    try {
      // Implementar verificação de feriados
      // Por enquanto apenas simular
      return false;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Utilitários de performance expandidos
 */
const PerformanceUtils = {
  
  /**
   * Cronômetro simples
   */
  startTimer() {
    return new Date().getTime();
  },
  
  /**
   * Parar cronômetro e retornar tempo decorrido
   */
  stopTimer(startTime) {
    return new Date().getTime() - startTime;
  },
  
  /**
   * Executar função com medição de tempo
   */
  measureTime(func, ...args) {
    const start = this.startTimer();
    const result = func.apply(this, args);
    const duration = this.stopTimer(start);
    
    return {
      result: result,
      duration: duration,
      performance: this.categorizePerformance(duration)
    };
  },
  
  /**
   * Categorizar performance
   */
  categorizePerformance(duration) {
    if (duration < 100) return 'excellent';
    if (duration < 500) return 'good';
    if (duration < 1000) return 'average';
    if (duration < 3000) return 'slow';
    return 'very_slow';
  },
  
  /**
   * Processar em lotes para evitar timeout
   */
  processBatch(items, batchSize, processor, options = {}) {
    const { 
      pauseBetweenBatches = 100,
      progressCallback = null,
      errorCallback = null 
    } = options;
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      try {
        const batch = items.slice(i, i + batchSize);
        const batchResult = processor(batch, i);
        
        if (Array.isArray(batchResult)) {
          results.push(...batchResult);
        } else {
          results.push(batchResult);
        }
        
        // Callback de progresso
        if (progressCallback) {
          const progress = Math.round(((i + batch.length) / items.length) * 100);
          progressCallback(progress, i + batch.length, items.length);
        }
        
        // Pausa entre lotes
        if (i + batchSize < items.length && pauseBetweenBatches > 0) {
          Utilities.sleep(pauseBetweenBatches);
        }
        
      } catch (error) {
        errors.push({
          batchIndex: Math.floor(i / batchSize),
          startIndex: i,
          error: error.message
        });
        
        if (errorCallback) {
          errorCallback(error, i);
        }
      }
    }
    
    return {
      results,
      errors,
      totalProcessed: results.length,
      totalErrors: errors.length,
      successRate: items.length > 0 ? (results.length / items.length) * 100 : 0
    };
  },
  
  /**
   * Executar com retry automático
   */
  executeWithRetry(func, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return func();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          logActivity('RETRY', `Tentativa ${attempt} falhou, tentando novamente em ${delay}ms`, {
            error: error.message,
            attempt,
            maxRetries
          });
          
          Utilities.sleep(delay);
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw new Error(`Falha após ${maxRetries} tentativas: ${lastError.message}`);
  },
  
  /**
   * Monitorar uso de memória (simulado)
   */
  getMemoryUsage() {
    try {
      // Google Apps Script não fornece API de memória
      // Retornar métricas simuladas baseadas na complexidade da execução
      return {
        used: Math.round(Math.random() * 100 + 50), // MB simulados
        available: Math.round(Math.random() * 200 + 100),
        percentage: Math.round(Math.random() * 60 + 20)
      };
    } catch (error) {
      return {
        used: 0,
        available: 0,
        percentage: 0,
        error: error.message
      };
    }
  },
  
  /**
   * Otimizar execução de grandes datasets
   */
  optimizeDataProcessing(data, processor, options = {}) {
    const {
      chunkSize = 100,
      enableCaching = true,
      cacheKey = null,
      cacheTTL = 300
    } = options;
    
    // Verificar cache se habilitado
    if (enableCaching && cacheKey) {
      const cached = CacheManager.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          fromCache: true,
          performance: 'excellent'
        };
      }
    }
    
    const startTime = this.startTimer();
    
    try {
      // Processar em chunks se necessário
      let result;
      if (data.length > chunkSize) {
        result = this.processBatch(data, chunkSize, processor);
      } else {
        result = processor(data);
      }
      
      const duration = this.stopTimer(startTime);
      const performance = this.categorizePerformance(duration);
      
      // Salvar no cache se habilitado
      if (enableCaching && cacheKey && result) {
        CacheManager.set(cacheKey, result, cacheTTL);
      }
      
      return {
        success: true,
        data: result,
        duration,
        performance,
        fromCache: false
      };
      
    } catch (error) {
      const duration = this.stopTimer(startTime);
      
      return {
        success: false,
        error: error.message,
        duration,
        performance: 'failed'
      };
    }
  }
};

/**
 * Utilitários de segurança expandidos
 */
const SecurityUtils = {
  
  /**
   * Gerar hash simples (não criptográfico)
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  },
  
  /**
   * Gerar ID único
   */
  generateUniqueId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return prefix + timestamp + '_' + random;
  },
  
  /**
   * Mascarar dados sensíveis
   */
  maskSensitiveData(data, fields = ['cpf', 'email', 'phone']) {
    const masked = { ...data };
    
    fields.forEach(field => {
      if (masked[field]) {
        const value = masked[field];
        
        if (field === 'cpf') {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 11) {
            masked[field] = cleaned.replace(/(\d{3})\d{3}\d{3}(\d{2})/, '$1.***.***-$2');
          }
        } else if (field === 'email') {
          const [local, domain] = value.split('@');
          if (local && domain) {
            const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(0, local.length - 2)) + local.charAt(local.length - 1);
            masked[field] = maskedLocal + '@' + domain;
          }
        } else if (field === 'phone') {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length >= 10) {
            masked[field] = cleaned.replace(/(\d{2})\d+(\d{4})/, '$1****$2');
          }
        }
      }
    });
    
    return masked;
  },
  
  /**
   * Validar permissões de usuário
   */
  checkUserPermissions() {
    try {
      const user = Session.getActiveUser().getEmail();
      const adminEmails = ConfigUtils.getSetting('admin_emails', '').split(',');
      const editorEmails = ConfigUtils.getSetting('editor_emails', '').split(',');
      
      return {
        email: user,
        isAdmin: adminEmails.includes(user),
        isEditor: editorEmails.includes(user),
        hasAccess: true,
        permissions: this.getUserPermissions(user)
      };
    } catch (error) {
      return {
        email: null,
        isAdmin: false,
        isEditor: false,
        hasAccess: false,
        error: error.message
      };
    }
  },
  
  /**
   * Obter permissões do usuário
   */
  getUserPermissions(userEmail) {
    const adminEmails = ConfigUtils.getSetting('admin_emails', '').split(',');
    const editorEmails = ConfigUtils.getSetting('editor_emails', '').split(',');
    
    if (adminEmails.includes(userEmail)) {
      return ['read', 'write', 'delete', 'admin', 'export', 'backup'];
    } else if (editorEmails.includes(userEmail)) {
      return ['read', 'write', 'export'];
    } else {
      return ['read'];
    }
  },
  
  /**
   * Sanitizar entrada de dados
   */
  sanitizeInput(input, type = 'text') {
    if (!input) return '';
    
    let sanitized = String(input);
    
    switch (type) {
      case 'text':
        sanitized = sanitized.replace(/[<>]/g, '');
        break;
      case 'html':
        sanitized = sanitized.replace(/[<>]/g, '');
        break;
      case 'sql':
        sanitized = sanitized.replace(/['";\\]/g, '');
        break;
      case 'phone':
        sanitized = sanitized.replace(/[^\d\s\-\(\)]/g, '');
        break;
      case 'alphanumeric':
        sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '');
        break;
    }
    
    return sanitized.trim();
  },
  
  /**
   * Validar origem da requisição
   */
  validateRequestOrigin(allowedOrigins = []) {
    try {
      // Em Google Apps Script, não temos acesso completo aos headers
      // Esta seria uma implementação básica
      return {
        isValid: true,
        origin: 'google_apps_script'
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  },
  
  /**
   * Rate limiting básico
   */
  checkRateLimit(identifier, maxRequests = 60, windowMinutes = 1) {
    try {
      const cache = CacheService.getScriptCache();
      const key = `rate_limit_${identifier}`;
      const current = parseInt(cache.get(key) || '0');
      
      if (current >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + (windowMinutes * 60 * 1000)
        };
      }
      
      cache.put(key, String(current + 1), windowMinutes * 60);
      
      return {
        allowed: true,
        remaining: maxRequests - current - 1,
        resetTime: Date.now() + (windowMinutes * 60 * 1000)
      };
      
    } catch (error) {
      // Em caso de erro, permitir a requisição
      return {
        allowed: true,
        remaining: maxRequests,
        error: error.message
      };
    }
  },
  
  /**
   * Gerar token de sessão
   */
  generateSessionToken() {
    return this.generateUniqueId('session_');
  },
  
  /**
   * Validar integridade de dados
   */
  validateDataIntegrity(data, expectedFields = []) {
    const issues = [];
    
    // Verificar campos obrigatórios
    expectedFields.forEach(field => {
      if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined) {
        issues.push(`Campo obrigatório ausente: ${field}`);
      }
    });
    
    // Verificar tipos de dados básicos
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      // Verificar se strings não estão vazias quando deveriam ter conteúdo
      if (typeof value === 'string' && value.trim() === '' && expectedFields.includes(key)) {
        issues.push(`Campo ${key} está vazio`);
      }
      
      // Verificar datas válidas
      if (key.includes('date') || key.includes('Date')) {
        if (value && isNaN(new Date(value).getTime())) {
          issues.push(`Data inválida no campo ${key}: ${value}`);
        }
      }
      
      // Verificar emails
      if (key.includes('email') || key.includes('Email')) {
        if (value && !DataValidator.isValidEmail(value).isValid) {
          issues.push(`Email inválido no campo ${key}: ${value}`);
        }
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 10))
    };
  }
};

/**
 * Cache Manager expandido
 */
const CacheManager = {
  
  /**
   * Obter dados do cache
   */
  get(key, defaultValue = null) {
    try {
      const cache = CacheService.getScriptCache();
      const cached = cache.get(key);
      
      if (cached) {
        try {
          const data = JSON.parse(cached);
          
          // Verificar expiração customizada
          if (data.expires && Date.now() > data.expires) {
            cache.remove(key);
            return defaultValue;
          }
          
          return data.value !== undefined ? data.value : data;
        } catch (parseError) {
          // Se não conseguir fazer parse do JSON, retornar o valor direto
          return cached;
        }
      }
      
      return defaultValue;
    } catch (error) {
      logError('CacheManager.get', error, { key });
      return defaultValue;
    }
  },
  
  /**
   * Definir dados no cache
   */
  set(key, value, ttlSeconds = 600) {
    try {
      const cache = CacheService.getScriptCache();
      
      const data = {
        value: value,
        expires: Date.now() + (ttlSeconds * 1000),
        created: Date.now()
      };
      
      cache.put(key, JSON.stringify(data), ttlSeconds);
      return true;
    } catch (error) {
      logError('CacheManager.set', error, { key, ttlSeconds });
      return false;
    }
  },
  
  /**
   * Remover do cache
   */
  remove(key) {
    try {
      const cache = CacheService.getScriptCache();
      cache.remove(key);
      return true;
    } catch (error) {
      logError('CacheManager.remove', error, { key });
      return false;
    }
  },
  
  /**
   * Limpar todo o cache
   */
  clear(keys = null) {
    try {
      const cache = CacheService.getScriptCache();
      
      if (keys && Array.isArray(keys)) {
        keys.forEach(key => {
          try {
            cache.remove(key);
          } catch (error) {
            console.warn(`Erro ao remover cache ${key}:`, error);
          }
        });
      } else {
        // Limpar keys conhecidas
        const commonKeys = [
          'appointments', 'patients', 'stats', 'settings',
          'working_hours', 'types', 'reports'
        ];
        
        commonKeys.forEach(key => {
          try {
            cache.remove(key);
          } catch (error) {
            console.warn(`Erro ao remover cache ${key}:`, error);
          }
        });
      }
      
      return true;
    } catch (error) {
      logError('CacheManager.clear', error);
      return false;
    }
  },
  
  /**
   * Verificar se chave existe no cache
   */
  has(key) {
    try {
      const cache = CacheService.getScriptCache();
      const cached = cache.get(key);
      return cached !== null;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Obter estatísticas do cache
   */
  getStats() {
    try {
      // Google Apps Script não fornece estatísticas detalhadas do cache
      // Retornar informações básicas
      return {
        provider: 'Google Apps Script CacheService',
        maxSize: '100KB per item',
        maxTTL: '21600 seconds (6 hours)',
        available: true
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
};

/**
 * Teste das funções utilitárias
 */
function testUtilities() {
  console.log('🧪 Testando funções utilitárias...');
  
  const tests = [];
  
  // Teste formatadores
  tests.push({
    name: 'Formatação de Telefone',
    test: () => DataFormatter.formatPhone('11999999999') === '(11) 99999-9999'
  });
  
  tests.push({
    name: 'Formatação de CPF',
    test: () => DataFormatter.formatCPF('12345678901') === '123.456.789-01'
  });
  
  tests.push({
    name: 'Formatação de Data',
    test: () => DataFormatter.formatDate('2024-12-15') !== ''
  });
  
  tests.push({
    name: 'Formatação de Duração',
    test: () => DataFormatter.formatDuration(90) === '1h 30min'
  });
  
  // Teste validadores
  tests.push({
    name: 'Validação de Email',
    test: () => DataValidator.isValidEmail('teste@email.com').isValid === true
  });
  
  tests.push({
    name: 'Validação de CPF',
    test: () => DataValidator.isValidCPF('12345678901').isValid === false // CPF inválido
  });
  
  tests.push({
    name: 'Validação de Telefone',
    test: () => DataValidator.isValidPhone('11999999999').isValid === true
  });
  
  // Teste utilitários de data
  tests.push({
    name: 'Cálculo de Idade',
    test: () => DateUtils.calculateAge('1990-01-01') > 30
  });
  
  tests.push({
    name: 'Verificação de Dia Útil',
    test: () => typeof DateUtils.isBusinessDay(new Date()) === 'boolean'
  });
  
  // Teste cache
  tests.push({
    name: 'Cache Set/Get',
    test: () => {
      CacheManager.set('test_key', 'test_value', 60);
      return CacheManager.get('test_key') === 'test_value';
    }
  });
  
  // Teste performance
  tests.push({
    name: 'Medição de Performance',
    test: () => {
      const result = PerformanceUtils.measureTime(() => {
        return 'test';
      });
      return result.result === 'test' && typeof result.duration === 'number';
    }
  });
  
  // Executar testes
  const results = tests.map(test => {
    try {
      const passed = test.test();
      console.log(`${passed ? '✅' : '❌'} ${test.name}`);
      return { name: test.name, passed };
    } catch (error) {
      console.log(`❌ ${test.name} - Erro: ${error.message}`);
      return { name: test.name, passed: false, error: error.message };
    }
  });
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`\n📊 Resultado dos Testes: ${passed}/${total} passaram`);
  
  if (passed === total) {
    console.log('✅ Todos os testes passaram!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique a implementação.');
  }
  
  return {
    success: passed === total,
    passed,
    total,
    results
  };
}

/**
 * Inicializar utilitários
 */
function initializeUtilities() {
  try {
    console.log('🔧 Inicializando utilitários do sistema...');
    
    // Verificar disponibilidade dos serviços
    const services = {
      cache: CacheManager.getStats().available,
      drive: true, // Sempre disponível no Google Apps Script
      mail: true   // Sempre disponível no Google Apps Script
    };
    
    console.log('📊 Serviços disponíveis:', services);
    
    // Limpar cache antigo se necessário
    const clearOldCache = ConfigUtils.getSetting('clear_cache_on_startup', 'false');
    if (clearOldCache === 'true') {
      CacheManager.clear();
      console.log('🧹 Cache limpo na inicialização');
    }
    
    console.log('✅ Utilitários inicializados com sucesso');
    
    return {
      success: true,
      services,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao inicializar utilitários:', error);
    return {
      success: false,
      error: error.message
    };
  }
}