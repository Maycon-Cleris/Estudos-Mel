import pg from "pg";

const { Pool } = pg;

// Reaproveita o pool entre invocações da mesma função serverless (evita
// abrir uma conexão nova a cada chamada quando a lambda continua "quente").
let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não configurada. Configure a variável de ambiente com a connection string do Postgres (Neon)."
    );
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

let schemaReady;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS results (
        id UUID PRIMARY KEY,
        student_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        subject_label TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        score INT NOT NULL,
        total INT NOT NULL,
        answers JSONB NOT NULL
      );
    `);
  }
  return schemaReady;
}

export async function insertResult(result) {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO results (id, student_name, subject, subject_label, created_at, score, total, answers)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      result.id,
      result.studentName,
      result.subject,
      result.subjectLabel,
      result.date,
      result.score,
      result.total,
      JSON.stringify(result.answers),
    ]
  );
}

export async function listResults({ subject, student } = {}) {
  await ensureSchema();
  const conditions = [];
  const params = [];

  if (subject) {
    params.push(subject);
    conditions.push(`subject = $${params.length}`);
  }
  if (student) {
    params.push(`%${student.toLowerCase()}%`);
    conditions.push(`LOWER(student_name) LIKE $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await getPool().query(
    `SELECT id, student_name, subject, subject_label, created_at, score, total
     FROM results
     ${whereClause}
     ORDER BY created_at DESC`,
    params
  );

  return rows.map(rowToSummary);
}

export async function getResultById(id) {
  await ensureSchema();
  const { rows } = await getPool().query(`SELECT * FROM results WHERE id = $1`, [id]);
  if (rows.length === 0) return null;
  return rowToFull(rows[0]);
}

function rowToSummary(row) {
  return {
    id: row.id,
    studentName: row.student_name,
    subject: row.subject,
    subjectLabel: row.subject_label,
    date: row.created_at,
    score: row.score,
    total: row.total,
  };
}

function rowToFull(row) {
  return {
    ...rowToSummary(row),
    answers: row.answers,
  };
}
