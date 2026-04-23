import { useState, useEffect, useRef } from 'react';
import { sections } from './data/examData';
import RegisterScreen from './components/RegisterScreen';
import WelcomeScreen from './components/WelcomeScreen';
import SectionExam from './components/SectionExam';
import ResultScreen from './components/ResultScreen';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';

const PHASE = { REGISTER: 'register', WELCOME: 'welcome', EXAM: 'exam', RESULT: 'result' };

const SAVED_USER_KEY = 'examenpc_user';
const SAVED_PROGRESS_KEY = 'examenpc_progress';
const COMPLETED_KEY = 'examenpc_completed';

function generateFolio(examType) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = examType === 'final' ? 'SEP-F' : 'SEP-I';
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}-${date}-${rand}`;
}

export default function App() {
  const [phase, setPhase] = useState(PHASE.REGISTER);
  const [showAdmin, setShowAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('examenpc_dark') === '1');
  const headerRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('examenpc_dark', darkMode ? '1' : '0');
  }, [darkMode]);

  useEffect(() => {
    function onScroll() {
      if (headerRef.current) {
        headerRef.current.classList.toggle('scrolled', window.scrollY > 4);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [userInfo, setUserInfo] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [defaultExamType, setDefaultExamType] = useState(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = JSON.parse(localStorage.getItem(SAVED_PROGRESS_KEY) || 'null');
      if (saved && saved.date === today && saved.examType) return saved.examType;
    } catch {}
    return 'inicial';
  });

  // Persist exam progress while in exam phase
  useEffect(() => {
    if (phase !== PHASE.EXAM) return;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(SAVED_PROGRESS_KEY, JSON.stringify({ answers, currentSection, date: today, examType: userInfo?.examType }));
  }, [answers, currentSection, phase, userInfo]);

  // Warn before leaving mid-exam
  useEffect(() => {
    if (phase !== PHASE.EXAM) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  function handleStart(info) {
    const today = new Date().toISOString().slice(0, 10);
    const folio = generateFolio(info.examType);
    const fullInfo = { ...info, folio };
    localStorage.setItem(SAVED_USER_KEY, JSON.stringify({ name: info.name, curp: info.curp, company: info.company, date: today }));
    setUserInfo(fullInfo);

    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_PROGRESS_KEY) || 'null');
      if (saved && saved.date === today && Object.keys(saved.answers || {}).length > 0) {
        setAnswers(saved.answers);
        setCurrentSection(saved.currentSection || 0);
      }
    } catch { /* ignore */ }

    setPhase(PHASE.WELCOME);
  }

  function handleBeginExam() {
    setPhase(PHASE.EXAM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAnswer(questionId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleNext() {
    if (currentSection < sections.length - 1) {
      setCurrentSection((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      localStorage.removeItem(SAVED_PROGRESS_KEY);
      const today = new Date().toISOString().slice(0, 10);
      const totalCorrect = sections.reduce((sum, s) => sum + s.questions.filter(q => answers[q.id] === q.correct).length, 0);
      const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
      const score = Math.round((totalCorrect / totalQuestions) * 100);
      const completed = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
      completed.push({
        curp: userInfo.curp,
        name: userInfo.name,
        company: userInfo.company,
        examType: userInfo.examType,
        date: today,
        score,
        correct: totalCorrect,
        total: totalQuestions,
        folio: userInfo.folio,
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      });
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed));
      setPhase(PHASE.RESULT);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrev() {
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleRestart() {
    localStorage.removeItem(SAVED_PROGRESS_KEY);
    setDefaultExamType(userInfo?.examType === 'inicial' ? 'final' : 'inicial');
    setAnswers({});
    setCurrentSection(0);
    setUserInfo(null);
    setPhase(PHASE.REGISTER);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      <header className="brand-header" ref={headerRef}>
        <span className="brand-logo">S</span>
        <span className="brand-name">SEPRISA <span className="brand-seg">SEGURIDAD</span></span>
        <div className="header-actions">
          <button className="btn-dark-toggle" onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
            {darkMode ? '☼' : '☾'}
          </button>
          <button className="btn-admin-link" onClick={() => setShowAdmin(true)}>
            Admin
          </button>
        </div>
      </header>

      {phase === PHASE.REGISTER && (
        <RegisterScreen onStart={handleStart} defaultExamType={defaultExamType} />
      )}

      {phase === PHASE.WELCOME && (
        <WelcomeScreen userInfo={userInfo} onBegin={handleBeginExam} />
      )}

      {phase === PHASE.EXAM && (
        <SectionExam
          section={sections[currentSection]}
          sectionIndex={currentSection}
          totalSections={sections.length}
          answers={answers}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentSection === 0}
          isLast={currentSection === sections.length - 1}
        />
      )}

      {phase === PHASE.RESULT && (
        <ResultScreen answers={answers} userInfo={userInfo} onRestart={handleRestart} />
      )}

      <Footer />
    </div>
  );
}
