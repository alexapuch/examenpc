import { useState } from 'react';

const ADMIN_PASSWORD = 'seprisa2024';
const COMPLETED_KEY = 'examenpc_completed';

export default function AdminPanel({ onClose }) {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const results = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]').filter(r => r.date === today);

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setError('Contraseña incorrecta');
    }
  }

  function exportCSV() {
    const headers = ['Nombre', 'CURP', 'Empresa', 'Tipo', 'Puntaje', 'Correctas', 'Total', 'Folio', 'Hora'];
    const rows = results.map(r => [
      r.name || '',
      r.curp || '',
      r.company || '',
      r.examType === 'inicial' ? 'Inicial' : 'Final',
      r.score !== undefined ? `${r.score}%` : '',
      r.correct !== undefined ? r.correct : '',
      r.total !== undefined ? r.total : '',
      r.folio || '',
      r.time || '',
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SEPRISA_resultados_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box admin-modal-box">
        <div className="modal-header">
          <h2>Panel de administración</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!authenticated ? (
          <div className="admin-login">
            <p className="admin-login-desc">Ingresa la contraseña para ver los resultados del día.</p>
            <form onSubmit={handleLogin} className="admin-login-form">
              <input
                className={`field-input${error ? ' input-invalid' : ''}`}
                type="password"
                placeholder="Contraseña"
                value={password}
                autoFocus
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
              {error && <span className="field-error-msg">{error}</span>}
              <button type="submit" className="btn-start" style={{ marginTop: 4 }}>Entrar</button>
            </form>
          </div>
        ) : (
          <>
            <div className="admin-toolbar">
              <span className="admin-date-label">Resultados del {today}</span>
              <span className="admin-count">{results.length} examen{results.length !== 1 ? 'es' : ''}</span>
              <button className="btn-csv" onClick={exportCSV} disabled={results.length === 0}>
                ⬇ Exportar CSV
              </button>
            </div>

            <div className="admin-table-wrap">
              {results.length === 0 ? (
                <p className="admin-empty">No hay resultados registrados hoy.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>CURP</th>
                      <th>Empresa</th>
                      <th>Tipo</th>
                      <th>Puntaje</th>
                      <th>Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i}>
                        <td>{r.name || '—'}</td>
                        <td className="admin-curp">{r.curp}</td>
                        <td>{r.company || '—'}</td>
                        <td>
                          <span className={`exam-type-badge ${r.examType}`}>
                            {r.examType === 'inicial' ? 'Inicial' : 'Final'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-score ${r.score >= 70 ? 'score-pass' : 'score-fail'}`}>
                            {r.score !== undefined ? `${r.score}%` : '—'}
                          </span>
                        </td>
                        <td>{r.time || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
