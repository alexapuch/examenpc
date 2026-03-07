import { useState } from 'react';
import { sections, PASSING_SCORE } from '../data/examData';

// Formato oficial CURP mexicana: 18 caracteres
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]$/;

export default function RegisterScreen({ onStart }) {
  const [form, setForm] = useState({ name: '', curp: '', company: '', examType: 'inicial' });
  const [errors, setErrors] = useState({});
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    const curp = form.curp.trim().toUpperCase();
    if (!curp) {
      e.curp = 'La CURP es obligatoria';
    } else if (curp.length !== 18) {
      e.curp = `La CURP debe tener 18 caracteres (actualmente: ${curp.length})`;
    } else if (!CURP_REGEX.test(curp)) {
      e.curp = 'CURP inválida — verifica el formato';
    }
    if (!form.company.trim()) e.company = 'La empresa es obligatoria';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onStart({ ...form, name: form.name.trim(), curp: form.curp.trim().toUpperCase(), company: form.company.trim() });
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  return (
    <div className="start-screen">
      <div className="start-card">
        <div className="start-header">
          <h1>Examen de Seguridad y Prevención</h1>
          <p className="start-subtitle">Complete sus datos para comenzar — {totalQuestions} preguntas · Mínimo {PASSING_SCORE}%</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="field-group">
            <label className="field-label">Nombre completo</label>
            <input
              className={`field-input${errors.name ? ' input-invalid' : ''}`}
              type="text"
              placeholder="Ej. Juan García López"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="field-error-msg">{errors.name}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">CURP</label>
            <input
              className={`field-input${errors.curp ? ' input-invalid' : ''}`}
              type="text"
              placeholder="AAAA000000HXXXXX0"
              maxLength={18}
              value={form.curp}
              onChange={e => handleChange('curp', e.target.value.toUpperCase())}
            />
            <span className="field-hint">18 caracteres · {form.curp.length}/18</span>
            {errors.curp && <span className="field-error-msg">{errors.curp}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">Empresa</label>
            <input
              className={`field-input${errors.company ? ' input-invalid' : ''}`}
              type="text"
              placeholder="Nombre de la empresa"
              value={form.company}
              onChange={e => handleChange('company', e.target.value)}
            />
            {errors.company && <span className="field-error-msg">{errors.company}</span>}
          </div>

          <div className="field-group">
            <label className="field-label">Tipo de examen</label>
            <div className="exam-type-options">
              <label className={`exam-type-option${form.examType === 'inicial' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="examType"
                  value="inicial"
                  checked={form.examType === 'inicial'}
                  onChange={() => handleChange('examType', 'inicial')}
                />
                <div>
                  <strong>Examen Inicial</strong>
                  <span>Antes del curso</span>
                </div>
              </label>
              <label className={`exam-type-option${form.examType === 'final' ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="examType"
                  value="final"
                  checked={form.examType === 'final'}
                  onChange={() => handleChange('examType', 'final')}
                />
                <div>
                  <strong>Examen Final</strong>
                  <span>Después del curso</span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-start">
            Comenzar examen →
          </button>
        </form>
      </div>
    </div>
  );
}
