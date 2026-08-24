import "dotenv/config";
import app from "./app.js";

const PORT = process.env.API_PORT || 3001;

if (!process.env.DATABASE_URL) {
  console.warn(
    "\n⚠️  DATABASE_URL não configurada. Crie um arquivo .env na raiz do projeto com:\n" +
      "   DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require\n" +
      "   (veja README.md > 'Rodando localmente' para instruções)\n"
  );
}

app.listen(PORT, () => {
  console.log(`Servidor da API rodando em http://localhost:${PORT}`);
});
