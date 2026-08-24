import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getResultById } from "../api/client.js";

export default function ReviewScreen() {
  const { id } = useParams();
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
        <p className="muted">Carregando correção...</p>
      </div>
    );
  }

  return (
    <div className="screen-center">
      <div className="card card-wide">
        <h1 className="title-sm">Correção detalhada</h1>
        <p className="subtitle">
          {result.studentName} · {result.subjectLabel} · {result.score}/{result.total} acertos
        </p>

        <div className="review-list">
          {result.answers.map((answer, index) => {
            const selectedText =
              answer.selectedIndex !== undefined && answer.alternativas[answer.selectedIndex] !== undefined
                ? answer.alternativas[answer.selectedIndex]
                : "Não respondida";
            const correctText =
              answer.respostaCorreta !== null ? answer.alternativas[answer.respostaCorreta] : "—";

            return (
              <div key={answer.questionId} className={`review-item ${answer.isCorrect ? "review-correct" : "review-wrong"}`}>
                <div className="review-header">
                  <span className="review-number">Questão {index + 1}</span>
                  <span className={`review-badge ${answer.isCorrect ? "badge-correct" : "badge-wrong"}`}>
                    {answer.isCorrect ? "✔ Acertou" : "✘ Errou"}
                  </span>
                </div>
                <p className="topic-tag">{answer.topico}</p>
                <p className="question-text">{answer.pergunta}</p>

                <p className="review-answer">
                  <strong>Sua resposta:</strong> {selectedText}
                </p>
                {!answer.isCorrect && (
                  <p className="review-answer">
                    <strong>Resposta correta:</strong> {correctText}
                  </p>
                )}
                <p className="review-explanation">{answer.explicacao}</p>
              </div>
            );
          })}
        </div>

        <div className="nav-buttons">
          <Link to="/" className="btn btn-secondary">Voltar ao início</Link>
          <Link to="/responsavel" className="btn btn-primary">Área do responsável</Link>
        </div>
      </div>
    </div>
  );
}
