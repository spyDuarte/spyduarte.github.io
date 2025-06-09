# 🤝 Contribuindo para o Caça-níquel da Fortuna

Obrigado por considerar contribuir para o **Caça-níquel da Fortuna**! Este documento fornece diretrizes e informações sobre como contribuir para o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Pull Requests](#pull-requests)
- [Padrões de Código](#padrões-de-código)
- [Testes](#testes)
- [Documentação](#documentação)

## 📜 Código de Conduta

Este projeto segue um código de conduta que todos os contribuidores devem respeitar. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

### Nossos Padrões

**Comportamentos que contribuem para um ambiente positivo:**
- Usar linguagem acolhedora e inclusiva
- Ser respeitoso com diferentes pontos de vista
- Aceitar críticas construtivas graciosamente
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

**Comportamentos inaceitáveis:**
- Uso de linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos ou ataques pessoais
- Assédio público ou privado
- Publicar informações privadas de terceiros
- Outras condutas inadequadas em um ambiente profissional

## 🚀 Como Contribuir

Existem várias maneiras de contribuir:

### 🐛 Reportando Bugs
- Use a [seção de Issues](../../issues) para reportar bugs
- Forneça informações detalhadas sobre o problema
- Inclua passos para reproduzir o bug

### 💡 Sugerindo Melhorias
- Abra uma issue com a tag "enhancement"
- Descreva claramente a melhoria proposta
- Explique por que seria útil para o projeto

### 💻 Contribuições de Código
- Fork o repositório
- Crie uma branch para sua feature
- Implemente as mudanças
- Adicione ou atualize testes
- Envie um Pull Request

### 📚 Melhorando a Documentação
- Correções de typos
- Melhorias na clareza
- Adição de exemplos
- Tradução para outros idiomas

## 🐛 Reportando Bugs

Antes de reportar um bug, verifique se ele já não foi reportado. Se não encontrar uma issue existente, crie uma nova com as seguintes informações:

### Template de Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

**Comportamento Esperado**
Descrição clara do que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Informações do Sistema:**
- OS: [ex: iOS 14.5, Windows 10, Ubuntu 20.04]
- Navegador: [ex: Chrome 91, Firefox 89, Safari 14]
- Versão: [ex: 2.0.0]

**Contexto Adicional**
Qualquer outra informação sobre o problema.
```

## 💡 Sugerindo Melhorias

### Template de Feature Request

```markdown
**A sua feature está relacionada a um problema? Descreva.**
Descrição clara do problema. Ex: Estou sempre frustrado quando [...]

**Descreva a solução que você gostaria**
Descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas consideradas**
Descrição clara de soluções ou features alternativas.

**Contexto Adicional**
Screenshots, mockups, ou qualquer outro contexto sobre a feature.
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- **Node.js** 14.0+ 
- **npm** 6.0+ ou **yarn** 1.22+
- **Git**
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Configuração

1. **Fork e Clone**
   ```bash
   git clone https://github.com/seu-usuario/caca-niquel-fortuna.git
   cd caca-niquel-fortuna
   ```

2. **Instalar Dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurar Ambiente**
   ```bash
   # Copiar arquivo de configuração exemplo
   cp .env.example .env.local
   ```

4. **Iniciar Servidor de Desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Abrir no Navegador**
   - Acesse `http://localhost:3000`

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor com hot reload
npm run start        # Servidor de produção local

# Build e Deploy
npm run build        # Build otimizado
npm run deploy       # Deploy para GitHub Pages

# Qualidade de Código
npm run lint         # ESLint
npm run lint:fix     # Corrigir problemas automáticos
npm run format       # Prettier
npm run validate     # Validar HTML

# Testes
npm test             # Executar todos os testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Cobertura de testes

# Utilitários
npm run lighthouse   # Análise de performance
npm run analyze      # Análise do bundle
```

## 📝 Pull Requests

### Processo

1. **Fork** o repositório
2. **Crie** uma branch descritiva
   ```bash
   git checkout -b feature/nova-funcionalidade
   # ou
   git checkout -b fix/correcao-bug
   ```

3. **Implemente** suas mudanças
4. **Teste** thoroughly
5. **Commit** com mensagens claras
6. **Push** para sua branch
7. **Abra** um Pull Request

### Diretrizes para PRs

#### ✅ Boa PR
- Foca em uma única funcionalidade ou correção
- Inclui testes para novas funcionalidades
- Atualiza documentação quando necessário
- Segue os padrões de código do projeto
- Tem uma descrição clara das mudanças

#### ❌ Evite
- PRs muito grandes que tocam muitos arquivos
- Mudanças sem testes
- Commits com mensagens vagas
- Alterações não relacionadas ao objetivo
- Quebrar funcionalidades existentes

### Template de Pull Request

```markdown
## Descrição
Breve descrição das mudanças feitas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (fix ou feature que quebra funcionalidade existente)
- [ ] Documentação (mudanças na documentação)

## Como Foi Testado?
Descreva os testes que você executou para verificar suas mudanças.

## Screenshots (se aplicável)
Adicione screenshots para ajudar a explicar suas mudanças.

## Checklist
- [ ] Meu código segue as diretrizes de estilo do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei código em áreas particularmente complexas
- [ ] Adicionei testes que provam que minha correção funciona
- [ ] Testes novos e existentes passam localmente
- [ ] Atualizei a documentação conforme necessário
```

## 🎨 Padrões de Código

### JavaScript

- **ES6+**: Use features modernas do JavaScript
- **Async/Await**: Prefira sobre Promises quando possível
- **Arrow Functions**: Para funções simples
- **Destructuring**: Para extrair propriedades de objetos
- **Template Literals**: Para interpolação de strings

#### Exemplo de Bom Código

```javascript
// ✅ Bom
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json();
    
    return {
      success: true,
      data: userData
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ❌ Evite
function fetchUserData(userId, callback) {
  fetch('/api/users/' + userId)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      callback(null, data);
    })
    .catch(function(error) {
      callback(error, null);
    });
}
```

### HTML

- **Semântico**: Use elementos HTML5 apropriados
- **Acessibilidade**: Inclua atributos ARIA
- **Performance**: Otimize carregamento de recursos

### CSS

- **Mobile-First**: Desenvolva primeiro para mobile
- **BEM**: Use metodologia BEM para naming
- **CSS Custom Properties**: Para temas e variáveis
- **Flexbox/Grid**: Para layouts modernos

### Convenções de Naming

```javascript
// Variáveis e funções: camelCase
const gameState = {};
function updateDisplay() {}

// Constantes: UPPER_SNAKE_CASE
const GAME_CONFIG = {};
const MAX_BET_AMOUNT = 500;

// Classes: PascalCase
class GameStateManager {}
class SoundManager {}

// Arquivos: kebab-case
// game-logic.js
// sound-manager.js
// user-interface.css
```

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --grep "Game Logic"

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Escrevendo Testes

```javascript
// Exemplo de teste
describe('Game Logic', () => {
  test('should calculate win correctly', () => {
    const result = checkWin('🍒', '🍒', '🍒');
    expect(result).toBe(5000); // 100 * 50 bet
  });
  
  test('should handle invalid input', () => {
    expect(() => {
      checkWin(null, null, null);
    }).toThrow();
  });
});
```

### Cobertura de Testes

Mantemos uma cobertura mínima de:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## 📚 Documentação

### Comentários no Código

```javascript
/**
 * Calcula o resultado de uma jogada
 * @param {string} reel1 - Primeiro rolo
 * @param {string} reel2 - Segundo rolo  
 * @param {string} reel3 - Terceiro rolo
 * @returns {number} Valor ganho ou 0 se perdeu
 */
function checkWin(reel1, reel2, reel3) {
  // Implementação...
}
```

### README Updates

Ao adicionar novas features, atualize:
- Seção de funcionalidades
- Instruções de instalação (se necessário)
- Exemplos de uso
- Screenshots (se aplicável)

## 🎯 Áreas que Precisam de Ajuda

Estamos especialmente interessados em contribuições nas seguintes áreas:

### 🔥 Alta Prioridade
- **Acessibilidade**: Melhorar suporte para leitores de tela
- **Performance**: Otimizações de velocidade e memória
- **Testes**: Aumentar cobertura de testes
- **Mobile**: Melhorar experiência mobile

### 🚀 Novas Features
- **Temas**: Novos esquemas de cores
- **Animações**: Efeitos visuais aprimorados
- **Sons**: Mais efeitos sonoros
- **Idiomas**: Tradução para outros idiomas

### 🐛 Bugs Conhecidos
- Veja [Issues abertas](../../issues) com label "bug"
- Issues com label "good first issue" são ideais para iniciantes

## 🆘 Precisa de Ajuda?

Se você tiver dúvidas ou precisar de ajuda:

1. **Check a documentação**: README.md e arquivos de docs/
2. **Issues existentes**: Veja se sua dúvida já foi respondida
3. **Nova issue**: Crie uma issue com label "question"
4. **Discussões**: Use as [Discussions](../../discussions) do GitHub

## 🎉 Reconhecimento

Todos os contribuidores são listados no arquivo [CONTRIBUTORS.md](CONTRIBUTORS.md). Contribuições de qualquer tamanho são valorizadas!

### Tipos de Contribuição

- 💻 **Código**: Novas features, correções de bugs
- 🐛 **Bug Reports**: Identificação de problemas
- 📝 **Documentação**: Melhorias na documentação
- 🎨 **Design**: UI/UX improvements
- 🔧 **Ferramentas**: Melhorias no processo de desenvolvimento
- 💡 **Ideias**: Sugestões e feedback
- 🤔 **Perguntas**: Ajudar outros usuários

---

**Obrigado por ajudar a tornar o Caça-níquel da Fortuna ainda melhor! 🎰✨**