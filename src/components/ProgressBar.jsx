export default function ProgressBar({ currentIndex, total }) {
  const percent = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
  const restantes = Math.max(total - currentIndex - 1, 0);

  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress-label">
        Questão {currentIndex + 1} de {total} · faltam {restantes}
      </span>
    </div>
  );
}
