// Servidor dinâmico baseado em JSON Server.
// - REST completo (GET/POST/PUT/PATCH/DELETE) sobre db/db.json
// - Filtros, ordenação e paginação nativos (ex.: /locais?usuarioId=2&_sort=nome)
// - Serve os arquivos estáticos de public/ na mesma porta
const jsonServer = require('json-server');
const path = require('path');

const DB = path.join(__dirname, 'db', 'db.json');
const PUBLIC = path.join(__dirname, 'public');
const PORT = 3001;

const server = jsonServer.create();
const router = jsonServer.router(DB);

// defaults() já inclui logger, CORS, no-cache e serve os arquivos estáticos.
// O static aponta para public/, então "/" e "/index.html" devolvem o app real.
const middlewares = jsonServer.defaults({ static: PUBLIC });

server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(router);

server.listen(PORT, () => {
  const resources = Object.keys(router.db.getState())
    .filter((k) => Array.isArray(router.db.getState()[k]));
  console.log(`JSON Server (dinâmico) on http://localhost:${PORT}`);
  console.log('Resources:', resources.join(', '));
});
