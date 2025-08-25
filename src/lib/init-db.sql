-- Create professions table
CREATE TABLE IF NOT EXISTS professions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    area VARCHAR(100) NOT NULL,
    required_education TEXT NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    formation_time VARCHAR(100),
    main_activities TEXT[], -- Array of strings
    certifications TEXT[], -- Array of strings  
    related_professions TEXT[], -- Array of strings
    icon_color VARCHAR(7) DEFAULT '#ffffff', -- Hex color
    x_position FLOAT DEFAULT 0,
    y_position FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_professions_area ON professions(area);
CREATE INDEX IF NOT EXISTS idx_professions_name ON professions(name);

-- Insert sample professions data
INSERT INTO professions (name, description, area, required_education, salary_min, salary_max, formation_time, main_activities, certifications, related_professions, icon_color, x_position, y_position) VALUES 
('Desenvolvedor Full Stack', 'Profissional que desenvolve tanto o front-end quanto o back-end de aplicações web', 'Tecnologia', 'Ensino Superior em Ciência da Computação, Engenharia de Software ou áreas correlatas', 4000, 15000, '4-5 anos', ARRAY['Desenvolvimento de interfaces de usuário', 'Criação de APIs', 'Gerenciamento de banco de dados', 'Testes de software'], ARRAY['Certificações em frameworks web', 'AWS Certified Developer', 'Google Cloud Professional'], ARRAY['Desenvolvedor Front-end', 'Desenvolvedor Back-end', 'DevOps Engineer'], '#00d4aa', 100, 150),

('Médico Cardiologista', 'Especialista em diagnóstico e tratamento de doenças do coração e sistema cardiovascular', 'Saúde', 'Graduação em Medicina + Residência em Cardiologia', 8000, 25000, '9-10 anos', ARRAY['Consultas médicas', 'Exames cardiológicos', 'Cirurgias cardíacas', 'Acompanhamento de pacientes'], ARRAY['CRM (Conselho Regional de Medicina)', 'Título de Especialista em Cardiologia'], ARRAY['Cirurgião Cardíaco', 'Clínico Geral', 'Cardiologista Intervencionista'], '#ff6b6b', 200, 100),

('Designer UX/UI', 'Profissional responsável pela experiência do usuário e design de interfaces', 'Design', 'Ensino Superior em Design, Artes Visuais ou áreas correlatas', 3000, 12000, '4 anos', ARRAY['Pesquisa com usuários', 'Criação de wireframes', 'Prototipação', 'Testes de usabilidade'], ARRAY['Certificação em Design Thinking', 'UX Certification'], ARRAY['Product Designer', 'Designer Gráfico', 'Front-end Designer'], '#9c88ff', 150, 200),

('Engenheiro Civil', 'Profissional que planeja, projeta e supervisiona construções', 'Engenharia', 'Ensino Superior em Engenharia Civil', 5000, 18000, '5 anos', ARRAY['Elaboração de projetos estruturais', 'Supervisão de obras', 'Cálculos de resistência', 'Gerenciamento de equipes'], ARRAY['CREA (Conselho Regional de Engenharia)', 'Certificações em software CAD'], ARRAY['Arquiteto', 'Engenheiro de Estruturas', 'Gerente de Projetos'], '#feca57', 250, 120),

('Psicólogo Clínico', 'Profissional que atua no diagnóstico e tratamento de questões mentais e comportamentais', 'Saúde', 'Ensino Superior em Psicologia + Especialização', 2500, 10000, '5-6 anos', ARRAY['Sessões de psicoterapia', 'Avaliação psicológica', 'Elaboração de laudos', 'Orientação familiar'], ARRAY['CRP (Conselho Regional de Psicologia)', 'Especialização em área específica'], ARRAY['Psiquiatra', 'Neuropsicólogo', 'Psicopedagogo'], '#ff9ff3', 180, 250);

-- Insert more professions to reach MVP target
INSERT INTO professions (name, description, area, required_education, salary_min, salary_max, formation_time, main_activities, certifications, related_professions, icon_color, x_position, y_position) VALUES 
('Advogado', 'Profissional que atua na defesa de direitos e interesses legais', 'Direito', 'Ensino Superior em Direito + OAB', 3000, 20000, '5 anos', ARRAY['Consultoria jurídica', 'Elaboração de contratos', 'Defesa em tribunais', 'Pesquisa jurídica'], ARRAY['OAB (Ordem dos Advogados do Brasil)', 'Especializações em áreas do direito'], ARRAY['Juiz', 'Promotor', 'Delegado'], '#48dbfb', 300, 180),

('Professor de Ensino Médio', 'Educador responsável pela formação de estudantes do ensino médio', 'Educação', 'Ensino Superior em Licenciatura', 2000, 8000, '4 anos', ARRAY['Ministrar aulas', 'Preparar material didático', 'Avaliar estudantes', 'Orientação pedagógica'], ARRAY['Registro no MEC', 'Especializações em educação'], ARRAY['Coordenador Pedagógico', 'Diretor Escolar', 'Professor Universitário'], '#0be881', 120, 300),

('Enfermeiro', 'Profissional que cuida da saúde e bem-estar dos pacientes', 'Saúde', 'Ensino Superior em Enfermagem', 3500, 12000, '4-5 anos', ARRAY['Cuidados diretos ao paciente', 'Administração de medicamentos', 'Supervisão de auxiliares', 'Educação em saúde'], ARRAY['COREN (Conselho Regional de Enfermagem)', 'Especializações em áreas específicas'], ARRAY['Técnico em Enfermagem', 'Médico', 'Fisioterapeuta'], '#ff3838', 220, 280),

('Analista de Dados', 'Profissional que analisa dados para gerar insights de negócio', 'Tecnologia', 'Ensino Superior em áreas exatas ou correlatas', 4500, 14000, '4 anos', ARRAY['Análise estatística', 'Criação de dashboards', 'Modelagem de dados', 'Relatórios gerenciais'], ARRAY['Certificações em ferramentas de BI', 'Python/R Certifications'], ARRAY['Cientista de Dados', 'Analista de BI', 'Estatístico'], '#686de0', 80, 80),

('Arquiteto', 'Profissional que projeta espaços e construções', 'Arquitetura', 'Ensino Superior em Arquitetura e Urbanismo', 4000, 16000, '5 anos', ARRAY['Criação de projetos arquitetônicos', 'Acompanhamento de obras', 'Consultoria em design de interiores', 'Estudos de viabilidade'], ARRAY['CAU (Conselho de Arquitetura e Urbanismo)', 'Certificações em software CAD'], ARRAY['Designer de Interiores', 'Engenheiro Civil', 'Urbanista'], '#ff9f43', 280, 50),

-- Additional professions to reach MVP target of 50-100
('Cientista de Dados', 'Profissional que extrai insights de grandes volumes de dados', 'Tecnologia', 'Ensino Superior em áreas exatas + especialização', 6000, 18000, '4-5 anos', ARRAY['Modelagem estatística', 'Machine Learning', 'Análise preditiva', 'Visualização de dados'], ARRAY['Certificações em Python/R', 'AWS/Google Cloud ML'], ARRAY['Analista de Dados', 'Engenheiro de ML', 'Estatístico'], '#4834d4', 60, 120),

('Veterinário', 'Profissional responsável pela saúde e bem-estar animal', 'Saúde', 'Ensino Superior em Medicina Veterinária', 3500, 15000, '5 anos', ARRAY['Consultas veterinárias', 'Cirurgias', 'Vacinação', 'Diagnósticos'], ARRAY['CRMV (Conselho Regional de Medicina Veterinária)', 'Especializações em áreas específicas'], ARRAY['Zootecnista', 'Biólogo', 'Técnico Veterinário'], '#26de81', 320, 200),

('Jornalista', 'Profissional que produz e divulga informações', 'Comunicação', 'Ensino Superior em Jornalismo', 2500, 12000, '4 anos', ARRAY['Apuração de notícias', 'Redação', 'Entrevistas', 'Edição de conteúdo'], ARRAY['Registro profissional', 'Especializações em mídias específicas'], ARRAY['Editor', 'Redator', 'Assessor de Imprensa'], '#ff6b6b', 140, 320),

('Fisioterapeuta', 'Profissional que trata disfunções motoras', 'Saúde', 'Ensino Superior em Fisioterapia', 3000, 12000, '4-5 anos', ARRAY['Avaliação física', 'Terapias manuais', 'Prescrição de exercícios', 'Reabilitação'], ARRAY['CREFITO (Conselho Regional de Fisioterapia)', 'Especializações clínicas'], ARRAY['Educador Físico', 'Terapeuta Ocupacional', 'Médico'], '#ff9ff3', 240, 320),

('Contador', 'Profissional responsável pela gestão financeira e contábil', 'Finanças', 'Ensino Superior em Ciências Contábeis', 3000, 15000, '4 anos', ARRAY['Escrituração contábil', 'Demonstrações financeiras', 'Consultoria fiscal', 'Auditoria'], ARRAY['CRC (Conselho Regional de Contabilidade)', 'Certificações em sistemas contábeis'], ARRAY['Analista Financeiro', 'Auditor', 'Controller'], '#2ed573', 360, 140),

('Biomédico', 'Profissional que atua em análises clínicas e pesquisa', 'Saúde', 'Ensino Superior em Biomedicina', 3500, 14000, '4-5 anos', ARRAY['Análises laboratoriais', 'Pesquisa científica', 'Diagnóstico por imagem', 'Controle de qualidade'], ARRAY['CRBM (Conselho Regional de Biomedicina)', 'Especializações em análises clínicas'], ARRAY['Farmacêutico', 'Biólogo', 'Técnico em Laboratório'], '#ff6348', 160, 60),

('Farmacêutico', 'Profissional especializado em medicamentos', 'Saúde', 'Ensino Superior em Farmácia', 4000, 16000, '5 anos', ARRAY['Dispensação de medicamentos', 'Atenção farmacêutica', 'Análises clínicas', 'Desenvolvimento de fármacos'], ARRAY['CRF (Conselho Regional de Farmácia)', 'Especializações em farmácia clínica'], ARRAY['Biomédico', 'Químico', 'Bioquímico'], '#7bed9f', 200, 40),

('Nutricionista', 'Profissional que orienta sobre alimentação saudável', 'Saúde', 'Ensino Superior em Nutrição', 2800, 10000, '4 anos', ARRAY['Avaliação nutricional', 'Planejamento de dietas', 'Educação nutricional', 'Consultoria em alimentação'], ARRAY['CRN (Conselho Regional de Nutrição)', 'Especializações em nutrição clínica'], ARRAY['Educador Físico', 'Médico', 'Chef de Cozinha'], '#70a1ff', 300, 260),

('Dentista', 'Profissional da saúde bucal', 'Saúde', 'Ensino Superior em Odontologia', 4000, 20000, '5 anos', ARRAY['Diagnóstico bucal', 'Tratamentos dentários', 'Cirurgias odontológicas', 'Prevenção'], ARRAY['CRO (Conselho Regional de Odontologia)', 'Especializações odontológicas'], ARRAY['Técnico em Saúde Bucal', 'Protético Dentário', 'Ortodontista'], '#ff4757', 280, 180),

('Engenheiro de Software', 'Profissional que desenvolve sistemas complexos', 'Tecnologia', 'Ensino Superior em Engenharia de Software ou correlatos', 5000, 20000, '4-5 anos', ARRAY['Arquitetura de software', 'Desenvolvimento de sistemas', 'Gerenciamento de projetos', 'Liderança técnica'], ARRAY['Certificações em metodologias ágeis', 'Cloud certifications'], ARRAY['Desenvolvedor Full Stack', 'Arquiteto de Soluções', 'Tech Lead'], '#3742fa', 40, 160),

('Marketing Digital', 'Profissional especializado em marketing online', 'Marketing', 'Ensino Superior em Marketing, Publicidade ou correlatos', 3000, 15000, '4 anos', ARRAY['Campanhas digitais', 'Análise de métricas', 'SEO/SEM', 'Redes sociais'], ARRAY['Certificações Google/Facebook', 'Certificações em ferramentas de marketing'], ARRAY['Publicitário', 'Analista de Dados', 'Social Media'], '#ff5722', 180, 140),

('Chef de Cozinha', 'Profissional especializado em gastronomia', 'Gastronomia', 'Curso técnico ou superior em Gastronomia', 2500, 12000, '2-4 anos', ARRAY['Criação de cardápios', 'Supervisão da cozinha', 'Controle de qualidade', 'Gestão de equipe'], ARRAY['Certificações culinárias', 'Especializações gastronômicas'], ARRAY['Nutricionista', 'Sommelier', 'Confeiteiro'], '#ff9500', 340, 240),

('Product Manager', 'Profissional responsável pela estratégia de produtos', 'Tecnologia', 'Ensino Superior + experiência em produto', 6000, 25000, '4+ anos experiência', ARRAY['Estratégia de produto', 'Análise de mercado', 'Roadmap de produto', 'Coordenação de equipes'], ARRAY['Certificações em Product Management', 'Metodologias ágeis'], ARRAY['Designer UX/UI', 'Analista de Negócios', 'Engenheiro de Software'], '#6c5ce7', 80, 200),

('Tradutor', 'Profissional que traduz textos entre idiomas', 'Linguagens', 'Ensino Superior em Letras ou Tradução', 2000, 10000, '4 anos', ARRAY['Tradução de documentos', 'Interpretação', 'Revisão linguística', 'Localização'], ARRAY['Certificações em idiomas', 'Registro profissional'], ARRAY['Intérprete', 'Professor de Idiomas', 'Editor'], '#f368e0', 200, 360),

('Engenheiro Elétrico', 'Profissional que trabalha com sistemas elétricos', 'Engenharia', 'Ensino Superior em Engenharia Elétrica', 4500, 18000, '5 anos', ARRAY['Projetos elétricos', 'Sistemas de potência', 'Automação industrial', 'Manutenção'], ARRAY['CREA', 'Certificações em sistemas elétricos'], ARRAY['Engenheiro Eletrônico', 'Técnico Elétrico', 'Engenheiro de Automação'], '#ffc048', 260, 80),

('Designer Gráfico', 'Profissional que cria identidades visuais', 'Design', 'Ensino Superior em Design Gráfico', 2500, 10000, '4 anos', ARRAY['Criação de logotipos', 'Layout de materiais', 'Identidade visual', 'Peças publicitárias'], ARRAY['Certificações em softwares de design', 'Portfolio profissional'], ARRAY['Designer UX/UI', 'Publicitário', 'Ilustrador'], '#00cec9', 120, 180),

('Psicopedagogo', 'Profissional que atua em dificuldades de aprendizagem', 'Educação', 'Graduação + Especialização em Psicopedagogia', 2500, 8000, '5-6 anos', ARRAY['Avaliação psicopedagógica', 'Intervenção pedagógica', 'Orientação familiar', 'Desenvolvimento de estratégias'], ARRAY['Certificação em Psicopedagogia', 'Registro em conselhos'], ARRAY['Psicólogo', 'Pedagogo', 'Fonoaudiólogo'], '#fd79a8', 160, 280),

('Biólogo', 'Profissional que estuda a vida e organismos', 'Ciências Biológicas', 'Ensino Superior em Ciências Biológicas', 3000, 12000, '4-5 anos', ARRAY['Pesquisa científica', 'Análise ambiental', 'Consultoria biológica', 'Educação ambiental'], ARRAY['CRBio (Conselho Regional de Biologia)', 'Especializações em áreas específicas'], ARRAY['Biomédico', 'Veterinário', 'Ecólogo'], '#55a3ff', 340, 160),

('Químico', 'Profissional especializado em química', 'Ciências Exatas', 'Ensino Superior em Química', 3500, 15000, '4-5 anos', ARRAY['Análises químicas', 'Desenvolvimento de produtos', 'Controle de qualidade', 'Pesquisa e desenvolvimento'], ARRAY['CRQ (Conselho Regional de Química)', 'Certificações laboratoriais'], ARRAY['Farmacêutico', 'Engenheiro Químico', 'Biomédico'], '#26de81', 380, 120);