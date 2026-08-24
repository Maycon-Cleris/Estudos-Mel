import app from "../server/app.js";

// Função serverless "catch-all": qualquer requisição para /api/* cai aqui,
// e o Express (definido em server/app.js) cuida do roteamento interno.
export default app;
