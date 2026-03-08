export default function WelcomeScreen({ userInfo, onBegin }) {
  const examLabel = userInfo.examType === 'inicial' ? 'Examen Inicial' : 'Examen Final';
  const examDesc  = userInfo.examType === 'inicial'
    ? 'Este examen se aplica antes del curso de capacitación.'
    : 'Este examen se aplica al concluir el curso de capacitación.';

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="welcome-badge">{examLabel}</div>
        <h2 className="welcome-title">Instrucciones generales</h2>
        <p className="welcome-desc">{examDesc}</p>

        <ul className="welcome-rules">
          <li>Lee cada pregunta con atención antes de seleccionar tu respuesta.</li>
          <li>No podrás avanzar a la siguiente sección si dejas preguntas sin contestar.</li>
          <li>Puedes regresar a la sección anterior para modificar tus respuestas.</li>
          <li>Una vez que entregues el examen no se podrán modificar las respuestas.</li>
          <li>Está prohibido el uso de cualquier material de apoyo durante la evaluación.</li>
          <li>Si cierras el navegador, tu progreso se guardará y podrás continuar hoy.</li>
        </ul>

        <div className="welcome-meta">
          <div className="welcome-meta-item">
            <span className="welcome-meta-label">Candidato</span>
            <strong>{userInfo.name}</strong>
          </div>
          <div className="welcome-meta-item">
            <span className="welcome-meta-label">CURP</span>
            <strong>{userInfo.curp}</strong>
          </div>
          <div className="welcome-meta-item">
            <span className="welcome-meta-label">Empresa</span>
            <strong>{userInfo.company}</strong>
          </div>
          <div className="welcome-meta-item">
            <span className="welcome-meta-label">Folio</span>
            <strong className="welcome-folio">{userInfo.folio}</strong>
          </div>
        </div>

        <p className="welcome-consent">
          Al iniciar el examen confirmas que leíste estas instrucciones y que los datos registrados son correctos.
        </p>

        <button className="btn-begin" onClick={onBegin}>
          Iniciar examen →
        </button>
      </div>
    </div>
  );
}
