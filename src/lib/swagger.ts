import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Galáxia das Profissões API',
      version: '1.0.0',
      description: 'API para exploração vocacional e descoberta de carreiras através de uma galáxia interativa de profissões.',
      contact: {
        name: 'Suporte Galáxia das Profissões',
        email: 'contato@inovamentelabs.com.br',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://galaxiadasprofissoes.vercel.app/api' 
          : 'http://localhost:3000/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            lastLogin: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
            emailVerified: { type: 'boolean' },
          },
        },
        Profession: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            area: { type: 'string' },
            required_education: { type: 'string' },
            formation_time: { type: 'string' },
            salary_min: { type: 'integer' },
            salary_max: { type: 'integer' },
            main_activities: { type: 'array', items: { type: 'string' } },
            certifications: { type: 'array', items: { type: 'string' } },
            related_professions: { type: 'array', items: { type: 'string' } },
            icon_color: { type: 'string' },
            x_position: { type: 'number' },
            y_position: { type: 'number' },
            riasec_r: { type: 'number' },
            riasec_i: { type: 'number' },
            riasec_a: { type: 'number' },
            riasec_s: { type: 'number' },
            riasec_e: { type: 'number' },
            riasec_c: { type: 'number' },
          },
        },
        RegisterData: {
          type: 'object',
          required: ['email', 'password', 'confirmPassword', 'name', 'dateOfBirth', 'education', 'agreeTerms'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            confirmPassword: { type: 'string', minLength: 8 },
            name: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date', nullable: true },
            education: {
              type: 'object',
              properties: {
                level: { 
                  type: 'string', 
                  enum: ['ensino_fundamental', 'ensino_medio', 'ensino_tecnico', 'ensino_superior', 'pos_graduacao', 'mestrado', 'doutorado']
                },
                status: { 
                  type: 'string', 
                  enum: ['estudando', 'concluido', 'interrompido', 'pretendo_cursar']
                },
              },
            },
            agreeTerms: { type: 'boolean' },
            agreeNewsletter: { type: 'boolean', nullable: true },
          },
        },
        LoginCredentials: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            rememberMe: { type: 'boolean', nullable: true },
          },
        },
        TestQuestion: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            question: { type: 'string' },
            category: { 
              type: 'string', 
              enum: ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional']
            },
          },
        },
        TestResult: {
          type: 'object',
          properties: {
            scores: {
              type: 'object',
              properties: {
                realistic: { type: 'number' },
                investigative: { type: 'number' },
                artistic: { type: 'number' },
                social: { type: 'number' },
                enterprising: { type: 'number' },
                conventional: { type: 'number' },
              },
            },
            matchingProfessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  profession: { $ref: '#/components/schemas/Profession' },
                  compatibility: { type: 'number' },
                },
              },
            },
            dominantTraits: { type: 'array', items: { type: 'string' } },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Endpoints de autenticação e gerenciamento de usuários' },
      { name: 'Professions', description: 'Endpoints para listar e filtrar profissões' },
      { name: 'Test', description: 'Teste vocacional RIASEC' },
      { name: 'User', description: 'Gerenciamento de perfil do usuário' },
      { name: 'Analytics', description: 'Métricas e estatísticas da aplicação' },
      { name: 'Health', description: 'Status da aplicação e saúde dos serviços' },
    ],
  },
  apis: [
    './src/app/api/**/*.ts', // Todos os arquivos da API
    './src/lib/swagger-docs.ts', // Documentação adicional
  ],
}

export const swaggerSpec = swaggerJSDoc(options)
export default swaggerSpec