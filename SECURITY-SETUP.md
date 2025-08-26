# 🔐 Setup de Segurança - Galáxia das Profissões

## ⚠️ ANTES DE COLOCAR EM PRODUÇÃO

### 1. Configurar Variáveis de Ambiente (.env.local)

Crie o arquivo `.env.local` baseado no `.env.example`:

```bash
# Database Configuration - OBRIGATÓRIO
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Configuration - OBRIGATÓRIO
# DEVE ser uma string aleatória de pelo menos 32 caracteres
JWT_SECRET="your-super-secure-random-jwt-secret-key-at-least-32-chars-long"

# Environment
NODE_ENV="production"

# Email Configuration (opcional)
EMAIL_FROM="noreply@seudominio.com"
EMAIL_API_KEY="sua-api-key"
```

### 2. Gerar JWT_SECRET Seguro

```bash
# Opção 1: Usando Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opção 2: Usando OpenSSL
openssl rand -hex 64

# Opção 3: Usando online (apenas para desenvolvimento)
# https://generate-secret.vercel.app/64
```

### 3. Configuração do Database

**NUNCA** deixe credenciais de banco hardcoded no código. O sistema agora:
- ✅ Valida se `DATABASE_URL` está definida
- ✅ Falha na inicialização se não encontrar
- ✅ Usa connection pooling seguro

### 4. Rate Limiting Implementado

**Proteção contra ataques:**
- Login/Register: 5 tentativas por 15 minutos
- APIs gerais: 100 requests por minuto
- Headers informativos sobre limites

### 5. Autenticação JWT Segura

**Melhorias implementadas:**
- ✅ Tokens seguros com cookies HttpOnly
- ✅ Validação rigorosa de payload
- ✅ Middleware de autenticação para rotas protegidas
- ✅ Tratamento de tokens expirados

### 6. Logging Estruturado

**Sistema de logs implementado:**
- ✅ Logs de autenticação (success/failure)
- ✅ Logs de queries de banco com timing
- ✅ Logs de rate limiting
- ✅ Logs de erros estruturados
- ✅ Mascaramento de dados sensíveis

### 7. Padronização de APIs

**Responses consistentes:**
- ✅ Códigos de erro padronizados
- ✅ Estrutura de resposta uniforme
- ✅ Tratamento de erros específicos (validação, conflito, etc.)
- ✅ Headers de rate limiting

## 🚀 Deploy Checklist

### Antes do Deploy:

- [ ] Configurar `.env.local` com variáveis reais
- [ ] Gerar `JWT_SECRET` forte (64+ caracteres)
- [ ] Configurar `DATABASE_URL` com credenciais reais
- [ ] Definir `NODE_ENV=production`
- [ ] Testar conexão de banco
- [ ] Verificar se todas as variáveis obrigatórias estão definidas

### Configuração de Produção:

```bash
# 1. Instalar dependências
npm install

# 2. Build da aplicação
npm run build

# 3. Testar localmente
npm start

# 4. Verificar logs
# Os logs aparecerão estruturados em formato JSON em produção
```

### Monitoramento Pós-Deploy:

1. **Verificar Logs:**
   - Autenticações bem-sucedidas e falhadas
   - Queries de banco com performance
   - Rate limiting sendo aplicado

2. **Métricas a Acompanhar:**
   - Tempo de resposta das APIs
   - Taxa de erro de autenticação
   - Uso de rate limiting
   - Performance de queries

3. **Alertas Recomendados:**
   - Múltiplas falhas de login do mesmo IP
   - Rate limiting sendo atingido frequentemente
   - Erros de banco de dados
   - JWT tokens inválidos em massa

## 🔧 Rotas Protegidas

### Rotas que requerem autenticação:
- `/api/admin/*` - Todas as rotas administrativas
- Qualquer rota que use `withAuth()` middleware

### Rotas públicas com rate limiting:
- `/api/auth/login` - 5 tentativas / 15 min
- `/api/auth/register` - 5 tentativas / 15 min
- `/api/professions` - 100 requests / min

## ⚡ Performance

### Otimizações implementadas:
- Connection pooling para PostgreSQL
- Logging assíncrono com Pino
- Rate limiting em memória (considere Redis para escala)
- Validação de entrada eficiente

### Próximas otimizações recomendadas:
- Cache Redis para queries frequentes
- CDN para assets estáticos
- Compressão gzip/brotli
- Paginação de resultados

## 🛡️ Segurança Adicional Recomendada

1. **HTTPS obrigatório** em produção
2. **CORS** configurado adequadamente
3. **Helmet.js** para headers de segurança
4. **Certificados SSL** válidos
5. **WAF (Web Application Firewall)** se possível

## 📞 Suporte

Se encontrar problemas após implementar essas melhorias:

1. Verifique os logs estruturados
2. Confirme todas as variáveis de ambiente
3. Teste a conexão com o banco de dados
4. Verifique se o JWT_SECRET tem pelo menos 32 caracteres

**IMPORTANTE:** Estas melhorias corrigem as vulnerabilidades críticas identificadas. O sistema agora está muito mais seguro para produção.