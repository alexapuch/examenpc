import { useState } from 'react';

const ADMIN_PASSWORD = 'seprisa2024';
const COMPLETED_KEY = 'examenpc_completed';

function loadResults(today) {
  return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]').filter(r => r.date === today);
}

function saveResults(today, updated) {
  const others = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]').filter(r => r.date !== today);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...others, ...updated]));
}

export default function AdminPanel({ onClose }) {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // 'selected' | 'all'
  const [results, setResults] = useState(() => loadResults(new Date().toISOString().slice(0, 10)));

  const today = new Date().toISOString().slice(0, 10);
  const allChecked = results.length > 0 && selected.size === results.length;
  const someChecked = selected.size > 0 && !allChecked;

  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setError('Contraseña incorrecta');
    }
  }

  function toggleSelect(i) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(results.map((_, i) => i)));
  }

  function deleteSelected() {
    const updated = results.filter((_, i) => !selected.has(i));
    saveResults(today, updated);
    setResults(updated);
    setSelected(new Set());
    setConfirmDelete(null);
  }

  function deleteAll() {
    saveResults(today, []);
    setResults([]);
    setSelected(new Set());
    setConfirmDelete(null);
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
            {/* Confirm delete dialog */}
            {confirmDelete && (
              <div className="admin-confirm-overlay">
                <div className="admin-confirm-box">
                  <p className="admin-confirm-msg">
                    {confirmDelete === 'all'
                      ? `¿Eliminar los ${results.length} registros del día?`
                      : `¿Eliminar ${selected.size} registro${selected.size !== 1 ? 's' : ''} seleccionado${selected.size !== 1 ? 's' : ''}?`}
                  </p>
                  <p className="admin-confirm-sub">Esta acción no se puede deshacer.</p>
                  <div className="admin-confirm-actions">
                    <button className="btn-admin-cancel" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                    <button
                      className="btn-admin-delete-confirm"
                      onClick={confirmDelete === 'all' ? deleteAll : deleteSelected}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="admin-toolbar">
              <span className="admin-date-label">Resultados del {today}</span>
              <span className="admin-count">{results.length} examen{results.length !== 1 ? 'es' : ''}</span>
              {selected.size > 0 && (
                <button className="btn-delete-selected" onClick={() => setConfirmDelete('selected')}>
                  Eliminar seleccionados ({selected.size})
                </button>
              )}
              <button className="btn-csv" onClick={exportCSV} disabled={results.length === 0}>
                ⬇ Exportar CSV
              </button>
              <button className="btn-delete-all" onClick={() => setConfirmDelete('all')} disabled={results.length === 0}>
                Eliminar todo
              </button>
            </div>

            <div className="admin-table-wrap">
              {results.length === 0 ? (
                <p className="admin-empty">No hay resultados registrados hoy.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="admin-th-check">
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={allChecked}
                          ref={el => { if (el) el.indeterminate = someChecked; }}
                          onChange={toggleAll}
                          title="Seleccionar todos"
                        />
                      </th>
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
                      <tr key={i} className={selected.has(i) ? 'row-selected' : ''}>
                        <td className="admin-td-check">
                          <input
                            type="checkbox"
                            className="admin-checkbox"
                            checked={selected.has(i)}
                            onChange={() => toggleSelect(i)}
                          />
                        </td>
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
