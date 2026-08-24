import { subjects } from "./subjects.js";
import ciencias from "./ciencias.json" with { type: "json" };
import matematica from "./matematica.json" with { type: "json" };
import portugues from "./portugues.json" with { type: "json" };
import historia from "./historia.json" with { type: "json" };
import geografia from "./geografia.json" with { type: "json" };

// Para adicionar uma nova matéria, crie um <id>.json nesta pasta e registre
// aqui + em subjects.js. Cada questão deve seguir o formato:
// { id, materia, topico, pergunta, alternativas: [4 itens], respostaCorreta: 0-3, explicacao }
const bankBySubject = {
  ciencias,
  matematica,
  portugues,
  historia,
  geografia,
};

export function getSubjects() {
  return subjects.map((s) => ({
    ...s,
    totalQuestoes: (bankBySubject[s.id] || []).length,
  }));
}

export function getQuestionsBySubject(subjectId) {
  return bankBySubject[subjectId] || [];
}

export function getQuestionById(subjectId, questionId) {
  return getQuestionsBySubject(subjectId).find((q) => q.id === questionId);
}
