import { useState } from 'react';
import { sections } from './data/examData';
import StartScreen from './components/StartScreen';
import SectionExam from './components/SectionExam';
import ResultScreen from './components/ResultScreen';

const PHASE = { START: 'start', EXAM: 'exam', RESULT: 'result' };

export default function App() {
  const [phase, setPhase] = useState(PHASE.START);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});

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
    setPhase(PHASE.START);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app">
      {phase === PHASE.START && (
        <StartScreen onStart={() => setPhase(PHASE.EXAM)} />
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
        <ResultScreen answers={answers} onRestart={handleRestart} />
      )}
    </div>
  );
}
