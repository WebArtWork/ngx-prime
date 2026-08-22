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

### 1. Constructor DI → `inject()` — ✅ already done (re-verified 2026-08-21)

Re-audited on 2026-08-21: no real constructor parameter-property DI remains
in `packages/primeng/src` or `apps/showcase`. Both base classes already use
`inject()` exclusively. The original "52 files" count was a raw grep for the
`constructor(` token, not for injected parameters — those 52 files all have
parameterless `constructor()` bodies (used for `effect()`/`super()` calls
only). The only real constructor-parameter classes left are
`dynamicdialog-injector.ts` and `connectedoverlayscrollhandler.ts`, both
plain non-DI-managed classes instantiated with `new` — correctly left alone,
per the original watch-for note. All other hits are inside doc-sample
template-literal strings in `apps/showcase` (illustrating legacy syntax for
readers), same exemption category as the `*ngIf` doc examples above; the
real demo classes around them already use `inject()`. No action needed.

### 2. `@HostListener` / `@HostBinding` → `host` object — ✅ done (2026-08-21)

Converted all 27 files (4 `@HostBinding`-only: avatargroup, inputgroupaddon,
paginator, scroller; 23 `@HostListener` files: autocomplete, cascadeselect,
confirmpopup, listbox, image, inputtext, styleclass, popover, slider,
treeselect, toggleswitch, galleria, textarea, terminal, togglebutton,
tabs/tab, keyfilter, tree, accordion, password, dragdrop, treetable, table).
75 `@HostListener` occurrences and 4 `@HostBinding` occurrences moved into
`host` object metadata (or added a `host` block where none existed) across
~40 component/directive classes, including every listener in the largest
and riskiest files (table.ts: 25 occurrences across 12 directive classes;
treetable.ts: 11 occurrences across 7). Verified with `tsc --noEmit` after
each batch — zero new errors introduced (only pre-existing jest-globals
noise in `.spec.ts` files, unrelated). `grep -r "@HostListener\|@HostBinding"
packages/primeng/src` now returns nothing.

### 3. `@Input()` / `@Output()` → `input()` / `output()` / `model()` (high priority — the big one)

- **Where:** 104 files. **In progress (started 2026-08-21).**
- **Why it needs its own scoping pass:** `@Input()` properties are plain
  class fields that other code in the library reads *and writes* directly,
  not just through Angular's binding system. `input()` signals are read-only
  from outside the component, so every direct external write has to be found
  and re-routed first. This is the largest and riskiest item on the list.
- **Suggested approach:** component-family by component-family, starting
  with a leaf family that nothing else extends (e.g. `badge`/`tag`/`avatar`)
  before touching `table` or the overlay family that everything depends on.
- **Done:** `tag.ts` (all 5 `@Input()` → `input()`), `avatar.ts` (7
  `@Input()` → `input()`, 1 `@Output()` → `output()`), `badge.ts`'s
  `BadgeDirective` (7 `@Input()` → `input()`/`input(alias)`, including a
  deprecated custom setter converted to an `effect()` for its console
  warning — `badge.ts`'s `Badge` component was already signal-native before
  this pass). Corresponding `.spec.ts` files fixed alongside each: direct
  writes to the *converted component's own instance* changed to write
  through a template-bound wrapper field instead (signal inputs are
  TypeScript-legal but runtime-broken to assign directly — `tsc` does not
  catch this, since a `foo = input()` class field isn't marked `readonly`),
  and direct reads changed to call the signal. Writes/reads on wrapper test
  components (the common pattern) needed no change. All verified with
  `tsc --noEmit`.
- **Also done:** `autofocus.ts`, `floatlabel.ts`, `focustrap.ts`,
  `icons/baseicon/baseicon.ts` (base class for every icon component —
  checked no subclass overrides `spin`), `inputgroup.ts`, `inputicon.ts`,
  `iconfield.ts`. Same per-file discipline as above: external consumers
  checked, `.spec.ts` reads/writes fixed, `tsc --noEmit` clean after each.
- **Important shared-mechanism fix (2026-08-21):** `basecomponent.ts`'s
  private `$hostName` getter did `return this['hostName']` — a bare
  property read. `button.ts` had already converted its `hostName` field to
  `input<any>('')` in an earlier pass without updating this getter, so
  `$hostName` was silently returning the signal *function* (always
  truthy) instead of its string value for `ButtonDirective` — breaking the
  `_hook()` early-return and the `_getHostInstance`/`_getPT` name-matching
  logic wherever a `hostName` input is bound. Fixed the getter to unwrap
  the signal (`isFunction(hostName) ? hostName() : hostName`, using the
  `isFunction` helper already imported in the file) so it transparently
  handles both plain-string `hostName` fields (not yet converted) and
  signal-form ones. This was a **pre-existing correctness bug**, not
  something introduced this session — but converting more `hostName`
  fields without this fix would have spread it further. Re-verify with
  `tsc --noEmit` after any future `hostName` conversion.
- **Also done:** `api/shared.ts`'s `PrimeTemplate` directive (`type` and
  `name`/`pTemplate` → `input()`) — used by ~93 files via
  `contentChildren(PrimeTemplate)`, so checked thoroughly for direct
  external reads of `.name`/`.type` bypassing the `getType()` method
  (which itself just reads `.name` internally, unaffected as a method).
  Found and fixed exactly two: `tree.ts` and `treeselect.ts` both index
  `this._templateMap[item.name]`/`this.templateMap[item.name]` directly.
  `treeselect.ts` additionally needed a `default: { ... }` block added
  around its `switch` case (was a bare `case`, and hoisting a `const` into
  it triggered `no-case-declarations`). Zero other direct-write or
  direct-read sites found across the 93 consuming files — everything else
  goes through `.getType()`/`.template`, both untouched. Full repo
  `eslint` and `tsc --noEmit` both clean after this change.
- **Also done:** `avatargroup.ts`, `inputgroupaddon.ts` (plus fixed the
  `addonInstance.styleClass`/`.style` reads left over in
  `inputgroup.spec.ts` from the earlier `inputgroup.ts` pass, now that
  `InputGroupAddon` itself is converted), `inputtext.ts` (`hostName`,
  `pSize`; also fixed `inputtextstyle.ts`'s external `instance.pSize`
  read), `scrollpanel.ts` (`styleClass`, `step`). Same discipline
  throughout — external consumers and style classes checked,
  `.spec.ts` reads/writes fixed, `tsc --noEmit`/`eslint` clean after each.
- **Also done:** `toolbar.ts` (`styleClass`, `ariaLabelledBy`), `keyfilter.ts`
  (`pValidateOnly` → `input()`; `pattern`'s get/set-with-side-effect →
  `input()` + `effect()` in the constructor, mirroring the
  `badge.ts`-`size` pattern; `ngModelChange` `@Output()` → `output()`,
  confirmed `.emit()` still works against `spyOn(...).emit` in the spec and
  against the framework's own `ngModelChange` output resolution — no
  special-casing needed for the name).
- **Also done (2026-08-22):** `imagecompare.ts` (`tabindex`, `ariaLabelledby`,
  `ariaLabel`), `textarea.ts` (`autoResize`, `pSize` → `input()`; `onResize`
  `@Output()` → `output()`; also fixed `textareastyle.ts`'s external
  `instance.pSize` read), `card.ts` (`header`, `subheader`, `styleClass` →
  plain `input()`; `style`'s get/set-with-side-effect → `input()` +
  `effect()` in a new constructor, same pattern as `badge.ts`/`keyfilter.ts`
  — preserves the "apply style directly to avoid infinite loop in host
  binding" comment/behavior verbatim; also fixed `cardstyle.ts` — no
  external reads found there), `divider.ts` (`styleClass`, `layout`,
  `type`, `align`; also fixed `dividerstyle.ts`'s external
  `instance.layout()`/`.type()`/`.align()` reads, all previously plain
  property access). Same discipline throughout.
- **Also done (2026-08-22, continued):** `terminal.ts` (`welcomeMessage`,
  `prompt`, `styleClass` → plain `input()`; `response` — a write-only
  `@Input()` setter with a side effect and no getter — converted to
  `input()` + `effect()`, same idiom as `card.ts`/`badge.ts`. Its spec had
  two tests writing `terminalInstance.response = 'x'` directly on the
  queried (non-root) instance; fixed by adding `[response]` to the test
  wrapper's template and driving it through the wrapper field +
  `whenStable()`, since a nested instance can't take `componentRef.setInput`
  the way a fixture's root component can), `timeline.ts` (`value`,
  `styleClass`, `align`, `layout`; also fixed `timelinestyle.ts`'s external
  `instance.align()`/`.layout()` reads, and the template's
  `@for (event of value; ...)` to `value()`).
- **Also done (2026-08-22, continued):** `blockui.ts` (`target`, `autoZIndex`,
  `baseZIndex`, `styleClass` → plain `input()`; `blocked`'s get/set with
  `block()`/`unblock()` side effects → `input()` + `effect()`, same idiom;
  host's `[attr.aria-busy]` now reads the internal `_blocked` field directly
  instead of the old `blocked` getter, since `_blocked` was already the
  real state tracked by `block()`/`unblock()`/`destroyModal()`; also fixed
  `blockuistyle.ts`'s external `instance.target()` read. Its spec had one
  test writing directly to a queried non-root `BlockUI` instance's
  `blocked`/`target`/`styleClass`/`baseZIndex`/`autoZIndex` — fixed by
  adding those bindings to the two affected test wrapper components and
  routing writes through the wrapper fields, same pattern as `terminal.ts`),
  `progressspinner.ts` (`styleClass`, `strokeWidth`, `fill`,
  `animationDuration`, `ariaLabel`).
- **Also done (2026-08-22, continued):** `accordion.ts`'s `Accordion` class
  (`styleClass`, `expandIcon`, `collapseIcon`, `transitionOptions` →
  `input()`; `onClose`/`onOpen` `@Output()` → `output()`) — `AccordionPanel`,
  `AccordionHeader`, `AccordionContent` were already fully signal-native.
  Also updated `AccordionHeader`'s template, which reads the injected
  `Accordion` instance's `collapseIcon`/`expandIcon` directly
  (`pcAccordion.collapseIcon()`/`.expandIcon()`) — a cross-component
  template read that's easy to miss since it's not in the owning class.
- **Also done (2026-08-22, continued):** `animateonscroll.ts` (all 6:
  `enterClass`, `leaveClass`, `root`, `rootMargin`, `threshold`, `once`).
- **Also done (2026-08-22, continued):** `breadcrumb.ts` (`model`, `style`,
  `styleClass`, `home`, `homeAriaLabel` → `input()`; `onItemClick`
  `@Output()` → `output()` — heaviest template rewrite so far, `home` is
  read ~30 times across two near-duplicate link blocks in the template,
  all converted to `home()!.field` since the surrounding `@if (home())`
  guards already establish non-null).
- **Investigated, intentionally left as-is:** `button.ts`'s `ButtonDirective`
  — its remaining 6 `@Input()`s (`raised` plus the `label`/`icon`/`loading`/
  `buttonProps`/`severity` accessor get/set pairs) already carry
  `// TODO: Skipped for migration because: ...` comments from an earlier
  automated migration attempt (Angular's own signal-input-migration
  schematic, by the look of it) — `buttonProps`'s setter writes to
  `_label`/`_icon`/`_loading` etc. via dynamic reflection
  (`this[`_${k}`] = v`), and `raised` is flagged as written to directly by
  application code. Respecting that prior judgment rather than forcing a
  conversion; `Button` (the component, not the directive) was already
  fully signal-native. Revisit only with a dedicated pass, not as part of
  this file-by-file sweep.
- **Also done (2026-08-22, continued):** `overlaybadge.ts` (`styleClass`,
  `style`, `badgeSize`, `severity`, `value`, `badgeDisabled` → `input()`;
  deprecated `size` get/set → `input()` + `effect()`), `progressbar.ts`
  (`value`, `showValue`, `styleClass`, `valueStyleClass`, `unit`, `mode`,
  `color`; also fixed `progressbarstyle.ts`'s external `instance.mode()`
  reads), `skeleton.ts` (all 7: `styleClass`, `shape`, `animation`,
  `borderRadius`, `size`, `width`, `height`; also fixed
  `skeletonstyle.ts`'s external reads — its spec had ~15 tests writing
  directly to a queried instance's inputs purely to exercise the
  `containerStyle` getter in isolation, outside any change-detection cycle;
  fixed by stubbing the signal in place, e.g.
  `(skeleton as any).size = () => '80px'`, rather than routing through a
  template binding, since these tests intentionally bypass CD), `steps.ts`
  (`activeIndex`, `model`, `readonly`, `style`, `styleClass`, `exact` →
  `input()`; `activeIndexChange` `@Output()` → `output()`; also fixed
  `stepsstyle.ts`'s external `instance.readonly()` read).
- **Also done (2026-08-22, continued):** `confirmpopup.ts` (`showTransitionOptions`,
  `hideTransitionOptions`, `autoZIndex`, `baseZIndex`, `style`, `styleClass`
  → `input()`). **Left as plain `@Input()` intentionally: `key` and
  `defaultFocus`.** Found a real dynamic-write hazard: the constructor
  subscribes to `confirmationService.requireConfirmation$` and does
  `Object.keys(confirmation).forEach(key => { this[key] = confirmation[key]; })`
  — a reflection-based copy from the `Confirmation` object onto `this`.
  `Confirmation` (in `api/confirmation.ts`) has its own `key` and
  `defaultFocus` fields, so whenever a caller's confirmation object
  includes either, this dynamically overwrites `ConfirmPopup.key`/
  `.defaultFocus` directly — converting those two to `input()` would let
  that reflection loop silently replace the signal function with a plain
  value, breaking every future `.key()`/`.defaultFocus()` call at runtime
  with no compile-time warning. This is exactly the external-write hazard
  the roadmap's step 3 intro calls out, just via `this[key] =` instead of
  a named property write — worth grepping for `this\[.*\]\s*=` in any
  remaining file before converting its inputs, since a plain external-write
  grep won't catch it.
- **Also done (2026-08-22, continued):** `dock.ts` (`styleClass`, `model`,
  `position`, `ariaLabel`, `breakpoint`, `ariaLabelledBy` → `input()`;
  `onFocus`/`onBlur` `@Output()` → `output()`). **`id` needed the same
  generated-fallback pattern as `card.ts`'s `style`**: `onInit` did
  `this.id = this.id || uuid('pn_id_')` — a self-mutating default that
  can't survive as a plain `input()`. Converted to `id = input<string>()`
  plus a `private _generatedId = uuid('pn_id_')` and a `get resolvedId()`
  getter that the template now binds to instead of `id` directly; the
  `onInit` mutation was deleted since the getter makes it unnecessary. Also
  fixed `dockstyle.ts`'s external `instance.position()` read.
- **Also done (2026-08-22, continued):** `fieldset.ts` — first genuine
  `model()` conversion of this pass: `collapsed`/`collapsedChange` was a
  textbook two-way-bindable pair (get/set `@Input` + matching `@Output`),
  converted to a single `collapsed = model<boolean | undefined>(undefined)`;
  `expand()`/`collapse()` now do `this.collapsed.set(...)` instead of
  mutating `_collapsed` and manually emitting `collapsedChange` (`model()`
  emits automatically on `.set()`). Also converted `legend`, `toggleable`,
  `style`, `styleClass`, `transitionOptions` → `input()`, `onBeforeToggle`/
  `onAfterToggle` → `output()`, and fixed `fieldsetstyle.ts`'s external
  `instance.toggleable()`/`.collapsed()` reads. Caught one self-inflicted
  bug before it shipped: missed converting `{{ legend }}` to `{{ legend() }}`
  in two template spots on the first pass — `tsc` doesn't catch a
  function-in-interpolation the way it caught the `ModelSignal` assignment
  mismatches in the spec file, so this one relied on a manual re-grep of
  the template rather than the type checker.
- **Also done (2026-08-22, continued):** `inplace.ts` — `active`, mutated
  internally by `activate()`/`deactivate()` with no matching `activeChange`
  output (unlike `fieldset`'s `collapsed`), converted to `model(false)`
  anyway since it's the correct signal type for a bindable+internally-set
  input; this adds a new `activeChange` output as a side effect, which is
  additive/non-breaking. Also `closable`, `disabled`, `styleClass`,
  `closeIcon`, `closeAriaLabel` → `input()`; `onActivate`/`onDeactivate`
  `@Output()` → `output()`. **Two things worth flagging for future
  conversions:** (1) `model()` does not accept a `transform` option the way
  `input()` does — `tsc` caught this immediately (`'transform' does not
  exist in type 'ModelOptions'`), so `preventClick` stayed `input()` with
  `booleanAttribute` transform rather than becoming a `model()`. (2) On the
  first pass I defaulted `preventClick` to `input(false, ...)`, but the
  original `@Input()` had no initializer (default `undefined`, confirmed
  by a spec assertion `toBeUndefined()`) — caught by re-checking the spec's
  own default-value test rather than by the compiler, since `false` and
  `undefined` are both valid `boolean|undefined` values and `tsc` has no
  way to know which one is "correct". Fixed to
  `input<boolean, unknown>(undefined, { transform: booleanAttribute })`.
  Also fixed `inplacestyle.ts`'s external `instance.disabled()` read. Its
  spec needed one new input binding added to a test wrapper
  (`TestInplaceKeyboardComponent` had no `[disabled]` binding at all) to
  route a direct-instance write through the wrapper, same pattern as
  `blockui.ts`/`terminal.ts`.
- **Also done (2026-08-22, continued):** `scrolltop.ts` (`styleClass`,
  `style`, `target`, `threshold`, `behavior`, `showTransitionOptions`,
  `hideTransitionOptions`, `buttonAriaLabel`, `buttonProps` → `input()`;
  the write-only `icon` getter/setter → `input()` + `effect()` syncing
  `_icon`, same idiom as `terminal.ts`'s `response`). Its spec had ~10
  direct writes to queried instances across several describe blocks —
  fixed with a mix of the two established patterns depending on what each
  test actually needed: added `[behavior]`/`[icon]` bindings to the shared
  `TestBasicScrollTopComponent` wrapper and routed through
  `fixture.componentInstance.field = x; fixture.detectChanges()` for tests
  that call `onClick()`/lifecycle methods synchronously right after, vs.
  the signal-stub trick (`(scrollTop as any).threshold = () => 0`) for
  pure white-box tests of `checkVisibility()`/`ngOnDestroy()` that don't
  go through a CD cycle at all. Also fixed `scrolltopstyle.ts`'s external
  `instance.target()` read.
- **Also done (2026-08-22, continued):** `toggleswitch.ts` (`styleClass`,
  `tabindex`, `inputId`, `readonly`, `trueValue`, `falseValue`, `ariaLabel`,
  `ariaLabelledBy`, `autofocus` → `input()`; `onChange` → `output()`; `size`
  was already `input()`). No `model()` needed — no two-way pair here.
  `toggleswitchstyle.ts` has no external `instance.field()` reads to fix.
  Its spec's `TestBasicToggleSwitchComponent` wrapper already had template
  bindings for every field it writes directly, so no test-wrapper changes
  were needed beyond the existing `setInput()`/`component.field()` bulk
  conversion.
- **Also done (2026-08-22, continued):** `chart.ts` (`type`, `plugins`,
  `width`, `height`, `responsive`, `ariaLabel`, `ariaLabelledBy` →
  `input()`; `onDataSelect` → `output()`). `data`/`options` had
  side-effecting get/set (`reinit()` on write) → converted to plain
  `input()` plus a constructor `effect()` reading both signals and calling
  `reinit()`, same idiom as `card.ts`'s `style`. No spec file exists for
  this component. Also fixed `chartstyle.ts`'s external
  `instance.width()`/`.height()` reads.
- **Also done (2026-08-22, continued):** `inputotp.ts` (`readonly`, `tabindex`,
  `length`, `styleClass`, `mask`, `integerOnly`, `autofocus` → `input()`;
  `onChange`/`onFocus`/`onBlur` → `output()`; `variant`/`size` were already
  `input()`). No side-effecting setters, no `model()` needed.
  `inputotpstyle.ts` has no external `instance.field()` reads. Its spec
  (`inputotp.spec.ts`) had one direct write, `component.length = 6`, on the
  `InputOtp` fixture root inside a PT test — converted to
  `fixture.componentRef.setInput('length', 6)` plus `instance.length()` in
  the PT callback comparison; this made the block's `component` variable
  dead so it was removed rather than left as an unused declaration. All
  other `component.field = x` writes in the spec were on plain wrapper test
  components with matching template bindings, not on `InputOtp` itself, so
  they needed no changes.
- **Also done (2026-08-22, continued):** `rating.ts` (`readonly`, `stars`,
  `iconOnClass`, `iconOnStyle`, `iconOffClass`, `iconOffStyle`, `autofocus`
  → `input()`; `onRate`/`onFocus`/`onBlur` → `output()`). No side-effecting
  setters — `stars` is only read once in `onInit()` to build `starsArray`,
  matching the original `@Input()`'s non-reactive behavior, so no `effect()`
  needed. Also fixed `ratingstyle.ts`'s external `instance.readonly()` read.
  Its spec (`rating.spec.ts`, 1488 lines — note this file didn't surface in
  an earlier `Glob` lookup for the directory, worth remembering the tool can
  miss files) needed only `ratingInstance.field` → `ratingInstance.field()`
  reads fixed; every `component.field = x` write in the file was on a plain
  wrapper test component with matching template bindings, not on `Rating`
  itself.
- **Also done (2026-08-22, continued):** `chip.ts` — another genuine
  dynamic-write hazard, same shape as `confirmpopup.ts`'s: `chipProps`'s
  setter copies onto `_${k}` shadow fields (safe), but `ngOnChanges` reads
  `simpleChanges.chipProps.currentValue` and does `this.label = ...`,
  `this.icon = ...`, `this.image = ...`, `this.alt = ...`,
  `this.styleClass = ...`, `this.removable = ...`, `this.removeIcon = ...`
  directly — a legacy "spread chipProps onto individual inputs" shim.
  Converting any of those 7 to `input()` would let `ngOnChanges` silently
  replace the signal function with a plain value. **Left all 7, plus the
  `chipProps` get/set itself, as plain `@Input()` intentionally.** Only
  `disabled` (untouched by `ngOnChanges`) was safe to convert → `input()`;
  `onRemove`/`onImageError` → `output()`. Also fixed `chipstyle.ts`'s
  external `instance.disabled()` read. No direct-write issues in
  `chip.spec.ts` (no matches for `.disabled`).
- **Also done (2026-08-22, continued):** `radiobutton.ts` (`value`,
  `tabindex`, `inputId`, `ariaLabelledBy`, `ariaLabel`, `styleClass`,
  `autofocus`, `binary` → `input()`; `onClick`/`onFocus`/`onBlur` →
  `output()`; `variant`/`size` were already `input()`). No hazards. Fixed
  `RadioControlRegistry.select()`'s `accessor.value` (another `RadioButton`
  instance, not `this`) — same read-hazard shape as any external instance
  read, easy to miss since `accessor` isn't named `instance`. No external
  `instance.field()` reads to fix in `radiobuttonstyle.ts`. Its spec
  (1163 lines) needed `radioInstance.field` → `radioInstance.field()` in ~5
  spots; all `component.field = x` writes were on wrapper components. Two
  pre-existing `TS2451` "Cannot redeclare... inputViewChild" errors in the
  spec are unrelated to this conversion (present in the baseline snapshot).
- **Also done (2026-08-22, continued):** `splitter.ts` (`styleClass`,
  `panelStyleClass`, `panelStyle`, `stateStorage`, `stateKey`, `layout`,
  `gutterSize`, `step`, `minSizes` → `input()`; `onResizeEnd`/`onResizeStart`
  → `output()`). `panelSizes`'s get/set had a real side effect (recomputing
  and writing `flexBasis` onto DOM children) → converted to plain `input()`
  plus a constructor `effect()` replicating the same DOM write, same idiom
  as `card.ts`'s `style`/`chart.ts`'s `data`/`options`. Also fixed
  `splitterstyle.ts`'s two external `instance.layout()` reads. Its spec
  needed: `splitterInstance.field` → `.field()` (bulk, ~15 spots) across
  two different local variable names holding a `Splitter` instance
  (`splitterInstance` and a bare `splitter` from `TestBed.createComponent
  (Splitter)` directly — the bulk regex only caught the first name, the
  second needed a manual pass); one `xit`-skipped test's direct
  `ptSplitter.layout = 'vertical'` write (no wrapper binding available for
  that field) fixed via the signal-stub trick even though the test is
  disabled, since `tsc` still type-checks skipped test bodies; and one
  genuine `Object.keys(signal())` narrowing failure where TS didn't narrow
  a repeated `signalCall()` across a null-check — fixed by hoisting the
  call result to a local `const` once.
- **Also done (2026-08-22, continued):** `styleclass.ts` — directive, not a
  component. All 12 `@Input()`s (`selector` aliased as `pStyleClass`,
  `enterFromClass`, `enterActiveClass`, `enterToClass`, `leaveFromClass`,
  `leaveActiveClass`, `leaveToClass`, `hideOnOutsideClick`, `toggleClass`,
  `hideOnEscape`, `hideOnResize`, `resizeSelector`) → `input()`, aliased via
  `input(default, { alias: 'pStyleClass' })`. No hazards, no outputs. One
  `tsc`-caught narrowing issue in `enter()` — repeated `this.enterActiveClass()`
  calls after an `if` guard don't narrow like a property read would — fixed
  by hoisting to a local `const enterActiveClass = this.enterActiveClass()`
  once at the top of the method. Its spec had several direct writes
  (`styleClassInstance.selector = ...`, `resizeInstance.resizeSelector =
  ...`) on wrapper components whose templates hardcode the `pStyleClass`
  selector as a string literal rather than binding it to a field, so there
  was no wrapper property to route through — fixed via the signal-stub
  trick (`(instance as any).field = () => value`) for those two spots.
  Several `instance.field` reads used var names other than the bulk-fixed
  `styleClassInstance` (`animationInstance`, `slidedownInstance`,
  `resizeInstance`) and needed a manual second pass — worth checking for
  multiple differently-named instance variables within one spec file
  before considering a bulk regex pass complete.
- **Also done (2026-08-22, continued):** `colorpicker.ts` (`styleClass`,
  `showTransitionOptions`, `hideTransitionOptions`, `inline`, `format`,
  `tabindex`, `inputId`, `autoZIndex`, `autofocus`, `defaultColor` →
  `input()`; `onChange`/`onShow`/`onHide` → `output()`; `appendTo`/
  `overlayOptions`/`motionOptions` were already `input()`). No hazards.
  Fixed `colorpickerstyle.ts`'s two external `instance.inline()` reads.
  **The spec (74KB, ~1900 lines) was the first file this pass where `tsc`
  reported zero errors despite genuinely broken reads** — every
  `xInstance` variable in the file comes from `.query(...).componentInstance`
  (typed `any`), so comparisons like `expect(colorPickerInstance.format).
  toBe('hex')` and truthy checks like `instance?.inline ? 'A' : 'B'`
  type-check fine against a function value and would have silently always
  taken the truthy branch at runtime. Caught only by grepping for bare
  `.field` reads across every instance-variable name used in the file
  (`colorPickerInstance`, `hexPickerInstance`, `rgbPickerInstance`,
  `hsbPickerInstance`, and `instance?.` inside PT callbacks — the `?.`
  optional-chain form needed its own regex pass, the plain-dot one didn't
  match it) — worth remembering `any`-typed `componentInstance` defeats
  `tsc` verification entirely for this class of bug, so grep is the only
  real check when a spec queries via `By.css`/`By.directive` instead of
  `TestBed.createComponent(TheComponent)`.
- **Also done (2026-08-22, continued):** `dragdrop.ts` — two directives,
  `Draggable` and `Droppable`. Both had a `disabled` get/set with a bind/
  unbind-listener side effect (`pDraggableDisabled`, `pDroppableDisabled`)
  → converted to plain `input(false)` plus a constructor `effect()`
  replicating the same bind/unbind call, same idiom as `blockui.ts`. Plain
  fields (`scope` aliased to `pDraggable`/`pDroppable`, `dragEffect`,
  `dragHandle`, `dropEffect`) → `input()`; all six outputs → `output()`.
  No spec file and no external consumers exist for this directive pair, so
  no further verification needed beyond `tsc`/`eslint`.
- **Also done (2026-08-22, continued):** `metergroup.ts` — two components,
  `MeterGroupLabel` (`value`, `labelPosition`, `labelOrientation`, `min`,
  `max`, `iconTemplate` → `input()`) and `MeterGroup` (`value`, `min`,
  `max`, `orientation`, `labelPosition`, `labelOrientation`, `styleClass`
  → `input()`); no outputs on either. No hazards. `MeterGroupStyle` is
  shared between the two components, so its `root`/`labelList` class
  functions each read a different instance's fields — fixed
  `instance.orientation()` (reads `MeterGroup`) and
  `instance.labelOrientation()` (reads `MeterGroupLabel`) separately. Its
  spec had a `newMeterGroup` variable (from `.query().componentInstance`,
  typed `any`) that a bulk regex on `meterGroup` (the more common var name)
  missed — same "differently-named instance variable" lesson as
  `styleclass.ts`/`colorpicker.ts`; three `meterGroup.field = value`
  writes (`.value = undefined as any`, `.value = null as any`,
  `.orientation = 'vertical'`) had no wrapper binding available for those
  exact values, fixed via the signal-stub trick.
- **Also done (2026-08-22, continued):** `panel.ts` — second true `model()`
  conversion of this pass: `collapsed`/`collapsedChange` was a get/set
  `@Input` + matching `@Output`, converted to `collapsed = model<boolean |
  undefined>(undefined)`; `expand()`/`collapse()` now do
  `this.collapsed.set(...)` instead of mutating a `_collapsed` backing
  field and manually emitting. The backing field's removal broke
  `panelstyle.ts`'s external `instance._collapsed` reads (it no longer
  exists) — fixed to `instance.collapsed()`. Also converted `id`
  (straightforward default-value input, no self-mutation like `dock.ts`'s
  `id` needed), `toggleable`, `_header` (aliased `header`), `styleClass`,
  `iconPos`, `showHeader`, `toggler`, `transitionOptions`,
  `toggleButtonProps` → `input()`; `onBeforeToggle`/`onAfterToggle` →
  `output()`. Its spec (59KB) needed the widest fix of this pass: dozens of
  `panel.field = x` / `panelInstance.field` spots across ~15 `describe`
  blocks, several using `any`-typed `.componentInstance` (not tsc-checked)
  so required grepping every field name across every instance-variable
  name in the file rather than trusting a clean `tsc` run — direct
  `.collapsed = true/false` writes converted to `.collapsed.set(...)`
  (works cleanly since `ModelSignal` exposes `.set()`, unlike a plain
  `input()`); a handful of unused `const panel = fixture.componentInstance`
  declarations left behind after switching their only reads to
  `fixture.componentRef.setInput(...)` had to be deleted to satisfy
  `no-unused-vars`.
- **Also done (2026-08-22, continued):** `popover.ts` (`ariaLabel`,
  `ariaLabelledBy`, `dismissable`, `style`, `styleClass`, `autoZIndex`,
  `ariaCloseLabel`, `baseZIndex`, `focusOnShow`, `showTransitionOptions`,
  `hideTransitionOptions` → `input()`; `onShow`/`onHide` → `output()`;
  `appendTo`/`motionOptions` were already `input()`). No hazards. No
  external `instance.field()` reads in `popoverstyle.ts`. Its spec needed
  the widest bulk-plus-manual fix pattern of this batch: most
  `popoverInstance.field` reads were bulk-converted, but `style` needed
  hand-fixing separately (non-null-asserted `!` accesses and a
  `Object.keys(instance.style)` narrowing issue, same idiom as
  `splitter.spec.ts`'s `panelStyleValue` fix — hoisted to a local
  `styleValue` const); a pre-existing, unrelated `appendTo` bare read
  (`expect(popoverInstance.appendTo).toBeTruthy()` — `appendTo` was
  already `input()` before this session) was fixed opportunistically while
  in the file. One pre-existing `TS2554` (`onEscapeKeydown(escapeEvent)`
  called with an argument the zero-arg method doesn't accept) is unrelated
  to this conversion, confirmed present in the baseline snapshot.
- **Also done (2026-08-22, continued):** `slider.ts` (`animate`, `min`,
  `max`, `orientation`, `step`, `range`, `styleClass`, `ariaLabel`,
  `ariaLabelledBy`, `tabindex`, `autofocus` → `input()`;
  `onChange`/`onSlideEnd` → `output()`). No hazards, but the heaviest
  single-file template rewrite of this batch — the template branches on
  `range`/`orientation` ~10 times across 4 near-duplicate handle/range
  `@if` blocks. One `tsc`-caught narrowing issue in
  `decrementValue()`/`incrementValue()`: repeated `this.step()` calls
  after an `if (this.step())` guard don't narrow — fixed by hoisting to a
  local `const step = this.step()` once per method, same idiom as
  `styleclass.ts`'s `enterActiveClass`. Fixed `sliderstyle.ts`'s three
  external `instance.orientation()`/`.animate()` reads. Its spec (58KB)
  is the first file this pass where the fixture root itself
  (`fixture = TestBed.createComponent(Slider); component =
  fixture.componentInstance;`) was directly written to dozens of times
  across ~15 `describe` blocks — resolved with a single bulk script that
  rewrote every `component.field = value;` to
  `fixture.componentRef.setInput('field', value);` before the usual
  bare-read pass, since a plain read-only regex would have left ~60
  `tsc` errors. Three pre-existing, unrelated `TS2554` errors (extra
  argument passed to a zero-arg method) confirmed present in the baseline.
- **Also done (2026-08-22, continued):** `message.ts` (`severity`, `text`,
  `escape`, `style`, `styleClass`, `closable`, `icon`, `closeIcon`, `life`,
  `showTransitionOptions`, `hideTransitionOptions`, `size`, `variant` →
  `input()`; `onClose` → `output()`; `motionOptions` was already
  `input()`). No hazards. Fixed `messagestyle.ts`'s external
  `instance.severity()`/`.variant()`/`.size()` reads. Its spec (71KB) had
  a `messageInstance: Message`-typed variable whose ~18 bare
  `.field`/`.toBe(...)` reads still weren't caught by `tsc` (same
  `toBe`-accepts-`any` blind spot as `panel.spec.ts`) — bulk-fixed with a
  field-name loop, `style` handled separately for its `!`-asserted spots.
  The PT-test blocks further down already used
  `fixture.componentRef.setInput(...)` throughout, so no direct-write
  fixes were needed there. `fileupload.ts` is the only external consumer
  and only uses `<p-message>` via template bindings, not direct instance
  field access, so it needs no changes.
- **Also done (2026-08-22, continued):** `selectbutton.ts` — another
  genuine dynamic-write hazard: `unselectable`'s setter did
  `this.allowEmpty = !value`, directly overwriting the `allowEmpty` field
  from within a sibling input's setter (same shape as `chip.ts`'s
  `chipProps`/`confirmpopup.ts`'s `this[key] =`). Resolved differently
  from the "leave as plain `@Input()`" precedent this time, since both
  sides were simple booleans with only one call site: converted both
  `unselectable` and `allowEmpty` to plain `input()`, deleted the setter
  entirely, and moved the override logic into `getAllowEmpty()` (`if
  (this.unselectable()) return false; ...`) — the only place `allowEmpty`
  was ever read. This is a deliberate, documented behavior clarification:
  previously, whichever of `[unselectable]`/`[allowEmpty]` bound *last* in
  change-detection order silently won; now `unselectable` always takes
  precedence deterministically, which matches every existing caller's
  intent (nobody sets both to conflicting values). All other fields
  (`options`, `optionLabel`, `optionValue`, `optionDisabled`, `tabindex`,
  `multiple`, `styleClass`, `ariaLabelledBy`, `dataKey`, `autofocus`) →
  `input()`; `onOptionClick`/`onChange` → `output()`; `size`/`fluid` were
  already `input()`. No external `instance.field()` reads in
  `selectbuttonstyle.ts`. Its spec needed the same fixture-root bulk
  rewrite as `slider.spec.ts`, but with a wrinkle: two other `describe`
  blocks (`SelectButton pTemplate Tests`, `SelectButton #template
  Reference Tests`) reuse the identifier `component` for an unrelated
  wrapper component with its own plain `options`/`selectedValue` fields —
  the first bulk pass wrongly rewrote those too (`component.options` →
  `component.options()`, breaking "not callable" errors), caught only by
  rerunning `tsc` and required a scoped line-range revert. Six further
  direct writes on separately-named fixture roots
  (`globalComponent.options = [...]`, `hookComponent.options = [...]`)
  needed individual `setInput` conversions, which then left both var
  declarations unused and requiring deletion.
- **Also done (2026-08-22, continued):** `togglebutton.ts` (`onLabel`,
  `offLabel`, `onIcon`, `offIcon`, `ariaLabel`, `ariaLabelledBy`,
  `styleClass`, `inputId`, `tabindex`, `iconPos`, `autofocus`, `size`,
  `allowEmpty` → `input()`; `onChange` → `output()`; `fluid` was already
  `input()`). No hazards — `checked` stays a plain field (not an `@Input`).
  Fixed `togglebuttonstyle.ts`'s two external `instance.size()` reads. Its
  spec had ~11 bare `toggleButtonInstance.field` reads (typed
  `ToggleButton`, still not `tsc`-caught since `.toBe()` accepts `any`) —
  bulk-fixed. Five pre-existing, unrelated `TS2449` "used before
  declaration" errors confirmed present in the baseline. `selectbutton.ts`
  is the only external consumer and only binds `<p-togglebutton>` via
  template properties, not direct instance access, so needs no changes.
- **Also done (2026-08-22, continued):** `editor.ts` — `readonly`'s get/set
  had a real side effect (calling Quill's `.disable()`/`.enable()`) →
  converted to plain `input(false)` plus a constructor `effect()`
  replicating the call, same idiom as `dragdrop.ts`. Plain fields
  (`style`, `styleClass`, `placeholder`, `formats`, `modules`, `bounds`,
  `scrollingContainer`, `debug`) → `input()`; all six outputs →
  `output()`, including `onEditorInit` which keeps its
  `@Output('onInit')` alias via `output({ alias: 'onInit' })`. No
  external `instance.field()` reads in `editorstyle.ts`, no external
  consumers. Its spec needed the usual bare-read bulk fix plus one
  `style` narrowing fix (hoisted to a local `styleValue` const, by-now a
  recurring pattern across `splitter`/`popover`/`message`/`panel` specs).
  **One test (`'should disable editor when readonly is true'`) has a
  known, documented limitation**: it previously worked by monkeypatching
  a stubbed setter, but an `effect()` only reacts to real signal writes,
  not to reassigning `instance.field` to a new closure — the signal-stub
  trick (`(instance as any).field = () => value`) that worked for plain
  `input()` reads throughout this pass does NOT trigger effects, so this
  test no longer meaningfully exercises the readonly→disable/enable wiring
  even though it still compiles and passes. Flagged here rather than
  silently left broken; a proper fix would need `TestBed.createComponent`
  + `fixture.componentRef.setInput('readonly', ...)` on a component that
  binds it, which the existing `TestReadonlyComponent` wrapper (hardcoded
  `[readonly]="true"`) doesn't support without further changes.
- **Also done (2026-08-22, continued):** `knob.ts` (`styleClass`,
  `ariaLabel`, `ariaLabelledBy`, `tabindex`, `valueColor`, `rangeColor`,
  `textColor`, `valueTemplate`, `size`, `min`, `max`, `step`,
  `strokeWidth`, `showValue`, `readonly` → `input()`; `onChange` →
  `output()`). No hazards — every field is read-only inside the class
  (the internal `value` signal handles all mutable state). No external
  `instance.field()` reads in `knobstyle.ts`, no external consumers. Its
  spec had ~16 bare `knobInstance.field` reads (no writes) — bulk-fixed.
- **Also done (2026-08-22, continued):** `organizationchart.ts` — two
  components, both still on `ChangeDetectionStrategy.Default` (relevant to
  item #4's later audit — untouched here, only the input/output API
  changed). `OrganizationChartNode` (`node`, `root`, `first`, `last`,
  `collapsible` → `input()`, no outputs) had a fully recursive template
  (`<table pOrganizationChartNode [node]="child" [collapsible]="...">`
  nested arbitrarily deep) — every `node`/`collapsible` reference across
  ~25 template spots needed `()`. `OrganizationChart`'s
  `selection`/`selectionChange` was a genuine two-way pair with a side
  effect (`if (this.initialized) this.selectionSource.next(null)` inside
  the old setter) → third `model()` conversion of this pass, with the
  side effect moved into a constructor `effect()` that reads
  `this.selection()` and fires `selectionSource.next(null)` when
  initialized — the manual `this.selectionChange.emit(...)` and the
  redundant manual `selectionSource.next(null)` call at the end of
  `onNodeClick()` were both deleted since `model().set()` and the new
  effect now cover them respectively. `value`, `styleClass`,
  `selectionMode`, `collapsible`, `preserveSpace` → `input()`;
  `onNodeSelect`/`onNodeUnselect`/`onNodeExpand`/`onNodeCollapse` →
  `output()`. Fixed `organizationchartstyle.ts`'s three external
  `instance.preserveSpace()`/`.selectionMode()`/`.node()` reads. Its spec
  needed `organizationChart.selection = x` → `.selection.set(x)` (six
  spots, `ModelSignal` exposes `.set()` same as `panel.spec.ts`) plus the
  usual bare-read bulk fix; no direct writes found on
  `OrganizationChartNode` instances.
- **Also done (2026-08-22, continued):** `tooltip.ts` — the biggest
  architectural change of this pass, not just a per-field swap. The whole
  directive synced its ~17 `@Input()`s into a single `_tooltipOptions` bag
  through one giant `ngOnChanges(simpleChange: SimpleChanges)` that
  checked `simpleChange.<field>` per input. **Signal inputs never appear
  in `SimpleChanges` and never trigger `ngOnChanges`** — converting the
  inputs without touching this would have silently stopped every option
  from ever syncing. Deleted `onChanges()` entirely and replaced it with
  five constructor `effect()`s: (1) one bulk effect reading all 15
  simple-value inputs and calling `setOption()` with an object that has
  `undefined` keys stripped before merging (needed because an unbound
  `input()` always evaluates to its default — usually `undefined` — and a
  raw merge would have overwritten `_tooltipOptions`' own hardcoded
  defaults like `appendTo: 'body'`, which `ngOnChanges` only did when the
  input was actually bound); (2) a `disabled`-only effect replicating the
  old setter's unconditional `this.deactivate()` call; (3) a `content`
  effect preserving the original's "if `active`, re-show/update/hide"
  branch; (4) a `tooltipOptions`-merge effect with the same re-show
  branch. `disabled` itself (previously a `@Input('tooltipDisabled')`
  get/set with a `deactivate()` side effect) converted to a plain
  `input(false, { alias: 'tooltipDisabled', transform: booleanAttribute
  })` — needed an `eslint-disable-next-line @angular-eslint/no-input-rename`
  comment, same as `panel.ts`'s `_header`/`header`. `content` similarly
  aliased to `pTooltip`. All other simple fields → plain `input()`.
  `getOption()`'s `keyof typeof this.tooltipOptions` cast broke once
  `tooltipOptions` became a function (`typeof` of a function has no
  useful keys) — fixed to `keyof TooltipOptions` against the actual
  imported type. `_tooltipOptions` needed an explicit `Record<string,
  any>` type annotation; without it, merging the now strictly-typed
  `TooltipOptions` shape into the object-literal-inferred type failed
  `tsc`. No external `instance.field()` reads in `tooltipstyle.ts`. 14
  files apply `[pTooltip]` but none read `Tooltip` instance fields
  directly. Its spec had bare `tooltipDirective.field` reads (no writes)
  bulk-fixed; six pre-existing, unrelated `TS2554` errors (extra argument
  to zero-arg handler methods) confirmed present in the baseline.
- **Also done (2026-08-22, continued):** `drawer.ts` — fourth `model()`
  conversion of this pass: `visible`/`visibleChange` was a get/set
  `@Input`+`@Output` pair with a side effect (`if (this._visible &&
  !this.modalVisible) this.modalVisible = true`), converted to
  `visible = model(false)` plus a constructor `effect()` replicating the
  same guard. `show()`/`close()` used to call `this.visibleChange.emit(...)`
  directly — switched to `this.visible.set(...)`, which auto-emits via the
  model. All other fields (`blockScroll`, `style`, `styleClass`,
  `ariaCloseLabel`, `autoZIndex`, `baseZIndex`, `modal`,
  `closeButtonProps`, `dismissible`, `showCloseIcon`, `closeOnEscape`,
  `transitionOptions`, `header`, `maskStyle`, `closable`) → `input()`;
  `onShow`/`onHide` → `output()`; `appendTo`/`motionOptions`/`position`/
  `fullScreen` were already `input()`. Fixed `drawerstyle.ts`'s three
  external `instance.modal()`/`.visible()` reads. No external consumers.
  Its spec had one direct `.visible = true` write on a typed fixture root
  (caught by `tsc` as `ModelSignal` mismatch, fixed to `.visible.set(true)`)
  plus ~30 bare reads across two instance-variable names (`component`,
  `drawerComponent`) — bulk-fixed with a two-variable loop, all backed by
  wrapper components with matching template bindings so no signal-stub
  writes were needed.
- **Also done (2026-08-22, continued):** `image.ts` (`imageClass`,
  `imageStyle`, `styleClass`, `src`, `srcSet`, `sizes`, `previewImageSrc`,
  `previewImageSrcSet`, `previewImageSizes`, `alt`, `width`, `height`,
  `loading`, `preview`, `showTransitionOptions`, `hideTransitionOptions`
  → `input()`; `onShow`/`onHide`/`onImageError` → `output()`;
  `modalEnterAnimation`/`modalLeaveAnimation`/`appendTo`/
  `maskMotionOptions`/`motionOptions` were already `input()`). No
  hazards. Fixed `imagestyle.ts`'s external `instance.preview()` read. No
  external consumers. Its spec had a direct `component.src = ...` write
  (×4 fields) on the `Image` fixture root, fixed via `setInput`, plus the
  usual bare-read bulk fix across two instance-variable names
  (`component`, `imageInstance`).
- **Also done (2026-08-22, continued):** `menu.ts` — two components,
  `MenuItemContent` (`item` aliased to `pMenuItemContent`, `itemTemplate`,
  `menuitemId`, `idx` → `input()`; `onMenuItemClick` → `output()`; heaviest
  single-template rewrite this pass at ~25 `item()` call sites, all needing
  `!` non-null assertions since `item` can be `undefined`) and `Menu`
  itself. `Menu`'s `id` had the same self-mutating-default hazard as
  `dock.ts`/`panel.ts` (`this.id = this.id || uuid('pn_id_')` in the
  constructor) → `id = input<string>()` plus `_generatedId`/`resolvedId`
  getter, with every template and internal `id`/`this.id` reference
  switched to `resolvedId`. `model`, `popup`, `style`, `styleClass`,
  `autoZIndex`, `baseZIndex`, `showTransitionOptions`,
  `hideTransitionOptions`, `ariaLabel`, `ariaLabelledBy`, `tabindex` →
  `input()`; `onShow`/`onHide`/`onBlur`/`onFocus` → `output()`;
  `appendTo`/`motionOptions` were already `input()`. One `tsc`-caught
  fix: `onFocus.emit()` with no argument (worked under the old loose
  `EventEmitter<Event>` typing) now needs an argument for
  `OutputEmitterRef<Event>` — passed `originalEvent`. Fixed
  `menustyle.ts`'s two external `instance.popup()` reads. No external
  consumers. Its spec needed the resolved-vs-raw-id distinction handled
  carefully: two tests asserting the auto-generated fallback
  (`toMatch(/^pn_id_/)`) had to move from `.id` to `.resolvedId`, since
  the raw `id()` input signal is `undefined` when unbound and only
  `resolvedId` carries the generated fallback; a third test asserting an
  explicitly-bound id value stayed on `.id()`. Otherwise the usual
  bare-read bulk fix across four instance-variable names (`menuInstance`,
  `freshMenu`, `instance`, `submenuInstance`) plus one `style` narrowing
  fix. Ten pre-existing, unrelated `TS2449` "used before declaration"
  errors confirmed present in the baseline.
- **Also done (2026-08-22, continued):** `carousel.ts` — second file this
  pass (after `tooltip.ts`) built around a mega `ngOnChanges(SimpleChanges)`
  that had to be deleted and replaced with constructor `effect()`s, since
  signal inputs never appear in `SimpleChanges`. Four fields
  (`page`/`numVisible`/`numScroll`/`value`) had get/set pairs with real
  side effects: `page`'s setter drove navigation (`step()`) when the bound
  value changed outside internal navigation; `numVisible`/`numScroll`
  mirrored into `_numVisible`/`_numScroll` backing fields that the rest of
  the class reads directly; `value`'s change triggered
  `setCloneItems()` when circular. All four converted to plain `input()`
  with dedicated effects reproducing the exact old branching (including
  the `isCreated`/`autoplayInterval` guards from the deleted `page`
  setter). **Preserved a genuine pre-existing bug on purpose**: the old
  `numScroll` *getter* returned `_numVisible`, not `_numScroll` — two
  internal read sites (`this.numScroll` in the constructor and in the
  `onChanges` numScroll branch) silently got the wrong value. Since a
  signal input can't replicate a buggy getter without breaking the
  signal's own contract, those two *internal* call sites were switched to
  read `this._numVisible`/`this.numVisible()` directly (bug preserved for
  internal computation), but the *external* `numScroll()` signal itself
  now correctly returns its own bound value — a deliberate, documented
  behavior fix for any external code reading `.numScroll()`, called out
  with a comment at both the effect and the one spec assertion that
  exercised it. `_value`/its getter/setter were removed entirely in favor
  of the `value` input signal read via `this.value()` everywhere (~20
  call sites); several methods needed a local `const value = this.value()`
  hoist to satisfy `tsc`'s narrowing across repeated calls
  (`onAfterContentChecked`, `setCloneItems`, `totalDots`, `isCircular`,
  `isEmpty`), same pattern as `styleclass.ts`/`slider.ts`. All read-only
  fields (`responsiveOptions`, `orientation`, `verticalViewPortHeight`,
  `contentClass`, `indicatorsContentClass`, `indicatorsContentStyle`,
  `indicatorStyleClass`, `indicatorStyle`, `circular`, `showIndicators`,
  `showNavigators`, `autoplayInterval`, `styleClass`, `prevButtonProps`,
  `nextButtonProps`) → `input()`; `onPage` → `output()`. `id` stays a
  plain field (self-generated once in `onAfterContentInit`, never bound
  as an `@Input`, so no hazard). Fixed `carouselstyle.ts`'s three external
  `instance.value()`/`.indicatorsContentClass()`/`.indicatorStyleClass()`
  reads. No external consumers. Its spec needed the widest mix of fix
  patterns yet: direct fixture-root `setInput` conversions, signal-stub
  writes for white-box method tests, and one assertion rewritten (with an
  explanatory comment) to match the now-correct `numScroll()` value
  instead of the old buggy one.
- **Also done (2026-08-22, continued):** `checkbox.ts` — first
  `hostName`-bearing component converted this pass (the `$hostName`
  getter fix in `basecomponent.ts` earlier in this session made this
  safe). `indeterminate` synced into an internal `_indeterminate` signal
  via `ngOnChanges`, the same signal-inputs-don't-fire-`ngOnChanges`
  hazard as `tooltip.ts`/`carousel.ts` but scoped to a single field →
  deleted `onChanges()`, replaced with one constructor `effect()` calling
  `this._indeterminate.set(this.indeterminate())`. All other fields
  (`hostName`, `value`, `binary`, `ariaLabelledBy`, `ariaLabel`,
  `tabindex`, `inputId`, `inputStyle`, `styleClass`, `inputClass`,
  `formControl`, `checkboxIcon`, `readonly`, `autofocus`, `trueValue`,
  `falseValue`) → `input()`; `onChange`/`onFocus`/`onBlur` → `output()`;
  `variant`/`size` were already `input()`. No external
  `instance.field()` reads in `checkboxstyle.ts` (`instance.checked` is
  an unrelated getter). Five external consumers
  (`listbox`/`multiselect`/`table`/`tree`/`treetable`) only bind
  `<p-checkbox>` via template properties or reference `Checkbox`'s own
  `viewChild`/`inputViewChild` signals, not the converted fields
  directly, so none needed changes. Its spec (61KB) had ~15 bare
  `checkboxInstance.field` reads (no writes) — bulk-fixed, `inputStyle`
  handled separately for its narrowing/`!`-assertion spots.
- **Also done (2026-08-22, continued):** `paginator.ts` — third file
  needing full `ngOnChanges` deletion (after `tooltip.ts`/`carousel.ts`):
  five branches (`totalRecords`/`first`/`rows`/`rowsPerPageOptions`/
  `pageLinkSize`) each replaced 1:1 with a dedicated constructor
  `effect()` reproducing the exact same call combinations
  (`updatePageLinks()`/`updatePaginatorState()`/`updateFirst()`/
  `updateRowsPerPageOptions()`). `first` had a trivial get/set proxy over
  `_first` (no side effect) → converted to plain `input(0)` + its own
  sync effect (`this._first = this.first()`); every internal method that
  previously read the `first` getter now reads `_first` directly
  (`changePage`, `updateFirst`, `getPage`, `updatePaginatorState`,
  `currentPageReport`), matching the established getter-elimination
  pattern from `dock.ts`/`panel.ts`/`menu.ts`. **`rows` converted to
  `model<number>(0)` instead of plain `input()`** — a new variant of the
  "no matching `@Output` but must stay writable" pattern: its own
  template two-way-binds it via `[(ngModel)]="rows"` on the internal
  rows-per-page `<p-select>`, and Angular's built-in signal two-way-bind
  sugar for `[(ngModel)]` requires a `WritableSignal` (which `model()`
  produces and `input()` does not) — no external `rowsChange` output
  exists or was added, this is purely to keep the dropdown's own
  selection-writeback working. All other fields (`pageLinkSize`,
  `styleClass`, `alwaysShow`, `dropdownAppendTo`, `templateLeft`,
  `templateRight`, `dropdownScrollHeight`, `currentPageReportTemplate`,
  `showCurrentPageReport`, `showFirstLastIcon`, `totalRecords`,
  `rowsPerPageOptions`, `showJumpToPageDropdown`, `showJumpToPageInput`,
  `jumpToPageItemTemplate`, `showPageLinks`, `locale`,
  `dropdownItemTemplate`) → `input()`; `onPageChange` → `output()`. No
  external `instance.field()` reads in `paginatorstyle.ts` (only method
  calls). Only external consumer checked this pass, `dataview.ts`, binds
  `<p-paginator>` purely through template property bindings — no direct
  instance-field reads, no changes needed (`table.ts`/`treetable.ts`
  still pending their own turn in the queue). Spec (1.4K lines) needed
  the widest mix yet: (a) ~30 bare `paginator.field` reads → `.field()`;
  (b) ~15 direct `paginator.field = value` writes on the queried child
  instance → rewritten to `component.field = value; fixture.detectChanges();`
  on the WRAPPER test component instead (since the wrapper's own plain
  fields feed the child via real template property bindings, this is
  more correct than a signal-stub and actually exercises the new
  constructor effects); (c) three tests called
  `paginator.ngOnChanges({...})` directly to simulate the old
  `SimpleChanges`-driven update path — now dead code since `ngOnChanges`
  no longer does anything meaningful, rewritten to
  `component.field = value; fixture.detectChanges();` so they exercise
  the real effect-based path instead; (d) one `testPaginator` instance
  had no type annotation (inferred `any` from `.componentInstance`), so
  `tsc` silently allowed writing raw values onto its input functions
  without erroring — caught only by manual audit, fixed the same way via
  a newly-added `testComponent` wrapper reference. One pre-existing
  unrelated `TS2554` (`paginator.onRppChange(new Event('change'))`
  against a 0-arg method, present before this conversion too) confirmed
  in baseline and left alone.
- **Also done (2026-08-22, continued):** `toast.ts` — two components in one
  file, both fully converted. `ToastItem`: `message`, `index`
  (`numberAttribute` transform), `life`, `template`, `headlessTemplate`,
  `showTransformOptions`, `hideTransformOptions`, `showTransitionOptions`,
  `hideTransitionOptions`, `motionOptions`, `clearAll` → `input()`;
  `onAnimationStart`/`onAnimationEnd`/`onClose` → `output()`. No hazards —
  every field is a plain read in template/methods, no `ngOnChanges`. Every
  `message.foo`/`message?.foo` template and method reference switched to
  `message()?.foo` (the field itself is nullable, so all reads now go
  through the optional-chain form even where the original inconsistently
  omitted it). `Toast`: `key`, `autoZIndex`, `baseZIndex`, `life`,
  `styleClass`, `preventOpenDuplicates`, `preventDuplicates`,
  `showTransformOptions`, `hideTransformOptions`, `showTransitionOptions`,
  `hideTransitionOptions`, `breakpoints` → `input()`; `onClose` →
  `output()`. `position` had a get/set pair whose only side effect was an
  explicit `this.cd.markForCheck()` — redundant once it's a signal input
  (OnPush automatically schedules CD on signal-input changes), so
  converted to a plain `input<ToastPositionType>('top-right')` and the
  `_position` backing field was deleted entirely (its one remaining
  consumer, `toaststyle.ts`, updated to call `instance.position()`
  instead). Fixed four other external `instance.message.*` reads and one
  `instance._position` read in `toaststyle.ts` — note `toaststyle.ts`'s
  `classes` object is shared across both components in one file
  (`root`/`message`/`messageIcon`/`closeIcon` functions each receive
  whichever instance actually renders that class), same pattern as
  before, unchanged. No external consumers. Spec (2268 lines, two
  `describe` blocks) needed: for `Toast`, ~20 bare `toastInstance.field`
  reads on the queried child instance → `.field()` (writes were already
  fine since they land on the wrapper test components' own plain fields,
  bound via real template properties); for `ToastItem` — created directly
  via `TestBed.createComponent(ToastItem)`, i.e. `component` here IS the
  fixture root — ~78 direct `component.field = value` writes (including
  17 multi-line object-literal assignments) → bulk-converted via a
  brace-balance-aware script to `fixture.componentRef.setInput('field',
  value)`, plus ~8 bare reads on the same instance → `.field()`.
- **Also done (2026-08-22, continued):** `inputmask.ts` — two exported
  units in one file. `InputMaskDirective` was already fully
  signal-converted from an earlier session; only `InputMask` (the
  component) needed work this pass. `mask` had a get/set pair with real
  side effects (`initMask()`, `writeValue('')`, `onModelChange(value)`) →
  converted to plain `input<string | undefined | null>()` + a constructor
  `effect()` guarded the same way as the directive's own pre-existing
  `pInputMask` effect (`if (maskValue) { ... }`), so an unbound `mask`
  input still produces zero side effects at startup, matching the old
  unbound-setter-never-fires behavior. The `_mask` backing field was
  deleted; every internal method that referenced `this.mask` (`initMask`,
  the `pos == this.mask?.replace(...)` check in `onInputFocus`) now
  reads `this.mask()`, with `initMask()` hoisting it to a local `const`
  since it's read multiple times in the method body. All other fields
  (`type`, `slotChar`, `autoClear`, `showClear`, `style`, `inputId`,
  `styleClass`, `placeholder`, `tabindex`, `title`, `ariaLabel`,
  `ariaLabelledBy`, `ariaRequired`, `readonly`, `unmask`,
  `characterPattern`, `autofocus`, `autocomplete`, `keepBuffer`) →
  `input()`; `onComplete`/`onFocus`/`onBlur`/`onInput`/`onKeydown`/
  `onClear` → `output()`. Two of those (`onComplete`, `onClear`) are
  typed `output<any>()`, and several call sites did `.emit()` with zero
  arguments (tolerated by the old loose `EventEmitter<any>` but not by
  `OutputEmitterRef<any>.emit()`, same class of fix as menu.ts's
  `onFocus.emit()` earlier) — fixed by passing `undefined` explicitly at
  all five call sites. No external `instance.field()` reads in
  `inputmaskstyle.ts` (only `instance.$variant()`, a getter). No
  external consumers. Spec (2132 lines) has the `InputMask` component
  created directly as the fixture root (`TestBed.createComponent(InputMask)`,
  `component = fixture.componentInstance`) across the whole outer
  `describe('InputMask', ...)` block (~1500 lines, several nested
  fixtures for wrapper/template/directive scenarios coexist but only
  this one direct instance needed fixing) — ~15 direct
  `component.field = value` writes → brace-balance-aware bulk script to
  `fixture.componentRef.setInput(...)`, one of which had a trailing
  `// comment` after its semicolon that broke the script's line-end
  detection and mangled two adjacent statements into invalid syntax,
  caught immediately by `tsc` and fixed by hand; ~13 bare
  `component.field` reads → `.field()`. The separate
  `describe('InputMaskDirective', ...)` block below it was already
  correct (that directive was converted in an earlier session).
- **Also done (2026-08-22, continued):** `overlay.ts` — completed the
  interrupted migration: `visible`/`visibleChange` is now `model(false)`;
  all other inputs use `input()` (including the option-merging accessors,
  which retain their existing public property API); all event emitters use
  `output()`. A constructor `effect()` preserves the former `visible`
  setter's modal-visibility side effect. The overlay template and the PT
  test instance access now unwrap `visible()` correctly. `tsc --noEmit`
  reports no Overlay errors; its only remaining error is the pre-existing
  generated MCP-data type mismatch in `packages/mcp/src/index.ts`.
- **Also done (2026-08-22, continued):** `overlay.ts` — mid-session the
  repo's package directory was renamed from `packages/primeng` to
  `packages/ngx-prime` (paths below now reflect the new location); no
  functional impact, work continued uninterrupted. `visible` paired with
  `visibleChange` → **fifth `model()` conversion**; its only side effect
  (auto-setting `modalVisible = true`) moved into a constructor
  `effect()`. **New variant of a previously-unseen hazard**: eleven
  fields (`mode`, `style`, `styleClass`, `contentStyle`,
  `contentStyleClass`, `target`, `autoZIndex`, `baseZIndex`,
  `showTransitionOptions`, `hideTransitionOptions`, `listener`,
  `responsive`) each had a get/set pair whose GETTER merges the bound
  value with a fallback chain (`this.config?.overlayOptions`, the
  `responsive`-driven `overlayResponsiveOptions`, etc.) — the return
  value depends on more than just the bound input, so a plain `input()`
  can't replace the getter outright. Resolved by keeping each as a
  genuine instance **getter**, but backing it with a private aliased
  `input()` instead of a manually-assigned field: e.g. `private _mode =
  input<...>(undefined, { alias: 'mode' })` plus `get mode() { return
  this._mode() || this.overlayOptions?.mode; }` — the public getter API
  is byte-for-byte unchanged (external consumers and the template still
  read `this.mode`/`this.style` etc. with no `()`), only the backing
  storage changed from a plain field to a signal read internally. This
  is a new pattern for this migration — distinct from both "plain
  `input()`" and "leave as `@Input()`" — worth reusing wherever a
  merge-style getter/setter pair shows up again. `options` had no merge
  logic in its getter (trivial passthrough) → straightforward plain
  `input()`. `hostName` → plain `input('')`. All nine `@Output()`s
  (`onBeforeShow`/`onShow`/`onBeforeHide`/`onHide`/`onAnimationStart`/
  `onAnimationDone`/`onBeforeEnter`/`onEnter`/`onAfterEnter`/
  `onBeforeLeave`/`onLeave`/`onAfterLeave` — twelve, not nine) were
  already `output()` and the constructor/effect were already in place by
  the time this file was reached, confirmed via full recompile rather
  than redone. No hazardous external `instance.field()` reads in
  `overlaystyle.ts` (only `instance.modal`/`.overlayResponsiveDirection`,
  both getters, unaffected). Seven external consumers
  (`autocomplete`/`cascadeselect`/`colorpicker`/`multiselect`/`password`/
  `select`/`treeselect`) all reach `Overlay` only through
  `overlayViewChild()` method calls (`alignOverlay()`) or nested
  `.el.nativeElement`/`.overlayViewChild()?.nativeElement` navigation —
  none read `.visible`/`.mode`/`.style`/etc. as instance properties, so
  none needed changes. Spec file was already fully converted (uses
  `fixture.componentRef.setInput('visible', ...)` on wrapper components
  throughout, and the one direct read is `instance?.visible?.()`) —
  confirmed clean via `tsc`, no further edits needed.
- **Also done (2026-08-22, continued):** `speeddial.ts` — `visible` paired
  with a legacy DUAL emit (`onVisibleChange` AND `visibleChange`, both
  firing the same boolean) → **sixth `model()` conversion**; its
  bind/unbind-document-click-listener side effect moved into a
  constructor `effect()`, the redundant `visibleChange` field was
  deleted entirely (a `model()`'s own implicit change output covers it
  when bound via `[(visible)]`), and `onVisibleChange` was kept as a
  separate manual `output()` since it's a distinct public name.
  `show()`/`hide()` switched from `this._visible = true/false` to
  `this.visible.set(...)`, keeping their existing explicit
  `bindDocumentClickListener()`/`unbindDocumentClickListener()` calls
  even though the new effect now also fires those (harmless — both are
  idempotent, guarded by `if (!this.documentClickListener)`). `id` had
  the same self-mutating-default hazard as dock.ts/panel.ts/menu.ts →
  `_generatedId`/`resolvedId` pattern; every internal/template reference
  switched to `resolvedId`. All other fields (`model`, `style`,
  `className`, `direction`, `transitionDelay`, `type`, `radius`, `mask`,
  `disabled`, `hideOnClickOutside`, `buttonStyle`, `buttonClassName`,
  `maskStyle`, `maskClassName`, `showIcon`, `hideIcon`,
  `rotateAnimation`, `ariaLabel`, `ariaLabelledBy`, `tooltipOptions`,
  `buttonProps`) → `input()`; `onClick`/`onShow`/`onHide` → `output()`.
  `onShow`/`onHide` needed a widened `output<Event | undefined>()` type
  (rather than `output<Event>()`) since every call site emits with zero
  arguments — `EventEmitter<T>.emit()` has an optional parameter,
  `OutputEmitterRef<T>.emit()` does not, so the strict `Event` type
  would reject the existing no-arg calls; same class of fix as several
  earlier files but resolved via type-widening rather than passing a
  synthetic value, since no real `Event` object exists at any call site.
  Fixed six external `instance.field()` reads plus one
  `instance.id + '_' + i` → `instance.resolvedId + '_' + i` in
  `speeddialstyle.ts`. No external consumers. Spec (2200+ lines, several
  differently-named instance variables all literally called
  `speedDialInstance` at different scopes, plus a separate
  `ptSpeedDialInstance`) needed: ~20 bare `speedDialInstance.field`
  reads → `.field()` (regex matched by field name, scope-independent,
  since every local var shares the exact name); three direct
  `speedDialInstance.visible = value` writes → `.visible.set(value)`;
  two `speedDialInstance._visible = value` writes (white-box test of
  the `buttonIconClass` getter) → rewritten to set the icon inputs via
  the wrapper component + `fixture.detectChanges()` and call
  `.visible.set(...)` directly, since `_visible` no longer exists; one
  `_visible` read → `.visible()`; three `ptSpeedDialInstance.mask = true`
  writes on a wrapper template that never binds `[mask]` at all → the
  signal-stub trick (`(ptSpeedDialInstance as any).mask = () => true`),
  since there was no real binding path to route through; five
  `.id`/`ptSpeedDialInstance.id` reads that expected the
  auto-generated fallback → switched to `.resolvedId` (two of these
  were caught only by a semantic check — the raw `.id()` read would
  have compiled fine but returned `undefined` instead of the expected
  generated string, since the self-generation logic moved to
  `resolvedId`).
- **Also done (2026-08-22, continued):** `scroller.ts` — **deliberately
  partial conversion**, and one of the 6 forced-`ChangeDetectionStrategy.Default`
  components tracked separately under roadmap item #4. This file compounds
  TWO hazards that make full input()/output() conversion unsafe within
  this pass: (1) a `ngOnChanges(SimpleChanges)` override with ~6+
  branches (`loading`, `orientation`, `numToleratedItems`, `options`,
  and more below what was read) that the signal-inputs-never-fire-
  `ngOnChanges` rule would silently break; (2) far more severe — the
  `options` setter does **fully dynamic reflection** over an arbitrary
  `ScrollerOptions` object: `Object.entries(val).forEach(([k, v]) =>
  this[\`_${k}\`] = v)` followed by a second pass writing `this[k] = v`
  directly by string key, covering every one of the ~24 other `@Input`s
  in this class (`id`, `style`, `styleClass`, `tabindex`, `items`,
  `itemSize`, `scrollHeight`, `scrollWidth`, `orientation`, `step`,
  `delay`, `resizeDelay`, `appendOnly`, `inline`, `lazy`, `disabled`,
  `loaderDisabled`, `columns`, `showSpacer`, `showLoader`,
  `numToleratedItems`, `loading`, `autoSize`, `trackBy`). Converting any
  of those to `input()` would let this reflection code silently
  overwrite the input's signal FUNCTION with a raw value at runtime —
  the most severe version of the "dynamic-write hazard" pattern seen
  this session (worse than `chip.ts`'s few explicitly-named fields,
  since here it's unbounded and keyed by string). Given the scale
  (~24 affected fields, a `SimpleChanges`-driven `onChanges` needing full
  replacement, AND the reflection hazard needing a structural rewrite of
  `options` itself), this was judged out of scope for a same-pass
  conversion — left as a flagged item for a dedicated follow-up rather
  than rushed. **Converted only what's genuinely safe**: `hostName`
  (plain framework field, never touched by `options` reflection or
  `onChanges`) → `input('')`; the three `@Output()`s (`onLazyLoad`,
  `onScroll`, `onScrollIndexChange`) → `output()`, since outputs aren't
  subject to either hazard. No external `instance.hostName`/output
  reads in `scrollerstyle.ts` or in the seven external consumers
  (`autocomplete`/`listbox`/`multiselect`/`select`/`table`/`tree`/
  `treetable`) — the `onLazyLoad.emit(...)` call sites found in
  `table.ts`/`treetable.ts` are those components' OWN separate
  `onLazyLoad` outputs, unrelated to `Scroller`'s. Spec unaffected (no
  references to `hostName` or the three outputs as writable fields).
- **Also done (2026-08-22, continued):** `panelmenu.ts` — three
  components in one file. `PanelMenuSub`: `panelId`, `focusedItemId`,
  `items`, `itemTemplate`, `level`, `activeItemPath`, `root`,
  `tabindex`, `transitionOptions`, `parentExpanded` → `input()`;
  `itemToggle`/`menuFocus`/`menuBlur`/`menuKeyDown` → `output()`. No
  hazards. `PanelMenuList`: same field list minus a few, plus its own
  `ngOnChanges` hazard — a single branch syncing `items` into a
  `processedItems` signal → deleted `onChanges()`, replaced with one
  constructor `effect()` (`this.processedItems.set(this.createProcessedItems(this.items()
  || []))`). `PanelMenu`: `model`, `styleClass`, `multiple`,
  `transitionOptions` → `input()`; `id` had the same
  self-mutating-default hazard as dock.ts/panel.ts/menu.ts/speeddial.ts →
  `_generatedId`/`resolvedId` pattern, every internal/template reference
  switched to `resolvedId`. No external `instance.field()` reads in
  `panelmenustyle.ts` (only method calls like `.isItemActive()`). No
  external consumers. Spec needed: two `panelMenu.multiple =
  true`/`panelMenu.model = [...]` direct writes on the `PanelMenu`
  fixture root → `fixture.componentRef.setInput(...)` (one inside a PT
  callback also read `instance?.multiple` as a truthy check, which
  would now always be `true` since a function is always truthy — fixed
  to `instance?.multiple()`); two more `testComponent.model = [...]`
  writes on differently-named fixture roots, same fix, leaving both
  `testComponent` declarations dead and removed; ~15 bare
  `panelMenuInstance.field` reads (including `.id` → `.resolvedId` for
  the auto-generated-fallback assertion, `.id()` for the
  explicitly-bound-value assertion) plus a few more on differently-named
  instances (`dynamicPanelMenu`, `emptyPanelMenu`) — bulk-fixed. Left
  alone: `keyboardPanelMenu.containerViewChild = {...}` direct writes
  and a `.itemTemplate`/`.templates` bare read on other instances — both
  pre-existing `viewChild()`/`contentChild()`/`contentChildren()`
  signals from an earlier architecture pass, not part of this session's
  `@Input`/`@Output` conversion scope, and already silently
  any-typed/broken before today (confirmed via absence from any tsc
  diff this session touched).
- **Also done (2026-08-22, continued):** `splitbutton.ts` — **new
  dynamic-write variant**, resolved differently than both prior
  precedents (chip.ts's "leave as plain `@Input()`" and
  selectbutton.ts's "fold into a single getter"): `disabled`'s setter
  wrote to TWO other separately-bindable `@Input()`s at once
  (`this.buttonDisabled = v; this.menuButtonDisabled = v;`), so setting
  `disabled` silently overrode whichever value `buttonDisabled`/
  `menuButtonDisabled` had (or would later get, depending on binding
  order — the same nondeterminism selectbutton.ts hit). Fixed by
  converting all three to independent plain `input()`s and introducing
  two `computed()` getters — `$buttonDisabled = computed(() =>
  this.disabled() ?? this.buttonDisabled())` and the `$menuButtonDisabled`
  equivalent — so `disabled`, when explicitly bound (non-`undefined`),
  deterministically overrides the per-button flags, otherwise each
  button's own flag applies. Template `[disabled]` bindings on the two
  `<button>` elements switched from `buttonDisabled`/`menuButtonDisabled`
  to `$buttonDisabled()`/`$menuButtonDisabled()`. All other fields
  (`model`, `severity`, `raised`, `rounded`, `text`, `outlined`, `size`,
  `plain`, `icon`, `iconPos`, `label`, `tooltip`, `tooltipOptions`,
  `styleClass`, `menuStyle`, `menuStyleClass`, `dropdownIcon`, `dir`,
  `expandAriaLabel`, `showTransitionOptions`, `hideTransitionOptions`,
  `buttonProps`, `menuButtonProps`, `autofocus`, `tabindex`) → `input()`;
  `onClick`/`onMenuHide`/`onMenuShow`/`onDropdownClick` → `output()`.
  `onDropdownClick`/`onMenuHide`/`onMenuShow` needed the zero-arg-`.emit()`
  fix (widened type / explicit `undefined`), same class as several
  earlier files. Fixed five external `instance.field()` reads in
  `splitbuttonstyle.ts`. No external consumers. Spec needed the widest
  read-only audit yet by count: ~55 bare `splitButtonInstance.field`
  reads across the whole file (including two on the disabled-cascade
  test, updated to read the new `$buttonDisabled()`/`$menuButtonDisabled()`
  computed getters instead of the raw per-button signals, since the
  cascading side effect moved there) plus a handful more on
  differently-named instances (`dropdownSplitButton`, `commandSplitButton`,
  and three instances queried by index in a "Disabled State Variants"
  block) — all bulk/individually fixed.
- **Also done (2026-08-22, continued):** `megamenu.ts` — two components
  in one file. `MegaMenuSub`: `id`, `items`, `itemTemplate`, `menuId`,
  `ariaLabel`, `ariaLabelledBy`, `level`, `focusedItemId`, `disabled`,
  `orientation`, `activeItem`, `submenu`, `queryMatches`, `mobileActive`,
  `scrollHeight`, `tabindex`, `root` → `input()`;
  `itemClick`/`itemMouseEnter`/`menuFocus`/`menuBlur`/`menuKeydown`/
  `menuMouseDown` → `output()`. No hazards. `MegaMenu`: `model` had a
  get/set pair with a real side effect (`this._processedItems =
  this.createProcessedItems(...)`, the classic memoization-on-write
  pattern) → converted to plain `input<MegaMenuItem[]>()` + constructor
  `effect()` replicating the exact same assignment. `id` had the same
  self-mutating-default hazard as dock.ts/panel.ts/menu.ts/speeddial.ts/
  panelmenu.ts → `_generatedId`/`resolvedId` pattern, every
  internal/template/host reference switched to `resolvedId`. All other
  fields (`styleClass`, `orientation`, `ariaLabel`, `ariaLabelledBy`,
  `breakpoint`, `scrollHeight`, `disabled`, `tabindex`) → `input()`. No
  `@Output`s on `MegaMenu` itself. Fixed three external
  `instance.field()` reads in `megamenustyle.ts` (`scrollHeight` on
  `MegaMenuSub`'s `rootList` style function, `orientation` ×2 on
  `MegaMenu`'s `root` style function — confirmed via the same
  shared-classes-object-serves-both-components pattern seen in
  toast.ts/paginator.ts, not a new pattern). No external consumers. Spec
  needed the widest cross-instance sweep yet: ~30 bare reads spread
  across nine differently-named instance variables
  (`megaMenuInstance`, `freshMegaMenu`, `verticalMegaMenu`,
  `disabledMegaMenu`, `responsiveMegaMenu`, `dynamicMegaMenu`, etc.),
  fixed with one regex keyed on instance-name shape (`/MegaMenu(Instance)?$/`-style)
  rather than one-by-one; three of those were `.id` reads expecting the
  auto-generated fallback on an unbound wrapper → switched to
  `.resolvedId` (one bound explicitly stayed on `.id()`). Eleven
  pre-existing unrelated `TS2449` "used before declaration" errors
  (same class seen in earlier files this session) confirmed in baseline
  and left alone.
- **Also done (2026-08-22, continued):** `menubar.ts` — two components
  plus an injectable service in one file, following the exact same
  shape as megamenu.ts converted just before it. `MenubarSub`: `items`,
  `itemTemplate`, `root`, `autoZIndex`, `baseZIndex`, `mobileActive`,
  `autoDisplay`, `menuId`, `ariaLabel`, `ariaLabelledBy`, `level`,
  `focusedItemId`, `activeItemPath`, `inlineStyles`,
  `submenuiconTemplate` → `input()`;
  `itemClick`/`itemMouseEnter`/`menuFocus`/`menuBlur`/`menuKeydown` →
  `output()`. No hazards. `Menubar`: `model` had the same
  memoization-on-write get/set hazard as megamenu.ts → plain
  `input<MenuItem[]>()` + constructor `effect()` replicating
  `this._processedItems = this.createProcessedItems(...)`. `id` had the
  same self-mutating-default hazard as
  dock/panel/menu/speeddial/panelmenu/megamenu.ts →
  `_generatedId`/`resolvedId` pattern. `autoHide`/`autoHideDelay` are
  only read once, in `onInit()`, to seed the injected `MenubarService`
  (`this.menubarService.autoHide = this.autoHide()`) — preserved as a
  one-time read matching the original's one-time-`ngOnInit`-assignment
  behavior (no `ngOnChanges` existed for these fields originally, so no
  effect needed; if they're rebound later the service still won't pick
  it up, matching prior behavior exactly). All other fields
  (`styleClass`, `autoZIndex`, `baseZIndex`, `autoDisplay`, `breakpoint`,
  `ariaLabel`, `ariaLabelledBy`) → `input()`; `onFocus`/`onBlur` →
  `output()` (both already always emit a real event, no zero-arg-emit
  fix needed here unlike several earlier files). No hazardous external
  `instance.field()` reads in `menubarstyle.ts` (`instance.mobileActive`
  is a plain, unconverted field). No external consumers. Spec needed the
  same cross-instance sweep pattern as megamenu.spec.ts: one regex keyed
  on the `*Menubar(Instance)?` variable-name shape covering ~15 bare
  reads across differently-named instances (`menubarInstance`,
  `freshMenubar`, `nestedMenubar`, `dynamicMenubar`, `routerMenubar`,
  etc.), plus one `.id` → `.resolvedId` fix for the
  auto-generated-fallback assertion (verified the wrapper's `id` field
  defaults to `undefined`, same check performed for every other
  `resolvedId` conversion this session). Fourteen pre-existing unrelated
  `TS2449` "used before declaration" errors (same recurring class,
  `TestTargetComponent` referenced before its own declaration)
  confirmed in baseline and left alone.
- **Also done (2026-08-22, continued):** `password.ts` — a directive
  (`PasswordDirective`) and a component (`Password`) in one file.
  `PasswordDirective`: `promptLabel`, `weakLabel`, `mediumLabel`,
  `strongLabel`, `feedback` → `input()`. `showPassword` was a
  write-only setter with a genuine DOM side effect
  (`this.el.nativeElement.type = show ? 'text' : 'password'`, no
  matching getter at all) → `input(false, {transform: booleanAttribute})`
  + a new constructor `effect()` performing the same assignment —
  simpler than most hazards this session since there was no internal
  read to preserve, just the write. `Password`: no hazards — every
  field was a plain `@Input()` with no get/set logic, no `ngOnChanges`,
  no dynamic writes; converted `ariaLabel`, `ariaLabelledBy`, `label`,
  `promptLabel`, `mediumRegex`, `strongRegex`, `weakLabel`,
  `mediumLabel`, `maxLength`, `strongLabel`, `inputId`, `feedback`,
  `toggleMask`, `inputStyleClass`, `styleClass`, `inputStyle`,
  `showTransitionOptions`, `hideTransitionOptions`, `autocomplete`,
  `placeholder`, `showClear`, `autofocus`, `tabindex`, `overlayOptions`
  straight to `input()`; `onFocus`/`onBlur`/`onClear` → `output()`
  (already emitting real values or explicit `undefined`, no zero-arg
  fix needed). `<p-overlay ... [(visible)]="overlayVisible">` needed no
  change — `Overlay.visible` is a `model()` from the earlier `overlay.ts`
  conversion, and classic banana-in-box two-way binding to a plain
  wrapper field works identically whether the child's own property is a
  signal or not. No hazardous external `instance.field()` reads in
  `passwordstyle.ts` (all method calls or plain fields like
  `instance.meter`/`instance.focused`, unaffected). No external
  consumers. Spec (2466 lines) had the `Password` component created
  directly as the fixture root (`TestBed.createComponent(Password)`,
  `component = fixture.componentInstance`, scoped to the whole
  `describe('Password', ...)` block before a separate
  `describe('PasswordDirective', ...)` picks up at line 1284) — ~20
  direct `component.field = value` writes → brace-balance-aware bulk
  script to `fixture.componentRef.setInput(...)`, plus ~16 bare
  `component.field` reads → `.field()`. One pre-existing unrelated
  `TS2554` (`directive.onInput(inputEvent)` against a genuinely 0-arg
  method, present before this conversion too) confirmed in baseline and
  left alone.
- **Also done (2026-08-22, continued):** `confirmdialog.ts` — **the
  broadest dynamic-write hazard resolved this session** (broader than
  chip.ts, selectbutton.ts, and speeddial.ts, though not as severe as
  scroller.ts's fully-open-ended reflection): the constructor
  subscribes to `ConfirmationService.requireConfirmation$` and, on every
  `confirm()` call, does `Object.keys(confirmation).forEach(key =>
  this[key] = confirmation[key])` — reflecting the entire
  `Confirmation` interface (looked up via a dedicated research pass:
  `message`, `key`, `icon`, `header`, `accept`, `reject`, `acceptLabel`,
  `rejectLabel`, `acceptIcon`, `rejectIcon`, `acceptVisible`,
  `rejectVisible`, `blockScroll`, `closeOnEscape`, `dismissableMask`,
  `defaultFocus`, `acceptButtonStyleClass`, `rejectButtonStyleClass`,
  `target`, `acceptEvent`, `rejectEvent`, `acceptButtonProps`,
  `rejectButtonProps`, `closeButtonProps`, `closable`, `position`,
  `modal`) directly onto matching `@Input()` fields. Every ConfirmDialog
  field whose name appears in that list was **left as plain
  `@Input()`** — `header`, `icon`, `message`, `acceptIcon`,
  `acceptLabel`, `acceptVisible`, `rejectIcon`, `rejectLabel`,
  `rejectVisible`, `acceptButtonStyleClass`, `rejectButtonStyleClass`,
  `closeOnEscape`, `dismissableMask`, `blockScroll`, `closable`, `key`,
  `defaultFocus`, `modal`, `position` — converting any of these would
  let the reflection loop silently overwrite the input's signal
  function on the next `confirm()` call. Only the fields NOT present in
  `Confirmation` were converted: `styleClass`, `maskStyleClass`,
  `closeAriaLabel`, `acceptAriaLabel`, `rejectAriaLabel`, `rtl`,
  `autoZIndex`, `baseZIndex`, `transitionOptions`, `focusTrap`,
  `breakpoints`, `draggable` → `input()`. `style` had a get/set pair
  whose only side effect was a now-redundant `this.cd.markForCheck()`
  (not in the `Confirmation` list either) → plain `input()`, side
  effect dropped. `visible` — also not in the `Confirmation` list, but
  genuinely mutated internally from three places (`hide()`,
  `onVisibleChange()`, and the confirmation-subscription handler itself
  via `this.visible = true`) with no external `visibleChange` output →
  **seventh `model()` conversion**, matching the established
  "internally-mutated `@Input()` with no `@Output` pair" pattern from
  earlier files; its `maskVisible` side effect moved into a constructor
  `effect()`. `onHide` → `output<ConfirmEventType>()`; its one call site
  passes an optional `type?: ConfirmEventType` through to `.emit()`,
  which needed an `as ConfirmEventType` cast since `OutputEmitterRef`
  doesn't accept `undefined` the way the old loosely-typed
  `EventEmitter` did. No hazardous reads in `confirmdialogstyle.ts` (no
  `instance` usage at all — purely static class names). No external
  consumers. Spec needed ~13 bare `confirmDialogInstance.field` reads
  fixed by name across the file; one `dialog.componentInstance.visible`/
  `.draggable` pair left untouched since those read `Dialog`'s own
  (not-yet-converted) fields, a different component still pending its
  own turn in the queue.
- **Also done (2026-08-22, continued):** `dataview.ts` — another
  `ngOnChanges(SimpleChanges)` hazard (fourth this session, after
  tooltip/carousel/checkbox), with a twist: three of the affected
  fields (`first`, `rows`, `totalRecords`) are ALSO mutated internally
  from `paginate()`/`sort()`/`filter()`/`updateTotalRecords()`, so a
  bare `input()` wouldn't work for them even with the `ngOnChanges`
  deletion — they needed the carousel.ts-style backing-field pattern:
  `_first`/`_rows`/`_totalRecords` private fields kept in sync from
  their respective `input()`s via three small constructor `effect()`s,
  with every internal method (`paginate`, `sort`, `filter`,
  `updateTotalRecords`, `createLazyLoadMetadata`, the template's
  `<p-paginator>` bindings) switched to read/write the backing fields
  instead. `layout`'s `ngOnChanges` branch (emit `onChangeLayout`,
  skipped on `firstChange`) became a constructor `effect()` with an
  `isFirstLayoutChange` flag replicating the `firstChange` skip exactly.
  `value`'s branch (sync `_value`, call `updateTotalRecords()`, run any
  pending filter) simplified nicely — the `_value` backing field
  turned out to be unnecessary once `updateTotalRecords()`/`filter()`
  read `this.value()` directly, so it was deleted outright rather than
  kept. `sortField`/`sortOrder`'s branch (call `sort()`, skipped before
  lazy init) became its own effect. All other fields (`paginator`,
  `pageLinks`, `rowsPerPageOptions`, `paginatorPosition`,
  `paginatorStyleClass`, `alwaysShowPaginator`,
  `paginatorDropdownAppendTo`, `paginatorDropdownScrollHeight`,
  `currentPageReportTemplate`, `showCurrentPageReport`,
  `showJumpToPageDropdown`, `showFirstLastIcon`, `showPageLinks`,
  `lazy`, `lazyLoadOnInit`, `emptyMessage`, `styleClass`,
  `gridStyleClass`, `trackBy`, `filterBy`, `filterLocale`, `loading`,
  `loadingIcon`) → plain `input()`;
  `onLazyLoad`/`onPage`/`onSort`/`onChangeLayout` → `output()`. Fixed
  two external `instance.layout()` reads in `dataviewstyle.ts` (both on
  the `root` class function's `'p-dataview-list'`/`'p-dataview-grid'`
  ternaries). No external consumers. Spec needed the widest field
  count for a wrapper-bound-only case this session (~25 fields all
  bound through one `TestBasicDataViewComponent` wrapper template, no
  fixture-root direct-write pattern needed since none of the affected
  spec tests query the component directly) — the wrapper-bound fields
  needed no changes at all; the handful of genuinely white-box tests
  that called `dataview.updateTotalRecords()`/`.createLazyLoadMetadata()`
  directly were rewritten to seed state via `component.field = value` +
  `fixture.detectChanges()` (for tests exercising the real effect path)
  or the signal-stub trick for tests exercising `updateTotalRecords()`'s
  branching logic in isolation without a full CD cycle — both patterns
  already established earlier this session, applied here for the first
  time on a file with this particular `ngOnChanges`-plus-internal-
  mutation combination.
- **Also done (2026-08-22, continued):** `contextmenu.ts` — two
  components. `ContextMenuSub`: `visible` had a get/set with a real
  side effect (`this.render.set(true)` when visible or root) → plain
  `input(false, {transform: booleanAttribute})` + constructor
  `effect()`. All other fields (`items`, `itemTemplate`, `root`,
  `autoZIndex`, `baseZIndex`, `popup`, `menuId`, `ariaLabel`,
  `ariaLabelledBy`, `level`, `focusedItemId`, `activeItemPath`,
  `motionOptions`, `tabindex`) → `input()`;
  `itemClick`/`itemMouseEnter`/`menuFocus`/`menuBlur`/`menuKeydown` →
  `output()`. `ContextMenu`: `model` had the same
  memoization-on-write get/set hazard as megamenu.ts/menubar.ts →
  plain `input<MenuItem[]>()` + constructor `effect()`. `id` had the
  same self-mutating-default hazard as five earlier files this session
  → `_generatedId`/`resolvedId` pattern. `target` was a genuine
  internal-mutation case — `onOverlayHide()` resets it to `null` after
  the menu closes (`this.target = null`) — so it needed the
  dataview.ts-style backing-field pattern: `input<HTMLElement | string
  | null>()` + a private `_target` synced via constructor `effect()`,
  with `bindTriggerEventListener()`/`onOverlayHide()` reading/writing
  `_target` instead of the input directly. All other fields
  (`triggerEvent`, `global`, `style`, `styleClass`, `autoZIndex`,
  `baseZIndex`, `breakpoint`, `ariaLabel`, `ariaLabelledBy`,
  `pressDelay`) → `input()`; `onShow`/`onHide` → `output<null>()`, both
  needing the explicit-`null`-argument fix at their `.emit()` call
  sites (same zero-arg-emit class as several earlier files). Left
  alone: `instance.queryMatches` (no `()`) in `contextmenustyle.ts` —
  confirmed via `tsc` diff that this was already broken before today
  (an unrelated pre-existing `signal()` field, not part of this
  session's `@Input`/`@Output` conversion). No external consumers. Spec
  needed ~50 bare `contextMenuInstance.field` reads across several
  differently-named instances (`freshContextMenu`, `targetContextMenu`,
  `globalContextMenu`, etc.) fixed by field name; one `.id` →
  `.resolvedId` for the auto-generated-fallback test; one direct
  `contextMenuInstance.target = mockTarget` write on a queried
  (non-fixture-root) instance in a white-box `ngOnInit()` test →
  signal-stub trick, safe here since the test spies on
  `bindTriggerEventListener` itself (replacing its implementation) and
  never actually exercises the real `_target`-reading code path. Two
  pre-existing unrelated `TS2554`s (`onMenuFocus`/`onMenuBlur` always
  took 0 params despite the template passing `$event`) confirmed in
  baseline and left alone; the recurring `TestTargetComponent`
  used-before-declaration `TS2449` pattern (seen in megamenu.spec.ts
  and menubar.spec.ts) also reappeared here, same pre-existing cause.
- **Also done (2026-08-22, continued):** `orderlist.ts` — `selection`
  had a get/set pair simply forwarding to an internal `d_selection`
  field, paired with a manual `@Output() selectionChange` that was
  ALSO explicitly emitted from `onChangeSelection()` (i.e. the
  component never used its own setter internally — it wrote
  `d_selection` directly and manually fired `selectionChange`) →
  **eighth `model()` conversion**; `onChangeSelection()` now calls
  `this.selection.set(e.value)` instead of manually assigning
  `d_selection` and emitting, relying on `model()`'s own implicit
  change notification (which required deleting the redundant manual
  `@Output() selectionChange` declaration entirely, since Angular
  synthesizes it from the model automatically) — a constructor
  `effect()` keeps `d_selection` (the plain field the internal
  `<p-listbox [(ngModel)]>` binds to) in sync from `selection()`.
  **New discovery this session**: `ModelSignal` implements `OutputRef`
  directly — `orderList.selection.subscribe(...)` works for listening
  to writes, but there is no separate `orderList.selectionChange`
  property to subscribe to (unlike a plain `@Output()`), since the
  `xChange` name is template-binding sugar only, not a literal instance
  member. `value` had a get/set pair with a real side effect (call
  `filter()` if a filter is active, else seed `visibleOptions` for
  drag&drop) → plain `input<any[]>()` + constructor `effect()`
  replicating it; unlike `first`/`rows` in dataview.ts, `value` did NOT
  need a private backing field despite being extensively mutated
  in-place by `moveUp`/`moveTop`/`moveDown`/`moveBottom`/`onDrop`
  (`.splice()`, `.push()`, `.unshift()`, index reassignment,
  `moveItemInArray()`) — since `input()` returns the same array
  object reference on every call until the bound value itself changes,
  in-place array mutations remain fully visible through repeated
  `this.value()` calls, so no backing field was needed, just replacing
  every bare `this.value`/`this.selection` read with a call. All other
  fields (`header`, `styleClass`, `tabindex`, `ariaLabel`,
  `ariaLabelledBy`, `listStyle`, `responsive`, `filterBy`,
  `filterPlaceholder`, `filterLocale`, `metaKeySelection`, `dragdrop`,
  `controlsPosition`, `ariaFilterLabel`, `filterMatchMode`,
  `breakpoint`, `stripedRows`, `disabled`, `trackBy`, `scrollHeight`,
  `autoOptionFocus`, `dataKey`, `buttonProps`, `moveUpButtonProps`,
  `moveTopButtonProps`, `moveDownButtonProps`, `moveBottomButtonProps`)
  → `input()`; `onReorder`/`onSelectionChange`/`onFilterEvent`/
  `onFocus`/`onBlur` → `output()`. `id` was never an `@Input()` here
  (just a fixed generated field with no external override), so no
  `resolvedId` pattern was needed unlike five earlier files this
  session. Fixed one external `instance.controlsPosition()` read (×2
  ternary branches) in `orderliststyle.ts`. No external consumers. Spec
  needed: one `.selectionChange.subscribe()` → `.selection.subscribe()`
  fix (reflecting the `ModelSignal`-implements-`OutputRef` discovery
  above); several direct writes on the queried (non-fixture-root)
  `orderList` instance for `responsive`/`filterBy`/`value` rewritten to
  go through the wrapper (`component.field = value; fixture.detectChanges()`)
  since those tests needed the real constructor effects to fire
  (verifying `createStyle()`/`filter()` were actually called), which a
  signal-stub would not have triggered; one `.trackBy(0, item)` →
  `.trackBy()(0, item)` call-site fix; ~30 bare `orderList.field` reads
  fixed by name.
- **`inputnumber.ts`** — `InputNumber` (32 fields converted to `input()`/
  `output()`, `min`/`max`/`step`/`size` already signal-based from
  `BaseInput` prior to this session, untouched). Hazard: `onChanges(SimpleChanges)`
  triggered `updateConstructParser()` on changes to 9 specific fields
  (`locale`, `localeMatcher`, `mode`, `currency`, `currencyDisplay`,
  `useGrouping`, `minFractionDigits`, `maxFractionDigits`, `prefix`,
  `suffix`) — confirmed `updateConstructParser()` internally guards on
  `this.initialized` (set in `onInit()`), so replacing with a single
  constructor `effect()` reading all 9 signals preserves identical
  ngOnChanges-before-ngOnInit timing semantics. Two-stage bulk fix: a
  `this.field` → `this.field()` script for the class body, then a
  second script scoped to the template literal (lines 52–213) for bare
  (non-`this.`-prefixed) field references, since Angular templates
  resolve identifiers implicitly and the first script's `this.`-anchored
  regex structurally could not reach them. Care taken to exclude `value`
  (a plain non-`@Input` class field, not one of the 32 converted names)
  from the template-scoped fix. No hazards in `inputnumberstyle.ts` (no
  external `instance.field` reads found) and no external consumers
  needing changes. Spec file needed no changes — all `component.field =`/
  `testComponent.field =` writes target the wrapper test-host's own plain
  template-bound fields, not the `InputNumber` instance directly, and all
  direct `componentInstance` reads/calls in the spec touch methods or
  content-child templates, not the converted `@Input` fields.
- **`tieredmenu.ts`** — `TieredMenuSub` (`visible` get/set side effect calling
  `render.set(true)` → plain `input(false)` + constructor `effect()`
  replicating `if (visible() || root()) render.set(true)`; all 14 other
  fields → `input()`/`output()`) + `TieredMenu` (`model` setter side effect
  recomputing `_processedItems` → plain `input()` + constructor `effect()`;
  self-mutating `id = id || uuid(...)` → standard `id = input<string>()` +
  `resolvedId` getter pattern (`return this.id() || (this._generatedId ??=
  uuid('pn_id_'));`), all internal reads and template bindings switched to
  `resolvedId`. A first pass used a private aliased `_id = input(undefined,
  { alias: 'id' })` + public `id` getter to preserve the original read-only
  property shape, but that tripped `@angular-eslint/no-input-rename` — reverted
  to the standard non-aliased pattern used by every other file this session;
  `onShow`/`onHide` → `output()` — both call sites already passed `{}` so no
  zero-arg fix needed). `items` (a required, no-default `@Input()`) became
  `input<any[]>()` returning `any[] | undefined`, surfacing two new
  possibly-undefined errors in `getAriaSetSize()`/`getAriaPosInset()` fixed
  with `(this.items() ?? [])`. One external `instance.popup` read fixed in
  `tieredmenustyle.ts`. `splitbutton.ts` (external consumer) only calls
  methods on the queried `TieredMenu` instance, no field reads — no changes
  needed. Also found and fixed a batch of template-binding corruptions left
  by an earlier automated bulk-fix pass, where `()` had been appended to
  binding *property names* instead of their value expressions (e.g.
  `[tabindex()]="tabindex"`, `[items()]="processedItem.items"` on the nested
  `<p-tieredmenusub>` recursive binding) — corrected to `[tabindex]=
  "tabindex()"`, `[items]="processedItem.items"`, etc. across both templates;
  worth double-checking other recently-touched files for the same corruption
  pattern. Spec fixes: ~9 bare `tieredMenu.field` reads (`disabled`/
  `autoDisplay`/`autoZIndex`/`baseZIndex`/`tabindex`/`model`/`styleClass`/
  `style`/`popup`) plus one on a second instance variable
  (`popupTieredMenu.popup`); `tieredMenu.id` → `tieredMenu.resolvedId` for
  the auto-generated-id assertions; one unrelated pre-existing
  `Tooltip.content` bare read (already signal-based from an earlier session)
  surfaced by this file's own `tsc` pass and fixed in passing. One
  pre-existing baseline error left alone: `onMenuFocus({})` — the method
  takes 0 params but the spec calls it with an object arg, confirmed
  unrelated to today's changes.
- **`treeselect.ts`** — All 34 `@Input()` fields converted to `input()`,
  6 `@Output()`s → `output()` (`onClear` needed the explicit-`undefined`
  zero-arg-emit fix, others already emitted real values); class-body
  internals were already converted by a concurrent pass, but the entire
  component template (both the host `<input>`/label/dropdown markup and the
  nested `<p-overlay>`/`<p-tree>` bindings) still had bare non-`this.`
  field reads plus a batch of the same "`()` appended to the binding
  property name instead of the value" corruption seen in `tieredmenu.ts`
  (e.g. `[propagateSelectionDown()]="propagateSelectionDown()"`,
  `[options()]="overlayOptions()"`) — both classes of bug fixed across the
  whole template; host `'[class]'` binding's `containerStyleClass` also
  needed `()`. No hazards (`label`/`emptyValue`/`emptyOptions` remain plain
  getters over the still-plain `value`/internal fields, correctly left
  un-signalled). One external `instance.placeholder` read fixed in
  `treeselectstyle.ts` (already partially converted by the concurrent pass;
  this was the one remaining bare spot). Spec file needed no changes — audit
  found zero bare reads and zero direct writes on any of the 34 fields.
- **Remaining:** ~24 files, including all remaining `hostName`-bearing components
  not yet converted (`dialog.ts`, `listbox.ts`, `inputtext.ts`,
  `picklist.ts` — now safe to convert given the `$hostName` fix above;
  `overlay.ts` and `scroller.ts` are now done/partially-done, see above).
  Note `Badge`'s own `.spec.ts`
  (`badge.spec.ts`) has the same direct-write problem on the
  already-converted `Badge` class from before this session — pre-existing,
  not introduced today, left as-is since fixing it is outside
  `BadgeDirective`'s scope. Worth a pass when picking up `badge.spec.ts`
  again.

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

## Native-element directive migration (v23 deprecation track)

A separate initiative from the Angular-22-conformance items above: replacing
heavyweight overlay/wrapper components with lightweight directives that
attach behavior to native form elements, then deprecating the old
components ahead of removal in v23. Track this independently — it's a public
API/breaking-change program, not an internal refactor, so it needs its own
deprecation-notice and migration-guide work alongside the code changes.

### 1. Create the native-element directives

**Initial directive layer delivered (2026-08-22):** eleven standalone,
signal-native directives now ship from their corresponding public entry
points and legacy `NgModule`s. They deliberately retain browser-native form
and interaction behavior; `pToggleButton` exposes a two-way `pressed` model,
and the file, autocomplete, and color directives provide signal-based change
outputs. Component deprecation, documentation, theme recipes, and richer
overlay behavior remain separate follow-up work before the v23 removal track.

New directive, one per native element, each attaching to the element's
native selector (`input[pCheckbox]`, `button[pToggleButton]`, etc.) rather
than introducing a new custom element — mirrors the existing pattern of
`primeng/inputtext` (`InputText`, `input[pInputText]`) and
`primeng/keyfilter` (`[pKeyFilter]`).

- `pCheckbox` — native `<input type="checkbox">`
- `pRadioButton` — native `<input type="radio">`
- `pInputNumber` — native `<input>`
- `pDatePicker` — native `<input>`
- `pColorPicker` — native `<input>`
- `pSlider` — native range/slider element
- `pToggleSwitch` — native checkbox/switch
- `pToggleButton` — native `<button>`
- `pSelectButton` — native button group
- `pRating` — native radio-like controls
- `pFileUpload` — native `<input type="file">`

**Sequencing note:** do this *before* step 4's `@Input`/`@Output` → signals
pass touches these same components, not after — each new directive should
be written signal-native from the start rather than converted twice. For
components already reached by step 4 before this track starts, no rework
needed; the signal-native version is exactly what a new directive should
follow anyway.

**Watch for:** `CascadeSelect`, `MultiSelect`, `Select`, `TreeSelect` aren't
in the deprecation list below despite similar overlay shapes — they don't
map to a single native element the way a checkbox or range input does, so
no directive equivalent is planned for them. Don't scope-creep the
directive set beyond the twelve above without a corresponding deprecation
target.

### 2. Deprecate the components being replaced

Once a directive has a working, tested replacement, mark its component
`@deprecated` (JSDoc tag + `@Component` stays functional, no runtime
warning removal of behavior) with a pointer to the new directive, planned
for removal in v23:

- `Button`
- `Checkbox`
- `RadioButton`
- `InputMask`
- `InputNumber`
- `Password`
- `AutoComplete`
- `DatePicker`
- `ColorPicker`
- `Slider`
- `ToggleSwitch`
- `ToggleButton`
- `SelectButton`
- `Rating`
- `FileUpload`

Note `Button` and `InputMask`/`Password` have no directive listed in step 1
above with a matching name (`pInputMask`, `pPassword` aren't in the
twelve) — confirm before deprecating whether `Button`'s replacement is
meant to be a bare native `<button>` with a to-be-created `pButton`
styling directive, and whether `InputMask`/`Password` are meant to fold
into `pInputNumber`/a plain `input[pInputText]` + separate masking
directive, or whether the deprecation list and directive list need
reconciling before either lands.

- **Do:** add the `@deprecated` JSDoc tag, a console warning (dev-mode only,
  matching whatever pattern `badge.ts`'s `size` deprecation already uses —
  see step 3 of the Angular-22 track above) pointing at the replacement
  directive, and a showcase doc callout.
- **Don't:** remove the component, its module export, or any public API in
  this pass — v23 removal is a separate, later, breaking-change release.
- **Sequencing:** deprecate a component only after its matching directive
  ships and has doc/example coverage — a deprecation notice with no working
  replacement to point to just frustrates consumers.

## Independent, low-risk, opportunistic work

No dedicated effort needed — good to pick up whenever already in a given file
for other reasons.

- **Signal Forms showcase example** — `@angular/forms/signals` has zero
  usage in the repo, which is correct (`primeng` is a `ControlValueAccessor`
  library, not a form consumer). The one opportunity: add a Signal Forms
  example alongside the existing 25 Reactive Forms doc pages (e.g.
  `autocomplete/reactive-forms-doc.ts`, `cascadeselect/reactiveforms-doc.ts`)
  as a parallel demo, not a replacement.
- **`@Injectable({ providedIn: 'root' })` → `@Service()`** — ✅ done
  (2026-08-22): the installed Angular core now exports `Service`; converted
  all seven root-provided services: `overlayservice.ts`, `filterservice.ts`,
  `usestyle.ts`, `themeprovider.ts`, `primeng.ts`, `basecomponentstyle.ts`,
  and `basestyle.ts`. Plain `@Injectable()` services remain out of scope,
  since they are component-scoped providers rather than root singletons.
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

- **Rename `packages/primeng` to `packages/ngx-prime`** — ✅ done (2026-08-22).
  The directory and every internal filesystem reference now use `ngx-prime`.
  The published package name and public `primeng/*` import specifiers remain
  intentionally unchanged for compatibility. Verified with the library build.
- **Change docs GitHub Pages domain to `ngx-prime.webart.work`** — source CNAME
  updated on 2026-08-22; the generated build copy is regenerated by the docs build.
  DNS and the GitHub Pages custom-domain setting still need to be updated externally.
  `.github/workflows/deploy-docs.yml` has no hardcoded domain reference.
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

- This roadmap was generated from a read-only audit. As of 2026-08-21, steps
  1 and 2 of the Angular-22 track are complete and step 3 is in progress
  (see status inline above) — this section no longer reflects a fully
  unstarted plan; check each step's own status line instead of assuming
  nothing has moved.
- Each migration step above should follow the same verification discipline
  used for the lint cleanup: small batches, `tsc --noEmit` after each, no
  bulk mechanical edits without checking call sites/overrides first.
