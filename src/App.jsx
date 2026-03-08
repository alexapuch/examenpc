import { useState, useEffect } from 'react';
import { sections } from './data/examData';
import RegisterScreen from './components/RegisterScreen';
import SectionExam from './components/SectionExam';
import ResultScreen from './components/ResultScreen';

const PHASE = { REGISTER: 'register', EXAM: 'exam', RESULT: 'result' };

const SAVED_USER_KEY = 'examenpc_user';
const SAVED_PROGRESS_KEY = 'examenpc_progress';
const COMPLETED_KEY = 'examenpc_completed';

export default function App() {
  const [phase, setPhase] = useState(PHASE.REGISTER);
  const [userInfo, setUserInfo] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});

  // Persist exam progress while in exam phase
  useEffect(() => {
    if (phase !== PHASE.EXAM) return;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(SAVED_PROGRESS_KEY, JSON.stringify({ answers, currentSection, date: today }));
  }, [answers, currentSection, phase]);

  // Warn before leaving mid-exam
  useEffect(() => {
    if (phase !== PHASE.EXAM) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  function handleStart(info) {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(SAVED_USER_KEY, JSON.stringify({ name: info.name, curp: info.curp, company: info.company, date: today }));
    setUserInfo(info);

    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_PROGRESS_KEY) || 'null');
      if (saved && saved.date === today && Object.keys(saved.answers || {}).length > 0) {
        setAnswers(saved.answers);
        setCurrentSection(saved.currentSection || 0);
      }
    } catch { /* ignore */ }

    setPhase(PHASE.EXAM);
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
      const completed = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]').filter(e => e.date === today);
      completed.push({ curp: userInfo.curp, examType: userInfo.examType, date: today });
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
    setAnswers({});
    setCurrentSection(0);
    setUserInfo(null);
    setPhase(PHASE.REGISTER);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      {phase === PHASE.REGISTER && (
        <RegisterScreen onStart={handleStart} />
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
    </div>
  );
}
