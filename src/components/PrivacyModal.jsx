export default function PrivacyModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <div className="modal-header">
          <h2 id="privacy-title">Aviso de Privacidad</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          <p className="privacy-responsible">
            <strong>SEPRISA SEGURIDAD</strong>, con domicilio en la República Mexicana,
            es responsable del tratamiento de sus datos personales conforme a la
            <em> Ley Federal de Protección de Datos Personales en Posesión de los
            Particulares (LFPDPPP)</em> y su Reglamento.
          </p>

          <section className="privacy-section">
            <h3>Datos personales que recabamos</h3>
            <ul>
              <li>Nombre completo</li>
              <li>Clave Única de Registro de Población (CURP)</li>
              <li>Empresa o razón social a la que pertenece</li>
              <li>Resultados obtenidos en el examen de evaluación</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h3>Finalidades del tratamiento</h3>
            <p><strong>Primarias</strong> (necesarias para la relación con usted):</p>
            <ul>
              <li>Registro e identificación del evaluado dentro del programa de formación</li>
              <li>Aplicación y calificación del examen de conocimientos (inicial y/o final)</li>
              <li>Generación del comprobante de evaluación y expediente interno</li>
              <li>Cumplimiento de obligaciones en materia de capacitación y seguridad laboral</li>
            </ul>
            <p><strong>Secundarias</strong> (puede negarse sin afectar la relación):</p>
            <ul>
              <li>Análisis estadístico agregado para mejorar los contenidos de formación</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h3>Transferencia de datos</h3>
            <p>
              Sus datos personales <strong>no serán transferidos a terceros</strong> ajenos
              a SEPRISA SEGURIDAD, salvo las excepciones previstas en el artículo 37 de la
              LFPDPPP (autoridades competentes que los requieran en ejercicio de sus
              atribuciones legales) o cuando usted otorgue su consentimiento expreso.
            </p>
          </section>

          <section className="privacy-section">
            <h3>Derechos ARCO</h3>
            <p>
              Usted tiene derecho de <strong>Acceder</strong> a sus datos, <strong>Rectificarlos</strong>{' '}
              si son inexactos, <strong>Cancelarlos</strong> cuando dejen de ser necesarios para la
              finalidad que justificó su tratamiento, u <strong>Oponerse</strong> a su uso para
              finalidades secundarias. Puede ejercer estos derechos enviando una solicitud al
              área de administración de SEPRISA SEGURIDAD con una identificación oficial.
            </p>
          </section>

          <section className="privacy-section">
            <h3>Seguridad de los datos</h3>
            <p>
              SEPRISA SEGURIDAD implementa medidas técnicas, administrativas y físicas para
              proteger sus datos personales contra daño, pérdida, alteración, destrucción
              o acceso no autorizado.
            </p>
          </section>

          <section className="privacy-section">
            <h3>Vigencia</h3>
            <p>
              Sus datos serán conservados durante el tiempo que sea necesario para cumplir
              las finalidades descritas y las obligaciones legales aplicables en materia
              de capacitación laboral. Al término del programa formativo, los datos serán
              resguardados de forma segura conforme a los plazos legales.
            </p>
          </section>

          <p className="privacy-date">
            Última actualización: marzo de 2026.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn-start" onClick={onClose}>
            Entendido — cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
