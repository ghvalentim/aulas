import  { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Edit3, XCircle, ArrowRight, RotateCcw, Home, Loader2, Server } from 'lucide-react';
import { createClient } from '@supabase/supabase-js'

// Estes dados são teus e ficam no painel do Supabase!
const supabaseUrl = '[https://zmghsxblcdtpqeitwyfa.supabase.co/rest/v1/](https://zmghsxblcdtpqeitwyfa.supabase.co/rest/v1/)'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ2hzeGJsY2R0cHFlaXR3eWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NTU4NzUsImV4cCI6MjEwMDEzMTg3NX0.0UtZ4wEdERpfFIeuxwFMfakZo3Alv0-W4Fg7Lw9G-JA' 
const supabase = createClient(supabaseUrl, supabaseKey)

// Estilos customizados injetados (Doodle/Caderno)
const doodleStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Nunito:wght@400;600;800&display=swap');
  
  .font-doodle { font-family: 'Caveat', cursive; }
  .font-body { font-family: 'Nunito', sans-serif; }
  
  .notebook-bg {
    background-color: #fdfbf7;
    background-image: linear-gradient(#999 transparent 1px), linear-gradient(90deg, #999 transparent 1px);
    background-size: 100% 1.5rem, 100% 1.5rem;
    background-position: 0 0, 0 0;
  }
  
  .doodle-border {
    border: 3px solid #1e293b;
    border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
    box-shadow: 4px 4px 0px #1e293b;
    transition: all 0.2s ease-in-out;
  }
  
  .doodle-border:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 0px #1e293b;
  }

  .highlighter-yellow {
    background: linear-gradient(104deg, rgba(253,255,133,0) 0.9%, rgba(253,255,133,1) 2.4%, rgba(253,255,133,0.5) 5.8%, rgba(253,255,133,1) 93%, rgba(253,255,133,0.7) 96%, rgba(253,255,133,0) 98%), linear-gradient(183deg, rgba(253,255,133,0) 0%, rgba(253,255,133,0.3) 7.9%, rgba(253,255,133,0) 15%);
    padding: 0 0.2em;
  }
  
  .sticky-note {
    background-color: #fef08a;
    box-shadow: 5px 5px 10px rgba(0,0,0,0.1);
    transform: rotate(-1deg);
  }
  
  .sticky-note:nth-child(even) {
    background-color: #bae6fd;
    transform: rotate(2deg);
  }
  
  .sticky-note:nth-child(3n) {
    background-color: #fbcfe8;
    transform: rotate(-2deg);
  }

  .index-link {
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: #cbd5e1;
    text-underline-offset: 4px;
  }
  .index-link:hover {
    text-decoration-color: #f43f5e;
  }
`;

// --- TIPOS TYPESCRIPT ---
type QuestionType = 'mcq' | 'fill';

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  feedback: string;
}

type ViewState = 'home' | 'notes' | 'quiz';

// --- BASE DE DADOS SIMULADA (MOCK API) ---
// Na vida real, isto estaria num ficheiro no teu servidor PHP/MySQL
const allQuestionsDB: Record<string, Question[]> = {
  'fundamentos': [
    {
      id: 1, type: "mcq",
      question: "O que caracteriza uma Single-Page Application (SPA)?",
      options: ["Carrega múltiplas páginas do servidor a cada clique.", "Carrega um único documento e atualiza via JavaScript.", "É um documento estático."],
      answer: "Carrega um único documento e atualiza via JavaScript.",
      feedback: "Exato! Numa SPA (arquitetura CSR), não recarregas a página inteira do servidor constantemente."
    },
    {
      id: 2, type: "fill",
      question: "O protocolo base de comunicação da Web chama-se .",
      answer: "HTTP",
      feedback: "Correto! Hypertext Transfer Protocol."
    }
  ],
  'php-mysql': [
    {
      id: 3, type: "fill",
      question: "A extensão recomendada em PHP para MySQL chama-se php_.",
      answer: "mysqli",
      feedback: "Certo! 'mysqli' (MySQL Improved) é a versão atual. Suporta prepared statements!"
    },
    {
      id: 4, type: "mcq",
      question: "Na POO em PHP, o modificador de acesso que deixa o atributo visível em qualquer lado é o:",
      options: ["private", "protected", "public"],
      answer: "public",
      feedback: "Spot on! 'public' deixa a porta totalmente aberta."
    }
  ],
  'avancado': [
    {
      id: 5, type: "fill",
      question: "A tecnologia que atualiza partes da página sem recarregar tudo chama-se .",
      answer: "AJAX",
      feedback: "Exatamente! AJAX (Asynchronous JavaScript And XML)."
    },
    {
      id: 6, type: "mcq",
      question: "Como o PHP lida inicialmente com o upload de ficheiros?",
      options: ["Guarda logo na pasta final usando $_GET.", "Guarda numa pasta temporária e a info fica em $_FILES.", "Envia diretamente para a BD."],
      answer: "Guarda numa pasta temporária e a info fica em $_FILES.",
      feedback: "Correto! Depois cabe ao programador mover o ficheiro para o destino final."
    }
  ]
};

// --- SERVIÇO DE API SIMULADO ---
const apiService = {
  fetchQuestionsByTheme: async (themeSlug: string): Promise<Question[]> => {
    const { data: themeData} = await supabase
     . from('themes')
     . select('id')
     .eq('slug', themeSlug)
      .single();

      if (!themeData) return [];

      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('theme_id', themeData.id);

      if (error) {
        console.error("Erro ao buscar perguntas:", error);
        return [];
      }

      return questionsData as Question[];
    }
    
};

const studyNotes = [
  { id: 1, title: "0.1 HTTP", content: "Servidores Web comunicam usando HTTP. MIME Type classifica a info." },
  { id: 2, title: "1. Pág. Dinâmicas", content: "SPA carrega 1 documento e atualiza via JS. PWA age como app nativa!" },
  { id: 3, title: "2. PHP Basics", content: "Linguagem Server-side. echo (vários param) vs print (1 param)." },
  { id: 4, title: "2.1 POO em PHP", content: "Organiza info em Objetos com atributos e ações. public, private, protected." },
  { id: 5, title: "2.2 MySQL", content: "Usar php_mysqli ou PDO. A antiga php_mysql está obsoleta." },
  { id: 6, title: "2.5 AJAX", content: "Atualiza partes da página SEM recarregar tudo usando XMLHttpRequest/Fetch." },
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeThemeTitle, setActiveThemeTitle] = useState<string>('');
  
  // Estados do Quiz
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Injetar estilos
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = doodleStyles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  // --- LÓGICA DE NAVEGAÇÃO E API ---
  const handleStartQuiz = async (themeKey: string, themeTitle: string) => {
    setCurrentView('quiz');
    setActiveThemeTitle(themeTitle);
    setIsLoading(true);
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);

    // Chama a nossa API (simulada)
    try {
      const data = await apiService.fetchQuestionsByTheme(themeKey);
      setQuizQuestions(data);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    setCurrentView('home');
  };

  // --- LÓGICA DO QUIZ ---
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const checkFillAnswer = (userAns: string, correctAns: string) => {
    if (!userAns) return false;
    return userAns.toLowerCase().trim() === correctAns.toLowerCase();
  };

  const calculateScore = () => {
    let currentScore = 0;
    quizQuestions.forEach(q => {
      const userAnswer = answers[q.id];
      if (userAnswer) {
        if (q.type === 'mcq' && userAnswer === q.answer) {
          currentScore += 1;
        } else if (q.type === 'fill' && checkFillAnswer(userAnswer, q.answer)) {
          currentScore += 1;
        }
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen notebook-bg font-body p-4 md:p-8 text-slate-800">
      
      {/* Header Fixo */}
      <header className="max-w-5xl mx-auto mb-8 relative flex flex-col items-center">
        {currentView !== 'home' && (
          <button 
            onClick={handleGoHome}
            className="absolute left-0 top-2 flex items-center gap-2 font-doodle text-2xl text-indigo-600 hover:text-rose-500 transition-colors"
          >
            <Home size={24} /> Índice
          </button>
        )}
        
        <h1 className="text-5xl md:text-6xl font-doodle font-bold mb-2 transform -rotate-1 text-indigo-900 text-center mt-8 md:mt-0">
          <span className="highlighter-yellow">Caderno de DW2</span>
        </h1>
        {currentView === 'home' && (
          <p className="text-xl font-bold text-slate-600 font-doodle text-2xl text-center">
            ~ Notas Visuais & Testes por API ~
          </p>
        )}
      </header>

      <main className="max-w-5xl mx-auto pb-20">
        
        {/* --- VISTA: MENU INICIAL (ÍNDICE) --- */}
        {currentView === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Secção Resumos */}
            <div className="bg-white/80 p-8 doodle-border backdrop-blur-sm">
              <h2 className="font-doodle text-4xl font-bold mb-6 text-indigo-900 flex items-center gap-3 border-b-4 border-slate-200 pb-2">
                <BookOpen className="text-indigo-500" size={32} />
                Ler Apontamentos
              </h2>
              <p className="text-lg font-semibold text-slate-600 mb-6 font-body">
                Revê a teoria de forma rápida antes de testares os teus conhecimentos.
              </p>
              <button 
                onClick={() => setCurrentView('notes')}
                className="w-full bg-indigo-100 text-indigo-900 px-6 py-4 font-doodle text-3xl doodle-border hover:bg-indigo-200 transition-colors text-left flex justify-between items-center"
              >
                Abrir Cábulas Visuais <ArrowRight />
              </button>
            </div>

            {/* Secção Testes por Tema */}
            <div className="bg-white/80 p-8 doodle-border backdrop-blur-sm">
              <h2 className="font-doodle text-4xl font-bold mb-6 text-rose-600 flex items-center gap-3 border-b-4 border-slate-200 pb-2">
                <Edit3 className="text-rose-500" size={32} />
                Realizar Testes
              </h2>
              <p className="text-lg font-semibold text-slate-600 mb-6 font-body">
                Escolhe um tema. As perguntas serão carregadas via API simulada.
              </p>
              <ul className="space-y-4 font-doodle text-3xl">
                <li>
                  <button onClick={() => handleStartQuiz('fundamentos', 'Fundamentos Web')} className="index-link flex items-center gap-2 w-full text-left">
                    <Server size={20} className="text-slate-400"/> 1. HTTP & SPAs
                  </button>
                </li>
                <li>
                  <button onClick={() => handleStartQuiz('php-mysql', 'PHP & MySQL')} className="index-link flex items-center gap-2 w-full text-left">
                    <Server size={20} className="text-slate-400"/> 2. PHP e Bases de Dados
                  </button>
                </li>
                <li>
                  <button onClick={() => handleStartQuiz('avancado', 'AJAX & Ficheiros')} className="index-link flex items-center gap-2 w-full text-left">
                    <Server size={20} className="text-slate-400"/> 3. AJAX e Interatividade
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* --- VISTA: CÁBULAS --- */}
        {currentView === 'notes' && (
          <div>
            <h2 className="font-doodle text-4xl font-bold mb-8 text-center text-indigo-900">
              Cábulas da Disciplina 📖
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyNotes.map(note => (
                <div key={note.id} className="sticky-note p-6 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-doodle text-3xl font-bold mb-3 border-b-2 border-black/20 pb-2">
                      {note.title}
                    </h3>
                    <p className="text-lg leading-relaxed font-semibold text-slate-700">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VISTA: QUIZ --- */}
        {currentView === 'quiz' && (
          <div className="max-w-3xl mx-auto bg-white/90 p-8 doodle-border backdrop-blur-sm">
            <h2 className="font-doodle text-4xl font-bold mb-2 text-center">
              Tema: <span className="highlighter-yellow">{activeThemeTitle}</span>
            </h2>
            
            {/* Estado de Carregamento (Loading da API) */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="w-16 h-16 animate-spin mb-4 text-indigo-500" />
                <p className="font-doodle text-3xl">A pedir perguntas ao servidor API...</p>
              </div>
            ) : (
              // Perguntas Carregadas
              <div className="mt-8">
                <div className="space-y-10">
                  {quizQuestions.map((q, index) => {
                    const userAnswer = answers[q.id] || '';
                    let isCorrect = false;
                    if (isSubmitted) {
                       isCorrect = q.type === 'mcq' ? userAnswer === q.answer : checkFillAnswer(userAnswer, q.answer);
                    }

                    return (
                      <div key={q.id} className="relative">
                        <div className="absolute -left-4 -top-4 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-doodle text-2xl font-bold transform -rotate-12 border-2 border-black">
                          {index + 1}
                        </div>
                        
                        <div className="pl-6 pt-2">
                          <p className="text-xl font-bold mb-4 font-body leading-relaxed">
                            {q.question.split(q.type === 'fill' ? ' ' : '').map((word, i) => {
                               if (q.type === 'fill' && word === '.') {
                                 return (
                                   <span key={i} className="inline-block mx-2">
                                     <input
                                       type="text"
                                       value={userAnswer}
                                       onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                       disabled={isSubmitted}
                                       className={`border-b-4 border-slate-400 bg-transparent outline-none text-center font-doodle text-2xl w-32 focus:border-indigo-500 transition-colors ${isSubmitted && isCorrect ? 'text-green-600 border-green-500' : ''} ${isSubmitted && !isCorrect ? 'text-red-600 border-red-500' : ''}`}
                                       placeholder="..."
                                     />
                                   </span>
                                 )
                               }
                               return q.type === 'fill' ? word + ' ' : word;
                            })}
                          </p>

                          {q.type === 'mcq' && q.options && (
                            <div className="space-y-3">
                              {q.options.map((opt, i) => (
                                <label key={i} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                                  userAnswer === opt && !isSubmitted ? 'bg-indigo-50 border-indigo-300' : 'border-transparent hover:bg-slate-50'
                                } ${
                                  isSubmitted && opt === q.answer ? 'bg-green-100 border-green-400' : ''
                                } ${
                                  isSubmitted && userAnswer === opt && opt !== q.answer ? 'bg-red-100 border-red-400' : ''
                                }`}>
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt}
                                    checked={userAnswer === opt}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    disabled={isSubmitted}
                                    className="mt-1 w-4 h-4 text-indigo-600"
                                  />
                                  <span className="text-lg">{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {isSubmitted && (
                            <div className={`mt-4 p-4 rounded-xl border-2 font-body text-lg flex gap-3 ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                              {isCorrect ? <CheckCircle2 className="shrink-0 mt-1" /> : <XCircle className="shrink-0 mt-1" />}
                              <div>
                                <strong className="font-doodle text-2xl block mb-1">
                                  {isCorrect ? 'Na mouche!' : 'Quase...'}
                                </strong>
                                {q.feedback}
                                {!isCorrect && q.type === 'fill' && (
                                  <p className="mt-2 text-sm">Resposta correta: <span className="font-bold bg-white px-2 py-1 rounded">{q.answer}</span></p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Área de Submissão */}
                <div className="mt-12 flex flex-col items-center border-t-4 border-dashed border-slate-300 pt-8">
                  {!isSubmitted ? (
                    <button
                      onClick={calculateScore}
                      disabled={Object.keys(answers).length < quizQuestions.length}
                      className="bg-indigo-600 text-white px-8 py-4 font-doodle text-3xl doodle-border flex items-center gap-3 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Entregar Ficha <ArrowRight />
                    </button>
                  ) : (
                    <div className="text-center w-full">
                      <div className="text-6xl font-doodle mb-4 font-bold">
                        Nota: <span className={score === quizQuestions.length ? 'text-green-600' : 'text-rose-500'}>
                          {score}/{quizQuestions.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(Object.keys(allQuestionsDB).find(k => allQuestionsDB[k] === quizQuestions) || 'fundamentos', activeThemeTitle)}
                        className="bg-slate-800 text-white px-8 py-3 font-doodle text-2xl doodle-border flex items-center gap-3 justify-center mx-auto hover:bg-slate-900 mt-4"
                      >
                        <RotateCcw /> Repetir Este Tema
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}