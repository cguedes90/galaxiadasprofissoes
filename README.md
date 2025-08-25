# 🌟 Galáxia das Profissões

Uma aplicação web interativa que apresenta profissões como estrelas em uma galáxia navegável, permitindo exploração livre e descoberta vocacional.

## 🎯 Características Principais

- **Interface Interativa**: Navegue pela galáxia arrastando e usando zoom
- **50+ Profissões**: Base de dados com informações detalhadas sobre diversas carreiras
- **Busca e Filtros**: Encontre profissões por nome ou área de atuação
- **Detalhes Completos**: Salários, formação necessária, atividades e certificações
- **Design Responsivo**: Funciona em desktop e dispositivos móveis

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Em outro terminal, inicialize o banco de dados
curl -X POST http://localhost:3000/api/init-db
```

3. Acesse a aplicação:
```
http://localhost:3000
```

## 🗄️ Estrutura do Projeto

```
src/
├── app/                 # Next.js 13+ App Router
│   ├── api/            # API Routes
│   ├── globals.css     # Estilos globais
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página inicial
├── components/         # Componentes React
│   ├── Galaxy.tsx      # Componente principal da galáxia
│   ├── SearchBar.tsx   # Barra de busca
│   └── ProfessionModal.tsx # Modal de detalhes
├── lib/               # Utilitários
│   ├── database.ts    # Configuração do banco
│   └── init-db.sql    # Schema e dados iniciais
└── types/             # Tipos TypeScript
    └── profession.ts  # Definições de tipos
```

## 🛠️ Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Framer Motion**: Animações
- **PostgreSQL**: Banco de dados (Neon)
- **Vercel**: Hospedagem (recomendado)

## 🎨 Funcionalidades do MVP

### Navegação na Galáxia
- Arraste para mover pela galáxia
- Use a roda do mouse para zoom
- Clique nas estrelas para ver detalhes

### Sistema de Busca
- Busca por nome da profissão
- Filtro por área de atuação
- Destaque visual dos resultados

### Detalhes das Profissões
- Descrição completa da profissão
- Faixa salarial por senioridade
- Formação acadêmica necessária
- Principais atividades do dia a dia
- Certificações importantes
- Profissões correlacionadas

## 🔧 Desenvolvimento

### Scripts Disponíveis
- `npm run dev`: Servidor de desenvolvimento
- `npm run build`: Build para produção
- `npm start`: Servidor de produção
- `npm run lint`: Verificação de código

### Adicionando Novas Profissões
1. Edite o arquivo `src/lib/init-db.sql`
2. Adicione novos registros na tabela `professions`
3. Reinicialize o banco: `curl -X POST http://localhost:3000/api/init-db`

## 📊 Banco de Dados

### Estrutura da Tabela `professions`
- `id`: Identificador único
- `name`: Nome da profissão
- `description`: Descrição detalhada
- `area`: Área de atuação
- `required_education`: Formação necessária
- `salary_min/max`: Faixa salarial
- `formation_time`: Tempo de formação
- `main_activities`: Principais atividades (array)
- `certifications`: Certificações (array)
- `related_professions`: Profissões relacionadas (array)
- `icon_color`: Cor da estrela na galáxia
- `x_position/y_position`: Posição na galáxia

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão do PostgreSQL
3. Deploy automático a cada push

### Outras Plataformas
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 📈 Roadmap Futuro

- [ ] Sistema de favoritos
- [ ] Comparação entre profissões
- [ ] Integração com APIs de mercado de trabalho
- [ ] Teste vocacional integrado
- [ ] Sistema de recomendações
- [ ] Modo offline
- [ ] Exportação de relatórios
- [ ] Gamificação da exploração

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.