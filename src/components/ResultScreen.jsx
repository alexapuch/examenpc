import { useEffect, useRef, useState } from 'react';
import { sections, PASSING_SCORE } from '../data/examData';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export default function ResultScreen({ answers, userInfo, onRestart }) {
  const submitted = useRef(false);
  const [submitStatus, setSubmitStatus] = useState(SCRIPT_URL ? 'sending' : 'idle');

  const sectionResults = sections.map((section) => {
    const correct = section.questions.filter(
      (q) => answers[q.id] === q.correct
    ).length;
    const total = section.questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { ...section, correct, total, percentage };
  });

  const totalCorrect = sectionResults.reduce((sum, s) => sum + s.correct, 0);
  const totalQuestions = sectionResults.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100);
  const improved = overallPercentage >= PASSING_SCORE;

  useEffect(() => {
    if (submitted.current || !SCRIPT_URL) return;
    submitted.current = true;

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        name: userInfo.name,
        curp: userInfo.curp,
        company: userInfo.company,
        examType: userInfo.examType,
        score: overallPercentage,
        correct: totalCorrect,
        total: totalQuestions,
        passed: improved,
      }),
    })
      .then(() => setSubmitStatus('sent'))
      .catch(() => setSubmitStatus('error'));
  }, []);

  const examLabel = userInfo.examType === 'inicial' ? 'Examen Inicial' : 'Examen Final';

  return (
    <div className="result-screen">
      <div className="result-card">
        {/* User info strip */}
        <div className="result-user-strip">
          <div className="result-user-row">
            <span className="result-user-name">{userInfo.name}</span>
            <span className={`exam-type-badge ${userInfo.examType}`}>{examLabel}</span>
          </div>
          <div className="result-user-meta">
            <span>{userInfo.curp}</span>
            <span className="meta-sep">·</span>
            <span>{userInfo.company}</span>
          </div>
        </div>

        {/* Overall result */}
        <div className={`result-banner ${improved ? 'passed' : 'failed'}`}>
          <div className="result-emoji">{improved ? '📈' : '📉'}</div>
          <h2>{improved ? '¡Buen dominio del tema!' : 'Área de oportunidad'}</h2>
          <div className="result-score">{overallPercentage}%</div>
          <p className="result-detail">
            {totalCorrect} de {totalQuestions} respuestas correctas
          </p>
        </div>

        {/* Per-section breakdown */}
        <div className="section-results">
          <h3>Resultados por sección</h3>
          {sectionResults.map((sr) => (
            <div key={sr.id} className="section-result-row">
              <div className="section-result-label">
                <span>{sr.icon}</span>
                <span>{sr.title}</span>
              </div>
              <div className="section-result-bar-wrap">
                <div className="section-result-bar">
                  <div
                    className={`section-result-fill ${sr.percentage >= 50 ? 'bar-pass' : 'bar-fail'}`}
                    style={{ width: `${sr.percentage}%` }}
                  />
                </div>
                <span className="section-result-pct">
                  {sr.correct}/{sr.total} — {sr.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {submitStatus !== 'idle' && (
          <p className={`submit-status submit-status--${submitStatus}`}>
            {submitStatus === 'sending' && 'Guardando resultados...'}
            {submitStatus === 'sent'    && 'Resultados guardados correctamente.'}
            {submitStatus === 'error'   && 'No se pudieron guardar los resultados (sin conexión).'}
          </p>
        )}

        <button className="btn-restart" onClick={onRestart}>
          {userInfo.examType === 'inicial' ? 'Siguiente examen' : 'Nuevo examen'}
        </button>
      </div>
    </div>
  );
}
