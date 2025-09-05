# 🌟 Galáxia das Profissões

Uma plataforma web inovadora que apresenta o mundo das profissões como uma galáxia interativa, onde cada estrela representa uma carreira e convida o usuário a explorar, descobrir e se orientar vocacionalmente através de uma experiência visual única e envolvente.

## 🎯 Visão Geral do Projeto

**Galáxia das Profissões** é uma aplicação moderna desenvolvida em Next.js que revoluciona a forma como pessoas descobrem e exploram carreiras profissionais. Através de uma interface galáctica navegável, os usuários podem:

- 🌌 **Explorar visualmente** mais de 30 profissões organizadas em uma galáxia interativa
- 🔍 **Descobrir carreiras** através de busca avançada e filtros por área de atuação
- 📊 **Obter informações detalhadas** sobre salários, formação, atividades e certificações
- 🎮 **Participar de sistema de gamificação** com conquistas e jornadas guiadas
- 🧠 **Realizar teste vocacional** para receber recomendações personalizadas
- 👤 **Gerenciar perfil** com sistema de autenticação e progresso pessoal

## 🏗️ Arquitetura e Tecnologias

### Stack Principal
- **Next.js 14** - Framework React com App Router para performance otimizada
- **TypeScript** - Tipagem estática para código mais confiável
- **Tailwind CSS** - Framework CSS utilitário para estilização rápida
- **Framer Motion** - Biblioteca de animações para interações fluidas
- **PostgreSQL (Neon)** - Banco de dados na nuvem para persistência
- **Redis/IORedis** - Cache e gerenciamento de sessões
- **JWT + bcrypt** - Autenticação e segurança

### Ferramentas de Desenvolvimento
- **Pino** - Sistema de logs estruturado
- **Swagger** - Documentação automática da API
- **Mixpanel** - Analytics e tracking de usuários
- **Sentry** - Monitoramento de erros em produção
- **SendGrid/Nodemailer** - Serviço de envio de emails

### Integrações e Serviços
- **Rate Limiting** - Controle de requisições por IP
- **Queue System** - Processamento assíncrono de tarefas
- **Background Workers** - Jobs em background para operações pesadas

## 🎨 Funcionalidades Implementadas

### 🌌 Navegação Galáctica Avançada
- **Controle total**: Arraste, zoom e navegação suave pela galáxia
- **30+ estrelas-profissões** posicionadas dinamicamente
- **Cores personalizadas** para cada área profissional
- **Tooltips informativos** ao passar o mouse nas estrelas
- **Estatísticas em tempo real** da galáxia

### 🔍 Sistema de Busca e Filtros
- **Busca inteligente** por nome, descrição ou área
- **Filtros por área** com contadores dinâmicos
- **Destaque visual** dos resultados encontrados
- **Performance otimizada** com debounce e cache

### 📊 Detalhes Completos das Profissões
- **Informações abrangentes**: Descrição, requisitos, atividades principais
- **Faixas salariais** atualizadas por região
- **Tempo de formação** e níveis educacionais
- **Certificações importantes** para cada carreira
- **Profissões relacionadas** com navegação entre elas

### 🎮 Sistema de Gamificação
- **Conquistas desbloqueáveis** por exploração e engajamento
- **Sistema de XP** e níveis de usuário
- **Jornadas guiadas** para diferentes perfis de interesse
- **Painel de progresso** personalizado
- **Lista de desejos** para profissões favoritas (em desenvolvimento)

### 🧠 Teste Vocacional Integrado
- **20+ perguntas** baseadas no modelo RIASEC
- **Algoritmo de compatibilidade** que analisa perfil psicológico
- **Resultados detalhados** com percentuais de afinidade
- **Recomendações personalizadas** de carreiras
- **Integração com a galáxia** para navegação direta

### 👤 Sistema de Autenticação Robusto
- **Cadastro completo** com validações avançadas
- **Login seguro** com JWT e refresh tokens
- **Recuperação de senha** via email
- **Perfis educacionais** opcionais para melhor personalização
- **Proteção contra** ataques e validação rigorosa

### 🔧 Painel Administrativo
- **Gerenciamento de profissões** com CRUD completo
- **Expansão dinâmica** da galáxia com novas profissões
- **Monitoramento de jobs** e tarefas em background
- **Estatísticas de uso** e analytics

## 🗂️ Estrutura de Arquivos

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Rotas da API
│   │   ├── auth/         # Autenticação (login, register, reset)
│   │   ├── professions/  # CRUD de profissões
│   │   ├── admin/        # Rotas administrativas
│   │   ├── debug/        # Ferramentas de debug
│   │   └── docs/         # Documentação Swagger
│   ├── debug/            # Páginas de debug
│   ├── docs/             # Documentação interativa
│   └── forgot-password/  # Recuperação de senha
├── components/            # Componentes React reutilizáveis
│   ├── Galaxy.tsx        # Componente principal da galáxia
│   ├── GalaxyImproved.tsx # Versão otimizada da galáxia
│   ├── AuthModal.tsx     # Modal de autenticação
│   ├── VocationalTest.tsx # Teste vocacional
│   ├── GamificationPanel.tsx # Painel de gamificação
│   ├── ProfessionModal.tsx # Detalhes das profissões
│   ├── SearchBar.tsx     # Barra de busca avançada
│   └── AdminPanel.tsx    # Painel administrativo
├── lib/                   # Bibliotecas e utilitários
│   ├── database.ts       # Configuração PostgreSQL
│   ├── redis.ts          # Configuração Redis
│   ├── auth.ts           # Sistema de autenticação
│   ├── email-service.ts  # Serviço de emails
│   ├── logger.ts         # Sistema de logs
│   ├── rate-limiter.ts   # Controle de taxa
│   ├── queue-system.ts   # Sistema de filas
│   └── analytics.ts      # Tracking e analytics
├── types/                 # Definições TypeScript
│   ├── profession.ts     # Tipos das profissões
│   ├── user.ts           # Tipos de usuário
│   ├── gamification.ts   # Tipos do sistema de jogos
│   └── vocational-test.ts # Tipos do teste vocacional
├── data/                  # Dados estáticos e configurações
│   ├── fallback-professions.ts # Profissões de fallback
│   ├── vocational-questions.ts # Perguntas do teste
│   ├── achievements.ts    # Conquistas disponíveis
│   └── journeys.ts       # Jornadas guiadas
├── hooks/                 # React Hooks customizados
│   ├── useGamification.ts # Hook para gamificação
│   ├── useFreePlanLimit.ts # Controle de limites
│   └── usePageTracking.ts # Tracking de páginas
├── workers/               # Workers em background
│   └── job-worker.ts     # Processador de jobs
└── scripts/               # Scripts utilitários
    └── add-new-professions.ts # Script para adicionar profissões
```

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL (recomendado: Neon Database)
- Redis (opcional, para cache)

### Configuração do Ambiente

1. **Clone e instale dependências:**
```bash
git clone [repositório]
cd galaxia
npm install
```

2. **Configure as variáveis de ambiente:**
```env
# Banco de dados
DATABASE_URL="postgresql://..."

# Redis (opcional)
REDIS_URL="redis://..."

# JWT
JWT_SECRET="sua-chave-super-secreta"

# Email (SendGrid ou SMTP)
SENDGRID_API_KEY="sg...."
EMAIL_FROM="noreply@seudominio.com"

# Analytics (opcional)
MIXPANEL_TOKEN="seu-token"
SENTRY_DSN="sua-dsn"

# Ambiente
NODE_ENV="development"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

3. **Inicialize o banco de dados:**
```bash
npm run dev # Em um terminal

# Em outro terminal
curl -X POST http://localhost:3000/api/init-db
curl -X POST http://localhost:3000/api/init-user-db
```

4. **Acesse a aplicação:**
```
http://localhost:3000
```

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting do código
npm run worker       # Worker em background (produção)
npm run worker:dev   # Worker em background (desenvolvimento)
npm run db:migrate   # Executar migrações do banco
npm run add-professions # Adicionar novas profissões
```

## 📊 Banco de Dados

### Tabela `professions`
```sql
CREATE TABLE professions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  area VARCHAR(100) NOT NULL,
  required_education TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  formation_time VARCHAR(50),
  main_activities TEXT[],
  certifications TEXT[],
  related_professions TEXT[],
  icon_color VARCHAR(7) DEFAULT '#4F46E5',
  x_position FLOAT DEFAULT 0,
  y_position FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  education_level VARCHAR(50),
  education_status VARCHAR(50),
  agree_terms BOOLEAN DEFAULT false,
  agree_newsletter BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Sistema de Gamificação
```sql
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  experience INTEGER DEFAULT 0,
  professions_viewed TEXT[],
  areas_explored TEXT[],
  tests_completed INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Funcionalidades Futuras (Roadmap)

### 📋 Lista de Próximas Funcionalidades

- [ ] **Sistema de favoritos** - Permitir que usuários salvem profissões de interesse
- [ ] **Comparação entre profissões** - Interface para comparar múltiplas carreiras lado a lado  
- [ ] **Integração com APIs de mercado de trabalho** - Dados reais de vagas e salários
- [ ] **Teste vocacional integrado** - Versão mais completa do teste com mais precisão
- [ ] **Sistema de recomendações** - IA para sugerir profissões baseadas no perfil
- [ ] **Modo offline** - PWA com funcionalidades offline
- [ ] **Exportação de relatórios** - PDFs com análise vocacional completa
- [ ] **Gamificação da exploração** - Mais conquistas, badges e recompensas

### 🔮 Visão de Longo Prazo

**Fase 2 - Inteligência e Personalização:**
- Sistema de recomendação baseado em IA
- Chat inteligente para orientação vocacional
- Integração com universidades e cursos
- Marketplace de mentorias profissionais

**Fase 3 - Ecossistema Profissional:**
- Conexão com profissionais da área
- Simulador de carreira com projeções
- Integração com plataformas de emprego
- App mobile nativo

**Fase 4 - Expansão e Escala:**
- Versões para diferentes países/culturas
- API pública para terceiros
- Versão empresarial para RH
- Parcerias estratégicas educacionais

## 🛡️ Segurança e Performance

### Medidas de Segurança Implementadas
- **Rate Limiting** por IP e usuário
- **Validação rigorosa** de entrada em todas as APIs  
- **Sanitização** de dados para prevenir XSS
- **JWT com refresh tokens** para autenticação segura
- **CORS configurado** adequadamente
- **Logs de segurança** para monitoramento
- **Proteção contra** ataques de força bruta

### Otimizações de Performance
- **Cache Redis** para consultas frequentes
- **Conexão pooling** no PostgreSQL
- **Lazy loading** de componentes
- **Debounce** em buscas e filtros
- **Compressão** de assets estáticos
- **CDN** para recursos estáticos
- **SSR/ISR** onde apropriado

## 🔧 Monitoramento e Observabilidade

### Ferramentas de Monitoramento
- **Sentry** - Tracking de erros e performance
- **Mixpanel** - Analytics de comportamento do usuário
- **Pino Logger** - Logs estruturados e pesquisáveis  
- **Health Checks** - Monitoramento de saúde das APIs
- **Swagger** - Documentação interativa da API

### Métricas Importantes
- Taxa de conversão (cadastro → uso efetivo)
- Profissões mais visualizadas
- Áreas de maior interesse
- Taxa de completude do teste vocacional
- Tempo de sessão médio
- Performance das consultas ao banco

## 🤝 Contribuição e Desenvolvimento

### Como Contribuir
1. Fork do repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Implemente as mudanças seguindo os padrões do projeto
4. Teste thoroughly localmente
5. Commit: `git commit -m 'Adiciona nova funcionalidade'`
6. Push: `git push origin feature/nova-funcionalidade`
7. Abra um Pull Request

### Padrões de Código
- **TypeScript** obrigatório em novos arquivos
- **ESLint** configurado deve passar sem erros
- **Prettier** para formatação consistente
- **Conventional Commits** para mensagens de commit
- **Testes unitários** para funções críticas

### Estrutura de Commits
```
feat: adiciona sistema de favoritos
fix: corrige bug na busca por profissões  
docs: atualiza documentação da API
style: formata código com prettier
refactor: reorganiza estrutura de componentes
test: adiciona testes para autenticação
chore: atualiza dependências do projeto
```

## 📈 Analytics e Métricas

### Eventos Trackados
- **Navegação**: Visualizações de página, tempo de sessão
- **Interações**: Cliques em estrelas, uso de filtros, buscas
- **Conversões**: Cadastros, testes completados, profissões favoritadas
- **Engajamento**: Conquistas desbloqueadas, jornadas iniciadas

### KPIs Principais  
- **DAU/MAU** (Usuários Ativos Diários/Mensais)
- **Taxa de Retenção** (7 dias, 30 dias)
- **Tempo Médio de Sessão**
- **Profissões por Sessão** (quantas profissões são exploradas)
- **Taxa de Completude** do teste vocacional
- **NPS** (Net Promoter Score) dos usuários

## 🚀 Deploy e Infraestrutura

### Ambientes Recomendados

**Desenvolvimento:**
- Next.js em modo desenvolvimento
- PostgreSQL local ou Neon
- Redis local (opcional)

**Produção (Vercel - Recomendado):**
```bash
# Conecte seu repositório ao Vercel
# Configure as variáveis de ambiente
# Deploy automático a cada push na main
```

**Alternativas de Produção:**
- **Netlify** + **Neon** + **Upstash Redis**
- **Railway** (full-stack em uma plataforma)
- **DigitalOcean App Platform**
- **AWS/GCP** com containers

### Variáveis de Ambiente de Produção
```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://seudominio.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=sua-chave-super-secreta-production
SENDGRID_API_KEY=sg....
MIXPANEL_TOKEN=production-token
SENTRY_DSN=production-dsn
```

## 📞 Suporte e Comunidade

### Canais de Comunicação
- **Issues do GitHub** - Para bugs e feature requests
- **Discussions** - Para perguntas e discussões gerais
- **Email** - contato@galaxiaprofissoes.com (se aplicável)

### FAQ
**P: Como adicionar uma nova profissão?**
R: Use o script `npm run add-professions` ou o painel administrativo.

**P: O projeto funciona offline?**
R: Parcialmente. Estamos trabalhando em uma versão PWA completa.

**P: Posso usar comercialmente?**
R: Verifique a licença MIT para detalhes sobre uso comercial.

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **Comunidade Open Source** pela inspiração e ferramentas
- **Designers** que contribuíram com conceitos visuais  
- **Beta Testers** que ajudaram a refinar a experiência
- **Mentores e Orientadores Vocacionais** que validaram a proposta

---

**✨ Desenvolvido com paixão para ajudar pessoas a descobrirem seu caminho profissional através da tecnologia ✨**

*"O futuro pertence àqueles que sabem onde estão indo. Navegue pela galáxia e descubra o seu destino profissional!"* 🌟