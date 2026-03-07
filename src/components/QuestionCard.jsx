export default function QuestionCard({ question, questionNumber, totalQuestions, selected, onSelect }) {
  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">Pregunta {questionNumber} de {totalQuestions}</span>
      </div>
      <p className="question-text">{question.text}</p>
      <ul className="options-list">
        {question.options.map((option, index) => (
          <li key={index}>
            <button
              className={`option-btn ${selected === index ? 'selected' : ''}`}
              onClick={() => onSelect(question.id, index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
