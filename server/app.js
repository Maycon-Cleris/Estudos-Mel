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

// Lista de matérias e quantas questões cada uma tem
app.get("/api/subjects", (req, res) => {
  res.json(getSubjects());
});

// Questões de uma matéria, sem revelar a resposta correta nem a explicação
app.get("/api/questions/:subjectId", (req, res) => {
  const questions = getQuestionsBySubject(req.params.subjectId);
  const safeQuestions = questions.map(
    ({ id, materia, topico, pergunta, alternativas }) => ({
      id,
      materia,
      topico,
      pergunta,
      alternativas,
    })
  );
  res.json(safeQuestions);
});

// Salva o resultado de uma prova finalizada
app.post("/api/results", async (req, res) => {
  const { studentName, subject, subjectLabel, answers } = req.body || {};

  if (!studentName || !subject || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "Dados incompletos para salvar o resultado." });
  }

  const detailedAnswers = answers.map(({ questionId, selectedIndex }) => {
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
    const isCorrect = question.respostaCorreta === selectedIndex;
    return {
      questionId,
      topico: question.topico,
      pergunta: question.pergunta,
      alternativas: question.alternativas,
      respostaCorreta: question.respostaCorreta,
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
