import { VocationalTest } from '@/types/vocational-test'

export const VOCATIONAL_TEST: VocationalTest = {
  id: 1,
  title: 'Teste Vocacional - Descubra Sua Profissão Ideal',
  description: 'Um questionário científico baseado na teoria RIASEC para identificar suas preferências profissionais',
  estimatedTime: 15,
  questions: [
    {
      id: 1,
      question: 'Qual tipo de atividade mais te atrai?',
      category: 'Preferências Gerais',
      options: [
        { id: 'a', text: 'Construir ou consertar objetos', categories: ['R'], weight: 3 },
        { id: 'b', text: 'Resolver problemas científicos complexos', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Criar arte, música ou design', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Ajudar e ensinar outras pessoas', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Liderar equipes e projetos', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Organizar dados e informações', categories: ['C'], weight: 3 }
      ]
    },
    {
      id: 2,
      question: 'Em qual ambiente você se sentiria mais produtivo?',
      category: 'Ambiente de Trabalho',
      options: [
        { id: 'a', text: 'Laboratório ou oficina', categories: ['R', 'I'], weight: 2 },
        { id: 'b', text: 'Estúdio criativo ou ateliê', categories: ['A'], weight: 3 },
        { id: 'c', text: 'Escola, hospital ou clínica', categories: ['S'], weight: 3 },
        { id: 'd', text: 'Escritório corporativo', categories: ['E', 'C'], weight: 2 },
        { id: 'e', text: 'Trabalho remoto/home office', categories: ['I', 'A', 'C'], weight: 1 }
      ]
    },
    {
      id: 3,
      question: 'Qual dessas habilidades você considera seu ponto forte?',
      category: 'Habilidades',
      options: [
        { id: 'a', text: 'Habilidades manuais e técnicas', categories: ['R'], weight: 3 },
        { id: 'b', text: 'Raciocínio lógico e análise', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Criatividade e inovação', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Comunicação e empatia', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Liderança e persuasão', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Organização e atenção aos detalhes', categories: ['C'], weight: 3 }
      ]
    },
    {
      id: 4,
      question: 'Que tipo de problema você prefere resolver?',
      category: 'Resolução de Problemas',
      options: [
        { id: 'a', text: 'Problemas práticos e concretos', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Problemas teóricos e abstratos', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Desafios criativos e estéticos', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Problemas sociais e humanos', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Desafios de negócios e estratégia', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Problemas de organização e sistemas', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 5,
      question: 'Como você prefere trabalhar?',
      category: 'Estilo de Trabalho',
      options: [
        { id: 'a', text: 'Individualmente, com as mãos', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Individualmente, pesquisando', categories: ['I'], weight: 2 },
        { id: 'c', text: 'Individualmente, criando', categories: ['A'], weight: 2 },
        { id: 'd', text: 'Em equipe, ajudando outros', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Em equipe, liderando', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Individualmente, organizando', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 6,
      question: 'Qual matéria escolar mais despertou seu interesse?',
      category: 'Interesses Acadêmicos',
      options: [
        { id: 'a', text: 'Educação Física, Física', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Matemática, Ciências, Química', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Arte, Literatura, Música', categories: ['A'], weight: 3 },
        { id: 'd', text: 'História, Filosofia, Psicologia', categories: ['S'], weight: 2 },
        { id: 'e', text: 'Geografia, Economia', categories: ['E'], weight: 2 },
        { id: 'f', text: 'Português, Inglês, Informática', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 7,
      question: 'Qual situação te motivaria mais no trabalho?',
      category: 'Motivação',
      options: [
        { id: 'a', text: 'Ver resultados concretos do meu trabalho', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Descobrir algo novo ou inovador', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Expressar minha criatividade', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Fazer diferença na vida das pessoas', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Alcançar metas e objetivos ambiciosos', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Manter tudo organizado e funcionando', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 8,
      question: 'Em um projeto de grupo, qual papel você assumiria?',
      category: 'Trabalho em Equipe',
      options: [
        { id: 'a', text: 'O executor, quem põe a mão na massa', categories: ['R'], weight: 3 },
        { id: 'b', text: 'O pesquisador, quem busca informações', categories: ['I'], weight: 3 },
        { id: 'c', text: 'O criativo, quem tem as ideias', categories: ['A'], weight: 3 },
        { id: 'd', text: 'O mediador, quem mantém a harmonia', categories: ['S'], weight: 3 },
        { id: 'e', text: 'O líder, quem coordena tudo', categories: ['E'], weight: 3 },
        { id: 'f', text: 'O organizador, quem cuida dos detalhes', categories: ['C'], weight: 3 }
      ]
    },
    {
      id: 9,
      question: 'Que tipo de reconhecimento mais valorizaria?',
      category: 'Valores',
      options: [
        { id: 'a', text: 'Reconhecimento pela qualidade técnica', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Reconhecimento científico ou acadêmico', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Reconhecimento artístico ou cultural', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Gratidão das pessoas que ajudei', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Sucesso financeiro e profissional', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Reconhecimento pela eficiência', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 10,
      question: 'Qual descrição mais combina com você?',
      category: 'Personalidade',
      options: [
        { id: 'a', text: 'Prático, objetivo e direto', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Curioso, analítico e questionador', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Imaginativo, expressivo e original', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Empático, generoso e colaborativo', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Ambicioso, persuasivo e competitivo', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Metódico, confiável e detalhista', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 11,
      question: 'Qual atividade de lazer mais combina com você?',
      category: 'Interesses Pessoais',
      options: [
        { id: 'a', text: 'Praticar esportes ou atividades ao ar livre', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Ler livros científicos ou documentários', categories: ['I'], weight: 2 },
        { id: 'c', text: 'Visitar museus, teatro ou shows', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Fazer trabalho voluntário ou social', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Participar de eventos de networking', categories: ['E'], weight: 2 },
        { id: 'f', text: 'Organizar coleções ou fazer palavras-cruzadas', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 12,
      question: 'Como você lidaria com um prazo apertado?',
      category: 'Pressão e Stress',
      options: [
        { id: 'a', text: 'Trabalharia com as mãos para acelerar', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Analisaria o problema metodicamente', categories: ['I'], weight: 2 },
        { id: 'c', text: 'Buscaria soluções criativas e inovadoras', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Pediria ajuda da equipe', categories: ['S'], weight: 2 },
        { id: 'e', text: 'Assumiria o controle e delegaria tarefas', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Criaria um plano detalhado de execução', categories: ['C'], weight: 3 }
      ]
    },
    {
      id: 13,
      question: 'Que tipo de feedback você prefere receber?',
      category: 'Comunicação',
      options: [
        { id: 'a', text: 'Feedback direto sobre resultados práticos', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Análise detalhada do processo e métodos', categories: ['I'], weight: 2 },
        { id: 'c', text: 'Apreciação da originalidade e criatividade', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Reconhecimento do impacto humano positivo', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Avaliação dos resultados de negócio', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Elogios pela precisão e organização', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 14,
      question: 'Em que tipo de reunião você se sentiria mais confortável?',
      category: 'Interação Social',
      options: [
        { id: 'a', text: 'Reunião técnica para resolver problemas práticos', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Reunião de análise de dados e pesquisa', categories: ['I'], weight: 2 },
        { id: 'c', text: 'Brainstorming criativo para novos projetos', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Reunião de planejamento de ações sociais', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Reunião estratégica de negócios', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Reunião de organização e processo', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 15,
      question: 'Qual aspecto do trabalho você considera mais importante?',
      category: 'Valores Profissionais',
      options: [
        { id: 'a', text: 'Estabilidade e segurança no emprego', categories: ['R', 'C'], weight: 2 },
        { id: 'b', text: 'Oportunidades de aprendizado contínuo', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Liberdade criativa e expressão pessoal', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Possibilidade de ajudar e impactar vidas', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Oportunidades de crescimento e liderança', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Ambiente estruturado e bem organizado', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 16,
      question: 'Como você prefere aprender coisas novas?',
      category: 'Aprendizagem',
      options: [
        { id: 'a', text: 'Praticando e experimentando', categories: ['R'], weight: 3 },
        { id: 'b', text: 'Estudando teoria e pesquisando', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Explorando de forma criativa e intuitiva', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Aprendendo com outros e compartilhando', categories: ['S'], weight: 2 },
        { id: 'e', text: 'Observando líderes e modelos de sucesso', categories: ['E'], weight: 2 },
        { id: 'f', text: 'Seguindo um plano de estudos estruturado', categories: ['C'], weight: 3 }
      ]
    },
    {
      id: 17,
      question: 'Que tipo de inovação mais te empolga?',
      category: 'Inovação e Tecnologia',
      options: [
        { id: 'a', text: 'Novas ferramentas e equipamentos práticos', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Descobertas científicas e tecnológicas', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Novas formas de arte e expressão', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Soluções para problemas sociais', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Novos modelos de negócio', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Sistemas mais eficientes de organização', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 18,
      question: 'Qual seria seu trabalho ideal nos fins de semana?',
      category: 'Projeto Pessoal',
      options: [
        { id: 'a', text: 'Construir ou reformar algo em casa', categories: ['R'], weight: 3 },
        { id: 'b', text: 'Pesquisar um tópico que me interessa', categories: ['I'], weight: 2 },
        { id: 'c', text: 'Trabalhar em um projeto artístico pessoal', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Ajudar amigos e familiares', categories: ['S'], weight: 2 },
        { id: 'e', text: 'Trabalhar em um projeto de negócio próprio', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Organizar e planejar a semana seguinte', categories: ['C'], weight: 2 }
      ]
    },
    {
      id: 19,
      question: 'Como você tomaria uma decisão importante?',
      category: 'Tomada de Decisão',
      options: [
        { id: 'a', text: 'Baseado na experiência prática anterior', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Após análise detalhada dos dados', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Seguindo minha intuição e criatividade', categories: ['A'], weight: 2 },
        { id: 'd', text: 'Considerando o impacto nas pessoas', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Focando nos resultados e oportunidades', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Seguindo um processo estruturado', categories: ['C'], weight: 3 }
      ]
    },
    {
      id: 20,
      question: 'Qual seria seu maior medo profissional?',
      category: 'Medos e Limitações',
      options: [
        { id: 'a', text: 'Não conseguir executar tarefas práticas', categories: ['R'], weight: 2 },
        { id: 'b', text: 'Estar desatualizado cientificamente', categories: ['I'], weight: 3 },
        { id: 'c', text: 'Perder minha criatividade e originalidade', categories: ['A'], weight: 3 },
        { id: 'd', text: 'Não conseguir ajudar quem precisa', categories: ['S'], weight: 3 },
        { id: 'e', text: 'Não alcançar meus objetivos ambiciosos', categories: ['E'], weight: 3 },
        { id: 'f', text: 'Cometer erros por desorganização', categories: ['C'], weight: 2 }
      ]
    }
  ]
}