# Quiz de Estudos 📚

Aplicativo web para treinar para provas, feito para uma aluna do 7º ano. Escolha a matéria, responda as questões de múltipla escolha e veja a correção detalhada ao final. Os responsáveis podem acompanhar o histórico de todas as provas realizadas, de qualquer lugar.

Matérias já com 15 questões cada, cobrindo o currículo do 7º ano (BNCC): **Ciências, Matemática, Português, História e Geografia**.

## Como funciona

- **Frontend**: React + Vite
- **Backend**: Express, rodando como função serverless na Vercel
- **Persistência**: banco de dados Postgres (recomendado: [Neon](https://neon.tech), integrado direto pela Vercel)

O app é feito para rodar online, acessível por um link, de qualquer aparelho (computador ou celular).

## Colocando o app no ar (Vercel + Neon)

Essas contas precisam ser criadas por você mesma — eu não posso criar contas em seu nome.

1. **Suba o projeto para o GitHub** (crie um repositório novo e faça o push desta pasta).
2. **Crie um banco Postgres gratuito na Neon, direto pela Vercel:**
   - Entre em [vercel.com](https://vercel.com) e importe o repositório do GitHub como um novo projeto.
   - Antes (ou depois) do primeiro deploy, vá em **Storage → Create Database → Neon (Postgres)** dentro do seu projeto na Vercel e crie o banco (plano gratuito).
   - Ao conectar o banco ao projeto, a Vercel preenche automaticamente a variável de ambiente `DATABASE_URL` para você — não precisa copiar nada manualmente.
3. **Faça o deploy.** A Vercel detecta automaticamente que é um projeto Vite (build `vite build`, saída em `dist/`) e publica as rotas dentro de `api/` como funções serverless. Na primeira requisição que salva uma prova, a tabela do banco é criada automaticamente (não precisa rodar nenhuma migração manual).
4. Pronto — você recebe uma URL pública (algo como `seu-app.vercel.app`) para acessar de qualquer lugar.

## Rodando localmente (para desenvolvimento)

Pré-requisito: [Node.js](https://nodejs.org/) 18+.

Como a persistência agora é em um banco de dados online, rodar localmente também exige apontar para esse mesmo banco (ou outro Postgres de teste):

1. Crie um arquivo `.env` na raiz do projeto (copie de `.env.example`):
   ```
   DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
   ```
   - Se você já fez o deploy na Vercel com o banco Neon conectado, pegue essa mesma connection string em **Storage → seu banco → .env.local** no painel da Vercel (ou rode `vercel env pull .env` com a [Vercel CLI](https://vercel.com/docs/cli) já logada).
2. Instale as dependências e rode:
   ```bash
   npm install
   npm run dev
   ```
3. Isso inicia a API Express (`http://localhost:3001`) e o frontend (`http://localhost:5173`) juntos. Abra `http://localhost:5173`.

Sem o `.env` configurado, o app inicia normalmente e o quiz funciona, mas salvar uma prova (e a Área do responsável) mostra um erro amigável, já que não há banco para gravar.

## Estrutura do projeto

```
questions/            -> banco de questões (fonte da verdade, usado só pelo servidor)
  subjects.js          -> lista de matérias disponíveis
  ciencias.json         -> 15 questões de Ciências
  matematica.json       -> 15 questões de Matemática
  portugues.json        -> 15 questões de Português
  historia.json         -> 15 questões de História
  geografia.json        -> 15 questões de Geografia
  index.js              -> junta tudo e expõe funções auxiliares

server/
  app.js                -> API Express (rotas /api/...), sem depender de porta fixa
  db.js                  -> conexão com o Postgres e funções de leitura/escrita
  index.js               -> só para rodar localmente (npm run dev), inicia o Express numa porta

api/
  [...path].js           -> ponto de entrada usado pela Vercel (função serverless que reaproveita server/app.js)

src/
  components/           -> telas do app (Home, Quiz, Resultado, Correção, Área do responsável)
  api/client.js          -> funções que chamam a API
  App.jsx, main.jsx, index.css

vercel.json             -> redirecionamentos para o app funcionar como SPA na Vercel
```

## Como adicionar novas questões

Cada matéria tem seu próprio arquivo `.json` dentro da pasta `questions/`. Para adicionar questões, edite o arquivo da matéria (por exemplo `questions/matematica.json`) seguindo este formato:

```json
{
  "id": "mat-16",
  "materia": "matematica",
  "topico": "Frações",
  "pergunta": "Quanto é 1/2 + 1/4?",
  "alternativas": ["1/6", "2/6", "3/4", "1"],
  "respostaCorreta": 2,
  "explicacao": "Para somar frações com denominadores diferentes, é preciso encontrar um denominador comum. 1/2 equivale a 2/4, então 2/4 + 1/4 = 3/4."
}
```

Regras importantes:

- `id`: precisa ser único dentro do arquivo (sugestão: prefixo da matéria + número, ex: `mat-16`, `mat-17`)
- `alternativas`: sempre um array com exatamente 4 opções
- `respostaCorreta`: índice (0, 1, 2 ou 3) da alternativa certa dentro do array `alternativas`
- `explicacao`: texto curto que aparece na correção, explicando o conteúdo

Depois de editar o arquivo, salve, rode `npm run dev` de novo localmente para conferir, e depois faça `git push` — a Vercel publica a atualização automaticamente.

### Adicionando uma matéria totalmente nova

Se quiser ir além das 5 matérias já previstas:

1. Crie o arquivo `questions/<id-da-materia>.json` com um array de questões no formato acima
2. Registre a matéria em `questions/subjects.js`
3. Importe e adicione o novo arquivo em `questions/index.js` (em `bankBySubject`)

## Onde ficam os resultados salvos

Todas as provas realizadas ficam salvas na tabela `results` do banco Postgres, incluindo nome do aluno, matéria, data/hora, nota e todas as respostas dadas (para permitir a correção detalhada depois). A tabela é criada automaticamente na primeira prova salva.

A "Área do responsável" (link na tela inicial) lista todas as provas salvas, com filtro por matéria e por aluno, e permite abrir a correção detalhada de qualquer prova antiga — de qualquer aparelho, já que os dados ficam no banco online.
