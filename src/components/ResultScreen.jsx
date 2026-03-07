import { sections, PASSING_SCORE } from '../data/examData';

export default function ResultScreen({ answers, onRestart }) {
  // Calculate results per section and overall
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
  const passed = overallPercentage >= PASSING_SCORE;

  return (
    <div className="result-screen">
      <div className="result-card">
        {/* Overall result */}
        <div className={`result-banner ${passed ? 'passed' : 'failed'}`}>
          <div className="result-emoji">{passed ? '✅' : '❌'}</div>
          <h2>{passed ? '¡Aprobado!' : 'No aprobado'}</h2>
          <div className="result-score">{overallPercentage}%</div>
          <p className="result-detail">
            {totalCorrect} de {totalQuestions} respuestas correctas
          </p>
          <p className="result-threshold">
            Calificación mínima: {PASSING_SCORE}%
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
                    className={`section-result-fill ${sr.percentage >= PASSING_SCORE ? 'bar-pass' : 'bar-fail'}`}
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

        <button className="btn-restart" onClick={onRestart}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
