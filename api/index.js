import app from "../server/app.js";

// Toda requisição para /api/* é reescrita para cá (veja vercel.json),
// e o Express (definido em server/app.js) cuida do roteamento interno.
export default app;
