import { VocationalTest } from '@/types/vocational-test'

export const VOCATIONAL_TEST: VocationalTest = {
  id: 1,
  title: 'Teste Vocacional - Descubra Sua Profissão Ideal',
  description: 'Um questionário científico baseado na teoria RIASEC para identificar suas preferências profissionais',
  estimatedTime: 10,
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
    }
  ]
}