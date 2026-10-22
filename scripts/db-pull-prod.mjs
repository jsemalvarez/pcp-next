// Copia la base de producción (schema public) a la base local de Docker.
// Producción solo se LEE. La base local se REEMPLAZA por completo.
//
// Uso: npm run db:pull-prod
// Requiere: Docker corriendo (npm run db:up) y DIRECT_URL en .env.prod
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, openSync, closeSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const PROD_ENV = ".env.prod";
const LOCAL_ENV = ".env.dev";
const CONTAINER = "postgres-pcp";
// pg_dump tiene que ser de la misma versión mayor (o mayor) que el servidor de producción
const PG_TOOLS_IMAGE = "postgres:17";

// Lee un archivo .env sin ejecutarlo (ignora comentarios, quita comillas)
function readEnv(file) {
  if (!existsSync(file)) return {};
  const vars = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) vars[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return vars;
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function run(args, options = {}) {
  const result = spawnSync("docker", args, { stdio: "inherit", ...options });
  if (result.error) fail(`No se pudo ejecutar docker: ${result.error.message}`);
  return result.status;
}

if (!existsSync(PROD_ENV)) fail(`Falta ${PROD_ENV} (ver .env.example)`);
const prodUrl = readEnv(PROD_ENV).DIRECT_URL;
if (!prodUrl) fail(`DIRECT_URL está vacío en ${PROD_ENV}`);

const local = readEnv(LOCAL_ENV);
const localUser = local.POSTGRES_USER || "pcp";
const localDb = local.POSTGRES_DB || "pcp";

const inspect = spawnSync("docker", ["inspect", "-f", "{{.State.Running}}", CONTAINER], { encoding: "utf8" });
if (inspect.stdout?.trim() !== "true") {
  fail(`El contenedor ${CONTAINER} no está corriendo. Levantalo con: npm run db:up`);
}

mkdirSync("backups", { recursive: true });
const stamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const file = join("backups", `prod-${stamp}.dump`);

console.log(`→ Descargando backup de producción en ${file}`);
// La URL va por variable de entorno para que no quede en los argumentos del proceso
const out = openSync(file, "w");
const dumpStatus = run(
  [
    "run", "--rm", "-e", "PROD_URL", PG_TOOLS_IMAGE,
    "sh", "-c", 'pg_dump "$PROD_URL" --schema=public --no-owner --no-privileges --format=custom',
  ],
  { stdio: ["ignore", out, "inherit"], env: { ...process.env, PROD_URL: prodUrl } },
);
closeSync(out);
if (dumpStatus !== 0 || statSync(file).size === 0) fail("Falló pg_dump; la base local no se tocó.");

console.log(`→ Restaurando en la base local (${localDb})`);
const input = openSync(file, "r");
const restoreStatus = run(
  [
    "exec", "-i", CONTAINER,
    "pg_restore", "--clean", "--if-exists", "--no-owner", "--no-privileges", "--exit-on-error",
    "-U", localUser, "-d", localDb,
  ],
  { stdio: [input, "inherit", "inherit"] },
);
closeSync(input);
if (restoreStatus !== 0) fail("Falló pg_restore.");

console.log("✓ Listo. Tablas y filas en la base local:");
run([
  "exec", CONTAINER, "psql", "-U", localUser, "-d", localDb, "-q",
  "-c", "analyze",
  "-c", "select relname as tabla, n_live_tup as filas from pg_stat_user_tables order by relname",
]);
