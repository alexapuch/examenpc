export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="corp-footer">
      <div className="corp-footer-inner">
        <span className="corp-footer-brand">SEPRISA SEGURIDAD</span>
        <span className="corp-footer-sep">·</span>
        <span>Uso interno — Documento confidencial</span>
        <span className="corp-footer-sep">·</span>
        <span>© {year} Todos los derechos reservados</span>
      </div>
      <div className="corp-footer-legal">
        Los datos proporcionados en esta evaluación son tratados de manera confidencial conforme al aviso de privacidad de la empresa.
      </div>
    </footer>
  );
}
