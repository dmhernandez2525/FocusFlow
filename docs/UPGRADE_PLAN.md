# FocusFlow Upgrade Plan

This document outlines the planned technology upgrades for the FocusFlow monorepo. Each upgrade is designed to be incremental and can be submitted as a separate PR.

## Current Stack Summary

| Service/Package | Current Version | Status |
|-----------------|-----------------|--------|
| Node.js | 20+ (22 LTS recommended) | Stable |
| TypeScript | 5.5+ | Stable |
| pnpm | 9.0.0 | Stable |
| TurboRepo | 2.0 | Stable |
| Next.js | 15.5.4 | Current - Stable |
| React | 19.0.0 | Current - Stable |
| Fastify | 5.6.0 | Current - Stable |
| Strapi | 5.23.1 | Current - Stable |
| Tailwind CSS | 3.4.15 | Upgrade Available |
| Prisma | 5.22.0 | Upgrade Available |
| ESLint/Prettier | 9.x / 3.3.x | Replace with Biome |

---

## 1. Tailwind CSS 3.4 -> 4.x (Web Service)

**Priority**: High
**Complexity**: Major Migration
**Service**: `services/web`

### Why Upgrade?

- Tailwind v4 introduces a new engine built on Rust (Lightning CSS)
- 10x faster build times
- Native CSS cascade layers support
- Zero-configuration content detection
- Simplified configuration with CSS-first approach
- Better IDE integration with CSS custom properties

### Migration Steps

1. **Backup Current Configuration**
   ```bash
   cp services/web/tailwind.config.ts services/web/tailwind.config.ts.backup
   cp services/web/postcss.config.js services/web/postcss.config.js.backup
   ```

2. **Install Tailwind v4**
   ```bash
   cd services/web
   pnpm remove tailwindcss postcss autoprefixer
   pnpm add tailwindcss@next @tailwindcss/postcss@next
   ```

3. **Update PostCSS Configuration**
   ```javascript
   // postcss.config.js (new v4 format)
   export default {
     plugins: {
       '@tailwindcss/postcss': {}
     }
   }
   ```

4. **Migrate Configuration to CSS**
   - Tailwind v4 uses CSS-based configuration
   - Move theme customizations to CSS variables
   - Replace `tailwind.config.ts` with `@import` in main CSS

5. **Update Import Syntax**
   ```css
   /* Old v3 */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* New v4 */
   @import "tailwindcss";
   ```

6. **Run Migration Tool**
   ```bash
   npx @tailwindcss/upgrade
   ```

7. **Update Plugins**
   - `@tailwindcss/forms` -> Built into v4
   - `@tailwindcss/typography` -> `@tailwindcss/typography@next`
   - `tailwindcss-animate` -> Check for v4 compatibility

### Breaking Changes to Address

- Class name changes (some utilities renamed)
- Configuration file format changes
- Plugin API changes
- Theme function syntax changes
- Default color palette updates

### Testing Checklist

- [ ] All UI components render correctly
- [ ] Dark mode (if used) functions properly
- [ ] Responsive breakpoints work as expected
- [ ] Animation classes work correctly
- [ ] Custom utilities still function
- [ ] Build time improvement verified

### Estimated Effort

- 4-8 hours depending on customization level
- Recommended: Create feature branch, test thoroughly

---

## 2. Add shadcn/ui v4 (Web Service)

**Priority**: High
**Complexity**: Medium
**Service**: `services/web`
**Dependency**: Complete Tailwind v4 upgrade first

### Why Add shadcn/ui?

- Production-ready, accessible components
- Full TypeScript support
- Radix UI primitives (already partially in use)
- Theme customization via CSS variables
- Copy-paste ownership model
- Active community and regular updates

### Current Radix Dependencies

The web service already uses several Radix UI primitives:
- `@radix-ui/react-slot`
- `@radix-ui/react-avatar`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-toast`
- `@radix-ui/react-tooltip`

### Installation Steps

1. **Initialize shadcn/ui**
   ```bash
   cd services/web
   npx shadcn@latest init
   ```

2. **Configure for Tailwind v4**
   - Select "New York" or "Default" style
   - Configure for CSS variables
   - Set up path aliases

3. **Add Core Components**
   ```bash
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add input
   npx shadcn@latest add form
   npx shadcn@latest add table
   npx shadcn@latest add dialog
   npx shadcn@latest add toast
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add avatar
   npx shadcn@latest add navigation-menu
   ```

4. **Migrate Existing Components**
   - Replace custom implementations with shadcn/ui versions
   - Update imports throughout the application
   - Ensure consistent styling

5. **Theme Configuration**
   ```css
   /* globals.css */
   @layer base {
     :root {
       --background: 0 0% 100%;
       --foreground: 222.2 84% 4.9%;
       --primary: 222.2 47.4% 11.2%;
       --primary-foreground: 210 40% 98%;
       /* ... additional variables */
     }
   }
   ```

### Components to Add (Priority Order)

| Component | Use Case | Priority |
|-----------|----------|----------|
| Button | Global actions | High |
| Form | Client/session forms | High |
| Input | All form inputs | High |
| Card | Dashboard widgets | High |
| Table | Client/session lists | High |
| Dialog | Modals, confirmations | High |
| Toast | Notifications | High |
| Calendar | Session scheduling | Medium |
| Data Table | Sortable lists | Medium |
| Command | Search/command palette | Medium |
| Sheet | Mobile navigation | Medium |

### Estimated Effort

- Initial setup: 1-2 hours
- Component migration: 4-6 hours
- Testing and refinement: 2-4 hours

---

## 3. Prisma Upgrade to Latest

**Priority**: Medium
**Complexity**: Low
**Service**: `services/web`

### Current Version

- `@prisma/client`: 5.22.0
- `prisma`: 5.22.0

### Upgrade Steps

1. **Check Latest Version**
   ```bash
   npm view prisma version
   npm view @prisma/client version
   ```

2. **Update Dependencies**
   ```bash
   cd services/web
   pnpm update prisma @prisma/client
   ```

3. **Regenerate Client**
   ```bash
   pnpm prisma generate
   ```

4. **Test Database Operations**
   - Run existing tests
   - Verify all CRUD operations
   - Check migration compatibility

### New Features to Consider

- Typed SQL (raw queries with type safety)
- Improved query batching
- Better relation loading
- Enhanced debugging tools
- Performance improvements

### Estimated Effort

- 30 minutes - 1 hour

---

## 4. Add Biome (ESLint/Prettier Replacement)

**Priority**: Medium
**Complexity**: Medium
**Service**: All services

### Why Biome?

- Single tool replaces ESLint + Prettier
- 10-100x faster than ESLint
- Written in Rust
- Zero configuration needed for most projects
- Built-in TypeScript support
- Compatible with existing ESLint/Prettier configs

### Current Linting Setup

Root `package.json`:
- `eslint: ^9.0.0`
- `prettier: ^3.3.0`

Per-service ESLint configurations with TypeScript plugins.

### Migration Steps

1. **Install Biome at Root**
   ```bash
   pnpm add -Dw @biomejs/biome
   ```

2. **Initialize Configuration**
   ```bash
   pnpm biome init
   ```

3. **Configure `biome.json`**
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
     "organizeImports": {
       "enabled": true
     },
     "linter": {
       "enabled": true,
       "rules": {
         "recommended": true,
         "correctness": {
           "noUnusedImports": "error",
           "noUnusedVariables": "error"
         },
         "style": {
           "noNonNullAssertion": "warn"
         }
       }
     },
     "formatter": {
       "enabled": true,
       "indentStyle": "space",
       "indentWidth": 2
     },
     "javascript": {
       "formatter": {
         "quoteStyle": "single",
         "trailingCommas": "es5"
       }
     }
   }
   ```

4. **Update Root Scripts**
   ```json
   {
     "scripts": {
       "lint": "biome lint .",
       "format": "biome format --write .",
       "check": "biome check --write ."
     }
   }
   ```

5. **Update TurboRepo Config**
   ```json
   // turbo.json
   {
     "tasks": {
       "lint": {
         "cache": true
       }
     }
   }
   ```

6. **Remove Old Dependencies**
   ```bash
   pnpm remove -w eslint prettier
   # Remove per-service ESLint configs
   ```

7. **Update VSCode Settings**
   ```json
   {
     "editor.defaultFormatter": "biomejs.biome",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "quickfix.biome": "explicit",
       "source.organizeImports.biome": "explicit"
     }
   }
   ```

### Service-by-Service Migration

| Service | ESLint Plugins to Replace |
|---------|--------------------------|
| web | `eslint-config-next`, `@typescript-eslint/*` |
| payments | `@typescript-eslint/*` |
| cms | `@typescript-eslint/*` |
| queue | `@typescript-eslint/*` |
| worker | `@typescript-eslint/*` |

### Estimated Effort

- Initial setup: 1-2 hours
- Per-service migration: 30 min each
- Total: 4-6 hours

---

## 5. Node.js 20 -> 22 LTS

**Priority**: Low
**Complexity**: Low
**Service**: All services

### Current State

- `.nvmrc`: 20 (should verify)
- `engines.node`: ">=20.0.0" across packages
- SOFTWARE_DESIGN_DOCUMENT references Node 22 as recommended

### Why Upgrade?

- LTS support until April 2027
- Performance improvements
- Native `fetch` improvements
- Better ESM support
- `--watch` mode improvements
- Native test runner enhancements

### Upgrade Steps

1. **Update `.nvmrc`**
   ```
   22
   ```

2. **Update Engine Requirements**
   ```json
   // All package.json files
   {
     "engines": {
       "node": ">=22.0.0"
     }
   }
   ```

3. **Update Docker Base Images**
   ```dockerfile
   # infrastructure/docker/Dockerfile.base
   FROM node:22-alpine
   ```

4. **Update CI/CD**
   - GitHub Actions node version
   - Render.com environment settings

5. **Test All Services**
   ```bash
   nvm install 22
   nvm use 22
   pnpm install
   pnpm build
   pnpm test
   ```

### Breaking Changes to Watch

- Some native modules may need rebuilding
- Check Sharp compatibility
- Verify bcrypt/bcryptjs compatibility

### Estimated Effort

- 1-2 hours

---

## 6. Stable Versions (No Action Required)

### Next.js 15.5.4

- Current version is latest stable
- React 19 support is complete
- Server Components fully supported
- No upgrade needed

### Fastify 5.6.0

- Current version is latest stable in v5 line
- TypeBox integration working
- No upgrade needed

### Strapi 5.23.1

- Current version is recent
- Monitor for security patches
- No immediate upgrade needed

---

## Upgrade Order Recommendation

For minimal risk and maximum efficiency, follow this order:

### Phase 1: Foundation (Week 1)
1. **Prisma Upgrade** - Low risk, quick win
2. **Node.js 22** - Foundation for other upgrades

### Phase 2: Tooling (Week 2)
3. **Biome Integration** - Replace ESLint/Prettier

### Phase 3: UI Modernization (Week 3-4)
4. **Tailwind CSS v4** - Major migration
5. **shadcn/ui v4** - After Tailwind upgrade

---

## PR Strategy

Each upgrade should be a separate PR for:
- Easier code review
- Simpler rollback if issues arise
- Better commit history
- Incremental testing

### PR Template

```markdown
## Upgrade: [Package Name] from vX.X to vY.Y

### Changes
- Updated [package] to version Y.Y
- Updated configuration files
- Migrated [specific features]

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Build succeeds
- [ ] No console errors/warnings

### Breaking Changes
- [List any breaking changes]

### Rollback Plan
- Revert this PR
- Run `pnpm install`
```

---

## Monitoring Post-Upgrade

After each upgrade, monitor:
- Build times (should improve with Biome, Tailwind v4)
- Bundle sizes
- Runtime performance
- Error rates in Sentry
- User feedback

---

*Document Version: 1.0*
*Last Updated: January 2026*
