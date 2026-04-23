import { useState, useMemo, useEffect } from 'react';

const ADMIN_PASSWORD = 'seprisa2024';
const COMPLETED_KEY = 'examenpc_completed';
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

function loadLocalResults() {
  return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
}

function saveLocalResults(date, updated) {
  const others = loadLocalResults().filter(r => r.date !== date);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...others, ...updated]));
}

/** Get sorted unique dates that have results */
function getAvailableDates(allData) {
  const dates = [...new Set(allData.map(r => r.date).filter(Boolean))];
  dates.sort((a, b) => b.localeCompare(a)); // newest first
  return dates;
}

/** Shift a YYYY-MM-DD date string by `days` */
function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Format YYYY-MM-DD to a friendly Spanish label */
function formatDateLabel(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = shiftDate(today, -1);
  if (dateStr === today) return `Hoy — ${dateStr}`;
  if (dateStr === yesterday) return `Ayer — ${dateStr}`;
  const d = new Date(dateStr + 'T12:00:00');
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AdminPanel({ onClose }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  // Data states
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useCloud, setUseCloud] = useState(false); // To show if we are online

  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // 'selected' | 'all'

  useEffect(() => {
    if (!authenticated) return;

    async function fetchCloudData() {
      if (!SCRIPT_URL) {
        setAllData(loadLocalResults());
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(SCRIPT_URL);
        const json = await res.json();
        
        const mapped = json.map(row => {
           const d = new Date(row['Fecha']);
           const offset = d.getTimezoneOffset() * 60000;
           const localISODate = (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
           
           return {
             name: row['Nombre'] || '',
             curp: row['Curp'] || '',
             company: row['Empresa'] || '',
             examType: row['Tipo de Examen']?.includes('Inicial') ? 'inicial' : 'final',
             date: localISODate,
             score: typeof row['Calificación'] === 'number' ? Math.round(row['Calificación'] * 100) : parseInt(row['Calificación'] || 0, 10),
             correct: row['Correctas/Total'] ? parseInt(row['Correctas/Total'].split('/')[0], 10) : 0,
             total: row['Correctas/Total'] ? parseInt(row['Correctas/Total'].split('/')[1], 10) : 24,
             time: d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
             folio: '—'
           };
        });
        
        setAllData(mapped);
        setUseCloud(true);
      } catch (err) {
        console.error("Error fetching from Google Sheets:", err);
        // Fallback to local storage if network fails
        setAllData(loadLocalResults());
        setUseCloud(false);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCloudData();
  }, [authenticated]);

  const availableDates = useMemo(() => getAvailableDates(allData), [allData]);
  const results = useMemo(() => allData.filter(r => r.date === selectedDate), [allData, selectedDate]);

  const allChecked = results.length > 0 && selected.size === results.length;
  const someChecked = selected.size > 0 && !allChecked;
  const isToday = selectedDate === todayStr;

  function changeDate(newDate) {
    setSelectedDate(newDate);
    setSelected(new Set());
    setConfirmDelete(null);
  }

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
    if (useCloud) {
      alert("No puedes borrar registros cuando estás conectado a Google Sheets. Borra las filas directamente en tu documento de Google Sheets.");
      setConfirmDelete(null);
      return;
    }
    const updated = results.filter((_, i) => !selected.has(i));
    saveLocalResults(selectedDate, updated);
    
    // Refresh local state
    setAllData(loadLocalResults());
    setSelected(new Set());
    setConfirmDelete(null);
  }

  function deleteAll() {
    if (useCloud) {
      alert("No puedes borrar registros cuando estás conectado a Google Sheets. Borra las filas directamente en tu documento de Google Sheets.");
      setConfirmDelete(null);
      return;
    }
    saveLocalResults(selectedDate, []);
    setAllData(loadLocalResults());
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
      r.score !== undefined && !isNaN(r.score) ? `${r.score}%` : '',
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
    a.download = `SEPRISA_resultados_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box admin-modal-box">
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Panel de administración</h2>
          {authenticated && useCloud && (
            <span className="cloud-badge" style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', marginLeft: 'auto', marginRight: '16px' }}>
              ☁️ Conectado a Sheets
            </span>
          )}
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!authenticated ? (
          <div className="admin-login">
            <p className="admin-login-desc">Ingresa la contraseña para ver los resultados globales.</p>
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
                      ? `¿Eliminar los ${results.length} registros de ${selectedDate}?`
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

            {/* ── Date navigator ── */}
            <div className="admin-date-nav">
              <button
                className="admin-date-arrow"
                onClick={() => changeDate(shiftDate(selectedDate, -1))}
                title="Día anterior"
              >
                ◀
              </button>

              <div className="admin-date-center">
                <input
                  type="date"
                  className="admin-date-input"
                  value={selectedDate}
                  max={todayStr}
                  onChange={e => changeDate(e.target.value)}
                />
                <span className="admin-date-friendly">{formatDateLabel(selectedDate)}</span>
              </div>

              <button
                className="admin-date-arrow"
                onClick={() => changeDate(shiftDate(selectedDate, 1))}
                disabled={isToday}
                title="Día siguiente"
              >
                ▶
              </button>

              {!isToday && (
                <button
                  className="admin-date-today-btn"
                  onClick={() => changeDate(todayStr)}
                  title="Ir a hoy"
                >
                  Hoy
                </button>
              )}
            </div>

            {/* Quick-jump chips for dates with data */}
            {availableDates.length > 1 && (
              <div className="admin-date-chips">
                {availableDates.slice(0, 14).map(d => (
                  <button
                    key={d}
                    className={`admin-date-chip${d === selectedDate ? ' active' : ''}`}
                    onClick={() => changeDate(d)}
                  >
                    {d === todayStr ? 'Hoy' : d.slice(5)}
                  </button>
                ))}
              </div>
            )}

            <div className="admin-toolbar">
              <span className="admin-count">
                {loading ? 'Cargando datos...' : `${results.length} examen${results.length !== 1 ? 'es' : ''}`}
              </span>
              {!useCloud && selected.size > 0 && (
                <button className="btn-delete-selected" onClick={() => setConfirmDelete('selected')}>
                  Eliminar seleccionados ({selected.size})
                </button>
              )}
              <button className="btn-csv" onClick={exportCSV} disabled={results.length === 0 || loading}>
                ⬇ Exportar CSV
              </button>
              {!useCloud && (
                <button className="btn-delete-all" onClick={() => setConfirmDelete('all')} disabled={results.length === 0 || loading}>
                  Eliminar todo
                </button>
              )}
            </div>

            <div className="admin-table-wrap">
              {loading ? (
                <p className="admin-empty">Descargando datos desde la nube...</p>
              ) : results.length === 0 ? (
                <p className="admin-empty">No hay resultados registrados en esta fecha.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      {!useCloud && (
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
                      )}
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
                        {!useCloud && (
                          <td className="admin-td-check">
                            <input
                              type="checkbox"
                              className="admin-checkbox"
                              checked={selected.has(i)}
                              onChange={() => toggleSelect(i)}
                            />
                          </td>
                        )}
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
                            {r.score !== undefined && !isNaN(r.score) ? `${r.score}%` : '—'}
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
