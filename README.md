# PCP — Next.js App

Aplicación Next.js con deploy automático en Vercel y versionado semántico automatizado mediante Conventional Commits.

---

## 🚀 Stack

- **Framework**: Next.js 16 + React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Base de datos**: Prisma ORM
- **Deploy**: Vercel (auto-deploy en `main`)
- **Versionado**: Semantic Release

---

## 📦 Convención de Commits

Este proyecto usa **[Conventional Commits](https://www.conventionalcommits.org/)**.  
Cada commit en `main` puede disparar automáticamente un nuevo release y bump de versión.

> ⚠️ El hook de `commitlint` **rechazará** cualquier commit que no respete el formato.

### Formato

```
<tipo>(<scope opcional>): <descripción en minúsculas>
```

**Ejemplos válidos:**

```bash
feat: agregar módulo de reportes de turnos
fix: corregir error en validación del formulario de login
docs: actualizar instrucciones de instalación
refactor: simplificar lógica de autenticación
chore: actualizar dependencias de desarrollo
```

---

### 📊 Tipos de commit y su efecto en la versión

| Tipo | Descripción | Versión que afecta | Ejemplo |
|---|---|---|---|
| `feat` | Nueva funcionalidad | **MINOR** `1.0.0 → 1.1.0` | `feat: agregar filtro por fecha` |
| `fix` | Corrección de bug | **PATCH** `1.0.0 → 1.0.1` | `fix: error en login con email` |
| `feat!` / `BREAKING CHANGE` | Cambio que rompe compatibilidad | **MAJOR** `1.0.0 → 2.0.0` | `feat!: rediseño del sistema de auth` |
| `perf` | Mejora de performance | **PATCH** `1.0.0 → 1.0.1` | `perf: optimizar consultas de DB` |
| `revert` | Revertir un commit anterior | **PATCH** `1.0.0 → 1.0.1` | `revert: revertir feat de dashboard` |
| `docs` | Solo documentación | Sin cambio | `docs: actualizar README` |
| `style` | Formato, espacios, etc. | Sin cambio | `style: corregir indentación` |
| `refactor` | Refactoring sin nueva funcionalidad | Sin cambio | `refactor: reorganizar carpetas` |
| `test` | Tests | Sin cambio | `test: agregar tests de login` |
| `build` | Sistema de build | Sin cambio | `build: actualizar next.config.ts` |
| `ci` | Configuración de CI/CD | Sin cambio | `ci: ajustar workflow de release` |
| `chore` | Tareas generales / dependencias | Sin cambio | `chore: actualizar dependencias` |

---

### 🔍 Uso del scope (opcional)

El scope es una palabra entre paréntesis que especifica qué parte del proyecto fue afectada:

```bash
feat(auth): agregar login con Google
fix(dashboard): corregir carga de turnos pendientes
refactor(api): reorganizar endpoints de usuarios
```

---

### ⚙️ Flujo completo de un release

```
1. Hacés un commit con formato convencional
       ↓
2. Husky valida el mensaje (commitlint)
       ↓
3. Push a main
       ↓
4. Vercel inicia el deploy del código nuevo
       ↓
5. GitHub Action corre semantic-release:
   - Analiza los commits desde el último release
   - Calcula la nueva versión según los tipos de commit
   - Actualiza package.json y CHANGELOG.md
   - Crea un tag en GitHub (ej: v2.1.0)
   - Publica el GitHub Release con notas automáticas
   - Pushea el commit de release con [skip ci]
       ↓
6. Vercel detecta el commit de release pero lo ignora (contiene [skip ci])
```

---

### ❌ Commits que serán rechazados

```bash
# Sin tipo
git commit -m "arregle el login"

# Descripción en mayúsculas
git commit -m "Fix: Corregir Login"

# Tipo inválido
git commit -m "update: nueva pantalla"

# Sin descripción
git commit -m "feat:"

# Descripción con punto final
git commit -m "fix: corregir bug."
```

---

## 🛠️ Desarrollo local

Requisitos: Node 20+ y Docker.

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno local a partir de la plantilla
cp .env.example .env.dev   # completar JWT_SECRET, ADMIN_* y Cloudinary

# 3. Levantar Postgres 17 (localhost:5433) y pgAdmin (http://localhost:5050)
npm run db:up

# 4a. Base vacía: crear tablas y el usuario admin
npm run db:migrate
npm run db:seed

# 4b. O bien, copiar los datos de producción (necesita .env.prod con DIRECT_URL)
npm run db:pull-prod

# 5. Correr la app contra la base local
npm run dev
```

| Archivo | Uso |
|---|---|
| `.env.example` | Plantilla (es el único que se sube al repo) |
| `.env.dev` | Desarrollo local; lo usan `npm run dev` y los scripts `db:*` |
| `.env.prod` | Credenciales de producción; solo lo usa `db:pull-prod`. En Vercel las variables van en el dashboard |

Otros comandos: `npm run db:studio` (Prisma Studio), `npm run db:down`, `npm run lint`.

---

## 🤖 Servidor MCP (carga de eventos con IA)

La app expone un servidor MCP en `/api/mcp` para buscar, cargar y editar eventos desde un asistente de IA (por ejemplo Claude). Es de uso personal: sin un token válido responde `401`. Acepta dos tipos de token:

- **OAuth** (recomendado): Claude abre el login del admin, autorizás una vez y listo. Funciona en claude.ai, la app móvil, Claude Desktop y Claude Code.
- **Token fijo** `MCP_API_TOKEN`: para Claude Code o scripts, enviado como `Authorization: Bearer <token>`.

**Qué se puede hacer:** buscar eventos, lugares y organizadores; crear borradores (nunca se publican solos); editar eventos y fechas; publicar, pasar a borrador y archivar; listar los borradores incompletos con los contactos para completarlos. Los eventos no se borran desde el MCP.

**Configuración:** definir `MCP_API_TOKEN` (mínimo 32 caracteres) y `SITE_URL` en `.env.dev` para local, y en las variables de entorno de Vercel para producción. Ver `.env.example`.

**Conectar claude.ai y la app del celular (OAuth):**

1. En claude.ai: **Configuración → Conectores → Agregar conector personalizado**.
2. URL: `https://www.paseosconpeques.com.ar/api/mcp`. Tiene que coincidir exactamente con `SITE_URL` + `/api/mcp` (mismo `www`). Dejá vacíos el client ID y el secreto.
3. Tocá **Conectar**: se abre el login del admin y después la pantalla "Autorizar acceso". Tocá **Permitir**.
4. El conector queda disponible también en la app móvil.

Solo se aceptan las URLs de retorno de Claude (`https://claude.ai/api/mcp/auth_callback`, `https://claude.com/...` y el loopback de Claude Code). Los tokens OAuth duran 1 hora y se renuevan solos con un refresh token que rota (válido 30 días).

**Conectar Claude Code:**

Con OAuth (abre el navegador para autorizar):

```bash
claude mcp add --transport http paseos-con-peques https://www.paseosconpeques.com.ar/api/mcp
```

O con el token fijo:

```bash
claude mcp add --transport http paseos-con-peques http://localhost:3000/api/mcp --header "Authorization: Bearer <MCP_API_TOKEN>"
```

En producción, reemplazar la URL por `https://www.paseosconpeques.com.ar/api/mcp` y usar el token de producción.

**Conectar Claude Desktop** (archivo `claude_desktop_config.json`, vía `mcp-remote`):

```json
{
  "mcpServers": {
    "paseos-con-peques": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://www.paseosconpeques.com.ar/api/mcp", "--header", "Authorization: Bearer ${MCP_TOKEN}"],
      "env": { "MCP_TOKEN": "<MCP_API_TOKEN>" }
    }
  }
}
```

---

## 🔧 Configuración necesaria en el repo de GitHub

Para que el release automático funcione correctamente:

1. **Permisos del GITHUB_TOKEN**  
   `Settings → Actions → General → Workflow permissions → Read and write permissions`

2. **Ignorar deploys de versioning en Vercel**  
   `Vercel Dashboard → Project → Settings → Git → Ignored Build Step`:
   ```bash
   if [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[skip ci]"* ]]; then exit 0; else exit 1; fi
   ```