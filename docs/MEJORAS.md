# Plan de mejoras — Paseos con Peques

Documento vivo para ir definiendo y siguiendo las mejoras del proyecto.
Última actualización: 2026-10-22.

**Estados:** `[ ]` pendiente · `[~]` en curso · `[x]` hecho
**Prioridad:** P0 urgente/bloqueante · P1 alta · P2 media · P3 baja

---

## 0. Orden de trabajo propuesto

| Fase | Qué | Por qué en este orden |
|---|---|---|
| 1 | Entorno local (sección 5) + seguridad + capa de servicios + estados de evento | Es la base: el MCP y los borradores escriben en la base, así que primero tiene que haber un único lugar con validación y autenticación. Y las migraciones nuevas hay que probarlas en local, no contra producción. |
| 2 | Servidor MCP | Lo más urgente. Depende de la fase 1 para no duplicar lógica. |
| 3 | Flujo Instagram → borrador | Se apoya en el MCP (la IA crea el borrador) y en los estados de la fase 1. |
| 4 | Deuda técnica | Limpieza, tests, CI, refactors grandes. |

---

## 1. Arquitectura

### 1.1 Situación actual

Hubo un intento de Clean Architecture (`src/domain`, `src/data`, `src/presentation`) que quedó a medio camino:

- `domain/` (entidades, repositorios, use cases, factories) **no se usa** en ningún lado.
- `PlaceRepositoryImpl` todavía lee de **Firebase**, cuando todo lo demás usa Prisma.
- La lógica real está repartida en tres caminos distintos:
  - server actions (`src/actions/*`),
  - páginas que llaman a `prisma` directo (`app/page.tsx`, `app/favorites/page.tsx`),
  - componentes cliente que llaman server actions de lectura (`calendario`, `map`).
- Las server actions mezclan lecturas públicas con escrituras de admin en el mismo archivo `"use server"`, por lo que **todas** quedan expuestas como endpoints públicos.

### 1.2 Propuesta: módulos por dominio + capa de servicios

No hace falta Clean Architecture completa (interfaces de repositorio, factories, use cases por operación): Prisma ya cumple el rol de repositorio y para el tamaño de la app agrega ceremonia sin beneficio. Lo que sí hace falta es **un núcleo único de lógica** que puedan usar varias entradas (admin, MCP, páginas públicas, share target).

```
   ENTRADAS (adaptadores)                NÚCLEO                       INFRA
 ┌──────────────────────────┐
 │ Admin UI → server actions│──┐
 │ MCP → /api/mcp           │──┼──►  src/server/<módulo>/      ──►  Prisma / Postgres
 │ Páginas públicas (RSC)   │──┤      · schemas (zod)               Cloudinary
 │ Share target (futuro)    │──┘      · service (escrituras)
 └──────────────────────────┘         · queries (lecturas)
      ▲ autenticación acá              · reglas de negocio
```

Estructura de carpetas objetivo:

```
src/
  server/                     ← solo código de servidor, sin "use server"
    db.ts                     ← cliente Prisma (hoy en data/prisma/db.ts)
    auth/
      session.ts              ← JWT de sesión admin
      require-admin.ts        ← requireAdmin(): lanza si no hay sesión
      mcp-auth.ts             ← verificación del token del MCP
    events/
      event.schemas.ts        ← zod: createDraft, update, occurrence
      event.service.ts        ← createDraft, update, publish, archive, occurrences
      event.queries.ts        ← lecturas públicas (solo PUBLISHED) y de admin
      event.completeness.ts   ← calcula campos faltantes y estado
    places/ …                 ← misma forma
    organizers/ …
    news/ …
    banners/ …
    audit/
      audit.service.ts        ← registro de cambios (quién, qué, antes/después)
  actions/                    ← finos: requireAdmin() → service → revalidatePath
  app/
    api/mcp/route.ts          ← tools MCP que llaman a los services
  presentation/               ← UI (como está hoy)
```

### 1.3 Reglas de la arquitectura

1. **Prisma solo se importa dentro de `src/server/**`.** Se puede forzar con `no-restricted-imports` en ESLint.
2. **`"use server"` solo en `src/actions/`**, y cada acción de escritura empieza con `await requireAdmin()`. Nunca poner `"use server"` en un service: expondría todas sus funciones.
3. **Toda escritura pasa por un service** que valida con zod. Ni la UI ni el MCP escriben directo en Prisma.
4. **La autenticación vive en el adaptador** (sesión para actions, token para MCP). Los services reciben un `actor` (`"admin:<userId>"` o `"mcp"`) para la auditoría.
5. **Las lecturas públicas filtran por `status = PUBLISHED` en un solo lugar** (`event.queries.ts`). Ninguna página arma su propio `findMany` de eventos.
6. Los tipos de entidades se derivan de Prisma o de los schemas zod, no se mantienen a mano en paralelo.

### 1.4 Tareas

- [x] `src/server/auth/require-admin.ts` aplicado en todas las acciones de escritura (eventos, lugares, organizadores, especialidades, noticias, banners) y en las lecturas de admin de eventos. Verificado llamando a las actions sin sesión: se rechazan.
- [x] `JWT_SECRET` obligatorio (mínimo 32 caracteres): sin él no se firma ni se verifica ninguna sesión.
- [x] `src/server/events` (schemas, service, queries, completeness) y `actions/events.ts` como acciones finas.
- [ ] P1 Repetir para places, organizers, organizerTypes, news, banners.
- [x] Bug corregido: al editar un evento en el admin, los cambios en las fechas no se guardaban (se descartaban las ocurrencias). Ahora se reemplazan.
- [x] Bug corregido: las fechas (guardadas a medianoche UTC) se leían en hora local en el formulario del admin, el listado, favoritos, la home y el perfil, y se mostraban un día antes. Ahora se leen en UTC (`dayjs.utc`, `fortmatDate`). Encontrado probando el admin en el navegador: al guardar, el evento se corría al día anterior.
- [x] Lecturas públicas de eventos (home, favoritos, calendario) movidas a `event.queries.ts`. Los lugares de la home y favoritos todavía se leen directo con Prisma.
- [ ] P2 Separar lecturas públicas de `"use server"`: el calendario puede pedir datos a un Route Handler GET o recibirlos de un server component.
- [~] P2 Borrar `src/domain`, `src/data/repositories`, `src/config/firebase.ts` y la dependencia `firebase`. Ya se borró la cadena repositorio/use case de eventos (no se usaba); quedan las entidades que usan los componentes `Calendar/*` y la parte de lugares/Firebase.
- [ ] P2 Regla de ESLint que prohíba importar `@prisma/client` / `db` fuera de `src/server`.

---

## 2. Servidor MCP (P0 — lo más urgente)

### 2.1 Objetivo

Exponer la app como servidor MCP para que una IA (Claude) pueda buscar, crear y editar eventos, lugares y organizadores a partir de mensajes en lenguaje natural. Uso **personal**: un solo usuario (el admin).

Ejemplos de uso:

- "Cargá este evento: Títeres en el Teatro Colón, sábado 15 a las 17 hs, a la gorra, de 3 a 8 años."
- "Pasá el show de magia del domingo a las 18:30."
- "¿Qué eventos del mes que viene no tienen foto?"
- "Mostrame los borradores incompletos y a quién tengo que escribirle."

### 2.2 Diseño técnico

- **Dónde:** dentro de la misma app Next.js, en `src/app/api/mcp/route.ts`, desplegado en Vercel junto al resto.
- **Transporte:** Streamable HTTP (el estándar actual de MCP remoto).
- **Librerías:** `@modelcontextprotocol/sdk` + el adaptador `mcp-handler` de Vercel para Next.js. Confirmar nombres y versiones vigentes al implementar.
- **Lógica:** cada tool es un adaptador fino: valida la entrada con el schema zod del módulo y llama al service. No hay lógica de negocio en el MCP.

### 2.3 Tools propuestas

| Tool | Qué hace | Notas |
|---|---|---|
| `search_events` | Busca por texto, rango de fechas, estado, lugar, organizador | Devuelve resumen + id |
| `get_event` | Detalle completo con fechas, lugar, organizadores y faltantes | |
| `create_event_draft` | Crea un evento **siempre como borrador** | Calcula faltantes → `DRAFT` o `INCOMPLETE` |
| `update_event` | Edita campos del evento | Recalcula faltantes |
| `add_occurrence` / `update_occurrence` / `delete_occurrence` | Maneja fechas y horarios | |
| `publish_event` | Pasa a `PUBLISHED` | Falla si faltan campos obligatorios |
| `archive_event` | Lo oculta sin borrarlo | Preferible a borrar (ver 2.5) |
| `list_incomplete_events` | Borradores incompletos con lo que falta y los contactos del lugar/organizador | Para el seguimiento |
| `search_places` / `get_place` / `create_place` / `update_place` | CRUD de lugares | `create_place` necesita lat/lng |
| `search_organizers` / `create_organizer` / `update_organizer` | CRUD de organizadores | |
| `set_event_photo_from_url` | Sube a Cloudinary una imagen desde una URL pública | Ver 2.6 |

Además, un **resource** (o tool `get_catalogs`) con los valores válidos de `ActivityType`, `PriceType`, `PlaceCategory` y tipos de organizador, para que la IA no invente categorías.

### 2.4 Seguridad

- [ ] Autenticación obligatoria en `/api/mcp`. Nada del MCP es público.
- [ ] Token largo y aleatorio en `MCP_API_TOKEN` (env de Vercel), comparado en tiempo constante, enviado como `Authorization: Bearer …`.
- [ ] **Compatibilidad de clientes:** Claude Code y Claude Desktop permiten configurar headers, así que el token funciona directo. Los conectores personalizados de claude.ai (web y app móvil) se autentican con OAuth. **Para usarlo desde el celular (necesario para el flujo de Instagram) probablemente haga falta un OAuth mínimo.** Verificar al implementar qué acepta hoy el conector.
- [ ] Sin tools sobre usuarios, contraseñas ni banners/noticias en la primera versión: superficie mínima.
- [ ] Tabla `AuditLog` (fecha, actor, tool, entidad, id, cambios). Como escribe una IA, poder ver y revertir qué cambió es importante.
- [ ] Rate limit básico por token.

### 2.5 Borrar vs archivar

Propuesta: el MCP **no borra eventos**, los archiva (`status = ARCHIVED`). El borrado definitivo queda solo en el admin web. Evita que un malentendido en el chat haga perder datos.

### 2.6 Fotos

Una IA no puede subir de forma confiable al MCP una imagen adjunta en el chat. Opciones:

1. `set_event_photo_from_url`: si la imagen está en una URL pública, el servidor la sube a Cloudinary con la API firmada (requiere `CLOUDINARY_API_KEY`/`SECRET` del lado servidor).
2. Si no hay URL, el evento queda `INCOMPLETE` con el faltante `foto` y la foto se carga desde el admin.

### 2.7 Tareas

- [x] Fase 1 terminada para eventos (services + auth + estados).
- [ ] P0 Endpoint `/api/mcp` con autenticación por token.
- [ ] P0 Tools de eventos y fechas + `search_places` / `search_organizers` + catálogos.
- [ ] P1 Tools de alta/edición de lugares y organizadores.
- [ ] P1 Auditoría.
- [ ] P1 OAuth para conectarlo desde claude.ai / app móvil.
- [ ] P2 `set_event_photo_from_url`.
- [ ] P2 Documentar en el README cómo conectar el MCP desde cada cliente.

---

## 3. Borradores y carga desde Instagram (P0)

### 3.1 Estados del evento

```prisma
enum EventStatus {
  DRAFT        // Borrador completo, listo para revisar y publicar
  INCOMPLETE   // Borrador con datos incompletos
  PUBLISHED    // Visible en la app
  ARCHIVED     // Oculto, se conserva
}

model Event {
  // … campos actuales …
  status        EventStatus @default(DRAFT)
  missingFields String[]    // calculado: ["foto", "lugar", "fecha", …]
  sourceUrl     String?     // link al post de Instagram de origen
  sourceText    String?     @db.Text // texto original del post
  internalNotes String?     @db.Text // notas internas (contacto, pendientes)
  publishedAt   DateTime?

  @@index([status])
}
```

En la migración, todos los eventos existentes pasan a `PUBLISHED`.

### 3.2 Problema con el modelo actual

`EventOccurrence` exige `date` y `placeId`. Un post de Instagram muchas veces menciona un lugar que todavía no está cargado. Propuesta:

- `placeId` pasa a ser **opcional** en `EventOccurrence`.
- Nuevo campo `placeText String?`: el nombre del lugar tal como aparece en el post, para asociarlo después.
- Si no hay fecha, no se crea la ocurrencia y el evento queda con el faltante `fecha`.
- Las lecturas públicas solo muestran ocurrencias con lugar asignado (y el evento no se puede publicar sin eso).

### 3.3 Qué es "completo" (a confirmar)

Un solo lugar del código (`event.completeness.ts`) decide los faltantes. Propuesta:

**Obligatorio para publicar (implementado):**
- título (siempre, también en borradores)
- al menos una fecha con hora de inicio
- lugar asignado en cada fecha
- tipo de precio

**Recomendado (se muestra como aviso, no bloquea):**
- foto (132 de los 144 eventos actuales no tienen, así que no puede ser obligatoria)
- tipo de actividad (8 eventos actuales no tienen)
- descripción
- organizador
- link de entradas o WhatsApp de reserva (si es `PAID_TICKET`)

Si falta algo obligatorio, el estado es `INCOMPLETE`. Si está todo, queda en `DRAFT` hasta que lo publiques.

### 3.4 Flujo desde Instagram

**Opción A (recomendada): compartir a Claude con el conector MCP.**

1. En Instagram, sacás captura del post (o copiás el texto) y lo compartís a la app de Claude.
2. Claude lee la imagen o el texto, busca si el lugar y el organizador ya existen y llama a `create_event_draft` con `sourceUrl` y `sourceText`.
3. Responde qué cargó y qué falta.
4. Revisás en el admin y publicás (o le pedís a Claude "publicalo").

Limitación: Claude no puede abrir links de Instagram (piden login), así que hay que compartir **captura o texto**, no solo el link. Depende del OAuth del punto 2.4 para usarlo desde el celular.

**Opción B: Web Share Target en la PWA.**

Agregar `share_target` al `manifest.ts` para que "PcP" aparezca en el menú *Compartir* de Android y guarde una "entrada pendiente" con el link. Después le pedís a Claude que procese las pendientes.

Limitaciones: no funciona en iOS e Instagram comparte solo el link, sin imagen ni texto. Aporta poco sobre la opción A; queda como mejora futura.

**Opción C: API de Meta (Instagram Graph / oEmbed).** Requiere app de Meta, revisión y tokens. Descartada por ahora.

### 3.5 Cambios en el admin

- [x] Filtro por estado en `/admin/eventos` (Todos / Borradores / Incompletos / Publicados / Archivados).
- [x] Badge de estado y columna de faltantes en la tabla.
- [ ] Vista "Incompletos" con link al post original y WhatsApp/Instagram del lugar y del organizador, para contactarlos rápido.
- [~] Botones "Guardar borrador" y "Guardar y publicar" (deshabilitado si faltan obligatorios) y, en publicados, "Pasar a borrador". Falta un botón "Archivar" en la UI (la acción ya existe).
- [x] Sección "Origen y notas internas" en el formulario: link de la fuente, texto original (solo lectura) y notas internas.

### 3.6 Lecturas públicas a filtrar por `PUBLISHED`

- [x] `src/app/page.tsx` (destacados de la home)
- [x] `src/app/favorites/page.tsx`
- [x] `getOccurrencesByMonth` (calendario)
- [x] `src/app/perfil/[slug]/page.tsx` (eventos del organizador)
- [x] `sitemap.ts`: hoy no lista eventos, no hace falta.

### 3.7 Tareas

- [x] Migración `20261022180000_add_event_status_and_drafts`: `EventStatus`, campos nuevos, `placeId` opcional + `placeText`, `priceType` opcional. Los eventos existentes pasan a `PUBLISHED` y las fechas a medianoche UTC. Aplicada en local; en producción se aplica sola en el próximo deploy (`prisma migrate deploy` del build).
- [x] `event.completeness.ts` y recálculo en cada escritura. Obligatorios: fecha, lugar en cada fecha, tipo de precio. La foto quedó como *recomendada*: 132 de los 144 eventos actuales no tienen.
- [x] Filtrar lecturas públicas por `PUBLISHED`.
- [~] P1 Cambios en el admin (3.5): falta la vista de contacto de incompletos y el botón de archivar.
- [ ] P1 Probar el flujo completo Instagram → Claude → borrador → publicar.
- [ ] P3 Web Share Target (opción B).

---

## 4. Deuda técnica (del análisis inicial)

### Seguridad
- [x] Autenticación en server actions de escritura (ver 1.4).
- [x] Validar `JWT_SECRET`.
- [~] P1 No devolver `error.message` de Prisma al cliente. Hecho en eventos; falta en lugares y noticias.
- [ ] P1 `getPlaces()` público no debe devolver lugares inactivos.
- [ ] P2 El upload preset de Cloudinary es *unsigned*: cualquiera que lo conozca puede subir imágenes. Pasar a subida firmada desde el servidor (se resuelve con 5.2).
- [ ] P3 Renombrar `middleware.ts` → `proxy.ts` (Next 16).

### Calidad
- [~] P1 Validación con zod en todas las entradas. Hecho en eventos; falta el resto de los módulos.
- [ ] P1 Centralizar el manejo de fechas y zona horaria (Argentina, UTC−3) con `dayjs`. Hoy hay cálculos manuales distintos en la home y en el calendario.
- [ ] P2 Partir `calendario/page.tsx` (1.230 líneas, todo cliente) en server component + componentes chicos; revisar si los componentes `Calendar/*` existentes se pueden reutilizar o borrar.
- [ ] P2 Partir `EventForm.tsx` (920 líneas) y `FavoritesClient.tsx` (695).
- [ ] P2 Sacar el cloud name de Cloudinary hardcodeado (`'dnpmw1mty'`) y el preset por defecto; usar solo variables de entorno.
- [ ] P3 Reducir los 28 `any` y los `console.log` sueltos.
- [ ] P3 Corregir nombres: `usescases`, `fortmatDate`, `isPlaceAvtive`.

### Repositorio y CI
- [ ] P1 CI: correr `npm run lint` y `next build` en cada PR, no solo semantic-release.
- [ ] P2 Borrar `globals_log.txt` y `check_db.js` (archivos de depuración en UTF-16).
- [ ] P2 Agregar `public/sw.js` y `public/workbox-*.js` al `.gitignore` (se generan en el build).
- [ ] P2 Tests: empezar por `event.completeness.ts` y los services (lógica pura, fácil de testear) con Vitest.

---

## 5. Entorno local

### 5.1 Base de datos

**Situación inicial**

- La única base real es la de **producción en Supabase** (en otra cuenta).
- Un solo `.env` apuntaba a **producción**: `npm run dev` leía y escribía en la base real, y un `npm run build` local aplicaba migraciones ahí.

**Archivos de entorno (hecho)**

| Archivo | En git | Para qué |
|---|---|---|
| `.env.example` | Sí | Plantilla con todas las variables y comentarios. |
| `.env.dev` | No | Desarrollo local: base de Docker. Lo cargan `npm run dev` y los scripts `db:*` (vía `dotenv-cli`). |
| `.env.prod` | No | Credenciales de producción. **Ninguna herramienta lo carga sola**; solo lo lee `npm run db:pull-prod`. En Vercel las variables siguen estando en el dashboard. |

Ya no hay `.env`. El original quedó en `backups/env-original.bak` (ignorado por git); se puede borrar.

Como no hay `.env`, si alguien corre `npx prisma …` o `npm run build` directo, falla por falta de `DATABASE_URL` en lugar de tocar producción.

**Scripts**

| Comando | Qué hace |
|---|---|
| `npm run db:up` / `npm run db:down` | Levanta / detiene Postgres + pgAdmin |
| `npm run dev` | Next.js contra la base local |
| `npm run db:migrate` | `prisma migrate dev` en local |
| `npm run db:seed` | Crea el admin de `.env.dev` |
| `npm run db:studio` | Prisma Studio en local |
| `npm run db:pull-prod` | Backup de producción (solo lectura) → `backups/prod-<fecha>.dump` → lo restaura en la base local, **reemplazando** su contenido |

**Docker local (hecho)**

`docker compose up -d` levanta, sin instalar nada más en la PC:

| Servicio | Dirección | Notas |
|---|---|---|
| Postgres 17 | `localhost:5433` | Misma versión mayor que producción (Supabase 17.6). Usuario, contraseña y base por defecto: `pcp` / `pcp` / `pcp`. |
| **pgAdmin 4** | http://localhost:5050 | Sin login y con la conexión "PCP local" ya cargada (la genera `docker/pgadmin/init.sh`). |

- [x] pgAdmin en el compose, preconfigurado (reemplaza a Adminer).
- [x] Valores por defecto para `POSTGRES_*`: el compose funciona aunque no haya `.env`.
- [x] Puertos atados a `127.0.0.1` (no quedan expuestos a la red).
- [x] Healthcheck de Postgres; pgAdmin espera a que la base esté lista.
- [x] `.gitattributes` para que `init.sh` mantenga fin de línea LF al clonar en Windows.
- [x] pgAdmin escucha en IPv4 (`PGADMIN_LISTEN_ADDRESS`): por defecto usa IPv6 y en Docker Desktop queda inaccesible.
- [x] Probado el 2026-10-22: pgAdmin 9.18 levanta, muestra "PCP local" y conecta sin pedir contraseña.
- [x] Volumen viejo `pcp_postgres_data` (vacío, con usuario `postgres` y base `pcp_db`) borrado y recreado con los valores por defecto.

Nota: pgAdmin importa la conexión solo la primera vez que arranca. Si se cambian las credenciales de Postgres después, hay que borrar su volumen: `docker compose down` y `docker volume rm pcp_pgadmin_data`. Lo mismo vale para Postgres: si el volumen `postgres_data` ya existía, conserva el usuario y la contraseña con los que se creó.

**Tareas**

- [x] `.env.example`, `.env.dev` y `.env.prod`; `.env` eliminado.
- [x] Desarrollar contra la base de Docker (`npm run dev` usa `.env.dev`).
- [x] Postgres local en versión 17, igual que producción.
- [x] Script `npm run db:pull-prod` (`scripts/db-pull-prod.sh`). Exporta solo el schema `public` (Supabase agrega los suyos: `auth`, `storage`, etc.). Los dumps van a `backups/`, ignorado por git.
- [x] Primera copia hecha el 2026-10-22: 144 eventos, 461 fechas, 52 lugares, 5 banners, 2 organizadores, 1 noticia, 1 usuario. Coincide con producción.
- [ ] P1 Agregar a `.env.example` las variables nuevas cuando se implementen (`MCP_API_TOKEN`, `IMAGE_STORAGE`, `CLOUDINARY_API_KEY/SECRET`).
- [x] Sección "Desarrollo local" del README actualizada con este flujo.
- [ ] P1 `npm install` reporta 62 vulnerabilidades (5 críticas, 45 altas). Revisar con `npm audit`; probablemente se resuelvan en buena parte actualizando Next (16.0.7) y Prisma (5.22, hay versión 6/7).
- [ ] P2 `build` sigue corriendo `prisma migrate deploy`. En local ya no es peligroso (sin `.env` falla), pero conviene moverlo a un script `vercel-build` para que quede explícito.
- [ ] P2 Las imágenes en local siguen subiendo al Cloudinary real (ver 5.2).
- [ ] P2 Seed con datos de ejemplo (lugares, eventos con varias fechas, un borrador incompleto) para poder trabajar sin depender de la copia de prod.
- [x] Quitar `version: "3.9"` del compose (Docker Compose ya no lo usa y muestra un aviso).

### 5.2 Imágenes en local

**Situación actual**

- Los formularios del admin suben la imagen **desde el navegador directo a Cloudinary** con un preset *unsigned*.
- La URL de Cloudinary (`https://res.cloudinary.com/<cloud>/image/upload/w_600,q_auto,f_auto/<photoId>`) se arma a mano en **unos 20 archivos**.
- En la base solo se guarda el `photoId` (ej. `events/nombre`).

Mientras la subida y las URLs estén repartidas así, no hay forma de simular Cloudinary en local.

**Propuesta: un módulo de imágenes con dos implementaciones**

```
src/server/images/
  storage.ts          ← interfaz: upload(file, folder) → { photoId, width, height }
  cloudinary.ts       ← implementación real (subida firmada desde el servidor)
  local.ts            ← guarda en ./.uploads/ (carpeta ignorada por git)
src/presentation/utils/imageUrl.ts
                      ← imageUrl(photoId, { width }) → URL final (único lugar)
src/app/api/images/route.ts
                      ← POST protegido con requireAdmin(); usa el storage configurado
src/app/api/uploads/[...path]/route.ts
                      ← sirve los archivos de ./.uploads (solo en desarrollo)
```

- Variable `IMAGE_STORAGE=cloudinary | local`. En local, `local`; en Vercel, `cloudinary`.
- Las imágenes subidas en local se guardan con `photoId` que empieza con `local/`. `imageUrl()` decide:
  - `local/...` → `/api/uploads/...`
  - cualquier otro → URL de Cloudinary (como hoy).
- Así, con una **copia de producción en local**, las fotos existentes se siguen viendo desde Cloudinary (solo lectura, no se toca nada), y las fotos nuevas que subas en local quedan en tu máquina, sin ensuciar Cloudinary.
- En local no hay transformaciones (`w_600`, `f_auto`): se sirve el archivo original. Para desarrollo alcanza.
- Bonus: al pasar la subida al servidor, se elimina el preset *unsigned* (problema de seguridad de la sección 4) y la tool `set_event_photo_from_url` del MCP reutiliza el mismo `upload()`.

**Alternativa más simple (sin código):** crear una carpeta o un preset `pcp_dev` en Cloudinary (o una cuenta gratuita aparte) y usarlo en el `.env` local. Sirve como parche, pero no funciona sin internet, mezcla pruebas con la cuenta real y no resuelve el preset *unsigned*.

**Tareas**

- [ ] P1 `imageUrl()` único y reemplazar las ~20 URLs armadas a mano (incluye `CloudinaryImage.tsx`).
- [ ] P1 Endpoint `/api/images` con subida firmada a Cloudinary; los formularios del admin pasan a usarlo.
- [ ] P1 Implementación `local` + ruta `/api/uploads` + variable `IMAGE_STORAGE`.
- [ ] P2 Desactivar el preset *unsigned* en Cloudinary una vez migrados los formularios.

---

## 6. Decisiones abiertas

| # | Pregunta | Propuesta |
|---|---|---|
| 1 | ¿Desde qué cliente vas a usar el MCP: Claude Code/Desktop, app móvil o ambos? | Ambos: token primero, OAuth después para el celular. |
| 2 | ¿El MCP puede borrar o solo archivar? | Solo archivar. |
| 3 | ¿Qué campos son obligatorios para publicar? | Los de 3.3. |
| 4 | ¿Los lugares también tienen borradores? | No por ahora; si el lugar no existe, se usa `placeText` y se crea después. |
| 5 | ¿Publicar requiere siempre tu confirmación? | Sí: el MCP solo publica cuando se lo pedís explícitamente. |
