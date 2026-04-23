import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { sections, PASSING_SCORE } from '../data/examData';

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export default function ResultScreen({ answers, userInfo, onRestart }) {
  const submitted = useRef(false);
  const [submitStatus, setSubmitStatus] = useState(SCRIPT_URL ? 'sending' : 'idle');

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
  const improved = overallPercentage >= PASSING_SCORE;

  useEffect(() => {
    if (userInfo.examType !== 'final') return;
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  useEffect(() => {
    if (submitted.current || !SCRIPT_URL) return;
    submitted.current = true;

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        name: userInfo.name,
        curp: userInfo.curp,
        company: userInfo.company,
        examType: userInfo.examType,
        score: overallPercentage,
        correct: totalCorrect,
        total: totalQuestions,
        passed: improved,
      }),
    })
      .then(() => setSubmitStatus('sent'))
      .catch(() => setSubmitStatus('error'));
  }, []);

  const examLabel = userInfo.examType === 'inicial' ? 'Examen Inicial' : 'Examen Final';

  function handleDownloadPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Encabezado azul ──
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 28, pageW, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('SEPRISA SEGURIDAD', 14, 13);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Constancia de Evaluación', 14, 21);

    const dateStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(dateStr, pageW - 14, 21, { align: 'right' });

    // ── Título del documento ──
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('RESULTADO DE EVALUACIÓN', pageW / 2, 44, { align: 'center' });

    // ── Datos del evaluado ──
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);

    const fields = [
      ['Nombre completo:', userInfo.name],
      ['CURP:', userInfo.curp],
      ['Empresa:', userInfo.company],
      ['Tipo de examen:', examLabel],
      ['Folio:', userInfo.folio || '—'],
    ];
    let y = 55;
    fields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(value, 60, y);
      y += 8;
    });

    // ── Resultado general ──
    const resultColor = improved ? [22, 163, 74] : [220, 38, 38];
    doc.setFillColor(...resultColor);
    doc.roundedRect(14, y + 4, pageW - 28, 24, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(`${overallPercentage}%`, pageW / 2, y + 14, { align: 'center' });
    doc.setFontSize(10);
    doc.text(improved ? 'APROBADO — Buen dominio del tema' : 'NO APROBADO — Área de oportunidad', pageW / 2, y + 21, { align: 'center' });

    y += 36;

    // ── Resultados por sección ──
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Resultados por sección', 14, y);
    y += 6;

    doc.setDrawColor(229, 231, 235);
    doc.line(14, y, pageW - 14, y);
    y += 6;

    sectionResults.forEach((sr) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text(`${sr.icon}  ${sr.title}`, 14, y);

      const pctText = `${sr.correct}/${sr.total} — ${sr.percentage}%`;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(pctText, pageW - 14, y, { align: 'right' });

      // Barra de progreso
      const barX = 14, barY = y + 2, barW = pageW - 28, barH = 3;
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(barX, barY, barW, barH, 1, 1, 'F');
      const fillW = Math.max(2, (sr.percentage / 100) * barW);
      const [fr, fg, fb] = sr.percentage >= 50 ? [22, 163, 74] : [220, 38, 38];
      doc.setFillColor(fr, fg, fb);
      doc.roundedRect(barX, barY, fillW, barH, 1, 1, 'F');

      y += 14;
    });

    // ── Pie de página ──
    const pageH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(229, 231, 235);
    doc.line(14, pageH - 18, pageW - 14, pageH - 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.text('SEPRISA SEGURIDAD — Documento confidencial de uso interno', pageW / 2, pageH - 12, { align: 'center' });
    doc.text(`Folio: ${userInfo.folio || '—'}`, pageW / 2, pageH - 7, { align: 'center' });

    doc.save(`SEPRISA_${userInfo.examType.toUpperCase()}_${userInfo.curp}.pdf`);
  }

  return (
    <div className="result-screen">
      <div className="result-card">
        {/* User info strip */}
        <div className="result-user-strip">
          <div className="result-user-row">
            <span className="result-user-name">{userInfo.name}</span>
            <span className={`exam-type-badge ${userInfo.examType}`}>{examLabel}</span>
          </div>
          <div className="result-user-meta">
            <span>{userInfo.curp}</span>
            <span className="meta-sep">·</span>
            <span>{userInfo.company}</span>
          </div>
          {userInfo.folio && (
            <div className="result-folio">Folio: <strong>{userInfo.folio}</strong></div>
          )}
        </div>

        {/* Overall result */}
        <div className={`result-banner ${improved ? 'passed' : 'failed'}`}>
          <div className="result-emoji">{improved ? '📈' : '📉'}</div>
          <h2>{improved ? '¡Buen dominio del tema!' : 'Área de oportunidad'}</h2>
          <div className="result-score">{overallPercentage}%</div>
          <p className="result-detail">
            {totalCorrect} de {totalQuestions} respuestas correctas
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
                    className={`section-result-fill ${sr.percentage >= 50 ? 'bar-pass' : 'bar-fail'}`}
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

        {submitStatus !== 'idle' && (
          <p className={`submit-status submit-status--${submitStatus}`}>
            {submitStatus === 'sending' && 'Guardando resultados...'}
            {submitStatus === 'sent'    && 'Resultados guardados correctamente.'}
            {submitStatus === 'error'   && 'No se pudieron guardar los resultados (sin conexión).'}
          </p>
        )}

        <div className="result-actions">
          <button className="btn-pdf" onClick={handleDownloadPDF}>
            ⬇ Descargar constancia PDF
          </button>
          <button className="btn-restart" onClick={onRestart}>
            {userInfo.examType === 'inicial' ? 'Siguiente examen' : 'Volver al inicio'}
          </button>
        </div>
      </div>
    </div>
  );
}
