# Item Types

Memex ships with **7 built-in system item types**. Each type is stored in the `ItemType` table with `isSystem: true` and `userId: null`. Pro users can create custom types (same model, `isSystem: false`, `userId` set).

Types are referenced by every `Item` via `typeId`. Visual identity (icon, color) lives on `ItemType`; payload fields live on `Item`.

---

## System Types

| Name (DB) | UI Label | Icon (Lucide) | Hex Color | Tier |
|-----------|----------|---------------|-----------|------|
| `snippet` | Snippet | `Code` | `#3b82f6` | Free |
| `prompt` | Prompt | `Sparkles` | `#8b5cf6` | Free |
| `command` | Command | `Terminal` | `#f97316` | Free |
| `note` | Note | `StickyNote` | `#fde047` | Free |
| `file` | File | `File` | `#6b7280` | Pro |
| `image` | Image | `Image` | `#ec4899` | Pro |
| `link` | URL | `Link` | `#10b981` | Free |

**Display order** (sidebar, profile stats): snippet → prompt → command → note → file → image → link.

**Seed IDs**: `type-snippet`, `type-prompt`, `type-command`, `type-note`, `type-file`, `type-image`, `type-link`.

---

## Per-Type Reference

### Snippet

| Property | Value |
|----------|-------|
| **Purpose** | Reusable code samples (hooks, utilities, config, patterns) |
| **Icon** | `Code` |
| **Color** | `#3b82f6` (blue) |
| **contentType** | `text` |
| **Key fields** | `content` (source code), `language` (optional, e.g. `typescript`, `yaml`) |
| **Also used** | `title`, `description`, `collectionId`, tags |

Syntax highlighting is intended for the `language` field (per project spec).

**Seed examples**: `useDebounce Hook`, `Compound Component Pattern`, `Docker Compose for Next.js + Postgres`.

---

### Prompt

| Property | Value |
|----------|-------|
| **Purpose** | AI prompts and workflow instructions for LLM use |
| **Icon** | `Sparkles` |
| **Color** | `#8b5cf6` (purple) |
| **contentType** | `text` |
| **Key fields** | `content` (prompt body) |
| **Also used** | `title`, `description`, `collectionId`, tags |

**Seed examples**: `Code Review Prompt`, `Documentation Generation`, `Refactoring Assistance`.

---

### Command

| Property | Value |
|----------|-------|
| **Purpose** | Shell/terminal commands for quick copy-paste |
| **Icon** | `Terminal` |
| **Color** | `#f97316` (orange) |
| **contentType** | `text` |
| **Key fields** | `content` (single command or short script) |
| **Also used** | `title`, `description`, `collectionId`, tags |

**Seed examples**: `git stash pop`, `docker system prune -af --volumes`, production deploy one-liner.

---

### Note

| Property | Value |
|----------|-------|
| **Purpose** | Free-form text notes and documentation (markdown editor planned) |
| **Icon** | `StickyNote` |
| **Color** | `#fde047` (yellow) |
| **contentType** | `text` |
| **Key fields** | `content` (markdown or plain text) |
| **Also used** | `title`, `description`, `collectionId`, tags |

No seed items yet; type is registered in `prisma/seed.ts`.

---

### File

| Property | Value |
|----------|-------|
| **Purpose** | Uploaded documents, templates, and non-image binaries |
| **Icon** | `File` |
| **Color** | `#6b7280` (gray) |
| **contentType** | `file` |
| **Key fields** | `fileUrl`, `fileName`, `fileSize` |
| **Also used** | `title`, `description`, `collectionId`, tags |
| **Storage** | Cloudflare R2 (per project spec) |

Marked **Pro** in the sidebar. No seed items yet.

---

### Image

| Property | Value |
|----------|-------|
| **Purpose** | Uploaded images (screenshots, diagrams, assets) |
| **Icon** | `Image` |
| **Color** | `#ec4899` (pink) |
| **contentType** | `file` |
| **Key fields** | `fileUrl`, `fileName`, `fileSize` |
| **Also used** | `title`, `description`, `collectionId`, tags |
| **Storage** | Cloudflare R2 |

Marked **Pro** in the sidebar (`PRO_ITEM_TYPES` in `sidebar-content.tsx`). No seed items yet.

---

### Link

| Property | Value |
|----------|-------|
| **Purpose** | External URLs and bookmarks |
| **Icon** | `Link` |
| **Color** | `#10b981` (green) |
| **contentType** | `text` |
| **Key fields** | `url` (destination URL) |
| **Also used** | `title`, `description`, `collectionId`, tags |

The DB name is `link`; the sidebar displays **URL** (`getTypeLabel` in `sidebar-content.tsx`). Project overview refers to this type as "URL".

**Seed examples**: Docker docs, GitHub Actions docs, Tailwind docs, shadcn/ui, Material Design 3, Lucide icons.

---

## Content Classification

Items are classified at two levels: **storage shape** (`contentType`) and **semantic type** (`ItemType`).

### Text vs File (`contentType`)

| `contentType` | Types | Primary payload |
|---------------|-------|-----------------|
| `text` | snippet, prompt, note, command, link | `content` and/or `url` |
| `file` | file, image | `fileUrl`, `fileName`, `fileSize` |

`contentType` is a string on `Item` (not a Prisma enum). Seed data uses `"text"` for all non-upload types, including links.

### URL handling

Links do **not** use a separate `contentType`. They keep `contentType: "text"` and store the destination in the `url` field. `content` may be empty or used for notes about the link.

---

## Shared Item Properties

All types share the same `Item` model:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Primary key |
| `title` | string | Display name |
| `contentType` | string | `text` or `file` |
| `description` | string? | Short summary shown in list views |
| `isFavorite` | boolean | Favorites filter |
| `isPinned` | boolean | Pinned section on dashboard |
| `userId` | string | Owner |
| `typeId` | string | FK to `ItemType` |
| `collectionId` | string? | Optional collection |
| `tags` | ItemTag[] | User-defined tags |
| `createdAt` / `updatedAt` | DateTime | Timestamps |

Type-specific optional fields:

| Field | Used by |
|-------|---------|
| `content` | snippet, prompt, note, command |
| `language` | snippet (primarily) |
| `url` | link |
| `fileUrl`, `fileName`, `fileSize` | file, image |

---

## Display Differences

Visual treatment is **consistent across types**; only icon and color vary.

### Styling (`src/lib/item-type-styles.ts`)

- `getItemTypeIcon(icon)` — maps stored icon name to a Lucide component; falls back to `File`.
- `getItemTypeStyles(color)` — if color starts with `#`, applies text color and `backgroundColor: ${color}1a` (10% alpha). Otherwise uses muted theme classes.

### Where types appear

| Surface | Behavior |
|---------|----------|
| **Sidebar** | Filter link per type at `/items/{name}`; `file` and `image` show a PRO badge; `link` labeled "URL" |
| **Item row** | Left border tinted with type color; icon badge with type-colored background |
| **Collection card** | Type badges (icon + name) for types present in the collection; left border uses dominant type color |
| **Profile stats** | Per-type item counts with icon and color |

List views (`DashboardItem`) expose `title`, `description`, `type`, tags, pin/favorite state — not raw `content`, `url`, or file metadata. Detail/editor views (not yet implemented) will surface type-specific fields.

---

## Custom Types (Pro)

`ItemType` supports user-owned types:

```prisma
model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String?
  color    String?
  isSystem Boolean @default(false)
  userId   String?  // null for system types
  @@unique([userId, name])
}
```

Custom types reuse the same `Item` fields and `contentType` rules. Icon names must match keys in `itemTypeIcons` (`Code`, `Sparkles`, `Terminal`, `StickyNote`, `File`, `Image`, `Link`) or fall back to `File`.

---

## Sources

- `prisma/schema.prisma` — `Item`, `ItemType` models
- `prisma/seed.ts` — system type definitions and seed item patterns
- `src/lib/item-type-styles.ts` — icons, colors, sort order
- `src/components/dashboard/sidebar-content.tsx` — PRO badges, URL label
- `context/project-overview.md` — product intent and tier limits
