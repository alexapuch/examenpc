export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="corp-footer">
      <div className="corp-footer-inner">
        <span className="corp-footer-brand">SEPRISA SEGURIDAD</span>
        <span className="corp-footer-sep">·</span>
        <span>Uso interno · © {year}</span>
      </div>
    </footer>
  );
}
