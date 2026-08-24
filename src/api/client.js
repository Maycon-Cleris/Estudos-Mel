const BASE_URL = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro na requisição: ${res.status}`);
  }
  return res.json();
}

export function getSubjects() {
  return request("/subjects");
}

export function getQuestions(subjectId) {
  return request(`/questions/${subjectId}`);
}

export function saveResult(payload) {
  return request("/results", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getResults(filters = {}) {
  const params = new URLSearchParams();
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.student) params.set("student", filters.student);
  const query = params.toString();
  return request(`/results${query ? `?${query}` : ""}`);
}

export function getResultById(id) {
  return request(`/results/${id}`);
}
