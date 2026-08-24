import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getQuestions, saveResult } from "../api/client.js";
import ProgressBar from "./ProgressBar.jsx";

export default function QuizScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state?.studentName || !state?.subject) {
      navigate("/", { replace: true });
      return;
    }
    getQuestions(state.subject)
      .then((data) => {
        if (data.length === 0) {
          setError("Essa matéria ainda não tem questões cadastradas.");
        }
        setQuestions(data);
      })
      .catch(() => setError("Não foi possível carregar as questões."))
      .finally(() => setLoading(false));
  }, [state, navigate]);

  if (!state?.studentName || !state?.subject) return null;

  if (loading) {
    return (
      <div className="screen-center">
        <p className="muted">Carregando questões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen-center">
        <div className="card card-narrow">
          <p className="error-text">{error}</p>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const currentSelected = selectedAnswers[currentQuestion.id];

  function handleSelect(optionIndex) {
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  async function handleNext() {
    if (currentSelected === undefined) return;

    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const answers = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: selectedAnswers[q.id],
      }));
      const result = await saveResult({
        studentName: state.studentName,
        subject: state.subject,
        subjectLabel: state.subjectLabel,
        answers,
      });
      navigate(`/resultado/${result.id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Não foi possível salvar o resultado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen-center">
      <div className="card card-wide">
        <ProgressBar currentIndex={currentIndex} total={questions.length} />

        <p className="topic-tag">{currentQuestion.topico}</p>
        <h2 className="question-text">{currentQuestion.pergunta}</h2>

        <div className="options">
          {currentQuestion.alternativas.map((option, index) => (
            <button
              type="button"
              key={index}
              className={`option-btn ${currentSelected === index ? "option-selected" : ""}`}
              onClick={() => handleSelect(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="nav-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={currentIndex === 0 || submitting}
          >
            Voltar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={currentSelected === undefined || submitting}
          >
            {submitting ? "Salvando..." : isLast ? "Finalizar" : "Próxima"}
          </button>
        </div>
      </div>
    </div>
  );
}
