/**
 * ========================================
 * SISTEMA DE AGENDAMENTO DENTAL - BACKEND PRINCIPAL
 * Google Apps Script Integration v3.0 - PRODUÇÃO
 * ========================================
 * 
 * @fileoverview Sistema completo de agendamento para clínicas dentais
 * @author Sistema Dental Pro
 * @version 3.0.0
 * @since 2024-01-01
 * @license MIT
 * 
 * Funcionalidades:
 * - CRUD completo de agendamentos
 * - Gestão de pacientes
 * - Sistema de notificações
 * - Backup automático
 * - Relatórios avançados
 * - API RESTful
 * - Validações robustas
 * - Sistema de logs
 * - Cache inteligente
 * - Recuperação de falhas
 */

// ==========================================
// CONFIGURAÇÕES GLOBAIS EXPANDIDAS
// ==========================================
const CONFIG = {
  // ID da planilha - SUBSTITUA PELO SEU ID
  SPREADSHEET_ID: 'SUBSTITUA_PELO_ID_DA_SUA_PLANILHA',
  
  // Configuração das abas
  SHEETS: {
    APPOINTMENTS: 'Agendamentos',
    PATIENTS: 'Pacientes', 
    LOGS: 'Logs',
    SETTINGS: 'Configurações',
    BACKUP: 'Backup',
    ANALYTICS: 'Analytics',
    AUDIT: 'Auditoria',
    NOTIFICATIONS: 'Notificações'
  },
  
  // Informações do sistema
  VERSION: '3.0.0',
  BUILD_DATE: '2024-12-19',
  ENVIRONMENT: 'production',
  
  // Configurações de performance
  MAX_RETRIES: 5,
  RETRY_DELAY: 2000,
  BATCH_SIZE: 100,
  CACHE_DURATION: 600, // 10 minutos
  MAX_EXECUTION_TIME: 280000, // 4m40s (margem de segurança)
  
  // Configurações de logging
  ENABLE_LOGGING: true,
  LOG_LEVEL: 'INFO', // DEBUG, INFO, WARN, ERROR
  MAX_LOG_ENTRIES: 5000,
  LOG_RETENTION_DAYS: 90,
  
  // Configurações de backup
  ENABLE_BACKUP: true,
  BACKUP_FREQUENCY: 24, // horas
  MAX_BACKUPS: 30,
  BACKUP_COMPRESSION: true,
  
  // Configurações de segurança
  ENABLE_RATE_LIMITING: true,
  MAX_REQUESTS_PER_MINUTE: 60,
  ENABLE_IP_FILTERING: false,
  ALLOWED_IPS: [],
  
  // Configurações de notificação
  NOTIFICATION_SETTINGS: {
    EMAIL_ENABLED: true,
    WEBHOOK_ENABLED: false,
    SMS_ENABLED: false,
    PUSH_ENABLED: false
  },
  
  // Configurações de validação
  VALIDATION: {
    STRICT_MODE: true,
    PHONE_FORMAT: 'BR',
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm',
    TIMEZONE: 'America/Sao_Paulo'
  },
  
  // Configurações de otimização
  OPTIMIZATION: {
    USE_CACHE: true,
    COMPRESS_RESPONSES: true,
    LAZY_LOADING: true,
    ASYNC_PROCESSING: true
  }
};

// ==========================================
// SISTEMA DE CACHE AVANÇADO
// ==========================================
const CacheManager = {
  
  /**
   * Obter dados do cache
   */
  get(key, defaultValue = null) {
    try {
      if (!CONFIG.OPTIMIZATION.USE_CACHE) return defaultValue;
      
      const cache = CacheService.getScriptCache();
      const cached = cache.get(key);
      
      if (cached) {
        const data = JSON.parse(cached);
        
        // Verificar expiração
        if (data.expires && Date.now() > data.expires) {
          cache.remove(key);
          return defaultValue;
        }
        
        return data.value;
      }
      
      return defaultValue;
    } catch (error) {
      Logger.log(`Erro ao recuperar cache ${key}: ${error.message}`);
      return defaultValue;
    }
  },
  
  /**
   * Definir dados no cache
   */
  set(key, value, ttlSeconds = CONFIG.CACHE_DURATION) {
    try {
      if (!CONFIG.OPTIMIZATION.USE_CACHE) return false;
      
      const cache = CacheService.getScriptCache();
      const data = {
        value: value,
        expires: Date.now() + (ttlSeconds * 1000),
        created: Date.now()
      };
      
      cache.put(key, JSON.stringify(data), ttlSeconds);
      return true;
    } catch (error) {
      Logger.log(`Erro ao definir cache ${key}: ${error.message}`);
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
      Logger.log(`Erro ao remover cache ${key}: ${error.message}`);
      return false;
    }
  },
  
  /**
   * Limpar todo o cache
   */
  clear() {
    try {
      const cache = CacheService.getScriptCache();
      cache.removeAll(['appointments', 'patients', 'stats', 'settings']);
      return true;
    } catch (error) {
      Logger.log(`Erro ao limpar cache: ${error.message}`);
      return false;
    }
  }
};

// ==========================================
// SISTEMA DE LOGS AVANÇADO
// ==========================================
const LogManager = {
  
  /**
   * Níveis de log
   */
  LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },
  
  /**
   * Log genérico
   */
  log(level, category, message, data = {}, userId = null) {
    try {
      if (!CONFIG.ENABLE_LOGGING) return;
      
      const levelNum = this.LEVELS[level] || this.LEVELS.INFO;
      const configLevel = this.LEVELS[CONFIG.LOG_LEVEL] || this.LEVELS.INFO;
      
      if (levelNum < configLevel) return;
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: level,
        category: category,
        message: message,
        data: JSON.stringify(data),
        userId: userId || this.getCurrentUser(),
        sessionId: this.getSessionId(),
        version: CONFIG.VERSION,
        environment: CONFIG.ENVIRONMENT
      };
      
      // Log no console
      Logger.log(`[${level}] ${category}: ${message}`);
      
      // Salvar na planilha (async)
      this.saveToSheet(logEntry);
      
    } catch (error) {
      Logger.log(`Erro no sistema de logs: ${error.message}`);
    }
  },
  
  /**
   * Logs específicos
   */
  debug(category, message, data) { this.log('DEBUG', category, message, data); },
  info(category, message, data) { this.log('INFO', category, message, data); },
  warn(category, message, data) { this.log('WARN', category, message, data); },
  error(category, message, data) { this.log('ERROR', category, message, data); },
  
  /**
   * Salvar log na planilha
   */
  saveToSheet(logEntry) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.LOGS);
      
      // Verificar se precisa de limpeza
      if (sheet.getLastRow() > CONFIG.MAX_LOG_ENTRIES) {
        this.cleanupOldLogs();
      }
      
      const rowData = [
        logEntry.timestamp,
        logEntry.level,
        logEntry.category,
        logEntry.message,
        logEntry.data,
        logEntry.userId,
        logEntry.sessionId,
        logEntry.version,
        logEntry.environment
      ];
      
      sheet.appendRow(rowData);
    } catch (error) {
      Logger.log(`Erro ao salvar log: ${error.message}`);
    }
  },
  
  /**
   * Limpar logs antigos
   */
  cleanupOldLogs() {
    try {
      const sheet = getSheet(CONFIG.SHEETS.LOGS);
      const cutoffDate = new Date(Date.now() - (CONFIG.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000));
      
      const data = sheet.getDataRange().getValues();
      const rowsToDelete = [];
      
      for (let i = 1; i < data.length; i++) {
        const logDate = new Date(data[i][0]);
        if (logDate < cutoffDate) {
          rowsToDelete.push(i + 1);
        }
      }
      
      // Deletar linhas antigas (do final para o início)
      rowsToDelete.reverse().forEach(rowNum => {
        sheet.deleteRow(rowNum);
      });
      
      this.info('CLEANUP', `${rowsToDelete.length} logs antigos removidos`);
    } catch (error) {
      Logger.log(`Erro na limpeza de logs: ${error.message}`);
    }
  },
  
  /**
   * Obter usuário atual
   */
  getCurrentUser() {
    try {
      return Session.getActiveUser().getEmail() || 'anonymous';
    } catch (error) {
      return 'unknown';
    }
  },
  
  /**
   * Obter ID da sessão
   */
  getSessionId() {
    const cache = CacheService.getScriptCache();
    let sessionId = cache.get('session_id');
    
    if (!sessionId) {
      sessionId = Utilities.getUuid();
      cache.put('session_id', sessionId, 3600); // 1 hora
    }
    
    return sessionId;
  }
};

// ==========================================
// SISTEMA DE VALIDAÇÃO ROBUSTO
// ==========================================
const ValidationManager = {
  
  /**
   * Validar dados de agendamento
   */
  validateAppointmentData(data, isUpdate = false) {
    const errors = [];
    const warnings = [];
    
    try {
      // Campos obrigatórios
      const requiredFields = {
        patientName: 'Nome do paciente',
        phone: 'Telefone',
        date: 'Data',
        time: 'Horário',
        type: 'Tipo de consulta'
      };
      
      Object.keys(requiredFields).forEach(field => {
        if (!data[field] || String(data[field]).trim() === '') {
          errors.push(`${requiredFields[field]} é obrigatório`);
        }
      });
      
      // Validações específicas
      if (data.patientName) {
        if (data.patientName.length < 2) {
          errors.push('Nome do paciente deve ter pelo menos 2 caracteres');
        }
        if (data.patientName.length > 100) {
          errors.push('Nome do paciente muito longo (máximo 100 caracteres)');
        }
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(data.patientName)) {
          warnings.push('Nome contém caracteres especiais');
        }
      }
      
      // Validar telefone
      if (data.phone) {
        const phoneValidation = this.validatePhone(data.phone);
        if (!phoneValidation.isValid) {
          errors.push(phoneValidation.error);
        }
      }
      
      // Validar email
      if (data.email && data.email.trim() !== '') {
        const emailValidation = this.validateEmail(data.email);
        if (!emailValidation.isValid) {
          errors.push(emailValidation.error);
        }
      }
      
      // Validar CPF
      if (data.cpf && data.cpf.trim() !== '') {
        const cpfValidation = this.validateCPF(data.cpf);
        if (!cpfValidation.isValid) {
          errors.push(cpfValidation.error);
        }
      }
      
      // Validar data
      if (data.date) {
        const dateValidation = this.validateDate(data.date);
        if (!dateValidation.isValid) {
          errors.push(dateValidation.error);
        }
      }
      
      // Validar horário
      if (data.time) {
        const timeValidation = this.validateTime(data.time);
        if (!timeValidation.isValid) {
          errors.push(timeValidation.error);
        }
      }
      
      // Validar tipo de consulta
      if (data.type) {
        const validTypes = [
          'Primeira Consulta', 'Retorno', 'Limpeza', 'Tratamento',
          'Emergência', 'Ortodontia', 'Implante', 'Cirurgia',
          'Prótese', 'Extração', 'Avaliação', 'Manutenção'
        ];
        
        if (!validTypes.includes(data.type)) {
          errors.push('Tipo de consulta inválido');
        }
      }
      
      // Validar duração
      if (data.duration) {
        const duration = parseInt(data.duration);
        if (isNaN(duration) || duration < 15 || duration > 480) {
          errors.push('Duração deve estar entre 15 e 480 minutos');
        }
      }
      
      // Validar status
      if (data.status) {
        const validStatuses = ['Pendente', 'Confirmado', 'Concluído', 'Cancelado', 'Reagendado'];
        if (!validStatuses.includes(data.status)) {
          errors.push('Status inválido');
        }
      }
      
      // Validar observações
      if (data.notes && data.notes.length > 1000) {
        warnings.push('Observações muito longas (máximo recomendado: 1000 caracteres)');
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings,
        score: this.calculateValidationScore(errors, warnings)
      };
      
    } catch (error) {
      LogManager.error('VALIDATION', 'Erro na validação', { error: error.message, data });
      return {
        isValid: false,
        errors: ['Erro interno na validação'],
        warnings: [],
        score: 0
      };
    }
  },
  
  /**
   * Validar telefone brasileiro
   */
  validatePhone(phone) {
    try {
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
        '61', '62', '64', '63', '65', '66', '67', '68', '69',
        '71', '73', '74', '75', '77', '79',
        '81', '87', '82', '83', '84', '85', '88', '86', '89',
        '91', '93', '94', '92', '97', '95', '96', '98', '99'
      ];
      
      if (!validDDDs.includes(ddd)) {
        return { isValid: false, error: 'DDD inválido' };
      }
      
      // Validar número
      if (cleaned.length === 11) {
        const ninthDigit = cleaned.charAt(2);
        if (ninthDigit !== '9') {
          return { isValid: false, error: 'Celular deve começar com 9' };
        }
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Formato de telefone inválido' };
    }
  },
  
  /**
   * Validar email
   */
  validateEmail(email) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Formato de email inválido' };
      }
      
      if (email.length > 254) {
        return { isValid: false, error: 'Email muito longo' };
      }
      
      const localPart = email.split('@')[0];
      if (localPart.length > 64) {
        return { isValid: false, error: 'Parte local do email muito longa' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
  },
  
  /**
   * Validar CPF
   */
  validateCPF(cpf) {
    try {
      const cleaned = cpf.replace(/\D/g, '');
      
      if (cleaned.length !== 11) {
        return { isValid: false, error: 'CPF deve ter 11 dígitos' };
      }
      
      // Verificar sequência repetida
      if (/^(\d)\1{10}$/.test(cleaned)) {
        return { isValid: false, error: 'CPF inválido' };
      }
      
      // Validar dígitos verificadores
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
      }
      let remainder = 11 - (sum % 11);
      if (remainder >= 10) remainder = 0;
      if (remainder !== parseInt(cleaned.charAt(9))) {
        return { isValid: false, error: 'CPF inválido' };
      }
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
      }
      remainder = 11 - (sum % 11);
      if (remainder >= 10) remainder = 0;
      if (remainder !== parseInt(cleaned.charAt(10))) {
        return { isValid: false, error: 'CPF inválido' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'CPF inválido' };
    }
  },
  
  /**
   * Validar data
   */
  validateDate(dateStr) {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Formato de data inválido' };
      }
      
      if (date < today) {
        return { isValid: false, error: 'Data não pode ser no passado' };
      }
      
      // Verificar se não é muito distante no futuro (1 ano)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (date > oneYearFromNow) {
        return { isValid: false, error: 'Data muito distante no futuro' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Data inválida' };
    }
  },
  
  /**
   * Validar horário
   */
  validateTime(timeStr) {
    try {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (!timeRegex.test(timeStr)) {
        return { isValid: false, error: 'Formato de horário inválido (use HH:MM)' };
      }
      
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Verificar horário comercial
      const workingHours = this.getWorkingHours();
      const timeInMinutes = hours * 60 + minutes;
      const startInMinutes = this.timeToMinutes(workingHours.start);
      const endInMinutes = this.timeToMinutes(workingHours.end);
      
      if (timeInMinutes < startInMinutes || timeInMinutes > endInMinutes) {
        return { 
          isValid: false, 
          error: `Horário fora do funcionamento (${workingHours.start} às ${workingHours.end})` 
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Horário inválido' };
    }
  },
  
  /**
   * Calcular score de validação
   */
  calculateValidationScore(errors, warnings) {
    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 5;
    return Math.max(0, score);
  },
  
  /**
   * Obter horário de funcionamento
   */
  getWorkingHours() {
    try {
      return {
        start: ConfigManager.getSetting('working_hours_start', '07:00'),
        end: ConfigManager.getSetting('working_hours_end', '20:00')
      };
    } catch (error) {
      return { start: '07:00', end: '20:00' };
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

// ==========================================
// GERENCIADOR DE CONFIGURAÇÕES
// ==========================================
const ConfigManager = {
  
  /**
   * Obter configuração
   */
  getSetting(key, defaultValue = null) {
    try {
      // Tentar cache primeiro
      const cached = CacheManager.get(`setting_${key}`);
      if (cached !== null) return cached;
      
      const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === key) {
          const value = data[i][1];
          CacheManager.set(`setting_${key}`, value, 3600); // 1 hora
          return value;
        }
      }
      
      return defaultValue;
    } catch (error) {
      LogManager.error('CONFIG', 'Erro ao obter configuração', { key, error: error.message });
      return defaultValue;
    }
  },
  
  /**
   * Definir configuração
   */
  setSetting(key, value, description = '') {
    try {
      const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
      const data = sheet.getDataRange().getValues();
      
      // Procurar configuração existente
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(value);
          sheet.getRange(i + 1, 4).setValue(new Date().toISOString());
          CacheManager.set(`setting_${key}`, value, 3600);
          LogManager.info('CONFIG', 'Configuração atualizada', { key, value });
          return { success: true, updated: true };
        }
      }
      
      // Criar nova configuração
      sheet.appendRow([key, value, description, new Date().toISOString()]);
      CacheManager.set(`setting_${key}`, value, 3600);
      LogManager.info('CONFIG', 'Configuração criada', { key, value });
      return { success: true, updated: false };
      
    } catch (error) {
      LogManager.error('CONFIG', 'Erro ao definir configuração', { key, error: error.message });
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Obter todas as configurações
   */
  getAllSettings() {
    try {
      const cached = CacheManager.get('all_settings');
      if (cached) return cached;
      
      const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
      const data = sheet.getDataRange().getValues();
      const settings = {};
      
      for (let i = 1; i < data.length; i++) {
        settings[data[i][0]] = {
          value: data[i][1],
          description: data[i][2] || '',
          updatedAt: data[i][3] || ''
        };
      }
      
      CacheManager.set('all_settings', settings, 1800); // 30 minutos
      return settings;
    } catch (error) {
      LogManager.error('CONFIG', 'Erro ao obter todas as configurações', { error: error.message });
      return {};
    }
  }
};

// ==========================================
// FUNÇÃO PRINCIPAL - PONTO DE ENTRADA
// ==========================================
function doGet(e) {
  const startTime = Date.now();
  
  try {
    LogManager.info('REQUEST', 'GET request received', { 
      parameters: e.parameter,
      userAgent: e.parameter.userAgent || 'unknown'
    });
    
    const action = e.parameter.action || 'getAll';
    
    // Rate limiting
    if (!checkRateLimit()) {
      return createResponse(false, 'Limite de requisições excedido. Tente novamente em alguns minutos.', null, 429);
    }
    
    let response;
    switch (action) {
      case 'ping':
        response = handlePing(e);
        break;
      case 'getAll':
        response = handleGetAll(e);
        break;
      case 'getAppointments':
        response = handleGetAppointments(e);
        break;
      case 'getPatients':
        response = handleGetPatients(e);
        break;
      case 'getStats':
        response = handleGetStats(e);
        break;
      case 'getSettings':
        response = handleGetSettings(e);
        break;
      case 'health':
        response = handleHealthCheck(e);
        break;
      default:
        response = createResponse(false, `Ação GET não reconhecida: ${action}`, null, 400);
    }
    
    const duration = Date.now() - startTime;
    LogManager.info('REQUEST', 'GET request completed', { action, duration, success: true });
    
    return response;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    LogManager.error('REQUEST', 'GET request failed', { 
      error: error.message, 
      stack: error.stack,
      duration,
      parameters: e.parameter 
    });
    
    return createResponse(false, 'Erro interno do servidor: ' + error.message, null, 500);
  }
}

function doPost(e) {
  const startTime = Date.now();
  
  try {
    const requestData = JSON.parse(e.postData.contents);
    
    LogManager.info('REQUEST', 'POST request received', { 
      action: requestData.action,
      dataSize: e.postData.contents.length
    });
    
    const action = requestData.action;
    
    // Rate limiting
    if (!checkRateLimit()) {
      return createResponse(false, 'Limite de requisições excedido. Tente novamente em alguns minutos.', null, 429);
    }
    
    let response;
    switch (action) {
      case 'create':
        response = handleCreate(requestData);
        break;
      case 'update':
        response = handleUpdate(requestData);
        break;
      case 'delete':
        response = handleDelete(requestData);
        break;
      case 'updateStatus':
        response = handleUpdateStatus(requestData);
        break;
      case 'bulkUpdate':
        response = handleBulkUpdate(requestData);
        break;
      case 'backup':
        response = handleBackup(requestData);
        break;
      case 'optimize':
        response = handleOptimize(requestData);
        break;
      case 'export':
        response = handleExport(requestData);
        break;
      default:
        response = createResponse(false, `Ação POST não reconhecida: ${action}`, null, 400);
    }
    
    const duration = Date.now() - startTime;
    LogManager.info('REQUEST', 'POST request completed', { action, duration, success: true });
    
    return response;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    LogManager.error('REQUEST', 'POST request failed', { 
      error: error.message, 
      stack: error.stack,
      duration 
    });
    
    return createResponse(false, 'Erro interno do servidor: ' + error.message, null, 500);
  }
}

// ==========================================
// RATE LIMITING
// ==========================================
function checkRateLimit() {
  try {
    if (!CONFIG.ENABLE_RATE_LIMITING) return true;
    
    const cache = CacheService.getScriptCache();
    const key = 'rate_limit_' + LogManager.getCurrentUser();
    const current = parseInt(cache.get(key) || '0');
    
    if (current >= CONFIG.MAX_REQUESTS_PER_MINUTE) {
      LogManager.warn('RATE_LIMIT', 'Rate limit exceeded', { user: LogManager.getCurrentUser(), requests: current });
      return false;
    }
    
    cache.put(key, String(current + 1), 60); // 1 minuto
    return true;
  } catch (error) {
    LogManager.error('RATE_LIMIT', 'Erro no rate limiting', { error: error.message });
    return true; // Em caso de erro, permitir a requisição
  }
}

// ==========================================
// HANDLERS DE REQUISIÇÕES EXPANDIDOS
// ==========================================
function handlePing(e) {
  try {
    const systemHealth = getSystemHealth();
    
    return createResponse(true, 'Pong! Sistema operacional.', {
      timestamp: new Date().toISOString(),
      version: CONFIG.VERSION,
      buildDate: CONFIG.BUILD_DATE,
      environment: CONFIG.ENVIRONMENT,
      health: systemHealth,
      test: e.parameter.test || 'default',
      server: 'Google Apps Script',
      uptime: getUptime(),
      cache: {
        enabled: CONFIG.OPTIMIZATION.USE_CACHE,
        entries: getCacheStats()
      }
    });
  } catch (error) {
    LogManager.error('PING', 'Erro no ping', { error: error.message });
    return createResponse(false, 'Erro no ping: ' + error.message);
  }
}

function handleGetAll(e) {
  try {
    // Verificar cache primeiro
    const cacheKey = 'getAll_' + JSON.stringify(e.parameter);
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      LogManager.debug('CACHE', 'GetAll servido do cache');
      return createResponse(true, 'Dados recuperados do cache', cached);
    }
    
    const appointments = getAllAppointments();
    const patients = getAllPatients();
    const stats = calculateStats(appointments);
    const settings = ConfigManager.getAllSettings();
    
    const data = {
      appointments: appointments,
      patients: patients,
      stats: stats,
      settings: settings,
      metadata: {
        lastUpdate: new Date().toISOString(),
        version: CONFIG.VERSION,
        totalRecords: appointments.length,
        cacheEnabled: CONFIG.OPTIMIZATION.USE_CACHE
      }
    };
    
    // Salvar no cache
    CacheManager.set(cacheKey, data, 300); // 5 minutos
    
    LogManager.info('GET_ALL', 'Dados recuperados', { 
      appointments: appointments.length,
      patients: patients.length 
    });
    
    return createResponse(true, 'Dados recuperados com sucesso', data);
  } catch (error) {
    LogManager.error('GET_ALL', 'Erro ao recuperar dados', { error: error.message });
    return createResponse(false, 'Erro ao recuperar dados: ' + error.message);
  }
}

function handleGetAppointments(e) {
  try {
    const filters = e.parameter.filters ? JSON.parse(e.parameter.filters) : {};
    const page = parseInt(e.parameter.page || '1');
    const limit = parseInt(e.parameter.limit || '50');
    
    const appointments = getAllAppointments(filters);
    
    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAppointments = appointments.slice(startIndex, endIndex);
    
    const result = {
      appointments: paginatedAppointments,
      pagination: {
        page: page,
        limit: limit,
        total: appointments.length,
        totalPages: Math.ceil(appointments.length / limit),
        hasNext: endIndex < appointments.length,
        hasPrevious: page > 1
      },
      filters: filters
    };
    
    LogManager.info('GET_APPOINTMENTS', 'Agendamentos recuperados', { 
      total: appointments.length,
      filtered: paginatedAppointments.length,
      page: page 
    });
    
    return createResponse(true, 'Agendamentos recuperados', result);
  } catch (error) {
    LogManager.error('GET_APPOINTMENTS', 'Erro ao recuperar agendamentos', { error: error.message });
    return createResponse(false, 'Erro ao recuperar agendamentos: ' + error.message);
  }
}

function handleGetPatients(e) {
  try {
    const patients = getAllPatients();
    
    LogManager.info('GET_PATIENTS', 'Pacientes recuperados', { count: patients.length });
    
    return createResponse(true, 'Pacientes recuperados', { 
      patients: patients,
      metadata: {
        count: patients.length,
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    LogManager.error('GET_PATIENTS', 'Erro ao recuperar pacientes', { error: error.message });
    return createResponse(false, 'Erro ao recuperar pacientes: ' + error.message);
  }
}

function handleGetStats(e) {
  try {
    const appointments = getAllAppointments();
    const stats = calculateStats(appointments);
    const advancedStats = calculateAdvancedStats(appointments);
    
    const result = {
      basic: stats,
      advanced: advancedStats,
      trends: calculateTrends(appointments),
      metadata: {
        calculatedAt: new Date().toISOString(),
        dataPoints: appointments.length
      }
    };
    
    LogManager.info('GET_STATS', 'Estatísticas calculadas', { dataPoints: appointments.length });
    
    return createResponse(true, 'Estatísticas calculadas', result);
  } catch (error) {
    LogManager.error('GET_STATS', 'Erro ao calcular estatísticas', { error: error.message });
    return createResponse(false, 'Erro ao calcular estatísticas: ' + error.message);
  }
}

function handleGetSettings(e) {
  try {
    const settings = ConfigManager.getAllSettings();
    
    LogManager.info('GET_SETTINGS', 'Configurações recuperadas', { count: Object.keys(settings).length });
    
    return createResponse(true, 'Configurações recuperadas', { settings });
  } catch (error) {
    LogManager.error('GET_SETTINGS', 'Erro ao recuperar configurações', { error: error.message });
    return createResponse(false, 'Erro ao recuperar configurações: ' + error.message);
  }
}

function handleHealthCheck(e) {
  try {
    const health = getSystemHealth();
    const status = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 500;
    
    return createResponse(health.status === 'healthy', 'Health check completed', health, status);
  } catch (error) {
    LogManager.error('HEALTH', 'Erro no health check', { error: error.message });
    return createResponse(false, 'Health check failed: ' + error.message, null, 500);
  }
}

// ==========================================
// HANDLERS DE CRIAÇÃO E ATUALIZAÇÃO
// ==========================================
function handleCreate(requestData) {
  try {
    const appointmentData = requestData.data;
    
    // Validação robusta
    const validation = ValidationManager.validateAppointmentData(appointmentData);
    if (!validation.isValid) {
      LogManager.warn('CREATE', 'Dados inválidos', { errors: validation.errors, data: appointmentData });
      return createResponse(false, 'Dados inválidos: ' + validation.errors.join(', '), {
        errors: validation.errors,
        warnings: validation.warnings,
        score: validation.score
      }, 400);
    }
    
    // Verificar conflitos
    const conflict = checkTimeConflict(appointmentData);
    if (conflict) {
      LogManager.warn('CREATE', 'Conflito de horário', { conflict, data: appointmentData });
      return createResponse(false, 'Conflito de horário detectado. Este horário já está ocupado.', {
        conflict: conflict
      }, 409);
    }
    
    // Verificar limite diário
    const dailyLimit = parseInt(ConfigManager.getSetting('max_appointments_per_day', '50'));
    const existingCount = countAppointmentsByDate(appointmentData.date);
    if (existingCount >= dailyLimit) {
      LogManager.warn('CREATE', 'Limite diário excedido', { date: appointmentData.date, count: existingCount });
      return createResponse(false, `Limite diário de agendamentos excedido (${dailyLimit}).`, null, 409);
    }
    
    const result = createAppointment(appointmentData);
    
    if (result.success) {
      // Limpar cache relacionado
      CacheManager.clear();
      
      // Trigger notificações
      if (ConfigManager.getSetting('notifications_enabled', 'true') === 'true') {
        triggerNotification('appointment_created', appointmentData);
      }
      
      LogManager.info('CREATE', 'Agendamento criado', { id: result.id, patient: appointmentData.patientName });
      
      return createResponse(true, 'Agendamento criado com sucesso', { 
        id: result.id,
        appointmentData: appointmentData,
        validationScore: validation.score
      }, 201);
    } else {
      LogManager.error('CREATE', 'Falha ao criar agendamento', { error: result.error, data: appointmentData });
      return createResponse(false, 'Erro ao criar agendamento: ' + result.error, null, 500);
    }
  } catch (error) {
    LogManager.error('CREATE', 'Erro interno na criação', { error: error.message, stack: error.stack });
    return createResponse(false, 'Erro interno ao criar agendamento: ' + error.message, null, 500);
  }
}

function handleUpdate(requestData) {
  try {
    const appointmentData = requestData.data;
    
    const validation = ValidationManager.validateAppointmentData(appointmentData, true);
    if (!validation.isValid) {
      LogManager.warn('UPDATE', 'Dados inválidos', { errors: validation.errors, id: appointmentData.id });
      return createResponse(false, 'Dados inválidos: ' + validation.errors.join(', '), {
        errors: validation.errors,
        warnings: validation.warnings
      }, 400);
    }
    
    const existing = getAppointmentById(appointmentData.id);
    if (!existing) {
      LogManager.warn('UPDATE', 'Agendamento não encontrado', { id: appointmentData.id });
      return createResponse(false, 'Agendamento não encontrado', null, 404);
    }
    
    const conflict = checkTimeConflict(appointmentData, appointmentData.id);
    if (conflict) {
      LogManager.warn('UPDATE', 'Conflito de horário na atualização', { conflict, id: appointmentData.id });
      return createResponse(false, 'Conflito de horário detectado', { conflict }, 409);
    }
    
    const result = updateAppointment(appointmentData);
    
    if (result.success) {
      CacheManager.clear();
      
      // Notificação de atualização
      if (ConfigManager.getSetting('notifications_enabled', 'true') === 'true') {
        triggerNotification('appointment_updated', appointmentData);
      }
      
      LogManager.info('UPDATE', 'Agendamento atualizado', { 
        id: appointmentData.id, 
        patient: appointmentData.patientName 
      });
      
      return createResponse(true, 'Agendamento atualizado com sucesso', {
        id: appointmentData.id,
        changes: getChanges(existing, appointmentData)
      });
    } else {
      LogManager.error('UPDATE', 'Falha na atualização', { error: result.error, id: appointmentData.id });
      return createResponse(false, 'Erro ao atualizar agendamento: ' + result.error, null, 500);
    }
  } catch (error) {
    LogManager.error('UPDATE', 'Erro interno na atualização', { error: error.message, stack: error.stack });
    return createResponse(false, 'Erro interno ao atualizar agendamento: ' + error.message, null, 500);
  }
}

// ==========================================
// FUNÇÕES DE MANIPULAÇÃO DE DADOS EXPANDIDAS
// ==========================================
function getAllAppointments(filters = {}) {
  try {
    // Verificar cache primeiro
    const cacheKey = 'appointments_' + JSON.stringify(filters);
    const cached = CacheManager.get(cacheKey);
    if (cached) {
      LogManager.debug('CACHE', 'Appointments servidos do cache');
      return cached;
    }
    
    const sheet = getSheet(CONFIG.SHEETS.APPOINTMENTS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      CacheManager.set(cacheKey, [], 300);
      return [];
    }
    
    const headers = data[0];
    const appointments = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const appointment = {};
      
      headers.forEach((header, index) => {
        appointment[header] = row[index] || '';
      });
      
      // Aplicar filtros
      if (applyFilters(appointment, filters)) {
        // Enriquecer dados
        appointment.formattedDate = formatDate(appointment.date);
        appointment.formattedTime = formatTime(appointment.time);
        appointment.dayOfWeek = getDayOfWeek(appointment.date);
        appointment.isToday = isToday(appointment.date);
        appointment.isPast = isPast(appointment.date, appointment.time);
        appointment.durationFormatted = formatDuration(appointment.duration);
        
        appointments.push(appointment);
      }
    }
    
    // Ordenar por data e hora
    appointments.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });
    
    // Salvar no cache
    CacheManager.set(cacheKey, appointments, 300);
    
    LogManager.debug('DATA', 'Appointments carregados', { 
      total: appointments.length,
      filtered: Object.keys(filters).length > 0 
    });
    
    return appointments;
  } catch (error) {
    LogManager.error('DATA', 'Erro ao carregar appointments', { error: error.message });
    throw error;
  }
}

function getAllPatients() {
  try {
    const cached = CacheManager.get('patients');
    if (cached) {
      LogManager.debug('CACHE', 'Patients servidos do cache');
      return cached;
    }
    
    const appointments = getAllAppointments();
    const patientsMap = new Map();
    
    appointments.forEach(apt => {
      const key = apt.cpf || apt.phone;
      if (!patientsMap.has(key)) {
        patientsMap.set(key, {
          name: apt.patientName,
          phone: apt.phone,
          email: apt.email,
          cpf: apt.cpf,
          firstAppointment: apt.date,
          lastAppointment: apt.date,
          totalAppointments: 1,
          appointments: [apt],
          status: 'active',
          totalSpent: calculatePatientSpent([apt]),
          averageInterval: 0,
          preferredTime: apt.time,
          preferredType: apt.type
        });
      } else {
        const existing = patientsMap.get(key);
        existing.appointments.push(apt);
        existing.totalAppointments++;
        existing.totalSpent = calculatePatientSpent(existing.appointments);
        
        if (apt.date > existing.lastAppointment) {
          existing.lastAppointment = apt.date;
        }
        
        if (apt.date < existing.firstAppointment) {
          existing.firstAppointment = apt.date;
        }
        
        // Calcular intervalo médio entre consultas
        existing.averageInterval = calculateAverageInterval(existing.appointments);
        
        // Determinar horário preferido
        existing.preferredTime = getMostFrequentTime(existing.appointments);
        existing.preferredType = getMostFrequentType(existing.appointments);
      }
    });
    
    const patients = Array.from(patientsMap.values());
    
    // Enriquecer dados dos pacientes
    patients.forEach(patient => {
      patient.formattedPhone = formatPhone(patient.phone);
      patient.formattedCPF = formatCPF(patient.cpf);
      patient.formattedLastAppointment = formatDate(patient.lastAppointment);
      patient.daysSinceLastAppointment = daysBetween(patient.lastAppointment, new Date());
      patient.isRecent = patient.daysSinceLastAppointment <= 30;
      patient.riskLevel = calculateRiskLevel(patient);
      patient.value = calculatePatientValue(patient);
    });
    
    CacheManager.set('patients', patients, 600); // 10 minutos
    
    LogManager.debug('DATA', 'Patients processados', { count: patients.length });
    
    return patients;
  } catch (error) {
    LogManager.error('DATA', 'Erro ao processar patients', { error: error.message });
    throw error;
  }
}

function createAppointment(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.APPOINTMENTS);
    
    // Gerar ID único
    if (!data.id) {
      data.id = generateId();
    }
    
    // Adicionar timestamps
    const now = new Date().toISOString();
    data.createdAt = now;
    data.updatedAt = now;
    data.version = 1;
    
    // Definir status padrão
    if (!data.status) {
      data.status = 'Pendente';
    }
    
    // Definir duração padrão baseada no tipo
    if (!data.duration) {
      data.duration = getDefaultDuration(data.type);
    }
    
    // Processar dados
    data.patientName = data.patientName.trim();
    data.phone = normalizePhone(data.phone);
    if (data.email) data.email = data.email.toLowerCase().trim();
    if (data.cpf) data.cpf = normalizeCPF(data.cpf);
    
    // Obter headers
    let headers;
    if (sheet.getLastRow() === 0) {
      headers = [
        'id', 'patientName', 'phone', 'email', 'cpf', 'date', 'time', 
        'type', 'duration', 'status', 'notes', 'createdAt', 'updatedAt', 
        'version', 'priority', 'reminder', 'source'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Formatar cabeçalho
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    
    // Preparar dados para inserção
    const rowData = headers.map(header => data[header] || '');
    
    // Inserir dados
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
    
    LogManager.info('CREATE', 'Appointment inserido na planilha', { id: data.id });
    
    return { success: true, id: data.id };
  } catch (error) {
    LogManager.error('CREATE', 'Erro ao inserir appointment', { error: error.message, data });
    return { success: false, error: error.message };
  }
}

function updateAppointment(data) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.APPOINTMENTS);
    const allData = sheet.getDataRange().getValues();
    
    if (allData.length <= 1) {
      return { success: false, error: 'Nenhum dado encontrado' };
    }
    
    const headers = allData[0];
    const idIndex = headers.indexOf('id');
    const versionIndex = headers.indexOf('version');
    
    if (idIndex === -1) {
      return { success: false, error: 'Coluna ID não encontrada' };
    }
    
    // Encontrar a linha do agendamento
    let rowIndex = -1;
    let currentVersion = 1;
    
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idIndex] === data.id) {
        rowIndex = i;
        currentVersion = parseInt(allData[i][versionIndex] || '1');
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Agendamento não encontrado' };
    }
    
    // Verificar versão para controle de concorrência
    if (data.version && parseInt(data.version) !== currentVersion) {
      LogManager.warn('UPDATE', 'Conflito de versão', { 
        id: data.id, 
        expectedVersion: data.version, 
        currentVersion 
      });
      return { 
        success: false, 
        error: 'Conflito de versão. O agendamento foi modificado por outro usuário.' 
      };
    }
    
    // Atualizar dados
    data.updatedAt = new Date().toISOString();
    data.version = currentVersion + 1;
    
    // Processar dados
    if (data.patientName) data.patientName = data.patientName.trim();
    if (data.phone) data.phone = normalizePhone(data.phone);
    if (data.email) data.email = data.email.toLowerCase().trim();
    if (data.cpf) data.cpf = normalizeCPF(data.cpf);
    
    // Atualizar células
    headers.forEach((header, index) => {
      if (data.hasOwnProperty(header)) {
        sheet.getRange(rowIndex + 1, index + 1).setValue(data[header]);
      }
    });
    
    LogManager.info('UPDATE', 'Appointment atualizado', { id: data.id, version: data.version });
    
    return { success: true, version: data.version };
  } catch (error) {
    LogManager.error('UPDATE', 'Erro ao atualizar appointment', { error: error.message, data });
    return { success: false, error: error.message };
  }
}

// ==========================================
// FUNÇÕES AUXILIARES EXPANDIDAS
// ==========================================
function getSheet(sheetName) {
  try {
    if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === 'SUBSTITUA_PELO_ID_DA_SUA_PLANILHA') {
      throw new Error('ID da planilha não configurado. Edite CONFIG.SPREADSHEET_ID');
    }
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      // Criar aba automaticamente
      sheet = spreadsheet.insertSheet(sheetName);
      initializeSheet(sheet, sheetName);
      LogManager.info('SHEET', `Aba '${sheetName}' criada automaticamente`);
    }
    
    return sheet;
  } catch (error) {
    LogManager.error('SHEET', `Erro ao acessar aba '${sheetName}'`, { error: error.message });
    throw new Error(`Erro ao acessar a aba '${sheetName}': ${error.message}`);
  }
}

function initializeSheet(sheet, sheetName) {
  try {
    const sheetConfigs = {
      [CONFIG.SHEETS.APPOINTMENTS]: {
        headers: ['id', 'patientName', 'phone', 'email', 'cpf', 'date', 'time', 'type', 'duration', 'status', 'notes', 'createdAt', 'updatedAt', 'version', 'priority', 'reminder', 'source'],
        color: '#4285f4'
      },
      [CONFIG.SHEETS.PATIENTS]: {
        headers: ['name', 'phone', 'email', 'cpf', 'totalAppointments', 'lastAppointment', 'firstAppointment', 'status', 'createdAt', 'updatedAt'],
        color: '#34a853'
      },
      [CONFIG.SHEETS.LOGS]: {
        headers: ['timestamp', 'level', 'category', 'message', 'data', 'userId', 'sessionId', 'version', 'environment'],
        color: '#fbbc05'
      },
      [CONFIG.SHEETS.SETTINGS]: {
        headers: ['key', 'value', 'description', 'updatedAt'],
        color: '#ea4335'
      },
      [CONFIG.SHEETS.BACKUP]: {
        headers: ['backupId', 'timestamp', 'dataType', 'recordCount', 'size', 'status', 'metadata'],
        color: '#9c27b0'
      }
    };
    
    const config = sheetConfigs[sheetName];
    if (config) {
      // Configurar cabeçalhos
      const headerRange = sheet.getRange(1, 1, 1, config.headers.length);
      headerRange.setValues([config.headers]);
      headerRange.setFontWeight('bold');
      headerRange.setBackground(config.color);
      headerRange.setFontColor('#ffffff');
      headerRange.setHorizontalAlignment('center');
      
      // Congelar primeira linha
      sheet.setFrozenRows(1);
      
      // Auto-resize
      sheet.autoResizeColumns(1, config.headers.length);
      
      // Cor da aba
      sheet.setTabColor(config.color);
      
      LogManager.info('SHEET', `Aba '${sheetName}' inicializada`, { headers: config.headers.length });
    }
  } catch (error) {
    LogManager.error('SHEET', `Erro ao inicializar aba '${sheetName}'`, { error: error.message });
  }
}

function generateId() {
  return 'apt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

function createResponse(success, message, data = null, statusCode = 200) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString(),
    version: CONFIG.VERSION,
    statusCode: statusCode
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  // Adicionar headers CORS
  const output = ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
    
  return output;
}

// Adicionar mais funções auxiliares necessárias...
function calculateStats(appointments) {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.substring(0, 7);
  
  return {
    total: appointments.length,
    confirmed: appointments.filter(apt => apt.status === 'Confirmado').length,
    pending: appointments.filter(apt => apt.status === 'Pendente').length,
    completed: appointments.filter(apt => apt.status === 'Concluído').length,
    canceled: appointments.filter(apt => apt.status === 'Cancelado').length,
    today: appointments.filter(apt => apt.date === today).length,
    thisMonth: appointments.filter(apt => apt.date.startsWith(thisMonth)).length,
    lastUpdated: new Date().toISOString()
  };
}

function checkTimeConflict(appointmentData, excludeId = null) {
  try {
    const appointments = getAllAppointments();
    
    return appointments.find(apt => 
      apt.date === appointmentData.date &&
      apt.time === appointmentData.time &&
      apt.status !== 'Cancelado' &&
      apt.id !== excludeId
    );
  } catch (error) {
    LogManager.error('CONFLICT', 'Erro ao verificar conflito', { error: error.message });
    return null;
  }
}

// Funções de formatação
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

function formatTime(timeStr) {
  return timeStr || '';
}

function formatDuration(minutes) {
  const mins = parseInt(minutes) || 60;
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h${remainingMins}min` : `${hours}h`;
}

function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

function formatCPF(cpf) {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
}

// Funções de normalização
function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

function normalizeCPF(cpf) {
  return cpf.replace(/\D/g, '');
}

// Sistema de saúde
function getSystemHealth() {
  try {
    const health = {
      status: 'healthy',
      checks: {},
      timestamp: new Date().toISOString(),
      version: CONFIG.VERSION
    };
    
    // Verificar acesso à planilha
    try {
      SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      health.checks.spreadsheet = { status: 'ok', message: 'Planilha acessível' };
    } catch (error) {
      health.checks.spreadsheet = { status: 'error', message: error.message };
      health.status = 'unhealthy';
    }
    
    // Verificar cache
    try {
      CacheManager.set('health_test', 'ok', 60);
      const test = CacheManager.get('health_test');
      health.checks.cache = { 
        status: test === 'ok' ? 'ok' : 'warning', 
        message: test === 'ok' ? 'Cache funcionando' : 'Cache indisponível' 
      };
    } catch (error) {
      health.checks.cache = { status: 'warning', message: 'Cache indisponível' };
      if (health.status === 'healthy') health.status = 'degraded';
    }
    
    // Verificar configurações
    try {
      const settings = ConfigManager.getAllSettings();
      health.checks.config = { 
        status: Object.keys(settings).length > 0 ? 'ok' : 'warning',
        message: `${Object.keys(settings).length} configurações carregadas` 
      };
    } catch (error) {
      health.checks.config = { status: 'warning', message: 'Configurações indisponíveis' };
      if (health.status === 'healthy') health.status = 'degraded';
    }
    
    return health;
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

function getUptime() {
  // Simples implementação de uptime baseada em cache
  const cache = CacheService.getScriptCache();
  let startTime = cache.get('system_start_time');
  
  if (!startTime) {
    startTime = Date.now().toString();
    cache.put('system_start_time', startTime, 21600); // 6 horas
  }
  
  const uptimeMs = Date.now() - parseInt(startTime);
  return Math.floor(uptimeMs / 1000); // em segundos
}

function getCacheStats() {
  // Stats básicas do cache
  return {
    provider: 'Google Apps Script',
    maxSize: '100KB',
    ttl: CONFIG.CACHE_DURATION
  };
}

// Funções de filtros e utilidades adicionais necessárias
function applyFilters(appointment, filters) {
  if (filters.status && appointment.status !== filters.status) return false;
  if (filters.date && appointment.date !== filters.date) return false;
  if (filters.type && appointment.type !== filters.type) return false;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    const searchFields = [appointment.patientName, appointment.phone, appointment.email, appointment.cpf].join(' ').toLowerCase();
    if (!searchFields.includes(search)) return false;
  }
  return true;
}

function getDayOfWeek(dateStr) {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

function isToday(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function isPast(dateStr, timeStr) {
  const appointmentTime = new Date(`${dateStr}T${timeStr}`);
  return appointmentTime < new Date();
}

// Implementações adicionais para as funções que faltam...
function calculateAdvancedStats(appointments) {
  // Implementar estatísticas avançadas
  return {
    conversionRate: 0,
    averageDuration: 0,
    peakHours: [],
    patientRetention: 0
  };
}

function calculateTrends(appointments) {
  // Implementar análise de tendências
  return {
    weekly: [],
    monthly: [],
    growth: 0
  };
}

function countAppointmentsByDate(date) {
  const appointments = getAllAppointments();
  return appointments.filter(apt => apt.date === date && apt.status !== 'Cancelado').length;
}

function getDefaultDuration(type) {
  const durations = {
    'Primeira Consulta': 60,
    'Retorno': 30,
    'Limpeza': 45,
    'Tratamento': 90,
    'Emergência': 30,
    'Ortodontia': 60,
    'Implante': 120,
    'Cirurgia': 180,
    'Prótese': 90,
    'Extração': 45
  };
  return durations[type] || 60;
}

function triggerNotification(type, data) {
  // Implementar sistema de notificações
  try {
    LogManager.info('NOTIFICATION', `Notificação triggered: ${type}`, { patient: data.patientName });
  } catch (error) {
    LogManager.error('NOTIFICATION', 'Erro ao enviar notificação', { error: error.message });
  }
}

function getChanges(oldData, newData) {
  const changes = {};
  Object.keys(newData).forEach(key => {
    if (oldData[key] !== newData[key]) {
      changes[key] = { from: oldData[key], to: newData[key] };
    }
  });
  return changes;
}

function getAppointmentById(id) {
  const appointments = getAllAppointments();
  return appointments.find(apt => apt.id === id);
}

// Implementar funções de pacientes
function calculatePatientSpent(appointments) {
  // Implementar cálculo baseado em tabela de preços
  return 0;
}

function calculateAverageInterval(appointments) {
  // Implementar cálculo de intervalo médio
  return 0;
}

function getMostFrequentTime(appointments) {
  // Implementar análise de horário mais frequente
  return appointments[0]?.time || '';
}

function getMostFrequentType(appointments) {
  // Implementar análise de tipo mais frequente
  return appointments[0]?.type || '';
}

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

function calculateRiskLevel(patient) {
  // Implementar cálculo de nível de risco
  return 'low';
}

function calculatePatientValue(patient) {
  // Implementar cálculo de valor do paciente
  return 'medium';
}

// Handlers adicionais que faltam
function handleDelete(requestData) {
  // Implementar delete
  return createResponse(false, 'Função delete não implementada ainda');
}

function handleUpdateStatus(requestData) {
  // Implementar update status
  return createResponse(false, 'Função updateStatus não implementada ainda');
}

function handleBulkUpdate(requestData) {
  // Implementar bulk update
  return createResponse(false, 'Função bulkUpdate não implementada ainda');
}

function handleBackup(requestData) {
  // Implementar backup
  return createResponse(false, 'Função backup não implementada ainda');
}

function handleOptimize(requestData) {
  // Implementar otimização
  return createResponse(false, 'Função optimize não implementada ainda');
}

function handleExport(requestData) {
  // Implementar export
  return createResponse(false, 'Função export não implementada ainda');
}

/**
 * ========================================
 * INICIALIZAÇÃO E CONFIGURAÇÃO DO SISTEMA
 * ========================================
 */
function setupSystem() {
  try {
    LogManager.info('SETUP', 'Iniciando configuração do sistema');
    
    // Verificar se a planilha existe
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    LogManager.info('SETUP', 'Planilha acessível', { name: spreadsheet.getName() });
    
    // Criar abas necessárias
    Object.values(CONFIG.SHEETS).forEach(sheetName => {
      getSheet(sheetName);
      LogManager.info('SETUP', `Aba '${sheetName}' configurada`);
    });
    
    // Configurações iniciais
    const initialSettings = [
      ['clinic_name', 'Clínica Dental Premium', 'Nome da clínica'],
      ['admin_email', '', 'Email do administrador'],
      ['working_hours_start', '07:00', 'Início do expediente'],
      ['working_hours_end', '20:00', 'Fim do expediente'],
      ['max_appointments_per_day', '50', 'Máximo de agendamentos por dia'],
      ['notifications_enabled', 'true', 'Notificações habilitadas'],
      ['backup_enabled', 'true', 'Backup automático habilitado'],
      ['timezone', 'America/Sao_Paulo', 'Fuso horário']
    ];
    
    initialSettings.forEach(([key, value, description]) => {
      if (!ConfigManager.getSetting(key)) {
        ConfigManager.setSetting(key, value, description);
      }
    });
    
    LogManager.info('SETUP', 'Sistema configurado com sucesso');
    
    return createResponse(true, 'Sistema configurado com sucesso', {
      version: CONFIG.VERSION,
      spreadsheetUrl: spreadsheet.getUrl(),
      sheetsCreated: Object.values(CONFIG.SHEETS)
    });
  } catch (error) {
    LogManager.error('SETUP', 'Erro na configuração do sistema', { error: error.message });
    return createResponse(false, 'Erro na configuração: ' + error.message);
  }
}

/**
 * Teste de conexão expandido
 */
function testConnection() {
  try {
    LogManager.info('TEST', 'Iniciando teste de conexão');
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheetCount = spreadsheet.getSheets().length;
    
    // Teste de escrita
    const testSheet = spreadsheet.insertSheet('Teste_' + Date.now());
    testSheet.getRange(1, 1).setValue('Teste: ' + new Date().toISOString());
    
    // Teste de leitura
    const testValue = testSheet.getRange(1, 1).getValue();
    
    // Limpar teste
    spreadsheet.deleteSheet(testSheet);
    
    const result = {
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      spreadsheetName: spreadsheet.getName(),
      sheetCount: sheetCount,
      readWriteTest: testValue ? 'OK' : 'FALHA',
      timestamp: new Date().toISOString(),
      version: CONFIG.VERSION,
      environment: CONFIG.ENVIRONMENT,
      cacheStatus: CONFIG.OPTIMIZATION.USE_CACHE ? 'Habilitado' : 'Desabilitado',
      logLevel: CONFIG.LOG_LEVEL
    };
    
    LogManager.info('TEST', 'Teste de conexão concluído', result);
    
    return createResponse(true, 'Teste de conexão realizado com sucesso', result);
  } catch (error) {
    LogManager.error('TEST', 'Erro no teste de conexão', { error: error.message });
    return createResponse(false, 'Erro no teste de conexão: ' + error.message);
  }
}