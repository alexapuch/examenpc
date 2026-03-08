import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';

export default function SectionExam({ section, sectionIndex, totalSections, answers, onAnswer, onNext, onPrev, isFirst, isLast }) {
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setAttempted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sectionIndex]);

  const unanswered = section.questions.filter((q) => answers[q.id] === undefined).length;
  const canAdvance = unanswered === 0;

  function handleNext() {
    if (!canAdvance) { setAttempted(true); return; }
    onNext();
  }

  return (
    <div className="section-exam">
      {/* Section header */}
      <div className="section-header">
        <div className="section-progress-meta">
          <span className="section-progress-label">Sección {sectionIndex + 1} de {totalSections}</span>
          <span className="section-progress-pct">{Math.round(((sectionIndex + 1) / totalSections) * 100)}%</span>
        </div>
        <div className="section-title-row">
          <span className="section-icon-large">{section.icon}</span>
          <h2>{section.title}</h2>
        </div>
        <p className="section-description">{section.description}</p>

        <div className="section-progress-bar">
          <div
            className="section-progress-fill"
            style={{ width: `${((sectionIndex + 1) / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="questions-list">
        {section.questions.map((question, idx) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={idx + 1}
            totalQuestions={section.questions.length}
            selected={answers[question.id]}
            onSelect={onAnswer}
            highlight={attempted && answers[question.id] === undefined}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="section-nav">
        {!isFirst && (
          <button className="btn-nav btn-prev" onClick={onPrev}>
            ← Sección anterior
          </button>
        )}

        {unanswered > 0 && (
          <p className="unanswered-warning">
            {unanswered} pregunta{unanswered !== 1 ? 's' : ''} sin responder
          </p>
        )}

        <button
          className="btn-nav btn-next"
          onClick={handleNext}
        >
          {isLast ? 'Ver resultados →' : 'Siguiente sección →'}
        </button>
      </div>
    </div>
  );
}
