import {useState, useEffect} from 'react';
import { BookOpen, CheckCircle2, Edit3, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

const doodleStyles = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Nunito:wght@400;600;800&display=swap');

.font-doodle {font-family: 'Caveat', cursive;}
.font-body {font-family: 'Nunito', sans-serif;}
.notebook-bg {
background-color: #fdfbf7;
background-image: url('https://www.transparenttextures.com/patterns/white-paper.png');
background-size: 100% 1.5rem, 100% 1.5rem;
background-position: 0 0, 0 0;
}

.doodle-border {
border: 3px solid #1e293b;
border-radius: 255px 15px 255px 15px/15px 255px 15px 255px;
box-shadow: 4px 4px 0px #1e293b;
transition: all 0.2s ease-in-out;
}

.doodle-border:hover {
transform: translate(-2px);
box-shadow: 6px 6px 0px #1e293b;
}

.highlighter-yellow {
background: linear-gradient(104deg, rgba(253,255,133,0)0.9%, rgba(253,255,133,1) 2.4%, rgba(253,255,133,0.5) 5.8%, rgba(253,255,133,1) 93%, rgba(253,255,133,0.7) 96%, rgba(253,255,133,0)98%), linear-gradient(183deg, rgba(253,255,133,0) 0%, rgba(253,255,133,0.3)7.9%, rgba(253,255,133,0)15%);
padding: 0 0.2rem;
}

.sticky-note {
background-color: #fef08a;
box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
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
`;

const studyNotes = [
  { id: 1, title: "0.1 HTTP", content: "Servidores Web comunicam usando o protocolo HTTP. O tipo de informação é classificado com um MIME Type." },
  { id: 2, title: "1. Pág. Dinâmicas", content: "CSR vs SSR! SPA (Single-Page App) carrega 1 documento e atualiza via JS. PWA age como app nativa!" },
  { id: 3, title: "2. PHP Basics", content: "Linguagem Server-side e Interpretada. echo (vários param) vs print (1 param). Formulários: $_GET e $_POST." },
  { id: 4, title: "2.1 POO em PHP", content: "Organiza info em Objetos. Uma classe tem atributos e ações. Modificador 'public' = acessível em todo o lado." },
  { id: 5, title: "2.2 MySQL", content: "Para ligar BDs usar a extensão php_mysqli (permite prepared statements). A antiga php_mysql está obsoleta." },
  { id: 6, title: "2.3 Cookies/Sessões", content: "Cookies: Info guardada no BROWSER (cliente). Sessão: Período em que o browser está aberto (no servidor)." },
  { id: 7, title: "2.4 Ficheiros", content: "Para upload usar <input type='file'>. Info fica na super global $_FILES. Vão para pasta temp primeiro!" },
  { id: 8, title: "2.5 AJAX", content: "Asynchronous JavaScript And XML. Usa XMLHttpRequest para atualizar partes da página SEM recarregar tudo." },
  { id: 9, title: "2.6 Emails", content: "Para enviar emails em PHP é necessário ter um servidor SMTP configurado no ficheiro php.ini." },
  { id: 10, title: "2.7 I18N", content: "Internacionalização! Separar labels/mensagens em ficheiros de variáveis (ex: i18n_pt.php) em vez de hard-coded." }
];

const quizQuestions = [
  {
    id: 1,
    type: "mcq",
    question: "O que caracteriza uma Single-Page Application (SPA)?",
    options: [
      "Carrega múltiplas páginas HTML do servidor a cada clique.",
      "Carrega um único documento e atualiza o conteúdo via JavaScript.",
      "É um documento estático sem qualquer interação."
    ],
    answer: "Carrega um único documento e atualiza o conteúdo via JavaScript.",
    feedback: "Exato! Numa SPA (arquitetura CSR), não recarregas a página inteira do servidor constantemente."
  },
  {
    id: 2,
    type: "fill",
    question: "A extensão mais recente e recomendada em PHP para interagir com bases de dados MySQL, que suporta prepared statements, chama-se php_.",
    answer: "mysqli",
    feedback: "Certo! 'mysqli' (MySQL Improved) é a versão atual. A versão antiga (mysql) está obsoleta nas versões recentes do PHP."
  },
  {
    id: 3,
    type: "mcq",
    question: "Qual a diferença principal entre 'echo' e 'print' em PHP?",
    options: [
      "O 'echo' só aceita um parâmetro, o 'print' aceita vários.",
      "Não há diferença, são exatamente a mesma coisa.",
      "O 'echo' pode receber diversos parâmetros sem adicionar espaços, o 'print' apenas recebe um."
    ],
    answer: "O 'echo' pode receber diversos parâmetros sem adicionar espaços, o 'print' apenas recebe um.",
    feedback: "Boa! O 'echo' é ligeiramente mais rápido e versátil por aceitar múltiplos parâmetros."
  },
  {
    id: 4,
    type: "fill",
    question: "Na Programação Orientada a Objetos em PHP, o modo de acesso que permite que um atributo seja acedido a partir de qualquer parte do código é o .",
    answer: "public",
    feedback: "Spot on! 'public' deixa a porta totalmente aberta. Outros seriam private ou protected."
  },
  {
    id: 5,
    type: "mcq",
    question: "Como o PHP lida inicialmente com o upload de ficheiros através de formulários HTML?",
    options: [
      "Guarda-os logo na pasta final do projeto através da variável $_GET.",
      "Guarda-os numa pasta temporária do servidor e a informação fica na variável $_FILES.",
      "Envia-os diretamente para a base de dados MySQL."
    ],
    answer: "Guarda-os numa pasta temporária do servidor e a informação fica na variável $_FILES.",
    feedback: "Correto! Depois de irem para a pasta temporária, cabe-te a ti (programador) movê-los para o destino final usando código PHP."
  },
  {
    id: 6,
    type: "fill",
    question: "A tecnologia que permite trocar informação nos bastidores e atualizar partes de uma página web sem a recarregar chama-se .",
    answer: "AJAX",
    feedback: "Exatamente! AJAX (Asynchronous JavaScript And XML) é o que dá a fluidez às web apps modernas."
  },
  {
    id: 7,
    type: "mcq",
    question: "Na área de I18N (Internacionalização), qual é a melhor prática para lidar com mensagens e labels?",
    options: [
      "Escrever o texto (hard-coded) diretamente no HTML.",
      "Usar apenas a base de dados para guardar todas as palavras do site.",
      "Criar ficheiros separados (ex: i18n_pt.php) com variáveis que possuem os valores das mensagens."
    ],
    answer: "Criar ficheiros separados (ex: i18n_pt.php) com variáveis que possuem os valores das mensagens.",
    feedback: "Perfeito! Isso permite carregar o ficheiro correspondente ao idioma do utilizador de forma dinâmica."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'quiz'
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Injetar estilos ao montar
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = doodleStyles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    let currentScore = 0;
    quizQuestions.forEach(q => {
      const userAnswer = answers[q.id];
      if (userAnswer) {
        if (q.type === 'mcq' && userAnswer === q.answer) {
          currentScore += 1;
        } else if (q.type === 'fill' && userAnswer.toLowerCase().trim() === q.answer.toLowerCase()) {
          currentScore += 1;
        }
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const checkFillAnswer = (userAns: string, correctAns: string) => {
    if (!userAns) return false;
    return userAns.toLowerCase().trim() === correctAns.toLowerCase();
  };

  return (
    <div className="min-h-screen notebook-bg font-body p-4 md:p-8 text-slate-800">
      
      {/* Header Estilo Doodle */}
      <header className="max-w-4xl mx-auto mb-10 text-center relative">
        <div className="absolute top-0 left-0 text-slate-300 -z-10 text-9xl opacity-20 font-doodle rotate-12">
          PHP
        </div>
        <h1 className="text-5xl md:text-7xl font-doodle font-bold mb-4 transform -rotate-1 text-indigo-900">
          <span className="highlighter-yellow">Caderno de DW2</span>
        </h1>
        <p className="text-lg md:text-xl font-bold text-slate-600 font-doodle text-2xl">
          ~ Notas Visuais & Exercícios by Teu Explicador ~
        </p>
        
        {/* Navegação */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-6 py-3 font-doodle text-2xl doodle-border ${activeTab === 'notes' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-900'}`}
          >
            <BookOpen size={24} /> Cábulas Visuais
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-6 py-3 font-doodle text-2xl doodle-border ${activeTab === 'quiz' ? 'bg-rose-500 text-white' : 'bg-white text-rose-600'}`}
          >
            <Edit3 size={24} /> Exercícios Práticos
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pb-20">
        
        {/* SECÇÃO 1: CÁBULAS / RESUMOS */}
        {activeTab === 'notes' && (
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
                <div className="mt-4 text-right">
                  <span className="font-doodle text-black/40 text-xl">#dica</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECÇÃO 2: QUIZ / EXERCÍCIOS */}
        {activeTab === 'quiz' && (
          <div className="max-w-3xl mx-auto bg-white/80 p-8 doodle-border backdrop-blur-sm">
            <h2 className="font-doodle text-4xl font-bold mb-8 text-center">
              Teste Rápido: <span className="highlighter-yellow">Hora de brilhar!</span> ✨
            </h2>

            <div className="space-y-10">
              {quizQuestions.map((q, index) => {
                const userAnswer : string = answers[q.id] || '';
                let isCorrect = false;
                if (isSubmitted) {
                   isCorrect = q.type === 'mcq' 
                    ? userAnswer === q.answer 
                    : checkFillAnswer(userAnswer, q.answer);
                }

                return (
                  <div key={q.id} className="relative">
                    {/* Número da questão desenhado */}
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

                      {/* Múltipla Escolha */}
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

                      {/* Feedback após submissão */}
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

            {/* Ações do Quiz */}
            <div className="mt-12 flex flex-col items-center border-t-4 border-dashed border-slate-300 pt-8">
              {!isSubmitted ? (
                <button
                  onClick={calculateScore}
                  className="bg-indigo-600 text-white px-8 py-4 font-doodle text-3xl doodle-border flex items-center gap-3 hover:bg-indigo-700"
                >
                  Entregar Ficha <ArrowRight />
                </button>
              ) : (
                <div className="text-center w-full">
                  <div className="text-6xl font-doodle mb-4 font-bold">
                    Nota: <span className={score > 4 ? 'text-green-600' : 'text-rose-500'}>
                      {score}/{quizQuestions.length}
                    </span>
                  </div>
                  <p className="text-2xl font-doodle mb-8 text-slate-600">
                    {score === quizQuestions.length ? 'Excelente! Dominas a matéria!' : score >= 4 ? 'Bom trabalho, mas vale a pena rever os apontamentos!' : 'Ups! Vamos voltar aos resumos e tentar de novo?'}
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="bg-slate-800 text-white px-8 py-3 font-doodle text-2xl doodle-border flex items-center gap-3 justify-center mx-auto hover:bg-slate-900"
                  >
                    <RotateCcw /> Repetir Exercícios
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}