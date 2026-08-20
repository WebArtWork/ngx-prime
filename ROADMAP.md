# Roadmap

Planned follow-up work for bringing `packages/primeng` and `apps/showcase` up to
current Angular best practices. This is not urgent cleanup — everything here was
deliberately deferred out of the lint-fixing pass so it could be scoped and
sequenced properly instead of rushed.

Source: Angular 22 conformance audit (Angular CLI MCP `get_best_practices` /
`search_documentation`, cross-referenced against a pattern census of the working
tree). No code was changed as part of that audit.

## Already conformant (no action needed)

- Standalone components throughout — no `NgModule`-based components, and
  `standalone: true` is correctly *absent* rather than redundantly present.
- Native control flow fully migrated: `@if`/`@for`/`@switch` used everywhere in
  live templates. The only remaining `*ngIf` occurrences are inside code-sample
  string literals on an accessibility doc page, illustrating pre-Ivy syntax for
  readers — not real templates.
- `ngClass`/`ngStyle` fully migrated to `class`/`style` bindings in `primeng`.
  Remaining hits are all in `apps/showcase` doc prose or generated `llms/*.md`
  reference content.
- `apps/showcase` already runs zoneless (`provideZonelessChangeDetection()` in
  `app.config.ts`).
- Newer components (the `tabs/` family, recent additions) are already
  signal-native — `input()`/`computed()` used correctly. The target style
  already exists in-house; this is a completion problem, not a direction
  problem.

## Planned work, in dependency order

Each item is easier once the one before it is done — do them in this order,
not by priority label alone.

### 1. Constructor DI → `inject()` (medium priority)

- **Where:** 52 files, including the base classes `basecomponent.ts` and
  `basemodelholder.ts` that everything else extends.
- **Why first:** low risk, single-file transform, no external call-site
  impact. Doing the base classes first means every subclass migration
  afterward touches already-converted base classes instead of two DI styles
  at once.
- **Watch for:** a few constructors do real work beyond assignment (e.g.
  `dynamicdialog-injector.ts` implements the `Injector` interface) — check
  each one individually rather than flattening mechanically.

### 2. `@HostListener` / `@HostBinding` → `host` object (high priority)

- **Where:** 23 files use `@HostListener`, 4 use `@HostBinding` — table.ts,
  treetable.ts, tabs/tab.ts, cascadeselect.ts, autocomplete.ts, tree.ts,
  popover.ts, password.ts, listbox.ts, galleria.ts, dragdrop.ts,
  confirmpopup.ts, togglebutton.ts, treeselect.ts, slider.ts, textarea.ts,
  terminal.ts, accordion.ts, toggleswitch.ts, inputtext.ts, image.ts,
  styleclass.ts, keyfilter.ts (+ paginator.ts, scroller.ts, avatargroup.ts,
  inputgroupaddon.ts for host-binding only).
- **Why it matters:** decorator-based listeners allocate per-instance
  functions discovered via reflection; `host`-object bindings are declared
  once on component metadata and are what Ivy's host-binding compiler is
  optimized for. Real allocation-count difference for a library instantiated
  hundreds of times per page (large tables, deep trees).
- **Watch for:** some handlers rely on `this` binding wired by the decorator,
  and some are overridden in subclasses (the base-component NOOP-override
  pattern). Check the override chain per method before converting.

### 3. `@Input()` / `@Output()` → `input()` / `output()` / `model()` (high priority — the big one)

- **Where:** 104 files.
- **Why it needs its own scoping pass:** `@Input()` properties are plain
  class fields that other code in the library reads *and writes* directly,
  not just through Angular's binding system. `input()` signals are read-only
  from outside the component, so every direct external write has to be found
  and re-routed first. This is the largest and riskiest item on the list.
- **Suggested approach:** component-family by component-family, starting
  with a leaf family that nothing else extends (e.g. `badge`/`tag`/`avatar`)
  before touching `table` or the overlay family that everything depends on.

### 4. Change-detection audit on the 6 forced-`Default` components (high priority)

- **Where:** `scroller.ts`, `organizationchart.ts` (×2), `dynamicdialog.ts`,
  `table.ts` (×2) explicitly set
  `changeDetection: ChangeDetectionStrategy.Default`.
- **Why it matters now specifically:** `OnPush` is the v22 default, so these
  six are opting *out* of it. Since `apps/showcase` already runs zoneless,
  these are the components most likely to have change-detection assumptions
  that zone-based CD was quietly papering over.
- **Sequencing:** do this only after step 3 touches these components anyway —
  flipping to `OnPush` is much lower-risk once their inputs are already
  signals, since signal reads are what makes `OnPush` actually correct rather
  than just fast. Do not flip these without auditing internal mutation
  patterns first — table/scroller/org-chart/dialog are exactly the components
  where a silently-stale view is the worst failure mode.

## Independent, low-risk, opportunistic work

No dedicated effort needed — good to pick up whenever already in a given file
for other reasons.

- **Signal Forms showcase example** — `@angular/forms/signals` has zero
  usage in the repo, which is correct (`primeng` is a `ControlValueAccessor`
  library, not a form consumer). The one opportunity: add a Signal Forms
  example alongside the existing 25 Reactive Forms doc pages (e.g.
  `autocomplete/reactive-forms-doc.ts`, `cascadeselect/reactiveforms-doc.ts`)
  as a parallel demo, not a replacement.
- **`@Injectable({ providedIn: 'root' })` → `@Service()`** — cosmetic, same
  tree-shakability and singleton guarantee, just shorter, and forces
  `inject()` over constructor DI. `@Service()` doesn't support non-root
  scopes or advanced provider keys (`useClass`, `useFactory`, etc.) — check
  `dialogservice.ts`, `contextmenuservice.ts`, `overlayservice.ts`
  individually before converting.
- **`any` cleanup** — 3,673 occurrences across 249 files in `primeng`, 573
  across 156 files in `apps/showcase`. Not a dedicated-pass candidate; too
  many are legitimate DOM/browser-API escape hatches (`domhandler.ts` alone
  has 34) or third-party interop (`chart.ts`). Highest-density files worth a
  look when already being edited: `table.ts` (235), `treetable.ts` (106),
  `tieredmenu.ts` (56), `menubar.ts`/`megamenu.ts` (48/46), `scroller.ts`
  (47), `picklist.ts` (47).
- **`NgOptimizedImage`** — `apps/showcase` only (`primeng` ships no content
  images). 561 `<img>` tags with zero `ngSrc` usage, concentrated in
  `doc/image/`, `doc/galleria/`, `doc/avatar/`. Check which are inline
  `data:` URIs first — `NgOptimizedImage` doesn't support those.

## Housekeeping

- **Re-enable husky pre-commit and commit-msg hooks** — both temporarily
  disabled (renamed to `.husky/pre-commit.disabled` and
  `.husky/commit-msg.disabled`) because of a broken/incomplete pnpm install:
  `node_modules/lint-staged` was missing its `bin/` folder, and
  `node_modules/@commitlint/cli` was missing entirely, so every commit failed
  with `MODULE_NOT_FOUND`. Before restoring: run `pnpm install` (or
  `pnpm install --force`) so `lint-staged` and `@commitlint/cli` resolve
  correctly, verify `npx --no-install lint-staged` and
  `npx --no-install commitlint --edit .git/COMMIT_EDITMSG` both run clean,
  then rename both files back (drop the `.disabled` suffix).

## Notes

- This roadmap was generated from a read-only audit; nothing here has been
  started.
- Each migration step above should follow the same verification discipline
  used for the lint cleanup: small batches, `tsc --noEmit` after each, no
  bulk mechanical edits without checking call sites/overrides first.
