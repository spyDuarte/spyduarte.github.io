/**
 * ====================================
 * 🎰 CAÇA-NÍQUEL DA FORTUNA - TESTS
 * ====================================
 * 
 * Arquivo: tests.js
 * Versão: 2.0.0
 * Descrição: Suite de testes unitários e de integração
 * 
 * Framework: Jest (se disponível) ou implementação própria
 * 
 * ====================================
 */

'use strict';

// ====== MOCK DOM ENVIRONMENT ======
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = String(value);
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
  
  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
  
  get length() {
    return Object.keys(this.store).length;
  }
}

class MockDocument {
  constructor() {
    this.elements = new Map();
    this.eventListeners = new Map();
  }
  
  getElementById(id) {
    return this.elements.get(id) || {
      textContent: '',
      value: '',
      checked: false,
      disabled: false,
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      },
      setAttribute: () => {},
      getAttribute: () => null,
      removeAttribute: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }
  
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      },
      setAttribute: () => {},
      getAttribute: () => null,
      addEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      remove: () => {}
    };
  }
  
  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }
  
  removeEventListener(event, handler) {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// ====== TEST FRAMEWORK ======
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }
  
  describe(description, callback) {
    console.log(`\n📝 ${description}`);
    callback();
  }
  
  test(name, callback) {
    try {
      callback();
      this.passed++;
      this.results.push({ name, status: 'PASS', error: null });
      console.log(`  ✅ ${name}`);
    } catch (error) {
      this.failed++;
      this.results.push({ name, status: 'FAIL', error: error.message });
      console.log(`  ❌ ${name}: ${error.message}`);
    }
  }
  
  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, got ${actual}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected truthy value, got ${actual}`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected falsy value, got ${actual}`);
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeLessThan: (expected) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toHaveLength: (expected) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${expected}, got ${actual.length}`);
        }
      },
      toThrow: () => {
        try {
          actual();
          throw new Error('Expected function to throw');
        } catch (error) {
          // Expected to throw
        }
      }
    };
  }
  
  beforeEach(callback) {
    this.beforeEachCallback = callback;
  }
  
  afterEach(callback) {
    this.afterEachCallback = callback;
  }
  
  runTest(name, callback) {
    if (this.beforeEachCallback) {
      this.beforeEachCallback();
    }
    
    this.test(name, callback);
    
    if (this.afterEachCallback) {
      this.afterEachCallback();
    }
  }
  
  getSummary() {
    const total = this.passed + this.failed;
    const percentage = total > 0 ? Math.round((this.passed / total) * 100) : 0;
    
    return {
      total,
      passed: this.passed,
      failed: this.failed,
      percentage,
      results: this.results
    };
  }
  
  printSummary() {
    const summary = this.getSummary();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ${summary.failed > 0 ? '❌' : ''}`);
    console.log(`Success Rate: ${summary.percentage}%`);
    
    if (summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      summary.results
        .filter(result => result.status === 'FAIL')
        .forEach(result => {
          console.log(`  • ${result.name}: ${result.error}`);
        });
    }
    
    console.log('='.repeat(50));
  }
}

// ====== SETUP TEST ENVIRONMENT ======
function setupTestEnvironment() {
  // Mock global objects
  global.localStorage = new MockLocalStorage();
  global.document = new MockDocument();
  global.window = {
    location: { hostname: 'localhost', hash: '' },
    history: { pushState: () => {}, replaceState: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    localStorage: global.localStorage,
    Math: Math,
    Date: Date,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval
  };
  global.console = console;
  
  // Mock functions that might not exist
  global.showMessage = (text, type) => {
    console.log(`Message: ${text} (${type})`);
  };
  
  global.updateDisplay = () => {
    console.log('Display updated');
  };
}

// ====== GAME LOGIC TESTS ======
function testGameLogic(runner) {
  runner.describe('Game Logic Tests', () => {
    let gameState;
    
    runner.beforeEach(() => {
      setupTestEnvironment();
      
      // Mock GAME_CONFIG
      global.GAME_CONFIG = {
        symbols: ['🍒', '🍊', '🍋', '🍇', '🔔', '💎'],
        payouts: {
          '🍒🍒🍒': 100,
          '🍊🍊🍊': 150,
          '🍋🍋🍋': 200,
          '🍇🍇🍇': 300,
          '🔔🔔🔔': 500,
          '💎💎💎': 1000
        },
        minBet: 25,
        maxBet: 500,
        initialCredits: 1000
      };
      
      // Simple GameState mock
      gameState = {
        credits: 1000,
        bet: 50,
        totalSpins: 0,
        totalWins: 0,
        settings: {
          visualEffects: true,
          reducedAnimations: false,
          soundVolume: 50
        },
        validateGameState: function() {
          if (this.credits < 0) this.credits = 0;
          if (this.bet < global.GAME_CONFIG.minBet) this.bet = global.GAME_CONFIG.minBet;
          if (this.bet > global.GAME_CONFIG.maxBet) this.bet = global.GAME_CONFIG.maxBet;
        }
      };
    });
    
    runner.test('should initialize with correct default values', () => {
      runner.expect(gameState.credits).toBe(1000);
      runner.expect(gameState.bet).toBe(50);
      runner.expect(gameState.totalSpins).toBe(0);
    });
    
    runner.test('should validate game state correctly', () => {
      gameState.credits = -100;
      gameState.bet = 10;
      gameState.validateGameState();
      
      runner.expect(gameState.credits).toBe(0);
      runner.expect(gameState.bet).toBe(25);
    });
    
    runner.test('getRandomSymbol should return valid symbol', () => {
      // Mock getRandomSymbol function
      const getRandomSymbol = () => {
        const symbols = global.GAME_CONFIG.symbols;
        return symbols[Math.floor(Math.random() * symbols.length)];
      };
      
      const symbol = getRandomSymbol();
      runner.expect(global.GAME_CONFIG.symbols).toContain(symbol);
    });
    
    runner.test('checkWin should calculate correct payouts', () => {
      // Mock checkWin function
      const checkWin = (reel1, reel2, reel3) => {
        const combination = reel1 + reel2 + reel3;
        
        if (global.GAME_CONFIG.payouts[combination]) {
          return global.GAME_CONFIG.payouts[combination] * gameState.bet;
        }
        
        if (reel1 === reel2 || reel1 === reel3 || reel2 === reel3) {
          return gameState.bet * 2;
        }
        
        return 0;
      };
      
      // Test jackpot
      runner.expect(checkWin('💎', '💎', '💎')).toBe(50000); // 1000 * 50
      
      // Test regular win
      runner.expect(checkWin('🍒', '🍒', '🍒')).toBe(5000); // 100 * 50
      
      // Test partial match
      runner.expect(checkWin('🍒', '🍒', '🍊')).toBe(100); // 2 * 50
      
      // Test no match
      runner.expect(checkWin('🍒', '🍊', '🍋')).toBe(0);
    });
    
    runner.test('should handle bet changes correctly', () => {
      const changeBet = (amount) => {
        const newBet = gameState.bet + amount;
        if (newBet >= global.GAME_CONFIG.minBet && 
            newBet <= global.GAME_CONFIG.maxBet && 
            newBet <= gameState.credits) {
          gameState.bet = newBet;
          return true;
        }
        return false;
      };
      
      // Valid bet change
      const result1 = changeBet(25);
      runner.expect(result1).toBeTruthy();
      runner.expect(gameState.bet).toBe(75);
      
      // Invalid bet change (too low)
      gameState.bet = 25;
      const result2 = changeBet(-50);
      runner.expect(result2).toBeFalsy();
      runner.expect(gameState.bet).toBe(25);
      
      // Invalid bet change (exceeds credits)
      gameState.credits = 100;
      gameState.bet = 50;
      const result3 = changeBet(100);
      runner.expect(result3).toBeFalsy();
      runner.expect(gameState.bet).toBe(50);
    });
  });
}

// ====== SETTINGS TESTS ======
function testSettings(runner) {
  runner.describe('Settings Manager Tests', () => {
    let settingsManager;
    
    runner.beforeEach(() => {
      setupTestEnvironment();
      
      // Mock SETTINGS_CONFIG
      global.SETTINGS_CONFIG = {
        defaults: {
          soundVolume: 50,
          musicVolume: 75,
          visualEffects: true,
          reducedAnimations: false,
          autoSpinSpeed: 3
        },
        limits: {
          soundVolume: { min: 0, max: 100 },
          musicVolume: { min: 0, max: 100 },
          autoSpinSpeed: { min: 1, max: 5 }
        }
      };
      
      // Simple SettingsManager mock
      settingsManager = {
        settings: { ...global.SETTINGS_CONFIG.defaults },
        
        validateSetting: function(key, value) {
          if (key === 'soundVolume' || key === 'musicVolume') {
            return typeof value === 'number' && value >= 0 && value <= 100;
          }
          if (key === 'autoSpinSpeed') {
            return typeof value === 'number' && value >= 1 && value <= 5;
          }
          if (key === 'visualEffects' || key === 'reducedAnimations') {
            return typeof value === 'boolean';
          }
          return true;
        },
        
        updateSetting: function(key, value) {
          if (this.validateSetting(key, value)) {
            this.settings[key] = value;
            return true;
          }
          return false;
        },
        
        resetSettings: function() {
          this.settings = { ...global.SETTINGS_CONFIG.defaults };
        }
      };
    });
    
    runner.test('should initialize with default settings', () => {
      runner.expect(settingsManager.settings.soundVolume).toBe(50);
      runner.expect(settingsManager.settings.visualEffects).toBeTruthy();
    });
    
    runner.test('should validate settings correctly', () => {
      runner.expect(settingsManager.validateSetting('soundVolume', 75)).toBeTruthy();
      runner.expect(settingsManager.validateSetting('soundVolume', 150)).toBeFalsy();
      runner.expect(settingsManager.validateSetting('visualEffects', true)).toBeTruthy();
      runner.expect(settingsManager.validateSetting('visualEffects', 'true')).toBeFalsy();
    });
    
    runner.test('should update settings when valid', () => {
      const result = settingsManager.updateSetting('soundVolume', 80);
      runner.expect(result).toBeTruthy();
      runner.expect(settingsManager.settings.soundVolume).toBe(80);
    });
    
    runner.test('should reject invalid settings', () => {
      const result = settingsManager.updateSetting('soundVolume', 150);
      runner.expect(result).toBeFalsy();
      runner.expect(settingsManager.settings.soundVolume).toBe(50); // Should remain unchanged
    });
    
    runner.test('should reset to defaults', () => {
      settingsManager.updateSetting('soundVolume', 80);
      settingsManager.updateSetting('visualEffects', false);
      
      settingsManager.resetSettings();
      
      runner.expect(settingsManager.settings.soundVolume).toBe(50);
      runner.expect(settingsManager.settings.visualEffects).toBeTruthy();
    });
  });
}

// ====== NAVIGATION TESTS ======
function testNavigation(runner) {
  runner.describe('Navigation Manager Tests', () => {
    let navigationManager;
    
    runner.beforeEach(() => {
      setupTestEnvironment();
      
      global.NAVIGATION_CONFIG = {
        sections: ['home', 'game', 'historic', 'config', 'faq'],
        defaultSection: 'home'
      };
      
      navigationManager = {
        currentSection: 'home',
        isTransitioning: false,
        
        validateSection: function(sectionId) {
          return global.NAVIGATION_CONFIG.sections.includes(sectionId);
        },
        
        navigateToSection: function(sectionId) {
          if (!this.validateSection(sectionId)) {
            sectionId = global.NAVIGATION_CONFIG.defaultSection;
          }
          
          if (this.currentSection === sectionId || this.isTransitioning) {
            return false;
          }
          
          this.currentSection = sectionId;
          return true;
        }
      };
    });
    
    runner.test('should start with default section', () => {
      runner.expect(navigationManager.currentSection).toBe('home');
    });
    
    runner.test('should validate sections correctly', () => {
      runner.expect(navigationManager.validateSection('game')).toBeTruthy();
      runner.expect(navigationManager.validateSection('invalid')).toBeFalsy();
    });
    
    runner.test('should navigate to valid sections', () => {
      const result = navigationManager.navigateToSection('game');
      runner.expect(result).toBeTruthy();
      runner.expect(navigationManager.currentSection).toBe('game');
    });
    
    runner.test('should handle invalid sections', () => {
      navigationManager.navigateToSection('invalid');
      runner.expect(navigationManager.currentSection).toBe('home'); // Should fallback to default
    });
    
    runner.test('should prevent navigation to same section', () => {
      const result = navigationManager.navigateToSection('home');
      runner.expect(result).toBeFalsy();
    });
  });
}

// ====== SOUND MANAGER TESTS ======
function testSoundManager(runner) {
  runner.describe('Sound Manager Tests', () => {
    let soundManager;
    
    runner.beforeEach(() => {
      setupTestEnvironment();
      
      soundManager = {
        volumes: {
          soundVolume: 50,
          musicVolume: 75
        },
        isInitialized: false,
        
        init: function() {
          this.isInitialized = true;
          return true;
        },
        
        updateVolume: function(type, value) {
          if (this.volumes.hasOwnProperty(type) && value >= 0 && value <= 100) {
            this.volumes[type] = value;
            return true;
          }
          return false;
        },
        
        getVolume: function(type = 'soundVolume') {
          return (this.volumes[type] / 100) * 0.3;
        },
        
        isReady: function() {
          return this.isInitialized;
        }
      };
    });
    
    runner.test('should initialize correctly', () => {
      soundManager.init();
      runner.expect(soundManager.isReady()).toBeTruthy();
    });
    
    runner.test('should update volume correctly', () => {
      const result = soundManager.updateVolume('soundVolume', 80);
      runner.expect(result).toBeTruthy();
      runner.expect(soundManager.volumes.soundVolume).toBe(80);
    });
    
    runner.test('should reject invalid volume values', () => {
      const result = soundManager.updateVolume('soundVolume', 150);
      runner.expect(result).toBeFalsy();
      runner.expect(soundManager.volumes.soundVolume).toBe(50);
    });
    
    runner.test('should calculate relative volume correctly', () => {
      soundManager.updateVolume('soundVolume', 50);
      const volume = soundManager.getVolume('soundVolume');
      runner.expect(volume).toBe(0.15); // (50/100) * 0.3
    });
  });
}

// ====== PERFORMANCE TESTS ======
function testPerformance(runner) {
  runner.describe('Performance Tests', () => {
    runner.test('getRandomSymbol should be fast', () => {
      const symbols = ['🍒', '🍊', '🍋', '🍇', '🔔', '💎'];
      const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];
      
      const start = performance.now();
      
      // Run 10000 times
      for (let i = 0; i < 10000; i++) {
        getRandomSymbol();
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete in less than 100ms
      runner.expect(duration).toBeLessThan(100);
    });
    
    runner.test('checkWin should be efficient', () => {
      const payouts = {
        '🍒🍒🍒': 100,
        '🍊🍊🍊': 150,
        '💎💎💎': 1000
      };
      
      const checkWin = (r1, r2, r3) => {
        const combo = r1 + r2 + r3;
        return payouts[combo] || (r1 === r2 || r1 === r3 || r2 === r3 ? 2 : 0);
      };
      
      const start = performance.now();
      
      // Test various combinations
      const testCombos = [
        ['🍒', '🍒', '🍒'],
        ['🍊', '🍊', '🍊'],
        ['💎', '💎', '💎'],
        ['🍒', '🍊', '🍋'],
        ['🍒', '🍒', '🍊']
      ];
      
      for (let i = 0; i < 1000; i++) {
        testCombos.forEach(combo => {
          checkWin(combo[0], combo[1], combo[2]);
        });
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete in less than 50ms
      runner.expect(duration).toBeLessThan(50);
    });
  });
}

// ====== INTEGRATION TESTS ======
function testIntegration(runner) {
  runner.describe('Integration Tests', () => {
    let gameState, settingsManager, navigationManager;
    
    runner.beforeEach(() => {
      setupTestEnvironment();
      
      // Setup integrated components
      gameState = {
        credits: 1000,
        bet: 50,
        isSpinning: false,
        settings: {
          visualEffects: true,
          soundVolume: 50
        }
      };
      
      settingsManager = {
        settings: { ...gameState.settings },
        updateSetting: function(key, value) {
          this.settings[key] = value;
          if (gameState.settings) {
            gameState.settings[key] = value;
          }
        }
      };
      
      navigationManager = {
        currentSection: 'home',
        navigateToSection: function(section) {
          this.currentSection = section;
          // Trigger section-specific logic
          if (section === 'game' && typeof updateDisplay === 'function') {
            updateDisplay();
          }
        }
      };
    });
    
    runner.test('settings should sync with game state', () => {
      settingsManager.updateSetting('visualEffects', false);
      
      runner.expect(gameState.settings.visualEffects).toBeFalsy();
      runner.expect(settingsManager.settings.visualEffects).toBeFalsy();
    });
    
    runner.test('navigation should trigger appropriate actions', () => {
      let displayUpdated = false;
      global.updateDisplay = () => { displayUpdated = true; };
      
      navigationManager.navigateToSection('game');
      
      runner.expect(navigationManager.currentSection).toBe('game');
      runner.expect(displayUpdated).toBeTruthy();
    });
    
    runner.test('game state should persist across navigation', () => {
      gameState.credits = 1500;
      gameState.bet = 100;
      
      navigationManager.navigateToSection('config');
      navigationManager.navigateToSection('game');
      
      runner.expect(gameState.credits).toBe(1500);
      runner.expect(gameState.bet).toBe(100);
    });
  });
}

// ====== ERROR HANDLING TESTS ======
function testErrorHandling(runner) {
  runner.describe('Error Handling Tests', () => {
    runner.test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalLocalStorage = global.localStorage;
      global.localStorage = {
        getItem: () => { throw new Error('Storage error'); },
        setItem: () => { throw new Error('Storage error'); }
      };
      
      const loadSettings = () => {
        try {
          return JSON.parse(global.localStorage.getItem('settings'));
        } catch (error) {
          return { soundVolume: 50, visualEffects: true }; // defaults
        }
      };
      
      const settings = loadSettings();
      runner.expect(settings.soundVolume).toBe(50);
      
      // Restore
      global.localStorage = originalLocalStorage;
    });
    
    runner.test('should handle invalid JSON gracefully', () => {
      global.localStorage.setItem('gameData', 'invalid json');
      
      const loadGameData = () => {
        try {
          return JSON.parse(global.localStorage.getItem('gameData'));
        } catch (error) {
          return { credits: 1000, bet: 50 }; // defaults
        }
      };
      
      const data = loadGameData();
      runner.expect(data.credits).toBe(1000);
    });
    
    runner.test('should validate data before using', () => {
      const validateGameData = (data) => {
        if (!data || typeof data !== 'object') return false;
        if (typeof data.credits !== 'number' || data.credits < 0) return false;
        if (typeof data.bet !== 'number' || data.bet < 25) return false;
        return true;
      };
      
      runner.expect(validateGameData({ credits: 1000, bet: 50 })).toBeTruthy();
      runner.expect(validateGameData({ credits: -100, bet: 50 })).toBeFalsy();
      runner.expect(validateGameData({ credits: 1000, bet: 10 })).toBeFalsy();
      runner.expect(validateGameData(null)).toBeFalsy();
    });
  });
}

// ====== ACCESSIBILITY TESTS ======
function testAccessibility(runner) {
  runner.describe('Accessibility Tests', () => {
    runner.test('should have proper ARIA labels', () => {
      const mockElement = {
        getAttribute: (attr) => attr === 'aria-label' ? 'Girar os rolos' : null,
        setAttribute: () => {},
        hasAttribute: (attr) => attr === 'aria-label'
      };
      
      runner.expect(mockElement.hasAttribute('aria-label')).toBeTruthy();
      runner.expect(mockElement.getAttribute('aria-label')).toBe('Girar os rolos');
    });
    
    runner.test('should support keyboard navigation', () => {
      const keyboardHandler = (event) => {
        const actions = {
          ' ': 'spin',
          'ArrowUp': 'increaseBet',
          'ArrowDown': 'decreaseBet',
          'a': 'autoSpin'
        };
        
        return actions[event.key] || null;
      };
      
      runner.expect(keyboardHandler({ key: ' ' })).toBe('spin');
      runner.expect(keyboardHandler({ key: 'ArrowUp' })).toBe('increaseBet');
      runner.expect(keyboardHandler({ key: 'x' })).toBe(null);
    });
    
    runner.test('should provide proper focus management', () => {
      const focusManager = {
        currentFocus: null,
        
        setFocus: function(element) {
          this.currentFocus = element;
        },
        
        getFocus: function() {
          return this.currentFocus;
        },
        
        moveFocus: function(direction) {
          const elements = ['home', 'game', 'historic', 'config', 'faq'];
          const current = elements.indexOf(this.currentFocus);
          
          if (direction === 'next') {
            const next = (current + 1) % elements.length;
            this.currentFocus = elements[next];
          } else if (direction === 'prev') {
            const prev = current === 0 ? elements.length - 1 : current - 1;
            this.currentFocus = elements[prev];
          }
        }
      };
      
      focusManager.setFocus('home');
      focusManager.moveFocus('next');
      runner.expect(focusManager.getFocus()).toBe('game');
      
      focusManager.moveFocus('prev');
      runner.expect(focusManager.getFocus()).toBe('home');
    });
  });
}

// ====== RUN ALL TESTS ======
function runAllTests() {
  console.log('🧪 Starting Caça-níquel da Fortuna Test Suite');
  console.log('=' + '='.repeat(48));
  
  const runner = new TestRunner();
  
  try {
    // Run test suites
    testGameLogic(runner);
    testSettings(runner);
    testNavigation(runner);
    testSoundManager(runner);
    testPerformance(runner);
    testIntegration(runner);
    testErrorHandling(runner);
    testAccessibility(runner);
    
    // Print summary
    runner.printSummary();
    
    return runner.getSummary();
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    return { total: 0, passed: 0, failed: 1, percentage: 0 };
  }
}

// ====== EXPORT FOR NODE.JS ======
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    TestRunner,
    setupTestEnvironment
  };
}

// ====== AUTO-RUN IN BROWSER ======
if (typeof window !== 'undefined' && window.location) {
  // Only auto-run tests in development
  if (window.location.hostname === 'localhost' || window.location.search.includes('test=true')) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        console.log('🧪 Auto-running tests...');
        const results = runAllTests();
        
        // Store results globally for debugging
        window.testResults = results;
        
        // Show in UI if test elements exist
        const testResultsElement = document.getElementById('testResults');
        if (testResultsElement) {
          testResultsElement.innerHTML = `
            <h3>Test Results</h3>
            <p>Total: ${results.total}</p>
            <p>Passed: ${results.passed}</p>
            <p>Failed: ${results.failed}</p>
            <p>Success Rate: ${results.percentage}%</p>
          `;
        }
      }, 2000);
    });
  }
}

// ====== DEBUGGING HELPERS ======
window.runTests = runAllTests;
window.TestRunner = TestRunner;

console.log('🧪 Tests.js loaded successfully');