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

```bash
# Instalar dependencias
npm install

# Correr en modo desarrollo
npm run dev

# Lint
npm run lint
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