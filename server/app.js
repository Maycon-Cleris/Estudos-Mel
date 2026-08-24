import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import {
  getSubjects,
  getQuestionsBySubject,
  getQuestionById,
} from "../questions/index.js";
import { insertResult, listResults, getResultById } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Quantidade de questões sorteadas em cada prova
const QUIZ_LENGTH = 15;

// Embaralha uma cópia do array (Fisher-Yates), sem alterar o original
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Lista de matérias e quantas questões cada uma tem
app.get("/api/subjects", (req, res) => {
  res.json(getSubjects());
});

// Sorteia QUIZ_LENGTH questões da matéria, embaralha a ordem das perguntas
// e das alternativas, e não revela a resposta correta nem a explicação.
// Assim, cada prova fica diferente, mesmo repetindo a matéria na mesma semana.
app.get("/api/questions/:subjectId", (req, res) => {
  const bank = getQuestionsBySubject(req.params.subjectId);
  const selected = shuffle(bank).slice(0, QUIZ_LENGTH);
  const quizQuestions = selected.map(({ id, materia, topico, pergunta, alternativas }) => ({
    id,
    materia,
    topico,
    pergunta,
    alternativas: shuffle(alternativas),
  }));
  res.json(quizQuestions);
});

// Salva o resultado de uma prova finalizada
app.post("/api/results", async (req, res) => {
  const { studentName, subject, subjectLabel, answers } = req.body || {};

  if (!studentName || !subject || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Dados incompletos para salvar o resultado." });
  }

  const detailedAnswers = answers.map(({ questionId, selectedIndex, alternativas }) => {
    const question = getQuestionById(subject, questionId);
    if (!question) {
      return {
        questionId,
        topico: "Desconhecido",
        pergunta: "Questão não encontrada",
        alternativas: [],
        respostaCorreta: null,
        selectedIndex,
        isCorrect: false,
        explicacao: "",
      };
    }
    // As alternativas foram embaralhadas ao gerar a prova, então a ordem que o
    // aluno viu (enviada de volta pelo cliente) pode não bater com a ordem
    // original do banco. Comparamos pelo texto da resposta, não pelo índice.
    const shownAlternativas =
      Array.isArray(alternativas) && alternativas.length === question.alternativas.length
        ? alternativas
        : question.alternativas;
    const correctText = question.alternativas[question.respostaCorreta];
    const selectedText = shownAlternativas[selectedIndex];
    const respostaCorretaIndex = shownAlternativas.indexOf(correctText);
    const isCorrect = selectedText === correctText;

    return {
      questionId,
      topico: question.topico,
      pergunta: question.pergunta,
      alternativas: shownAlternativas,
      respostaCorreta: respostaCorretaIndex,
      selectedIndex,
      isCorrect,
      explicacao: question.explicacao,
    };
  });

  const score = detailedAnswers.filter((a) => a.isCorrect).length;
  const total = detailedAnswers.length;

  const result = {
    id: randomUUID(),
    studentName: String(studentName).trim(),
    subject,
    subjectLabel: subjectLabel || subject,
    date: new Date().toISOString(),
    score,
    total,
    answers: detailedAnswers,
  };

  try {
    await insertResult(result);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Não foi possível salvar o resultado no banco de dados." });
  }
});

// Lista de provas realizadas (área do responsável), com filtros opcionais
app.get("/api/results", async (req, res) => {
  const { subject, student } = req.query;
  try {
    const summaries = await listResults({ subject, student });
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Não foi possível carregar os resultados." });
  }
});

// Detalhe de uma prova específica (tela de correção)
app.get("/api/results/:id", async (req, res) => {
  try {
    const result = await getResultById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Resultado não encontrado." });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Não foi possível carregar o resultado." });
  }
});

export default app;
