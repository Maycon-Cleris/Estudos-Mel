import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResults, getSubjects } from "../api/client.js";

export default function ParentArea() {
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getResults({ subject: subjectFilter, student: studentFilter })
      .then(setResults)
      .catch(() => setError("Não foi possível carregar os resultados."))
      .finally(() => setLoading(false));
  }, [subjectFilter, studentFilter]);

  return (
    <div className="screen-center">
      <div className="card card-wide">
        <h1 className="title-sm">Área do responsável</h1>
        <p className="subtitle">Acompanhe o histórico de provas realizadas</p>

        <div className="filters">
          <label className="field">
            <span>Filtrar por matéria</span>
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="">Todas as matérias</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Filtrar por aluno</span>
            <input
              type="text"
              placeholder="Nome do aluno"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="muted">Carregando...</p>
        ) : results.length === 0 ? (
          <p className="muted">Nenhuma prova encontrada.</p>
        ) : (
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matéria</th>
                  <th>Data</th>
                  <th>Nota</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>{r.studentName}</td>
                    <td>{r.subjectLabel}</td>
                    <td>{formatDate(r.date)}</td>
                    <td>
                      <Link to={`/correcao/${r.id}`} className="result-link">
                        {r.score}/{r.total}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="nav-buttons">
          <Link to="/" className="btn btn-secondary">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
