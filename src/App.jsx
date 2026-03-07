import { useState } from 'react';
import { sections } from './data/examData';
import RegisterScreen from './components/RegisterScreen';
import SectionExam from './components/SectionExam';
import ResultScreen from './components/ResultScreen';

const PHASE = { REGISTER: 'register', EXAM: 'exam', RESULT: 'result' };

const SAVED_USER_KEY = 'examenpc_user';

export default function App() {
  const [phase, setPhase] = useState(PHASE.REGISTER);
  const [userInfo, setUserInfo] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});

  function handleStart(info) {
    localStorage.setItem(SAVED_USER_KEY, JSON.stringify({ name: info.name, curp: info.curp, company: info.company }));
    setUserInfo(info);
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
