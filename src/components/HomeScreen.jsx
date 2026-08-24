import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSubjects } from "../api/client.js";

export default function HomeScreen() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects()
      .then((data) => {
        setSubjects(data);
        const firstAvailable = data.find((s) => s.totalQuestoes > 0);
        if (firstAvailable) setSubjectId(firstAvailable.id);
      })
      .catch(() => setError("Não foi possível carregar as matérias. Verifique se o servidor está rodando."))
      .finally(() => setLoading(false));
  }, []);

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!studentName.trim()) {
      setError("Digite o nome do aluno para começar.");
      return;
    }
    if (!selectedSubject || selectedSubject.totalQuestoes === 0) {
      setError("Essa matéria ainda não tem questões cadastradas.");
      return;
    }
    setError("");
    navigate("/quiz", {
      state: {
        studentName: studentName.trim(),
        subject: selectedSubject.id,
        subjectLabel: selectedSubject.label,
      },
    });
  }

  return (
    <div className="screen-center">
      <div className="card card-narrow">
        <h1 className="title">📚 Quiz de Estudos</h1>
        <p className="subtitle">Treine para a prova respondendo questões de múltipla escolha</p>

        {loading ? (
          <p className="muted">Carregando matérias...</p>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Nome do aluno</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Digite seu nome"
                autoFocus
              />
            </label>

            <label className="field">
              <span>Matéria</span>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} {s.totalQuestoes === 0 ? "(em breve)" : `(${s.totalQuestoes} questões)`}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn btn-primary">
              Começar prova
            </button>
          </form>
        )}

        <Link to="/responsavel" className="link-muted">
          Área do responsável
        </Link>
      </div>
    </div>
  );
}
