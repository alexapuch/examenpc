import { sections, PASSING_SCORE } from '../data/examData';

export default function StartScreen({ onStart }) {
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="start-header">
          <h1>Examen de Seguridad y Prevención</h1>
          <p className="start-subtitle">
            Evaluación de conocimientos en seguridad laboral
          </p>
        </div>

        <div className="sections-preview">
          {sections.map((section) => (
            <div key={section.id} className="section-preview-item">
              <span className="section-icon">{section.icon}</span>
              <div>
                <strong>{section.title}</strong>
                <span className="question-count">{section.questions.length} preguntas</span>
              </div>
            </div>
          ))}
        </div>

        <div className="start-info">
          <div className="info-item">
            <span className="info-label">Total de preguntas</span>
            <span className="info-value">{totalQuestions}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Calificación mínima</span>
            <span className="info-value">{PASSING_SCORE}%</span>
          </div>
          <div className="info-item">
            <span className="info-label">Secciones</span>
            <span className="info-value">{sections.length}</span>
          </div>
        </div>

        <button className="btn-start" onClick={onStart}>
          Comenzar examen
        </button>
      </div>
    </div>
  );
}
