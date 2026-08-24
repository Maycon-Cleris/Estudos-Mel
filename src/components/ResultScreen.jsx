import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getResultById } from "../api/client.js";

export default function ResultScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getResultById(id)
      .then(setResult)
      .catch(() => setError("Resultado não encontrado."));
  }, [id]);

  if (error) {
    return (
      <div className="screen-center">
        <div className="card card-narrow">
          <p className="error-text">{error}</p>
          <Link to="/" className="btn btn-secondary">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="screen-center">
        <p className="muted">Carregando resultado...</p>
      </div>
    );
  }

  const percent = Math.round((result.score / result.total) * 100);
  const mensagem =
    percent >= 80 ? "Mandou muito bem! 🎉" : percent >= 60 ? "Bom trabalho! 👏" : "Vamos estudar mais um pouco 💪";

  return (
    <div className="screen-center">
      <div className="card card-narrow result-card">
        <p className="subtitle">{result.studentName} · {result.subjectLabel}</p>
        <h1 className="score-display">{result.score} / {result.total}</h1>
        <p className="score-percent">{percent}% de acerto</p>
        <p className="result-message">{mensagem}</p>

        <div className="nav-buttons nav-buttons-column">
          <button className="btn btn-primary" onClick={() => navigate(`/correcao/${result.id}`)}>
            Ver correção detalhada
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
