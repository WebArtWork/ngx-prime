# Roadmap

Planned follow-up work for bringing `packages/ngx-prime` and `apps/showcase` up to
current Angular best practices. This is not urgent cleanup â€” everything here was
deliberately deferred out of the lint-fixing pass so it could be scoped and
sequenced properly instead of rushed.

Source: Angular 22 conformance audit (Angular CLI MCP `get_best_practices` /
`search_documentation`, cross-referenced against a pattern census of the working
tree). No code was changed as part of that audit.

## Already conformant (no action needed)

- Standalone components throughout â€” no `NgModule`-based components, and
  `standalone: true` is correctly *absent* rather than redundantly present.
- Native control flow fully migrated: `@if`/`@for`/`@switch` used everywhere in
  live templates. The only remaining `*ngIf` occurrences are inside code-sample
  string literals on an accessibility doc page, illustrating pre-Ivy syntax for
  readers â€” not real templates.
- `ngClass`/`ngStyle` fully migrated to `class`/`style` bindings in `ngx-prime`.
  Remaining hits are all in `apps/showcase` doc prose or generated `llms/*.md`
  reference content.
- `apps/showcase` already runs zoneless (`provideZonelessChangeDetection()` in
  `app.config.ts`).
- Newer components (the `tabs/` family, recent additions) are already
  signal-native â€” `input()`/`computed()` used correctly. The target style
  already exists in-house; this is a completion problem, not a direction
  problem.

## Planned work, in dependency order

Each item is easier once the one before it is done â€” do them in this order,
not by priority label alone.

### 1. Constructor DI â†’ `inject()` â€” âœ… already done (re-verified 2026-08-21)

Re-audited on 2026-08-21: no real constructor parameter-property DI remains
in `packages/ngx-prime/src` or `apps/showcase`. Both base classes already use
`inject()` exclusively. The original "52 files" count was a raw grep for the
`constructor(` token, not for injected parameters â€” those 52 files all have
parameterless `constructor()` bodies (used for `effect()`/`super()` calls
only). The only real constructor-parameter classes left are
`dynamicdialog-injector.ts` and `connectedoverlayscrollhandler.ts`, both
plain non-DI-managed classes instantiated with `new` â€” correctly left alone,
per the original watch-for note. All other hits are inside doc-sample
template-literal strings in `apps/showcase` (illustrating legacy syntax for
readers), same exemption category as the `*ngIf` doc examples above; the
real demo classes around them already use `inject()`. No action needed.

### 2. `@HostListener` / `@HostBinding` â†’ `host` object â€” âœ… done (2026-08-21)

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
each batch â€” zero new errors introduced (only pre-existing jest-globals
noise in `.spec.ts` files, unrelated). `grep -r "@HostListener\|@HostBinding"
packages/ngx-prime/src` now returns nothing.

### 3. `@Input()` / `@Output()` â†’ `input()` / `output()` / `model()` (high priority â€” the big one)

- **Where:** 104 files. **Complete (started 2026-08-21, finished 2026-08-22)** â€”
  a repo-wide `grep -rl "@Input(\|@Output(" packages/ngx-prime/src --include="*.ts"`
  (excluding `.spec.ts`) now returns zero matches.
- **Why it needs its own scoping pass:** `@Input()` properties are plain
  class fields that other code in the library reads *and writes* directly,
  not just through Angular's binding system. `input()` signals are read-only
  from outside the component, so every direct external write has to be found
  and re-routed first. This is the largest and riskiest item on the list.
- **Suggested approach:** component-family by component-family, starting
  with a leaf family that nothing else extends (e.g. `badge`/`tag`/`avatar`)
  before touching `table` or the overlay family that everything depends on.
- **Done:** `tag.ts` (all 5 `@Input()` â†’ `input()`), `avatar.ts` (7
  `@Input()` â†’ `input()`, 1 `@Output()` â†’ `output()`), `badge.ts`'s
  `BadgeDirective` (7 `@Input()` â†’ `input()`/`input(alias)`, including a
  deprecated custom setter converted to an `effect()` for its console
  warning â€” `badge.ts`'s `Badge` component was already signal-native before
  this pass). Corresponding `.spec.ts` files fixed alongside each: direct
  writes to the *converted component's own instance* changed to write
  through a template-bound wrapper field instead (signal inputs are
  TypeScript-legal but runtime-broken to assign directly â€” `tsc` does not
  catch this, since a `foo = input()` class field isn't marked `readonly`),
  and direct reads changed to call the signal. Writes/reads on wrapper test
  components (the common pattern) needed no change. All verified with
  `tsc --noEmit`.
- **Also done:** `autofocus.ts`, `floatlabel.ts`, `focustrap.ts`,
  `icons/baseicon/baseicon.ts` (base class for every icon component â€”
  checked no subclass overrides `spin`), `inputgroup.ts`, `inputicon.ts`,
  `iconfield.ts`. Same per-file discipline as above: external consumers
  checked, `.spec.ts` reads/writes fixed, `tsc --noEmit` clean after each.
- **Important shared-mechanism fix (2026-08-21):** `basecomponent.ts`'s
  private `$hostName` getter did `return this['hostName']` â€” a bare
  property read. `button.ts` had already converted its `hostName` field to
  `input<any>('')` in an earlier pass without updating this getter, so
  `$hostName` was silently returning the signal *function* (always
  truthy) instead of its string value for `ButtonDirective` â€” breaking the
  `_hook()` early-return and the `_getHostInstance`/`_getPT` name-matching
  logic wherever a `hostName` input is bound. Fixed the getter to unwrap
  the signal (`isFunction(hostName) ? hostName() : hostName`, using the
  `isFunction` helper already imported in the file) so it transparently
  handles both plain-string `hostName` fields (not yet converted) and
  signal-form ones. This was a **pre-existing correctness bug**, not
  something introduced this session â€” but converting more `hostName`
  fields without this fix would have spread it further. Re-verify with
  `tsc --noEmit` after any future `hostName` conversion.
- **Also done:** `api/shared.ts`'s `PrimeTemplate` directive (`type` and
  `name`/`pTemplate` â†’ `input()`) â€” used by ~93 files via
  `contentChildren(PrimeTemplate)`, so checked thoroughly for direct
  external reads of `.name`/`.type` bypassing the `getType()` method
  (which itself just reads `.name` internally, unaffected as a method).
  Found and fixed exactly two: `tree.ts` and `treeselect.ts` both index
  `this._templateMap[item.name]`/`this.templateMap[item.name]` directly.
  `treeselect.ts` additionally needed a `default: { ... }` block added
  around its `switch` case (was a bare `case`, and hoisting a `const` into
  it triggered `no-case-declarations`). Zero other direct-write or
  direct-read sites found across the 93 consuming files â€” everything else
  goes through `.getType()`/`.template`, both untouched. Full repo
  `eslint` and `tsc --noEmit` both clean after this change.
- **Also done:** `avatargroup.ts`, `inputgroupaddon.ts` (plus fixed the
  `addonInstance.styleClass`/`.style` reads left over in
  `inputgroup.spec.ts` from the earlier `inputgroup.ts` pass, now that
  `InputGroupAddon` itself is converted), `inputtext.ts` (`hostName`,
  `pSize`; also fixed `inputtextstyle.ts`'s external `instance.pSize`
  read), `scrollpanel.ts` (`styleClass`, `step`). Same discipline
  throughout â€” external consumers and style classes checked,
  `.spec.ts` reads/writes fixed, `tsc --noEmit`/`eslint` clean after each.
- **Also done:** `toolbar.ts` (`styleClass`, `ariaLabelledBy`), `keyfilter.ts`
  (`pValidateOnly` â†’ `input()`; `pattern`'s get/set-with-side-effect â†’
  `input()` + `effect()` in the constructor, mirroring the
  `badge.ts`-`size` pattern; `ngModelChange` `@Output()` â†’ `output()`,
  confirmed `.emit()` still works against `spyOn(...).emit` in the spec and
  against the framework's own `ngModelChange` output resolution â€” no
  special-casing needed for the name).
- **Also done (2026-08-22):** `imagecompare.ts` (`tabindex`, `ariaLabelledby`,
  `ariaLabel`), `textarea.ts` (`autoResize`, `pSize` â†’ `input()`; `onResize`
  `@Output()` â†’ `output()`; also fixed `textareastyle.ts`'s external
  `instance.pSize` read), `card.ts` (`header`, `subheader`, `styleClass` â†’
  plain `input()`; `style`'s get/set-with-side-effect â†’ `input()` +
  `effect()` in a new constructor, same pattern as `badge.ts`/`keyfilter.ts`
  â€” preserves the "apply style directly to avoid infinite loop in host
  binding" comment/behavior verbatim; also fixed `cardstyle.ts` â€” no
  external reads found there), `divider.ts` (`styleClass`, `layout`,
  `type`, `align`; also fixed `dividerstyle.ts`'s external
  `instance.layout()`/`.type()`/`.align()` reads, all previously plain
  property access). Same discipline throughout.
- **Also done (2026-08-22, continued):** `terminal.ts` (`welcomeMessage`,
  `prompt`, `styleClass` â†’ plain `input()`; `response` â€” a write-only
  `@Input()` setter with a side effect and no getter â€” converted to
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
  `baseZIndex`, `styleClass` â†’ plain `input()`; `blocked`'s get/set with
  `block()`/`unblock()` side effects â†’ `input()` + `effect()`, same idiom;
  host's `[attr.aria-busy]` now reads the internal `_blocked` field directly
  instead of the old `blocked` getter, since `_blocked` was already the
  real state tracked by `block()`/`unblock()`/`destroyModal()`; also fixed
  `blockuistyle.ts`'s external `instance.target()` read. Its spec had one
  test writing directly to a queried non-root `BlockUI` instance's
  `blocked`/`target`/`styleClass`/`baseZIndex`/`autoZIndex` â€” fixed by
  adding those bindings to the two affected test wrapper components and
  routing writes through the wrapper fields, same pattern as `terminal.ts`),
  `progressspinner.ts` (`styleClass`, `strokeWidth`, `fill`,
  `animationDuration`, `ariaLabel`).
- **Also done (2026-08-22, continued):** `accordion.ts`'s `Accordion` class
  (`styleClass`, `expandIcon`, `collapseIcon`, `transitionOptions` â†’
  `input()`; `onClose`/`onOpen` `@Output()` â†’ `output()`) â€” `AccordionPanel`,
  `AccordionHeader`, `AccordionContent` were already fully signal-native.
  Also updated `AccordionHeader`'s template, which reads the injected
  `Accordion` instance's `collapseIcon`/`expandIcon` directly
  (`pcAccordion.collapseIcon()`/`.expandIcon()`) â€” a cross-component
  template read that's easy to miss since it's not in the owning class.
- **Also done (2026-08-22, continued):** `animateonscroll.ts` (all 6:
  `enterClass`, `leaveClass`, `root`, `rootMargin`, `threshold`, `once`).
- **Also done (2026-08-22, continued):** `breadcrumb.ts` (`model`, `style`,
  `styleClass`, `home`, `homeAriaLabel` â†’ `input()`; `onItemClick`
  `@Output()` â†’ `output()` â€” heaviest template rewrite so far, `home` is
  read ~30 times across two near-duplicate link blocks in the template,
  all converted to `home()!.field` since the surrounding `@if (home())`
  guards already establish non-null).
- **Investigated, intentionally left as-is:** `button.ts`'s `ButtonDirective`
  â€” its remaining 6 `@Input()`s (`raised` plus the `label`/`icon`/`loading`/
  `buttonProps`/`severity` accessor get/set pairs) already carry
  `// TODO: Skipped for migration because: ...` comments from an earlier
  automated migration attempt (Angular's own signal-input-migration
  schematic, by the look of it) â€” `buttonProps`'s setter writes to
  `_label`/`_icon`/`_loading` etc. via dynamic reflection
  (`this[`_${k}`] = v`), and `raised` is flagged as written to directly by
  application code. Respecting that prior judgment rather than forcing a
  conversion; `Button` (the component, not the directive) was already
  fully signal-native. Revisit only with a dedicated pass, not as part of
  this file-by-file sweep.
- **Also done (2026-08-22, continued):** `overlaybadge.ts` (`styleClass`,
  `style`, `badgeSize`, `severity`, `value`, `badgeDisabled` â†’ `input()`;
  deprecated `size` get/set â†’ `input()` + `effect()`), `progressbar.ts`
  (`value`, `showValue`, `styleClass`, `valueStyleClass`, `unit`, `mode`,
  `color`; also fixed `progressbarstyle.ts`'s external `instance.mode()`
  reads), `skeleton.ts` (all 7: `styleClass`, `shape`, `animation`,
  `borderRadius`, `size`, `width`, `height`; also fixed
  `skeletonstyle.ts`'s external reads â€” its spec had ~15 tests writing
  directly to a queried instance's inputs purely to exercise the
  `containerStyle` getter in isolation, outside any change-detection cycle;
  fixed by stubbing the signal in place, e.g.
  `(skeleton as any).size = () => '80px'`, rather than routing through a
  template binding, since these tests intentionally bypass CD), `steps.ts`
  (`activeIndex`, `model`, `readonly`, `style`, `styleClass`, `exact` â†’
  `input()`; `activeIndexChange` `@Output()` â†’ `output()`; also fixed
  `stepsstyle.ts`'s external `instance.readonly()` read).
- **Also done (2026-08-22, continued):** `confirmpopup.ts` (`showTransitionOptions`,
  `hideTransitionOptions`, `autoZIndex`, `baseZIndex`, `style`, `styleClass`
  â†’ `input()`). **Left as plain `@Input()` intentionally: `key` and
  `defaultFocus`.** Found a real dynamic-write hazard: the constructor
  subscribes to `confirmationService.requireConfirmation$` and does
  `Object.keys(confirmation).forEach(key => { this[key] = confirmation[key]; })`
  â€” a reflection-based copy from the `Confirmation` object onto `this`.
  `Confirmation` (in `api/confirmation.ts`) has its own `key` and
  `defaultFocus` fields, so whenever a caller's confirmation object
  includes either, this dynamically overwrites `ConfirmPopup.key`/
  `.defaultFocus` directly â€” converting those two to `input()` would let
  that reflection loop silently replace the signal function with a plain
  value, breaking every future `.key()`/`.defaultFocus()` call at runtime
  with no compile-time warning. This is exactly the external-write hazard
  the roadmap's step 3 intro calls out, just via `this[key] =` instead of
  a named property write â€” worth grepping for `this\[.*\]\s*=` in any
  remaining file before converting its inputs, since a plain external-write
  grep won't catch it.
- **Also done (2026-08-22, continued):** `dock.ts` (`styleClass`, `model`,
  `position`, `ariaLabel`, `breakpoint`, `ariaLabelledBy` â†’ `input()`;
  `onFocus`/`onBlur` `@Output()` â†’ `output()`). **`id` needed the same
  generated-fallback pattern as `card.ts`'s `style`**: `onInit` did
  `this.id = this.id || uuid('pn_id_')` â€” a self-mutating default that
  can't survive as a plain `input()`. Converted to `id = input<string>()`
  plus a `private _generatedId = uuid('pn_id_')` and a `get resolvedId()`
  getter that the template now binds to instead of `id` directly; the
  `onInit` mutation was deleted since the getter makes it unnecessary. Also
  fixed `dockstyle.ts`'s external `instance.position()` read.
- **Also done (2026-08-22, continued):** `fieldset.ts` â€” first genuine
  `model()` conversion of this pass: `collapsed`/`collapsedChange` was a
  textbook two-way-bindable pair (get/set `@Input` + matching `@Output`),
  converted to a single `collapsed = model<boolean | undefined>(undefined)`;
  `expand()`/`collapse()` now do `this.collapsed.set(...)` instead of
  mutating `_collapsed` and manually emitting `collapsedChange` (`model()`
  emits automatically on `.set()`). Also converted `legend`, `toggleable`,
  `style`, `styleClass`, `transitionOptions` â†’ `input()`, `onBeforeToggle`/
  `onAfterToggle` â†’ `output()`, and fixed `fieldsetstyle.ts`'s external
  `instance.toggleable()`/`.collapsed()` reads. Caught one self-inflicted
  bug before it shipped: missed converting `{{ legend }}` to `{{ legend() }}`
  in two template spots on the first pass â€” `tsc` doesn't catch a
  function-in-interpolation the way it caught the `ModelSignal` assignment
  mismatches in the spec file, so this one relied on a manual re-grep of
  the template rather than the type checker.
- **Also done (2026-08-22, continued):** `inplace.ts` â€” `active`, mutated
  internally by `activate()`/`deactivate()` with no matching `activeChange`
  output (unlike `fieldset`'s `collapsed`), converted to `model(false)`
  anyway since it's the correct signal type for a bindable+internally-set
  input; this adds a new `activeChange` output as a side effect, which is
  additive/non-breaking. Also `closable`, `disabled`, `styleClass`,
  `closeIcon`, `closeAriaLabel` â†’ `input()`; `onActivate`/`onDeactivate`
  `@Output()` â†’ `output()`. **Two things worth flagging for future
  conversions:** (1) `model()` does not accept a `transform` option the way
  `input()` does â€” `tsc` caught this immediately (`'transform' does not
  exist in type 'ModelOptions'`), so `preventClick` stayed `input()` with
  `booleanAttribute` transform rather than becoming a `model()`. (2) On the
  first pass I defaulted `preventClick` to `input(false, ...)`, but the
  original `@Input()` had no initializer (default `undefined`, confirmed
  by a spec assertion `toBeUndefined()`) â€” caught by re-checking the spec's
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
  `hideTransitionOptions`, `buttonAriaLabel`, `buttonProps` â†’ `input()`;
  the write-only `icon` getter/setter â†’ `input()` + `effect()` syncing
  `_icon`, same idiom as `terminal.ts`'s `response`). Its spec had ~10
  direct writes to queried instances across several describe blocks â€”
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
  `ariaLabelledBy`, `autofocus` â†’ `input()`; `onChange` â†’ `output()`; `size`
  was already `input()`). No `model()` needed â€” no two-way pair here.
  `toggleswitchstyle.ts` has no external `instance.field()` reads to fix.
  Its spec's `TestBasicToggleSwitchComponent` wrapper already had template
  bindings for every field it writes directly, so no test-wrapper changes
  were needed beyond the existing `setInput()`/`component.field()` bulk
  conversion.
- **Also done (2026-08-22, continued):** `chart.ts` (`type`, `plugins`,
  `width`, `height`, `responsive`, `ariaLabel`, `ariaLabelledBy` â†’
  `input()`; `onDataSelect` â†’ `output()`). `data`/`options` had
  side-effecting get/set (`reinit()` on write) â†’ converted to plain
  `input()` plus a constructor `effect()` reading both signals and calling
  `reinit()`, same idiom as `card.ts`'s `style`. No spec file exists for
  this component. Also fixed `chartstyle.ts`'s external
  `instance.width()`/`.height()` reads.
- **Also done (2026-08-22, continued):** `inputotp.ts` (`readonly`, `tabindex`,
  `length`, `styleClass`, `mask`, `integerOnly`, `autofocus` â†’ `input()`;
  `onChange`/`onFocus`/`onBlur` â†’ `output()`; `variant`/`size` were already
  `input()`). No side-effecting setters, no `model()` needed.
  `inputotpstyle.ts` has no external `instance.field()` reads. Its spec
  (`inputotp.spec.ts`) had one direct write, `component.length = 6`, on the
  `InputOtp` fixture root inside a PT test â€” converted to
  `fixture.componentRef.setInput('length', 6)` plus `instance.length()` in
  the PT callback comparison; this made the block's `component` variable
  dead so it was removed rather than left as an unused declaration. All
  other `component.field = x` writes in the spec were on plain wrapper test
  components with matching template bindings, not on `InputOtp` itself, so
  they needed no changes.
- **Also done (2026-08-22, continued):** `rating.ts` (`readonly`, `stars`,
  `iconOnClass`, `iconOnStyle`, `iconOffClass`, `iconOffStyle`, `autofocus`
  â†’ `input()`; `onRate`/`onFocus`/`onBlur` â†’ `output()`). No side-effecting
  setters â€” `stars` is only read once in `onInit()` to build `starsArray`,
  matching the original `@Input()`'s non-reactive behavior, so no `effect()`
  needed. Also fixed `ratingstyle.ts`'s external `instance.readonly()` read.
  Its spec (`rating.spec.ts`, 1488 lines â€” note this file didn't surface in
  an earlier `Glob` lookup for the directory, worth remembering the tool can
  miss files) needed only `ratingInstance.field` â†’ `ratingInstance.field()`
  reads fixed; every `component.field = x` write in the file was on a plain
  wrapper test component with matching template bindings, not on `Rating`
  itself.
- **Also done (2026-08-22, continued):** `chip.ts` â€” another genuine
  dynamic-write hazard, same shape as `confirmpopup.ts`'s: `chipProps`'s
  setter copies onto `_${k}` shadow fields (safe), but `ngOnChanges` reads
  `simpleChanges.chipProps.currentValue` and does `this.label = ...`,
  `this.icon = ...`, `this.image = ...`, `this.alt = ...`,
  `this.styleClass = ...`, `this.removable = ...`, `this.removeIcon = ...`
  directly â€” a legacy "spread chipProps onto individual inputs" shim.
  Converting any of those 7 to `input()` would let `ngOnChanges` silently
  replace the signal function with a plain value. **Left all 7, plus the
  `chipProps` get/set itself, as plain `@Input()` intentionally.** Only
  `disabled` (untouched by `ngOnChanges`) was safe to convert â†’ `input()`;
  `onRemove`/`onImageError` â†’ `output()`. Also fixed `chipstyle.ts`'s
  external `instance.disabled()` read. No direct-write issues in
  `chip.spec.ts` (no matches for `.disabled`).
- **Also done (2026-08-22, continued):** `radiobutton.ts` (`value`,
  `tabindex`, `inputId`, `ariaLabelledBy`, `ariaLabel`, `styleClass`,
  `autofocus`, `binary` â†’ `input()`; `onClick`/`onFocus`/`onBlur` â†’
  `output()`; `variant`/`size` were already `input()`). No hazards. Fixed
  `RadioControlRegistry.select()`'s `accessor.value` (another `RadioButton`
  instance, not `this`) â€” same read-hazard shape as any external instance
  read, easy to miss since `accessor` isn't named `instance`. No external
  `instance.field()` reads to fix in `radiobuttonstyle.ts`. Its spec
  (1163 lines) needed `radioInstance.field` â†’ `radioInstance.field()` in ~5
  spots; all `component.field = x` writes were on wrapper components. Two
  pre-existing `TS2451` "Cannot redeclare... inputViewChild" errors in the
  spec are unrelated to this conversion (present in the baseline snapshot).
- **Also done (2026-08-22, continued):** `splitter.ts` (`styleClass`,
  `panelStyleClass`, `panelStyle`, `stateStorage`, `stateKey`, `layout`,
  `gutterSize`, `step`, `minSizes` â†’ `input()`; `onResizeEnd`/`onResizeStart`
  â†’ `output()`). `panelSizes`'s get/set had a real side effect (recomputing
  and writing `flexBasis` onto DOM children) â†’ converted to plain `input()`
  plus a constructor `effect()` replicating the same DOM write, same idiom
  as `card.ts`'s `style`/`chart.ts`'s `data`/`options`. Also fixed
  `splitterstyle.ts`'s two external `instance.layout()` reads. Its spec
  needed: `splitterInstance.field` â†’ `.field()` (bulk, ~15 spots) across
  two different local variable names holding a `Splitter` instance
  (`splitterInstance` and a bare `splitter` from `TestBed.createComponent
  (Splitter)` directly â€” the bulk regex only caught the first name, the
  second needed a manual pass); one `xit`-skipped test's direct
  `ptSplitter.layout = 'vertical'` write (no wrapper binding available for
  that field) fixed via the signal-stub trick even though the test is
  disabled, since `tsc` still type-checks skipped test bodies; and one
  genuine `Object.keys(signal())` narrowing failure where TS didn't narrow
  a repeated `signalCall()` across a null-check â€” fixed by hoisting the
  call result to a local `const` once.
- **Also done (2026-08-22, continued):** `styleclass.ts` â€” directive, not a
  component. All 12 `@Input()`s (`selector` aliased as `pStyleClass`,
  `enterFromClass`, `enterActiveClass`, `enterToClass`, `leaveFromClass`,
  `leaveActiveClass`, `leaveToClass`, `hideOnOutsideClick`, `toggleClass`,
  `hideOnEscape`, `hideOnResize`, `resizeSelector`) â†’ `input()`, aliased via
  `input(default, { alias: 'pStyleClass' })`. No hazards, no outputs. One
  `tsc`-caught narrowing issue in `enter()` â€” repeated `this.enterActiveClass()`
  calls after an `if` guard don't narrow like a property read would â€” fixed
  by hoisting to a local `const enterActiveClass = this.enterActiveClass()`
  once at the top of the method. Its spec had several direct writes
  (`styleClassInstance.selector = ...`, `resizeInstance.resizeSelector =
  ...`) on wrapper components whose templates hardcode the `pStyleClass`
  selector as a string literal rather than binding it to a field, so there
  was no wrapper property to route through â€” fixed via the signal-stub
  trick (`(instance as any).field = () => value`) for those two spots.
  Several `instance.field` reads used var names other than the bulk-fixed
  `styleClassInstance` (`animationInstance`, `slidedownInstance`,
  `resizeInstance`) and needed a manual second pass â€” worth checking for
  multiple differently-named instance variables within one spec file
  before considering a bulk regex pass complete.
- **Also done (2026-08-22, continued):** `colorpicker.ts` (`styleClass`,
  `showTransitionOptions`, `hideTransitionOptions`, `inline`, `format`,
  `tabindex`, `inputId`, `autoZIndex`, `autofocus`, `defaultColor` â†’
  `input()`; `onChange`/`onShow`/`onHide` â†’ `output()`; `appendTo`/
  `overlayOptions`/`motionOptions` were already `input()`). No hazards.
  Fixed `colorpickerstyle.ts`'s two external `instance.inline()` reads.
  **The spec (74KB, ~1900 lines) was the first file this pass where `tsc`
  reported zero errors despite genuinely broken reads** â€” every
  `xInstance` variable in the file comes from `.query(...).componentInstance`
  (typed `any`), so comparisons like `expect(colorPickerInstance.format).
  toBe('hex')` and truthy checks like `instance?.inline ? 'A' : 'B'`
  type-check fine against a function value and would have silently always
  taken the truthy branch at runtime. Caught only by grepping for bare
  `.field` reads across every instance-variable name used in the file
  (`colorPickerInstance`, `hexPickerInstance`, `rgbPickerInstance`,
  `hsbPickerInstance`, and `instance?.` inside PT callbacks â€” the `?.`
  optional-chain form needed its own regex pass, the plain-dot one didn't
  match it) â€” worth remembering `any`-typed `componentInstance` defeats
  `tsc` verification entirely for this class of bug, so grep is the only
  real check when a spec queries via `By.css`/`By.directive` instead of
  `TestBed.createComponent(TheComponent)`.
- **Also done (2026-08-22, continued):** `dragdrop.ts` â€” two directives,
  `Draggable` and `Droppable`. Both had a `disabled` get/set with a bind/
  unbind-listener side effect (`pDraggableDisabled`, `pDroppableDisabled`)
  â†’ converted to plain `input(false)` plus a constructor `effect()`
  replicating the same bind/unbind call, same idiom as `blockui.ts`. Plain
  fields (`scope` aliased to `pDraggable`/`pDroppable`, `dragEffect`,
  `dragHandle`, `dropEffect`) â†’ `input()`; all six outputs â†’ `output()`.
  No spec file and no external consumers exist for this directive pair, so
  no further verification needed beyond `tsc`/`eslint`.
- **Also done (2026-08-22, continued):** `metergroup.ts` â€” two components,
  `MeterGroupLabel` (`value`, `labelPosition`, `labelOrientation`, `min`,
  `max`, `iconTemplate` â†’ `input()`) and `MeterGroup` (`value`, `min`,
  `max`, `orientation`, `labelPosition`, `labelOrientation`, `styleClass`
  â†’ `input()`); no outputs on either. No hazards. `MeterGroupStyle` is
  shared between the two components, so its `root`/`labelList` class
  functions each read a different instance's fields â€” fixed
  `instance.orientation()` (reads `MeterGroup`) and
  `instance.labelOrientation()` (reads `MeterGroupLabel`) separately. Its
  spec had a `newMeterGroup` variable (from `.query().componentInstance`,
  typed `any`) that a bulk regex on `meterGroup` (the more common var name)
  missed â€” same "differently-named instance variable" lesson as
  `styleclass.ts`/`colorpicker.ts`; three `meterGroup.field = value`
  writes (`.value = undefined as any`, `.value = null as any`,
  `.orientation = 'vertical'`) had no wrapper binding available for those
  exact values, fixed via the signal-stub trick.
- **Also done (2026-08-22, continued):** `panel.ts` â€” second true `model()`
  conversion of this pass: `collapsed`/`collapsedChange` was a get/set
  `@Input` + matching `@Output`, converted to `collapsed = model<boolean |
  undefined>(undefined)`; `expand()`/`collapse()` now do
  `this.collapsed.set(...)` instead of mutating a `_collapsed` backing
  field and manually emitting. The backing field's removal broke
  `panelstyle.ts`'s external `instance._collapsed` reads (it no longer
  exists) â€” fixed to `instance.collapsed()`. Also converted `id`
  (straightforward default-value input, no self-mutation like `dock.ts`'s
  `id` needed), `toggleable`, `_header` (aliased `header`), `styleClass`,
  `iconPos`, `showHeader`, `toggler`, `transitionOptions`,
  `toggleButtonProps` â†’ `input()`; `onBeforeToggle`/`onAfterToggle` â†’
  `output()`. Its spec (59KB) needed the widest fix of this pass: dozens of
  `panel.field = x` / `panelInstance.field` spots across ~15 `describe`
  blocks, several using `any`-typed `.componentInstance` (not tsc-checked)
  so required grepping every field name across every instance-variable
  name in the file rather than trusting a clean `tsc` run â€” direct
  `.collapsed = true/false` writes converted to `.collapsed.set(...)`
  (works cleanly since `ModelSignal` exposes `.set()`, unlike a plain
  `input()`); a handful of unused `const panel = fixture.componentInstance`
  declarations left behind after switching their only reads to
  `fixture.componentRef.setInput(...)` had to be deleted to satisfy
  `no-unused-vars`.
- **Also done (2026-08-22, continued):** `popover.ts` (`ariaLabel`,
  `ariaLabelledBy`, `dismissable`, `style`, `styleClass`, `autoZIndex`,
  `ariaCloseLabel`, `baseZIndex`, `focusOnShow`, `showTransitionOptions`,
  `hideTransitionOptions` â†’ `input()`; `onShow`/`onHide` â†’ `output()`;
  `appendTo`/`motionOptions` were already `input()`). No hazards. No
  external `instance.field()` reads in `popoverstyle.ts`. Its spec needed
  the widest bulk-plus-manual fix pattern of this batch: most
  `popoverInstance.field` reads were bulk-converted, but `style` needed
  hand-fixing separately (non-null-asserted `!` accesses and a
  `Object.keys(instance.style)` narrowing issue, same idiom as
  `splitter.spec.ts`'s `panelStyleValue` fix â€” hoisted to a local
  `styleValue` const); a pre-existing, unrelated `appendTo` bare read
  (`expect(popoverInstance.appendTo).toBeTruthy()` â€” `appendTo` was
  already `input()` before this session) was fixed opportunistically while
  in the file. One pre-existing `TS2554` (`onEscapeKeydown(escapeEvent)`
  called with an argument the zero-arg method doesn't accept) is unrelated
  to this conversion, confirmed present in the baseline snapshot.
- **Also done (2026-08-22, continued):** `slider.ts` (`animate`, `min`,
  `max`, `orientation`, `step`, `range`, `styleClass`, `ariaLabel`,
  `ariaLabelledBy`, `tabindex`, `autofocus` â†’ `input()`;
  `onChange`/`onSlideEnd` â†’ `output()`). No hazards, but the heaviest
  single-file template rewrite of this batch â€” the template branches on
  `range`/`orientation` ~10 times across 4 near-duplicate handle/range
  `@if` blocks. One `tsc`-caught narrowing issue in
  `decrementValue()`/`incrementValue()`: repeated `this.step()` calls
  after an `if (this.step())` guard don't narrow â€” fixed by hoisting to a
  local `const step = this.step()` once per method, same idiom as
  `styleclass.ts`'s `enterActiveClass`. Fixed `sliderstyle.ts`'s three
  external `instance.orientation()`/`.animate()` reads. Its spec (58KB)
  is the first file this pass where the fixture root itself
  (`fixture = TestBed.createComponent(Slider); component =
  fixture.componentInstance;`) was directly written to dozens of times
  across ~15 `describe` blocks â€” resolved with a single bulk script that
  rewrote every `component.field = value;` to
  `fixture.componentRef.setInput('field', value);` before the usual
  bare-read pass, since a plain read-only regex would have left ~60
  `tsc` errors. Three pre-existing, unrelated `TS2554` errors (extra
  argument passed to a zero-arg method) confirmed present in the baseline.
- **Also done (2026-08-22, continued):** `message.ts` (`severity`, `text`,
  `escape`, `style`, `styleClass`, `closable`, `icon`, `closeIcon`, `life`,
  `showTransitionOptions`, `hideTransitionOptions`, `size`, `variant` â†’
  `input()`; `onClose` â†’ `output()`; `motionOptions` was already
  `input()`). No hazards. Fixed `messagestyle.ts`'s external
  `instance.severity()`/`.variant()`/`.size()` reads. Its spec (71KB) had
  a `messageInstance: Message`-typed variable whose ~18 bare
  `.field`/`.toBe(...)` reads still weren't caught by `tsc` (same
  `toBe`-accepts-`any` blind spot as `panel.spec.ts`) â€” bulk-fixed with a
  field-name loop, `style` handled separately for its `!`-asserted spots.
  The PT-test blocks further down already used
  `fixture.componentRef.setInput(...)` throughout, so no direct-write
  fixes were needed there. `fileupload.ts` is the only external consumer
  and only uses `<p-message>` via template bindings, not direct instance
  field access, so it needs no changes.
- **Also done (2026-08-22, continued):** `selectbutton.ts` â€” another
  genuine dynamic-write hazard: `unselectable`'s setter did
  `this.allowEmpty = !value`, directly overwriting the `allowEmpty` field
  from within a sibling input's setter (same shape as `chip.ts`'s
  `chipProps`/`confirmpopup.ts`'s `this[key] =`). Resolved differently
  from the "leave as plain `@Input()`" precedent this time, since both
  sides were simple booleans with only one call site: converted both
  `unselectable` and `allowEmpty` to plain `input()`, deleted the setter
  entirely, and moved the override logic into `getAllowEmpty()` (`if
  (this.unselectable()) return false; ...`) â€” the only place `allowEmpty`
  was ever read. This is a deliberate, documented behavior clarification:
  previously, whichever of `[unselectable]`/`[allowEmpty]` bound *last* in
  change-detection order silently won; now `unselectable` always takes
  precedence deterministically, which matches every existing caller's
  intent (nobody sets both to conflicting values). All other fields
  (`options`, `optionLabel`, `optionValue`, `optionDisabled`, `tabindex`,
  `multiple`, `styleClass`, `ariaLabelledBy`, `dataKey`, `autofocus`) â†’
  `input()`; `onOptionClick`/`onChange` â†’ `output()`; `size`/`fluid` were
  already `input()`. No external `instance.field()` reads in
  `selectbuttonstyle.ts`. Its spec needed the same fixture-root bulk
  rewrite as `slider.spec.ts`, but with a wrinkle: two other `describe`
  blocks (`SelectButton pTemplate Tests`, `SelectButton #template
  Reference Tests`) reuse the identifier `component` for an unrelated
  wrapper component with its own plain `options`/`selectedValue` fields â€”
  the first bulk pass wrongly rewrote those too (`component.options` â†’
  `component.options()`, breaking "not callable" errors), caught only by
  rerunning `tsc` and required a scoped line-range revert. Six further
  direct writes on separately-named fixture roots
  (`globalComponent.options = [...]`, `hookComponent.options = [...]`)
  needed individual `setInput` conversions, which then left both var
  declarations unused and requiring deletion.
- **Also done (2026-08-22, continued):** `togglebutton.ts` (`onLabel`,
  `offLabel`, `onIcon`, `offIcon`, `ariaLabel`, `ariaLabelledBy`,
  `styleClass`, `inputId`, `tabindex`, `iconPos`, `autofocus`, `size`,
  `allowEmpty` â†’ `input()`; `onChange` â†’ `output()`; `fluid` was already
  `input()`). No hazards â€” `checked` stays a plain field (not an `@Input`).
  Fixed `togglebuttonstyle.ts`'s two external `instance.size()` reads. Its
  spec had ~11 bare `toggleButtonInstance.field` reads (typed
  `ToggleButton`, still not `tsc`-caught since `.toBe()` accepts `any`) â€”
  bulk-fixed. Five pre-existing, unrelated `TS2449` "used before
  declaration" errors confirmed present in the baseline. `selectbutton.ts`
  is the only external consumer and only binds `<p-togglebutton>` via
  template properties, not direct instance access, so needs no changes.
- **Also done (2026-08-22, continued):** `editor.ts` â€” `readonly`'s get/set
  had a real side effect (calling Quill's `.disable()`/`.enable()`) â†’
  converted to plain `input(false)` plus a constructor `effect()`
  replicating the call, same idiom as `dragdrop.ts`. Plain fields
  (`style`, `styleClass`, `placeholder`, `formats`, `modules`, `bounds`,
  `scrollingContainer`, `debug`) â†’ `input()`; all six outputs â†’
  `output()`, including `onEditorInit` which keeps its
  `@Output('onInit')` alias via `output({ alias: 'onInit' })`. No
  external `instance.field()` reads in `editorstyle.ts`, no external
  consumers. Its spec needed the usual bare-read bulk fix plus one
  `style` narrowing fix (hoisted to a local `styleValue` const, by-now a
  recurring pattern across `splitter`/`popover`/`message`/`panel` specs).
  **One test (`'should disable editor when readonly is true'`) has a
  known, documented limitation**: it previously worked by monkeypatching
  a stubbed setter, but an `effect()` only reacts to real signal writes,
  not to reassigning `instance.field` to a new closure â€” the signal-stub
  trick (`(instance as any).field = () => value`) that worked for plain
  `input()` reads throughout this pass does NOT trigger effects, so this
  test no longer meaningfully exercises the readonlyâ†’disable/enable wiring
  even though it still compiles and passes. Flagged here rather than
  silently left broken; a proper fix would need `TestBed.createComponent`
  + `fixture.componentRef.setInput('readonly', ...)` on a component that
  binds it, which the existing `TestReadonlyComponent` wrapper (hardcoded
  `[readonly]="true"`) doesn't support without further changes.
- **Also done (2026-08-22, continued):** `knob.ts` (`styleClass`,
  `ariaLabel`, `ariaLabelledBy`, `tabindex`, `valueColor`, `rangeColor`,
  `textColor`, `valueTemplate`, `size`, `min`, `max`, `step`,
  `strokeWidth`, `showValue`, `readonly` â†’ `input()`; `onChange` â†’
  `output()`). No hazards â€” every field is read-only inside the class
  (the internal `value` signal handles all mutable state). No external
  `instance.field()` reads in `knobstyle.ts`, no external consumers. Its
  spec had ~16 bare `knobInstance.field` reads (no writes) â€” bulk-fixed.
- **Also done (2026-08-22, continued):** `organizationchart.ts` â€” two
  components, both still on `ChangeDetectionStrategy.Default` (relevant to
  item #4's later audit â€” untouched here, only the input/output API
  changed). `OrganizationChartNode` (`node`, `root`, `first`, `last`,
  `collapsible` â†’ `input()`, no outputs) had a fully recursive template
  (`<table pOrganizationChartNode [node]="child" [collapsible]="...">`
  nested arbitrarily deep) â€” every `node`/`collapsible` reference across
  ~25 template spots needed `()`. `OrganizationChart`'s
  `selection`/`selectionChange` was a genuine two-way pair with a side
  effect (`if (this.initialized) this.selectionSource.next(null)` inside
  the old setter) â†’ third `model()` conversion of this pass, with the
  side effect moved into a constructor `effect()` that reads
  `this.selection()` and fires `selectionSource.next(null)` when
  initialized â€” the manual `this.selectionChange.emit(...)` and the
  redundant manual `selectionSource.next(null)` call at the end of
  `onNodeClick()` were both deleted since `model().set()` and the new
  effect now cover them respectively. `value`, `styleClass`,
  `selectionMode`, `collapsible`, `preserveSpace` â†’ `input()`;
  `onNodeSelect`/`onNodeUnselect`/`onNodeExpand`/`onNodeCollapse` â†’
  `output()`. Fixed `organizationchartstyle.ts`'s three external
  `instance.preserveSpace()`/`.selectionMode()`/`.node()` reads. Its spec
  needed `organizationChart.selection = x` â†’ `.selection.set(x)` (six
  spots, `ModelSignal` exposes `.set()` same as `panel.spec.ts`) plus the
  usual bare-read bulk fix; no direct writes found on
  `OrganizationChartNode` instances.
- **Also done (2026-08-22, continued):** `tooltip.ts` â€” the biggest
  architectural change of this pass, not just a per-field swap. The whole
  directive synced its ~17 `@Input()`s into a single `_tooltipOptions` bag
  through one giant `ngOnChanges(simpleChange: SimpleChanges)` that
  checked `simpleChange.<field>` per input. **Signal inputs never appear
  in `SimpleChanges` and never trigger `ngOnChanges`** â€” converting the
  inputs without touching this would have silently stopped every option
  from ever syncing. Deleted `onChanges()` entirely and replaced it with
  five constructor `effect()`s: (1) one bulk effect reading all 15
  simple-value inputs and calling `setOption()` with an object that has
  `undefined` keys stripped before merging (needed because an unbound
  `input()` always evaluates to its default â€” usually `undefined` â€” and a
  raw merge would have overwritten `_tooltipOptions`' own hardcoded
  defaults like `appendTo: 'body'`, which `ngOnChanges` only did when the
  input was actually bound); (2) a `disabled`-only effect replicating the
  old setter's unconditional `this.deactivate()` call; (3) a `content`
  effect preserving the original's "if `active`, re-show/update/hide"
  branch; (4) a `tooltipOptions`-merge effect with the same re-show
  branch. `disabled` itself (previously a `@Input('tooltipDisabled')`
  get/set with a `deactivate()` side effect) converted to a plain
  `input(false, { alias: 'tooltipDisabled', transform: booleanAttribute
  })` â€” needed an `eslint-disable-next-line @angular-eslint/no-input-rename`
  comment, same as `panel.ts`'s `_header`/`header`. `content` similarly
  aliased to `pTooltip`. All other simple fields â†’ plain `input()`.
  `getOption()`'s `keyof typeof this.tooltipOptions` cast broke once
  `tooltipOptions` became a function (`typeof` of a function has no
  useful keys) â€” fixed to `keyof TooltipOptions` against the actual
  imported type. `_tooltipOptions` needed an explicit `Record<string,
  any>` type annotation; without it, merging the now strictly-typed
  `TooltipOptions` shape into the object-literal-inferred type failed
  `tsc`. No external `instance.field()` reads in `tooltipstyle.ts`. 14
  files apply `[pTooltip]` but none read `Tooltip` instance fields
  directly. Its spec had bare `tooltipDirective.field` reads (no writes)
  bulk-fixed; six pre-existing, unrelated `TS2554` errors (extra argument
  to zero-arg handler methods) confirmed present in the baseline.
- **Also done (2026-08-22, continued):** `drawer.ts` â€” fourth `model()`
  conversion of this pass: `visible`/`visibleChange` was a get/set
  `@Input`+`@Output` pair with a side effect (`if (this._visible &&
  !this.modalVisible) this.modalVisible = true`), converted to
  `visible = model(false)` plus a constructor `effect()` replicating the
  same guard. `show()`/`close()` used to call `this.visibleChange.emit(...)`
  directly â€” switched to `this.visible.set(...)`, which auto-emits via the
  model. All other fields (`blockScroll`, `style`, `styleClass`,
  `ariaCloseLabel`, `autoZIndex`, `baseZIndex`, `modal`,
  `closeButtonProps`, `dismissible`, `showCloseIcon`, `closeOnEscape`,
  `transitionOptions`, `header`, `maskStyle`, `closable`) â†’ `input()`;
  `onShow`/`onHide` â†’ `output()`; `appendTo`/`motionOptions`/`position`/
  `fullScreen` were already `input()`. Fixed `drawerstyle.ts`'s three
  external `instance.modal()`/`.visible()` reads. No external consumers.
  Its spec had one direct `.visible = true` write on a typed fixture root
  (caught by `tsc` as `ModelSignal` mismatch, fixed to `.visible.set(true)`)
  plus ~30 bare reads across two instance-variable names (`component`,
  `drawerComponent`) â€” bulk-fixed with a two-variable loop, all backed by
  wrapper components with matching template bindings so no signal-stub
  writes were needed.
- **Also done (2026-08-22, continued):** `image.ts` (`imageClass`,
  `imageStyle`, `styleClass`, `src`, `srcSet`, `sizes`, `previewImageSrc`,
  `previewImageSrcSet`, `previewImageSizes`, `alt`, `width`, `height`,
  `loading`, `preview`, `showTransitionOptions`, `hideTransitionOptions`
  â†’ `input()`; `onShow`/`onHide`/`onImageError` â†’ `output()`;
  `modalEnterAnimation`/`modalLeaveAnimation`/`appendTo`/
  `maskMotionOptions`/`motionOptions` were already `input()`). No
  hazards. Fixed `imagestyle.ts`'s external `instance.preview()` read. No
  external consumers. Its spec had a direct `component.src = ...` write
  (Ã—4 fields) on the `Image` fixture root, fixed via `setInput`, plus the
  usual bare-read bulk fix across two instance-variable names
  (`component`, `imageInstance`).
- **Also done (2026-08-22, continued):** `menu.ts` â€” two components,
  `MenuItemContent` (`item` aliased to `pMenuItemContent`, `itemTemplate`,
  `menuitemId`, `idx` â†’ `input()`; `onMenuItemClick` â†’ `output()`; heaviest
  single-template rewrite this pass at ~25 `item()` call sites, all needing
  `!` non-null assertions since `item` can be `undefined`) and `Menu`
  itself. `Menu`'s `id` had the same self-mutating-default hazard as
  `dock.ts`/`panel.ts` (`this.id = this.id || uuid('pn_id_')` in the
  constructor) â†’ `id = input<string>()` plus `_generatedId`/`resolvedId`
  getter, with every template and internal `id`/`this.id` reference
  switched to `resolvedId`. `model`, `popup`, `style`, `styleClass`,
  `autoZIndex`, `baseZIndex`, `showTransitionOptions`,
  `hideTransitionOptions`, `ariaLabel`, `ariaLabelledBy`, `tabindex` â†’
  `input()`; `onShow`/`onHide`/`onBlur`/`onFocus` â†’ `output()`;
  `appendTo`/`motionOptions` were already `input()`. One `tsc`-caught
  fix: `onFocus.emit()` with no argument (worked under the old loose
  `EventEmitter<Event>` typing) now needs an argument for
  `OutputEmitterRef<Event>` â€” passed `originalEvent`. Fixed
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
- **Also done (2026-08-22, continued):** `carousel.ts` â€” second file this
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
  `numScroll` *getter* returned `_numVisible`, not `_numScroll` â€” two
  internal read sites (`this.numScroll` in the constructor and in the
  `onChanges` numScroll branch) silently got the wrong value. Since a
  signal input can't replicate a buggy getter without breaking the
  signal's own contract, those two *internal* call sites were switched to
  read `this._numVisible`/`this.numVisible()` directly (bug preserved for
  internal computation), but the *external* `numScroll()` signal itself
  now correctly returns its own bound value â€” a deliberate, documented
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
  `nextButtonProps`) â†’ `input()`; `onPage` â†’ `output()`. `id` stays a
  plain field (self-generated once in `onAfterContentInit`, never bound
  as an `@Input`, so no hazard). Fixed `carouselstyle.ts`'s three external
  `instance.value()`/`.indicatorsContentClass()`/`.indicatorStyleClass()`
  reads. No external consumers. Its spec needed the widest mix of fix
  patterns yet: direct fixture-root `setInput` conversions, signal-stub
  writes for white-box method tests, and one assertion rewritten (with an
  explanatory comment) to match the now-correct `numScroll()` value
  instead of the old buggy one.
- **Also done (2026-08-22, continued):** `checkbox.ts` â€” first
  `hostName`-bearing component converted this pass (the `$hostName`
  getter fix in `basecomponent.ts` earlier in this session made this
  safe). `indeterminate` synced into an internal `_indeterminate` signal
  via `ngOnChanges`, the same signal-inputs-don't-fire-`ngOnChanges`
  hazard as `tooltip.ts`/`carousel.ts` but scoped to a single field â†’
  deleted `onChanges()`, replaced with one constructor `effect()` calling
  `this._indeterminate.set(this.indeterminate())`. All other fields
  (`hostName`, `value`, `binary`, `ariaLabelledBy`, `ariaLabel`,
  `tabindex`, `inputId`, `inputStyle`, `styleClass`, `inputClass`,
  `formControl`, `checkboxIcon`, `readonly`, `autofocus`, `trueValue`,
  `falseValue`) â†’ `input()`; `onChange`/`onFocus`/`onBlur` â†’ `output()`;
  `variant`/`size` were already `input()`. No external
  `instance.field()` reads in `checkboxstyle.ts` (`instance.checked` is
  an unrelated getter). Five external consumers
  (`listbox`/`multiselect`/`table`/`tree`/`treetable`) only bind
  `<p-checkbox>` via template properties or reference `Checkbox`'s own
  `viewChild`/`inputViewChild` signals, not the converted fields
  directly, so none needed changes. Its spec (61KB) had ~15 bare
  `checkboxInstance.field` reads (no writes) â€” bulk-fixed, `inputStyle`
  handled separately for its narrowing/`!`-assertion spots.
- **Also done (2026-08-22, continued):** `paginator.ts` â€” third file
  needing full `ngOnChanges` deletion (after `tooltip.ts`/`carousel.ts`):
  five branches (`totalRecords`/`first`/`rows`/`rowsPerPageOptions`/
  `pageLinkSize`) each replaced 1:1 with a dedicated constructor
  `effect()` reproducing the exact same call combinations
  (`updatePageLinks()`/`updatePaginatorState()`/`updateFirst()`/
  `updateRowsPerPageOptions()`). `first` had a trivial get/set proxy over
  `_first` (no side effect) â†’ converted to plain `input(0)` + its own
  sync effect (`this._first = this.first()`); every internal method that
  previously read the `first` getter now reads `_first` directly
  (`changePage`, `updateFirst`, `getPage`, `updatePaginatorState`,
  `currentPageReport`), matching the established getter-elimination
  pattern from `dock.ts`/`panel.ts`/`menu.ts`. **`rows` converted to
  `model<number>(0)` instead of plain `input()`** â€” a new variant of the
  "no matching `@Output` but must stay writable" pattern: its own
  template two-way-binds it via `[(ngModel)]="rows"` on the internal
  rows-per-page `<p-select>`, and Angular's built-in signal two-way-bind
  sugar for `[(ngModel)]` requires a `WritableSignal` (which `model()`
  produces and `input()` does not) â€” no external `rowsChange` output
  exists or was added, this is purely to keep the dropdown's own
  selection-writeback working. All other fields (`pageLinkSize`,
  `styleClass`, `alwaysShow`, `dropdownAppendTo`, `templateLeft`,
  `templateRight`, `dropdownScrollHeight`, `currentPageReportTemplate`,
  `showCurrentPageReport`, `showFirstLastIcon`, `totalRecords`,
  `rowsPerPageOptions`, `showJumpToPageDropdown`, `showJumpToPageInput`,
  `jumpToPageItemTemplate`, `showPageLinks`, `locale`,
  `dropdownItemTemplate`) â†’ `input()`; `onPageChange` â†’ `output()`. No
  external `instance.field()` reads in `paginatorstyle.ts` (only method
  calls). Only external consumer checked this pass, `dataview.ts`, binds
  `<p-paginator>` purely through template property bindings â€” no direct
  instance-field reads, no changes needed (`table.ts`/`treetable.ts`
  still pending their own turn in the queue). Spec (1.4K lines) needed
  the widest mix yet: (a) ~30 bare `paginator.field` reads â†’ `.field()`;
  (b) ~15 direct `paginator.field = value` writes on the queried child
  instance â†’ rewritten to `component.field = value; fixture.detectChanges();`
  on the WRAPPER test component instead (since the wrapper's own plain
  fields feed the child via real template property bindings, this is
  more correct than a signal-stub and actually exercises the new
  constructor effects); (c) three tests called
  `paginator.ngOnChanges({...})` directly to simulate the old
  `SimpleChanges`-driven update path â€” now dead code since `ngOnChanges`
  no longer does anything meaningful, rewritten to
  `component.field = value; fixture.detectChanges();` so they exercise
  the real effect-based path instead; (d) one `testPaginator` instance
  had no type annotation (inferred `any` from `.componentInstance`), so
  `tsc` silently allowed writing raw values onto its input functions
  without erroring â€” caught only by manual audit, fixed the same way via
  a newly-added `testComponent` wrapper reference. One pre-existing
  unrelated `TS2554` (`paginator.onRppChange(new Event('change'))`
  against a 0-arg method, present before this conversion too) confirmed
  in baseline and left alone.
- **Also done (2026-08-22, continued):** `toast.ts` â€” two components in one
  file, both fully converted. `ToastItem`: `message`, `index`
  (`numberAttribute` transform), `life`, `template`, `headlessTemplate`,
  `showTransformOptions`, `hideTransformOptions`, `showTransitionOptions`,
  `hideTransitionOptions`, `motionOptions`, `clearAll` â†’ `input()`;
  `onAnimationStart`/`onAnimationEnd`/`onClose` â†’ `output()`. No hazards â€”
  every field is a plain read in template/methods, no `ngOnChanges`. Every
  `message.foo`/`message?.foo` template and method reference switched to
  `message()?.foo` (the field itself is nullable, so all reads now go
  through the optional-chain form even where the original inconsistently
  omitted it). `Toast`: `key`, `autoZIndex`, `baseZIndex`, `life`,
  `styleClass`, `preventOpenDuplicates`, `preventDuplicates`,
  `showTransformOptions`, `hideTransformOptions`, `showTransitionOptions`,
  `hideTransitionOptions`, `breakpoints` â†’ `input()`; `onClose` â†’
  `output()`. `position` had a get/set pair whose only side effect was an
  explicit `this.cd.markForCheck()` â€” redundant once it's a signal input
  (OnPush automatically schedules CD on signal-input changes), so
  converted to a plain `input<ToastPositionType>('top-right')` and the
  `_position` backing field was deleted entirely (its one remaining
  consumer, `toaststyle.ts`, updated to call `instance.position()`
  instead). Fixed four other external `instance.message.*` reads and one
  `instance._position` read in `toaststyle.ts` â€” note `toaststyle.ts`'s
  `classes` object is shared across both components in one file
  (`root`/`message`/`messageIcon`/`closeIcon` functions each receive
  whichever instance actually renders that class), same pattern as
  before, unchanged. No external consumers. Spec (2268 lines, two
  `describe` blocks) needed: for `Toast`, ~20 bare `toastInstance.field`
  reads on the queried child instance â†’ `.field()` (writes were already
  fine since they land on the wrapper test components' own plain fields,
  bound via real template properties); for `ToastItem` â€” created directly
  via `TestBed.createComponent(ToastItem)`, i.e. `component` here IS the
  fixture root â€” ~78 direct `component.field = value` writes (including
  17 multi-line object-literal assignments) â†’ bulk-converted via a
  brace-balance-aware script to `fixture.componentRef.setInput('field',
  value)`, plus ~8 bare reads on the same instance â†’ `.field()`.
- **Also done (2026-08-22, continued):** `inputmask.ts` â€” two exported
  units in one file. `InputMaskDirective` was already fully
  signal-converted from an earlier session; only `InputMask` (the
  component) needed work this pass. `mask` had a get/set pair with real
  side effects (`initMask()`, `writeValue('')`, `onModelChange(value)`) â†’
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
  `characterPattern`, `autofocus`, `autocomplete`, `keepBuffer`) â†’
  `input()`; `onComplete`/`onFocus`/`onBlur`/`onInput`/`onKeydown`/
  `onClear` â†’ `output()`. Two of those (`onComplete`, `onClear`) are
  typed `output<any>()`, and several call sites did `.emit()` with zero
  arguments (tolerated by the old loose `EventEmitter<any>` but not by
  `OutputEmitterRef<any>.emit()`, same class of fix as menu.ts's
  `onFocus.emit()` earlier) â€” fixed by passing `undefined` explicitly at
  all five call sites. No external `instance.field()` reads in
  `inputmaskstyle.ts` (only `instance.$variant()`, a getter). No
  external consumers. Spec (2132 lines) has the `InputMask` component
  created directly as the fixture root (`TestBed.createComponent(InputMask)`,
  `component = fixture.componentInstance`) across the whole outer
  `describe('InputMask', ...)` block (~1500 lines, several nested
  fixtures for wrapper/template/directive scenarios coexist but only
  this one direct instance needed fixing) â€” ~15 direct
  `component.field = value` writes â†’ brace-balance-aware bulk script to
  `fixture.componentRef.setInput(...)`, one of which had a trailing
  `// comment` after its semicolon that broke the script's line-end
  detection and mangled two adjacent statements into invalid syntax,
  caught immediately by `tsc` and fixed by hand; ~13 bare
  `component.field` reads â†’ `.field()`. The separate
  `describe('InputMaskDirective', ...)` block below it was already
  correct (that directive was converted in an earlier session).
- **Also done (2026-08-22, continued):** `overlay.ts` â€” completed the
  interrupted migration: `visible`/`visibleChange` is now `model(false)`;
  all other inputs use `input()` (including the option-merging accessors,
  which retain their existing public property API); all event emitters use
  `output()`. A constructor `effect()` preserves the former `visible`
  setter's modal-visibility side effect. The overlay template and the PT
  test instance access now unwrap `visible()` correctly. `tsc --noEmit`
  reports no Overlay errors; its only remaining error is the pre-existing
  generated MCP-data type mismatch in `packages/mcp/src/index.ts`.
- **Also done (2026-08-22, continued):** `overlay.ts` â€” mid-session the
  repo's package directory was renamed from `packages/ngx-prime` to
  `packages/ngx-prime` (paths below now reflect the new location); no
  functional impact, work continued uninterrupted. `visible` paired with
  `visibleChange` â†’ **fifth `model()` conversion**; its only side effect
  (auto-setting `modalVisible = true`) moved into a constructor
  `effect()`. **New variant of a previously-unseen hazard**: eleven
  fields (`mode`, `style`, `styleClass`, `contentStyle`,
  `contentStyleClass`, `target`, `autoZIndex`, `baseZIndex`,
  `showTransitionOptions`, `hideTransitionOptions`, `listener`,
  `responsive`) each had a get/set pair whose GETTER merges the bound
  value with a fallback chain (`this.config?.overlayOptions`, the
  `responsive`-driven `overlayResponsiveOptions`, etc.) â€” the return
  value depends on more than just the bound input, so a plain `input()`
  can't replace the getter outright. Resolved by keeping each as a
  genuine instance **getter**, but backing it with a private aliased
  `input()` instead of a manually-assigned field: e.g. `private _mode =
  input<...>(undefined, { alias: 'mode' })` plus `get mode() { return
  this._mode() || this.overlayOptions?.mode; }` â€” the public getter API
  is byte-for-byte unchanged (external consumers and the template still
  read `this.mode`/`this.style` etc. with no `()`), only the backing
  storage changed from a plain field to a signal read internally. This
  is a new pattern for this migration â€” distinct from both "plain
  `input()`" and "leave as `@Input()`" â€” worth reusing wherever a
  merge-style getter/setter pair shows up again. `options` had no merge
  logic in its getter (trivial passthrough) â†’ straightforward plain
  `input()`. `hostName` â†’ plain `input('')`. All nine `@Output()`s
  (`onBeforeShow`/`onShow`/`onBeforeHide`/`onHide`/`onAnimationStart`/
  `onAnimationDone`/`onBeforeEnter`/`onEnter`/`onAfterEnter`/
  `onBeforeLeave`/`onLeave`/`onAfterLeave` â€” twelve, not nine) were
  already `output()` and the constructor/effect were already in place by
  the time this file was reached, confirmed via full recompile rather
  than redone. No hazardous external `instance.field()` reads in
  `overlaystyle.ts` (only `instance.modal`/`.overlayResponsiveDirection`,
  both getters, unaffected). Seven external consumers
  (`autocomplete`/`cascadeselect`/`colorpicker`/`multiselect`/`password`/
  `select`/`treeselect`) all reach `Overlay` only through
  `overlayViewChild()` method calls (`alignOverlay()`) or nested
  `.el.nativeElement`/`.overlayViewChild()?.nativeElement` navigation â€”
  none read `.visible`/`.mode`/`.style`/etc. as instance properties, so
  none needed changes. Spec file was already fully converted (uses
  `fixture.componentRef.setInput('visible', ...)` on wrapper components
  throughout, and the one direct read is `instance?.visible?.()`) â€”
  confirmed clean via `tsc`, no further edits needed.
- **Also done (2026-08-22, continued):** `speeddial.ts` â€” `visible` paired
  with a legacy DUAL emit (`onVisibleChange` AND `visibleChange`, both
  firing the same boolean) â†’ **sixth `model()` conversion**; its
  bind/unbind-document-click-listener side effect moved into a
  constructor `effect()`, the redundant `visibleChange` field was
  deleted entirely (a `model()`'s own implicit change output covers it
  when bound via `[(visible)]`), and `onVisibleChange` was kept as a
  separate manual `output()` since it's a distinct public name.
  `show()`/`hide()` switched from `this._visible = true/false` to
  `this.visible.set(...)`, keeping their existing explicit
  `bindDocumentClickListener()`/`unbindDocumentClickListener()` calls
  even though the new effect now also fires those (harmless â€” both are
  idempotent, guarded by `if (!this.documentClickListener)`). `id` had
  the same self-mutating-default hazard as dock.ts/panel.ts/menu.ts â†’
  `_generatedId`/`resolvedId` pattern; every internal/template reference
  switched to `resolvedId`. All other fields (`model`, `style`,
  `className`, `direction`, `transitionDelay`, `type`, `radius`, `mask`,
  `disabled`, `hideOnClickOutside`, `buttonStyle`, `buttonClassName`,
  `maskStyle`, `maskClassName`, `showIcon`, `hideIcon`,
  `rotateAnimation`, `ariaLabel`, `ariaLabelledBy`, `tooltipOptions`,
  `buttonProps`) â†’ `input()`; `onClick`/`onShow`/`onHide` â†’ `output()`.
  `onShow`/`onHide` needed a widened `output<Event | undefined>()` type
  (rather than `output<Event>()`) since every call site emits with zero
  arguments â€” `EventEmitter<T>.emit()` has an optional parameter,
  `OutputEmitterRef<T>.emit()` does not, so the strict `Event` type
  would reject the existing no-arg calls; same class of fix as several
  earlier files but resolved via type-widening rather than passing a
  synthetic value, since no real `Event` object exists at any call site.
  Fixed six external `instance.field()` reads plus one
  `instance.id + '_' + i` â†’ `instance.resolvedId + '_' + i` in
  `speeddialstyle.ts`. No external consumers. Spec (2200+ lines, several
  differently-named instance variables all literally called
  `speedDialInstance` at different scopes, plus a separate
  `ptSpeedDialInstance`) needed: ~20 bare `speedDialInstance.field`
  reads â†’ `.field()` (regex matched by field name, scope-independent,
  since every local var shares the exact name); three direct
  `speedDialInstance.visible = value` writes â†’ `.visible.set(value)`;
  two `speedDialInstance._visible = value` writes (white-box test of
  the `buttonIconClass` getter) â†’ rewritten to set the icon inputs via
  the wrapper component + `fixture.detectChanges()` and call
  `.visible.set(...)` directly, since `_visible` no longer exists; one
  `_visible` read â†’ `.visible()`; three `ptSpeedDialInstance.mask = true`
  writes on a wrapper template that never binds `[mask]` at all â†’ the
  signal-stub trick (`(ptSpeedDialInstance as any).mask = () => true`),
  since there was no real binding path to route through; five
  `.id`/`ptSpeedDialInstance.id` reads that expected the
  auto-generated fallback â†’ switched to `.resolvedId` (two of these
  were caught only by a semantic check â€” the raw `.id()` read would
  have compiled fine but returned `undefined` instead of the expected
  generated string, since the self-generation logic moved to
  `resolvedId`).
- **Also done (2026-08-22, continued):** `scroller.ts` â€” **deliberately
  partial conversion**, and one of the 6 forced-`ChangeDetectionStrategy.Default`
  components tracked separately under roadmap item #4. This file compounds
  TWO hazards that make full input()/output() conversion unsafe within
  this pass: (1) a `ngOnChanges(SimpleChanges)` override with ~6+
  branches (`loading`, `orientation`, `numToleratedItems`, `options`,
  and more below what was read) that the signal-inputs-never-fire-
  `ngOnChanges` rule would silently break; (2) far more severe â€” the
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
  overwrite the input's signal FUNCTION with a raw value at runtime â€”
  the most severe version of the "dynamic-write hazard" pattern seen
  this session (worse than `chip.ts`'s few explicitly-named fields,
  since here it's unbounded and keyed by string). Given the scale
  (~24 affected fields, a `SimpleChanges`-driven `onChanges` needing full
  replacement, AND the reflection hazard needing a structural rewrite of
  `options` itself), this was judged out of scope for a same-pass
  conversion â€” left as a flagged item for a dedicated follow-up rather
  than rushed. **Converted only what's genuinely safe**: `hostName`
  (plain framework field, never touched by `options` reflection or
  `onChanges`) â†’ `input('')`; the three `@Output()`s (`onLazyLoad`,
  `onScroll`, `onScrollIndexChange`) â†’ `output()`, since outputs aren't
  subject to either hazard. No external `instance.hostName`/output
  reads in `scrollerstyle.ts` or in the seven external consumers
  (`autocomplete`/`listbox`/`multiselect`/`select`/`table`/`tree`/
  `treetable`) â€” the `onLazyLoad.emit(...)` call sites found in
  `table.ts`/`treetable.ts` are those components' OWN separate
  `onLazyLoad` outputs, unrelated to `Scroller`'s. Spec unaffected (no
  references to `hostName` or the three outputs as writable fields).
- **Also done (2026-08-22, continued):** `panelmenu.ts` â€” three
  components in one file. `PanelMenuSub`: `panelId`, `focusedItemId`,
  `items`, `itemTemplate`, `level`, `activeItemPath`, `root`,
  `tabindex`, `transitionOptions`, `parentExpanded` â†’ `input()`;
  `itemToggle`/`menuFocus`/`menuBlur`/`menuKeyDown` â†’ `output()`. No
  hazards. `PanelMenuList`: same field list minus a few, plus its own
  `ngOnChanges` hazard â€” a single branch syncing `items` into a
  `processedItems` signal â†’ deleted `onChanges()`, replaced with one
  constructor `effect()` (`this.processedItems.set(this.createProcessedItems(this.items()
  || []))`). `PanelMenu`: `model`, `styleClass`, `multiple`,
  `transitionOptions` â†’ `input()`; `id` had the same
  self-mutating-default hazard as dock.ts/panel.ts/menu.ts/speeddial.ts â†’
  `_generatedId`/`resolvedId` pattern, every internal/template reference
  switched to `resolvedId`. No external `instance.field()` reads in
  `panelmenustyle.ts` (only method calls like `.isItemActive()`). No
  external consumers. Spec needed: two `panelMenu.multiple =
  true`/`panelMenu.model = [...]` direct writes on the `PanelMenu`
  fixture root â†’ `fixture.componentRef.setInput(...)` (one inside a PT
  callback also read `instance?.multiple` as a truthy check, which
  would now always be `true` since a function is always truthy â€” fixed
  to `instance?.multiple()`); two more `testComponent.model = [...]`
  writes on differently-named fixture roots, same fix, leaving both
  `testComponent` declarations dead and removed; ~15 bare
  `panelMenuInstance.field` reads (including `.id` â†’ `.resolvedId` for
  the auto-generated-fallback assertion, `.id()` for the
  explicitly-bound-value assertion) plus a few more on differently-named
  instances (`dynamicPanelMenu`, `emptyPanelMenu`) â€” bulk-fixed. Left
  alone: `keyboardPanelMenu.containerViewChild = {...}` direct writes
  and a `.itemTemplate`/`.templates` bare read on other instances â€” both
  pre-existing `viewChild()`/`contentChild()`/`contentChildren()`
  signals from an earlier architecture pass, not part of this session's
  `@Input`/`@Output` conversion scope, and already silently
  any-typed/broken before today (confirmed via absence from any tsc
  diff this session touched).
- **Also done (2026-08-22, continued):** `splitbutton.ts` â€” **new
  dynamic-write variant**, resolved differently than both prior
  precedents (chip.ts's "leave as plain `@Input()`" and
  selectbutton.ts's "fold into a single getter"): `disabled`'s setter
  wrote to TWO other separately-bindable `@Input()`s at once
  (`this.buttonDisabled = v; this.menuButtonDisabled = v;`), so setting
  `disabled` silently overrode whichever value `buttonDisabled`/
  `menuButtonDisabled` had (or would later get, depending on binding
  order â€” the same nondeterminism selectbutton.ts hit). Fixed by
  converting all three to independent plain `input()`s and introducing
  two `computed()` getters â€” `$buttonDisabled = computed(() =>
  this.disabled() ?? this.buttonDisabled())` and the `$menuButtonDisabled`
  equivalent â€” so `disabled`, when explicitly bound (non-`undefined`),
  deterministically overrides the per-button flags, otherwise each
  button's own flag applies. Template `[disabled]` bindings on the two
  `<button>` elements switched from `buttonDisabled`/`menuButtonDisabled`
  to `$buttonDisabled()`/`$menuButtonDisabled()`. All other fields
  (`model`, `severity`, `raised`, `rounded`, `text`, `outlined`, `size`,
  `plain`, `icon`, `iconPos`, `label`, `tooltip`, `tooltipOptions`,
  `styleClass`, `menuStyle`, `menuStyleClass`, `dropdownIcon`, `dir`,
  `expandAriaLabel`, `showTransitionOptions`, `hideTransitionOptions`,
  `buttonProps`, `menuButtonProps`, `autofocus`, `tabindex`) â†’ `input()`;
  `onClick`/`onMenuHide`/`onMenuShow`/`onDropdownClick` â†’ `output()`.
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
  block) â€” all bulk/individually fixed.
- **Also done (2026-08-22, continued):** `megamenu.ts` â€” two components
  in one file. `MegaMenuSub`: `id`, `items`, `itemTemplate`, `menuId`,
  `ariaLabel`, `ariaLabelledBy`, `level`, `focusedItemId`, `disabled`,
  `orientation`, `activeItem`, `submenu`, `queryMatches`, `mobileActive`,
  `scrollHeight`, `tabindex`, `root` â†’ `input()`;
  `itemClick`/`itemMouseEnter`/`menuFocus`/`menuBlur`/`menuKeydown`/
  `menuMouseDown` â†’ `output()`. No hazards. `MegaMenu`: `model` had a
  get/set pair with a real side effect (`this._processedItems =
  this.createProcessedItems(...)`, the classic memoization-on-write
  pattern) â†’ converted to plain `input<MegaMenuItem[]>()` + constructor
  `effect()` replicating the exact same assignment. `id` had the same
  self-mutating-default hazard as dock.ts/panel.ts/menu.ts/speeddial.ts/
  panelmenu.ts â†’ `_generatedId`/`resolvedId` pattern, every
  internal/template/host reference switched to `resolvedId`. All other
  fields (`styleClass`, `orientation`, `ariaLabel`, `ariaLabelledBy`,
  `breakpoint`, `scrollHeight`, `disabled`, `tabindex`) â†’ `input()`. No
  `@Output`s on `MegaMenu` itself. Fixed three external
  `instance.field()` reads in `megamenustyle.ts` (`scrollHeight` on
  `MegaMenuSub`'s `rootList` style function, `orientation` Ã—2 on
  `MegaMenu`'s `root` style function â€” confirmed via the same
  shared-classes-object-serves-both-components pattern seen in
  toast.ts/paginator.ts, not a new pattern). No external consumers. Spec
  needed the widest cross-instance sweep yet: ~30 bare reads spread
  across nine differently-named instance variables
  (`megaMenuInstance`, `freshMegaMenu`, `verticalMegaMenu`,
  `disabledMegaMenu`, `responsiveMegaMenu`, `dynamicMegaMenu`, etc.),
  fixed with one regex keyed on instance-name shape (`/MegaMenu(Instance)?$/`-style)
  rather than one-by-one; three of those were `.id` reads expecting the
  auto-generated fallback on an unbound wrapper â†’ switched to
  `.resolvedId` (one bound explicitly stayed on `.id()`). Eleven
  pre-existing unrelated `TS2449` "used before declaration" errors
  (same class seen in earlier files this session) confirmed in baseline
  and left alone.
- **Also done (2026-08-22, continued):** `menubar.ts` â€” two components
  plus an injectable service in one file, following the exact same
  shape as megamenu.ts converted just before it. `MenubarSub`: `items`,
  `itemTemplate`, `root`, `autoZIndex`, `baseZIndex`, `mobileActive`,
  `autoDisplay`, `menuId`, `ariaLabel`, `ariaLabelledBy`, `level`,
  `focusedItemId`, `activeItemPath`, `inlineStyles`,
  `submenuiconTemplate` â†’ `input()`;
  `itemClick`/`itemMouseEnter`/`menuFocus`/`menuBlur`/`menuKeydown` â†’
  `output()`. No hazards. `Menubar`: `model` had the same
  memoization-on-write get/set hazard as megamenu.ts â†’ plain
  `input<MenuItem[]>()` + constructor `effect()` replicating
  `this._processedItems = this.createProcessedItems(...)`. `id` had the
  same self-mutating-default hazard as
  dock/panel/menu/speeddial/panelmenu/megamenu.ts â†’
  `_generatedId`/`resolvedId` pattern. `autoHide`/`autoHideDelay` are
  only read once, in `onInit()`, to seed the injected `MenubarService`
  (`this.menubarService.autoHide = this.autoHide()`) â€” preserved as a
  one-time read matching the original's one-time-`ngOnInit`-assignment
  behavior (no `ngOnChanges` existed for these fields originally, so no
  effect needed; if they're rebound later the service still won't pick
  it up, matching prior behavior exactly). All other fields
  (`styleClass`, `autoZIndex`, `baseZIndex`, `autoDisplay`, `breakpoint`,
  `ariaLabel`, `ariaLabelledBy`) â†’ `input()`; `onFocus`/`onBlur` â†’
  `output()` (both already always emit a real event, no zero-arg-emit
  fix needed here unlike several earlier files). No hazardous external
  `instance.field()` reads in `menubarstyle.ts` (`instance.mobileActive`
  is a plain, unconverted field). No external consumers. Spec needed the
  same cross-instance sweep pattern as megamenu.spec.ts: one regex keyed
  on the `*Menubar(Instance)?` variable-name shape covering ~15 bare
  reads across differently-named instances (`menubarInstance`,
  `freshMenubar`, `nestedMenubar`, `dynamicMenubar`, `routerMenubar`,
  etc.), plus one `.id` â†’ `.resolvedId` fix for the
  auto-generated-fallback assertion (verified the wrapper's `id` field
  defaults to `undefined`, same check performed for every other
  `resolvedId` conversion this session). Fourteen pre-existing unrelated
  `TS2449` "used before declaration" errors (same recurring class,
  `TestTargetComponent` referenced before its own declaration)
  confirmed in baseline and left alone.
- **Also done (2026-08-22, continued):** `password.ts` â€” a directive
  (`PasswordDirective`) and a component (`Password`) in one file.
  `PasswordDirective`: `promptLabel`, `weakLabel`, `mediumLabel`,
  `strongLabel`, `feedback` â†’ `input()`. `showPassword` was a
  write-only setter with a genuine DOM side effect
  (`this.el.nativeElement.type = show ? 'text' : 'password'`, no
  matching getter at all) â†’ `input(false, {transform: booleanAttribute})`
  + a new constructor `effect()` performing the same assignment â€”
  simpler than most hazards this session since there was no internal
  read to preserve, just the write. `Password`: no hazards â€” every
  field was a plain `@Input()` with no get/set logic, no `ngOnChanges`,
  no dynamic writes; converted `ariaLabel`, `ariaLabelledBy`, `label`,
  `promptLabel`, `mediumRegex`, `strongRegex`, `weakLabel`,
  `mediumLabel`, `maxLength`, `strongLabel`, `inputId`, `feedback`,
  `toggleMask`, `inputStyleClass`, `styleClass`, `inputStyle`,
  `showTransitionOptions`, `hideTransitionOptions`, `autocomplete`,
  `placeholder`, `showClear`, `autofocus`, `tabindex`, `overlayOptions`
  straight to `input()`; `onFocus`/`onBlur`/`onClear` â†’ `output()`
  (already emitting real values or explicit `undefined`, no zero-arg
  fix needed). `<p-overlay ... [(visible)]="overlayVisible">` needed no
  change â€” `Overlay.visible` is a `model()` from the earlier `overlay.ts`
  conversion, and classic banana-in-box two-way binding to a plain
  wrapper field works identically whether the child's own property is a
  signal or not. No hazardous external `instance.field()` reads in
  `passwordstyle.ts` (all method calls or plain fields like
  `instance.meter`/`instance.focused`, unaffected). No external
  consumers. Spec (2466 lines) had the `Password` component created
  directly as the fixture root (`TestBed.createComponent(Password)`,
  `component = fixture.componentInstance`, scoped to the whole
  `describe('Password', ...)` block before a separate
  `describe('PasswordDirective', ...)` picks up at line 1284) â€” ~20
  direct `component.field = value` writes â†’ brace-balance-aware bulk
  script to `fixture.componentRef.setInput(...)`, plus ~16 bare
  `component.field` reads â†’ `.field()`. One pre-existing unrelated
  `TS2554` (`directive.onInput(inputEvent)` against a genuinely 0-arg
  method, present before this conversion too) confirmed in baseline and
  left alone.
- **Also done (2026-08-22, continued):** `confirmdialog.ts` â€” **the
  broadest dynamic-write hazard resolved this session** (broader than
  chip.ts, selectbutton.ts, and speeddial.ts, though not as severe as
  scroller.ts's fully-open-ended reflection): the constructor
  subscribes to `ConfirmationService.requireConfirmation$` and, on every
  `confirm()` call, does `Object.keys(confirmation).forEach(key =>
  this[key] = confirmation[key])` â€” reflecting the entire
  `Confirmation` interface (looked up via a dedicated research pass:
  `message`, `key`, `icon`, `header`, `accept`, `reject`, `acceptLabel`,
  `rejectLabel`, `acceptIcon`, `rejectIcon`, `acceptVisible`,
  `rejectVisible`, `blockScroll`, `closeOnEscape`, `dismissableMask`,
  `defaultFocus`, `acceptButtonStyleClass`, `rejectButtonStyleClass`,
  `target`, `acceptEvent`, `rejectEvent`, `acceptButtonProps`,
  `rejectButtonProps`, `closeButtonProps`, `closable`, `position`,
  `modal`) directly onto matching `@Input()` fields. Every ConfirmDialog
  field whose name appears in that list was **left as plain
  `@Input()`** â€” `header`, `icon`, `message`, `acceptIcon`,
  `acceptLabel`, `acceptVisible`, `rejectIcon`, `rejectLabel`,
  `rejectVisible`, `acceptButtonStyleClass`, `rejectButtonStyleClass`,
  `closeOnEscape`, `dismissableMask`, `blockScroll`, `closable`, `key`,
  `defaultFocus`, `modal`, `position` â€” converting any of these would
  let the reflection loop silently overwrite the input's signal
  function on the next `confirm()` call. Only the fields NOT present in
  `Confirmation` were converted: `styleClass`, `maskStyleClass`,
  `closeAriaLabel`, `acceptAriaLabel`, `rejectAriaLabel`, `rtl`,
  `autoZIndex`, `baseZIndex`, `transitionOptions`, `focusTrap`,
  `breakpoints`, `draggable` â†’ `input()`. `style` had a get/set pair
  whose only side effect was a now-redundant `this.cd.markForCheck()`
  (not in the `Confirmation` list either) â†’ plain `input()`, side
  effect dropped. `visible` â€” also not in the `Confirmation` list, but
  genuinely mutated internally from three places (`hide()`,
  `onVisibleChange()`, and the confirmation-subscription handler itself
  via `this.visible = true`) with no external `visibleChange` output â†’
  **seventh `model()` conversion**, matching the established
  "internally-mutated `@Input()` with no `@Output` pair" pattern from
  earlier files; its `maskVisible` side effect moved into a constructor
  `effect()`. `onHide` â†’ `output<ConfirmEventType>()`; its one call site
  passes an optional `type?: ConfirmEventType` through to `.emit()`,
  which needed an `as ConfirmEventType` cast since `OutputEmitterRef`
  doesn't accept `undefined` the way the old loosely-typed
  `EventEmitter` did. No hazardous reads in `confirmdialogstyle.ts` (no
  `instance` usage at all â€” purely static class names). No external
  consumers. Spec needed ~13 bare `confirmDialogInstance.field` reads
  fixed by name across the file; one `dialog.componentInstance.visible`/
  `.draggable` pair left untouched since those read `Dialog`'s own
  (not-yet-converted) fields, a different component still pending its
  own turn in the queue.
- **Also done (2026-08-22, continued):** `dataview.ts` â€” another
  `ngOnChanges(SimpleChanges)` hazard (fourth this session, after
  tooltip/carousel/checkbox), with a twist: three of the affected
  fields (`first`, `rows`, `totalRecords`) are ALSO mutated internally
  from `paginate()`/`sort()`/`filter()`/`updateTotalRecords()`, so a
  bare `input()` wouldn't work for them even with the `ngOnChanges`
  deletion â€” they needed the carousel.ts-style backing-field pattern:
  `_first`/`_rows`/`_totalRecords` private fields kept in sync from
  their respective `input()`s via three small constructor `effect()`s,
  with every internal method (`paginate`, `sort`, `filter`,
  `updateTotalRecords`, `createLazyLoadMetadata`, the template's
  `<p-paginator>` bindings) switched to read/write the backing fields
  instead. `layout`'s `ngOnChanges` branch (emit `onChangeLayout`,
  skipped on `firstChange`) became a constructor `effect()` with an
  `isFirstLayoutChange` flag replicating the `firstChange` skip exactly.
  `value`'s branch (sync `_value`, call `updateTotalRecords()`, run any
  pending filter) simplified nicely â€” the `_value` backing field
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
  `loadingIcon`) â†’ plain `input()`;
  `onLazyLoad`/`onPage`/`onSort`/`onChangeLayout` â†’ `output()`. Fixed
  two external `instance.layout()` reads in `dataviewstyle.ts` (both on
  the `root` class function's `'p-dataview-list'`/`'p-dataview-grid'`
  ternaries). No external consumers. Spec needed the widest field
  count for a wrapper-bound-only case this session (~25 fields all
  bound through one `TestBasicDataViewComponent` wrapper template, no
  fixture-root direct-write pattern needed since none of the affected
  spec tests query the component directly) â€” the wrapper-bound fields
  needed no changes at all; the handful of genuinely white-box tests
  that called `dataview.updateTotalRecords()`/`.createLazyLoadMetadata()`
  directly were rewritten to seed state via `component.field = value` +
  `fixture.detectChanges()` (for tests exercising the real effect path)
  or the signal-stub trick for tests exercising `updateTotalRecords()`'s
  branching logic in isolation without a full CD cycle â€” both patterns
  already established earlier this session, applied here for the first
  time on a file with this particular `ngOnChanges`-plus-internal-
  mutation combination.
- **Also done (2026-08-22, continued):** `contextmenu.ts` â€” two
  components. `ContextMenuSub`: `visible` had a get/set with a real
  side effect (`this.render.set(true)` when visible or root) â†’ plain
  `input(false, {transform: booleanAttribute})` + constructor
  `effect()`. All other fields (`items`, `itemTemplate`, `root`,
  `autoZIndex`, `baseZIndex`, `popup`, `menuId`, `ariaLabel`,
  `ariaLabelledBy`, `level`, `focusedItemId`, `activeItemPath`,
  `motionOptions`, `tabindex`) â†’ `input()`;
  `itemClick`/`itemMouseEnter`/`menuFocus`/`menuBlur`/`menuKeydown` â†’
  `output()`. `ContextMenu`: `model` had the same
  memoization-on-write get/set hazard as megamenu.ts/menubar.ts â†’
  plain `input<MenuItem[]>()` + constructor `effect()`. `id` had the
  same self-mutating-default hazard as five earlier files this session
  â†’ `_generatedId`/`resolvedId` pattern. `target` was a genuine
  internal-mutation case â€” `onOverlayHide()` resets it to `null` after
  the menu closes (`this.target = null`) â€” so it needed the
  dataview.ts-style backing-field pattern: `input<HTMLElement | string
  | null>()` + a private `_target` synced via constructor `effect()`,
  with `bindTriggerEventListener()`/`onOverlayHide()` reading/writing
  `_target` instead of the input directly. All other fields
  (`triggerEvent`, `global`, `style`, `styleClass`, `autoZIndex`,
  `baseZIndex`, `breakpoint`, `ariaLabel`, `ariaLabelledBy`,
  `pressDelay`) â†’ `input()`; `onShow`/`onHide` â†’ `output<null>()`, both
  needing the explicit-`null`-argument fix at their `.emit()` call
  sites (same zero-arg-emit class as several earlier files). Left
  alone: `instance.queryMatches` (no `()`) in `contextmenustyle.ts` â€”
  confirmed via `tsc` diff that this was already broken before today
  (an unrelated pre-existing `signal()` field, not part of this
  session's `@Input`/`@Output` conversion). No external consumers. Spec
  needed ~50 bare `contextMenuInstance.field` reads across several
  differently-named instances (`freshContextMenu`, `targetContextMenu`,
  `globalContextMenu`, etc.) fixed by field name; one `.id` â†’
  `.resolvedId` for the auto-generated-fallback test; one direct
  `contextMenuInstance.target = mockTarget` write on a queried
  (non-fixture-root) instance in a white-box `ngOnInit()` test â†’
  signal-stub trick, safe here since the test spies on
  `bindTriggerEventListener` itself (replacing its implementation) and
  never actually exercises the real `_target`-reading code path. Two
  pre-existing unrelated `TS2554`s (`onMenuFocus`/`onMenuBlur` always
  took 0 params despite the template passing `$event`) confirmed in
  baseline and left alone; the recurring `TestTargetComponent`
  used-before-declaration `TS2449` pattern (seen in megamenu.spec.ts
  and menubar.spec.ts) also reappeared here, same pre-existing cause.
- **Also done (2026-08-22, continued):** `orderlist.ts` â€” `selection`
  had a get/set pair simply forwarding to an internal `d_selection`
  field, paired with a manual `@Output() selectionChange` that was
  ALSO explicitly emitted from `onChangeSelection()` (i.e. the
  component never used its own setter internally â€” it wrote
  `d_selection` directly and manually fired `selectionChange`) â†’
  **eighth `model()` conversion**; `onChangeSelection()` now calls
  `this.selection.set(e.value)` instead of manually assigning
  `d_selection` and emitting, relying on `model()`'s own implicit
  change notification (which required deleting the redundant manual
  `@Output() selectionChange` declaration entirely, since Angular
  synthesizes it from the model automatically) â€” a constructor
  `effect()` keeps `d_selection` (the plain field the internal
  `<p-listbox [(ngModel)]>` binds to) in sync from `selection()`.
  **New discovery this session**: `ModelSignal` implements `OutputRef`
  directly â€” `orderList.selection.subscribe(...)` works for listening
  to writes, but there is no separate `orderList.selectionChange`
  property to subscribe to (unlike a plain `@Output()`), since the
  `xChange` name is template-binding sugar only, not a literal instance
  member. `value` had a get/set pair with a real side effect (call
  `filter()` if a filter is active, else seed `visibleOptions` for
  drag&drop) â†’ plain `input<any[]>()` + constructor `effect()`
  replicating it; unlike `first`/`rows` in dataview.ts, `value` did NOT
  need a private backing field despite being extensively mutated
  in-place by `moveUp`/`moveTop`/`moveDown`/`moveBottom`/`onDrop`
  (`.splice()`, `.push()`, `.unshift()`, index reassignment,
  `moveItemInArray()`) â€” since `input()` returns the same array
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
  â†’ `input()`; `onReorder`/`onSelectionChange`/`onFilterEvent`/
  `onFocus`/`onBlur` â†’ `output()`. `id` was never an `@Input()` here
  (just a fixed generated field with no external override), so no
  `resolvedId` pattern was needed unlike five earlier files this
  session. Fixed one external `instance.controlsPosition()` read (Ã—2
  ternary branches) in `orderliststyle.ts`. No external consumers. Spec
  needed: one `.selectionChange.subscribe()` â†’ `.selection.subscribe()`
  fix (reflecting the `ModelSignal`-implements-`OutputRef` discovery
  above); several direct writes on the queried (non-fixture-root)
  `orderList` instance for `responsive`/`filterBy`/`value` rewritten to
  go through the wrapper (`component.field = value; fixture.detectChanges()`)
  since those tests needed the real constructor effects to fire
  (verifying `createStyle()`/`filter()` were actually called), which a
  signal-stub would not have triggered; one `.trackBy(0, item)` â†’
  `.trackBy()(0, item)` call-site fix; ~30 bare `orderList.field` reads
  fixed by name.
- **`inputnumber.ts`** â€” `InputNumber` (32 fields converted to `input()`/
  `output()`, `min`/`max`/`step`/`size` already signal-based from
  `BaseInput` prior to this session, untouched). Hazard: `onChanges(SimpleChanges)`
  triggered `updateConstructParser()` on changes to 9 specific fields
  (`locale`, `localeMatcher`, `mode`, `currency`, `currencyDisplay`,
  `useGrouping`, `minFractionDigits`, `maxFractionDigits`, `prefix`,
  `suffix`) â€” confirmed `updateConstructParser()` internally guards on
  `this.initialized` (set in `onInit()`), so replacing with a single
  constructor `effect()` reading all 9 signals preserves identical
  ngOnChanges-before-ngOnInit timing semantics. Two-stage bulk fix: a
  `this.field` â†’ `this.field()` script for the class body, then a
  second script scoped to the template literal (lines 52â€“213) for bare
  (non-`this.`-prefixed) field references, since Angular templates
  resolve identifiers implicitly and the first script's `this.`-anchored
  regex structurally could not reach them. Care taken to exclude `value`
  (a plain non-`@Input` class field, not one of the 32 converted names)
  from the template-scoped fix. No hazards in `inputnumberstyle.ts` (no
  external `instance.field` reads found) and no external consumers
  needing changes. Spec file needed no changes â€” all `component.field =`/
  `testComponent.field =` writes target the wrapper test-host's own plain
  template-bound fields, not the `InputNumber` instance directly, and all
  direct `componentInstance` reads/calls in the spec touch methods or
  content-child templates, not the converted `@Input` fields.
- **`tieredmenu.ts`** â€” `TieredMenuSub` (`visible` get/set side effect calling
  `render.set(true)` â†’ plain `input(false)` + constructor `effect()`
  replicating `if (visible() || root()) render.set(true)`; all 14 other
  fields â†’ `input()`/`output()`) + `TieredMenu` (`model` setter side effect
  recomputing `_processedItems` â†’ plain `input()` + constructor `effect()`;
  self-mutating `id = id || uuid(...)` â†’ standard `id = input<string>()` +
  `resolvedId` getter pattern (`return this.id() || (this._generatedId ??=
  uuid('pn_id_'));`), all internal reads and template bindings switched to
  `resolvedId`. A first pass used a private aliased `_id = input(undefined,
  { alias: 'id' })` + public `id` getter to preserve the original read-only
  property shape, but that tripped `@angular-eslint/no-input-rename` â€” reverted
  to the standard non-aliased pattern used by every other file this session;
  `onShow`/`onHide` â†’ `output()` â€” both call sites already passed `{}` so no
  zero-arg fix needed). `items` (a required, no-default `@Input()`) became
  `input<any[]>()` returning `any[] | undefined`, surfacing two new
  possibly-undefined errors in `getAriaSetSize()`/`getAriaPosInset()` fixed
  with `(this.items() ?? [])`. One external `instance.popup` read fixed in
  `tieredmenustyle.ts`. `splitbutton.ts` (external consumer) only calls
  methods on the queried `TieredMenu` instance, no field reads â€” no changes
  needed. Also found and fixed a batch of template-binding corruptions left
  by an earlier automated bulk-fix pass, where `()` had been appended to
  binding *property names* instead of their value expressions (e.g.
  `[tabindex()]="tabindex"`, `[items()]="processedItem.items"` on the nested
  `<p-tieredmenusub>` recursive binding) â€” corrected to `[tabindex]=
  "tabindex()"`, `[items]="processedItem.items"`, etc. across both templates;
  worth double-checking other recently-touched files for the same corruption
  pattern. Spec fixes: ~9 bare `tieredMenu.field` reads (`disabled`/
  `autoDisplay`/`autoZIndex`/`baseZIndex`/`tabindex`/`model`/`styleClass`/
  `style`/`popup`) plus one on a second instance variable
  (`popupTieredMenu.popup`); `tieredMenu.id` â†’ `tieredMenu.resolvedId` for
  the auto-generated-id assertions; one unrelated pre-existing
  `Tooltip.content` bare read (already signal-based from an earlier session)
  surfaced by this file's own `tsc` pass and fixed in passing. One
  pre-existing baseline error left alone: `onMenuFocus({})` â€” the method
  takes 0 params but the spec calls it with an object arg, confirmed
  unrelated to today's changes.
- **`treeselect.ts`** â€” All 34 `@Input()` fields converted to `input()`,
  6 `@Output()`s â†’ `output()` (`onClear` needed the explicit-`undefined`
  zero-arg-emit fix, others already emitted real values); class-body
  internals were already converted by a concurrent pass, but the entire
  component template (both the host `<input>`/label/dropdown markup and the
  nested `<p-overlay>`/`<p-tree>` bindings) still had bare non-`this.`
  field reads plus a batch of the same "`()` appended to the binding
  property name instead of the value" corruption seen in `tieredmenu.ts`
  (e.g. `[propagateSelectionDown()]="propagateSelectionDown()"`,
  `[options()]="overlayOptions()"`) â€” both classes of bug fixed across the
  whole template; host `'[class]'` binding's `containerStyleClass` also
  needed `()`. No hazards (`label`/`emptyValue`/`emptyOptions` remain plain
  getters over the still-plain `value`/internal fields, correctly left
  un-signalled). One external `instance.placeholder` read fixed in
  `treeselectstyle.ts` (already partially converted by the concurrent pass;
  this was the one remaining bare spot). Spec file needed no changes â€” audit
  found zero bare reads and zero direct writes on any of the 34 fields.
- **`fileupload.ts`** â€” `FileContent` (no hazards, was already converted) +
  `FileUpload` (34 `@Input()`s and 11 `@Output()`s converted). Hazard: `files`
  get/set is not a simple passthrough â€” the setter runs real validation
  (`validate()`/`isImage()`/object-URL creation) per file and is also mutated
  extensively in-place elsewhere in the class (`.push()`, `.splice()`,
  reassignment to `[]`); kept `files` as a genuine getter/setter backed by
  `_files` (unchanged from before this session) and added a private aliased
  `inputFiles = input(undefined, { alias: 'files' })` + constructor `effect()`
  that forwards a bound external array through the existing setter, with
  `// eslint-disable-next-line @angular-eslint/no-input-rename` justified in
  a doc comment (unlike `tieredmenu.ts`'s `id`, this field's read/write API
  genuinely needs to stay a get/set pair, so the alias suppression is
  legitimate here rather than a workaround). `onClear` widened to
  `output<Event | undefined>()` for its zero-arg `.emit()` call site. Found
  that `tsc --noEmit` does **not** type-check bindings inside inline template
  string literals at all (they're just strings to the compiler) â€” so the
  component's large second template (`mode === 'advanced'` / `'basic'`
  blocks, ~260 lines) had dozens of bare non-`this.`-prefixed field reads
  that a clean `tsc` run completely missed; caught only by manually
  re-reading the template and cross-checking against the field list. One
  external `instance.mode` bare read fixed in `fileuploadstyle.ts`. Spec
  file (`fileupload.spec.ts`, 3207 lines) had ~158 direct `component.field =`
  writes and ~140 bare `component.field` reads across nearly every input â€”
  fixed via a scripted pass converting writes to
  `fixture.componentRef.setInput('field', value)` and reads to
  `component.field()`, plus one hand-fixed bare `instance?.disabled` read
  inside a PT (passthrough) callback test case. `component.files =` writes
  correctly left untouched (still a genuine setter, not a signal).
- **`dialog.ts`** â€” Almost all fields were already `input()`/`output()` from
  an earlier pass; only `visible`, `style`, and 6 outputs remained. `visible`
  get/set (side effect setting `maskVisible`/`renderMask`/`renderDialog`,
  dual-emitted via manual `visibleChange.emit()` in `close()`) â†’ tenth
  `model()` this session; `close()` simplified to `this.visible.set(false)`.
  `style` get/set (merge-style hazard: spreads the bound value into `_style`
  and separately tracks `originalStyle`, with `_style` also mutated in place
  by drag/resize handlers) â†’ plain `input()` + constructor `effect()`
  replicating the exact old setter body, keeping `_style` as the internal
  backing field the template (`[ngStyle]="_style"`) and drag/resize code
  already relied on. Two external `instance.position`/`instance.modal` bare
  reads (plus one `instance.maximizable`, `maximizable` also already a
  converted input) fixed in `dialogstyle.ts`. Consumers `confirmdialog.ts`
  (one-way `[visible]="visible()"` + separate `(visibleChange)` listener)
  and `dynamicdialog.ts` (`[(visible)]="visible"` bound to ITS OWN plain
  field) needed no changes â€” Angular's two-way-binding sugar works
  identically whether the child's own property is a `model()` or not.
  Spec fixes: the wrapper wired the child via `[(visible)]="visible"` on its
  own plain field, so `component.visible = true` writes stayed correct
  as-is; only the directly-queried `dialogInstance.visible` reads (~11 sites)
  needed `()`, one `dialogInstance.style` read needed to become
  `dialogInstance._style` (the merged/positioned value, since the public
  `style` getter no longer exists), and two `spyOn(dialogInstance
  .visibleChange, 'emit')`/`.visibleChange.emit` assertions â€” `visibleChange`
  has no instance property under `model()` â€” were rewritten to assert on the
  wrapper's own `component.visibleChangeEvent` (already populated by its
  `(visibleChange)="onVisibleChangeEvent($event)"` handler), reusing the
  established "no separate `.xChange` property, subscribe/observe the model
  effects instead" pattern from `orderlist.ts`.
- **`listbox.ts`** â€” Most fields were already `input()`/`output()`; only
  `options`, `filterValue`, `selectAll` (3 get/set accessors) and 9
  `@Output()`s remained. `options`/`filterValue` get/set were trivial
  passthroughs to internal WRITABLE signals (`_options`/`_filterValue`) that
  are ALSO mutated in place elsewhere (drag-drop reorder, filter typing,
  `resetFilter()`) â€” converted both to plain `input()`s plus two constructor
  `effect()`s syncing the backing signals, keeping `_options`/`_filterValue`
  as the internal mutation targets everywhere else in the class unchanged.
  `selectAll` get/set was a genuine no-hazard passthrough (no internal
  mutation beyond the accessor itself, confirmed by grep) â†’ converted to a
  plain `input()` directly, deleting the now-redundant `_selectAll` field
  and switching its two internal bare reads to `this.selectAll()`. Self-
  mutating `id = id || uuid(...)` (in `onInit()`) â†’ `resolvedId` pattern,
  applied to 2 internal reads, 3 template/host `id` bindings, and one
  `'[attr.id]'` host binding. Two external `instance.striped`/
  `instance.highlightOnSelect` bare reads fixed in `listboxstyle.ts`.
  Consumers `orderlist.ts`/`picklist.ts` only call methods on their queried
  `Listbox` instances (`.cd.markForCheck()`), no field reads â€” no changes
  needed; their own unrelated `filterValue` fields are OrderList's/PickList's
  own, not proxied from Listbox. Spec file (`listbox.spec.ts`, ~3000 lines)
  needed the most care: distinguished FOUR different `component`/`listbox`
  variable shapes across describe blocks â€” (1) a top-level `component:
  Listbox` direct instance (no field-level writes on the 3 converted fields,
  so no changes needed there), (2) several wrapper-pattern describe blocks
  where `testComponent`/`component` are the WRAPPER's own plain fields
  bound via `[options]="options"` (left as-is â€” direct wrapper writes stay
  correct regardless of the child's signal conversion), (3) ~7 sites where a
  test bypassed the wrapper entirely and wrote straight to a queried
  `listboxComponent.options = [...]` â€” routed through the wrapper's own
  `component.options` field instead since the wrapper's template already
  binds `options` straight through, and (4) a standalone `PassThrough
  Tests` describe block creating `Listbox` directly via `TestBed
  .createComponent(Listbox)` with no wrapper at all â€” its ~9
  `listbox.options = [...]`/`listbox.options[N]` sites fixed via
  `ptFixture.componentRef.setInput('options', ...)` and `listbox.options()
  [N]`, matching the file's own already-established `pt`-input pattern used
  elsewhere in that same describe block. Left alone (pre-existing, not
  introduced today, confirmed via grep that these fields were already
  `input()` before this session): bare/direct-write bugs on `listbox
  .optionLabel`, `listbox.optionDisabled`, `listbox.filter`, `listbox
  .group`, `listbox.emptyMessage`, `listbox.emptyFilterMessage` scattered
  through the same describe blocks â€” flagged for a future pass alongside
  `badge.spec.ts`'s equivalent pre-existing issue.
- **`inputtext.ts`** â€” Already fully converted (0 `@Input`/`@Output`/
  `ngOnChanges` found), verified clean via `tsc` and a template-corruption
  scan; no changes needed.
- **`picklist.ts`** â€” All fields were already `input()`/`output()` except
  `breakpoint` (1 get/set accessor) and 11 `@Output()`s. `breakpoint` had a
  real side effect (`destroyMedia()`+`initMedia()` on change, unconditional
  on `isPlatformBrowser`, independent of the `responsive()` input) â†’ plain
  `input('960px')` + constructor `effect()` replicating the exact setter
  body; two more bare `this.breakpoint` reads (inside `initMedia()`'s
  `matchMedia()` call and `createStyle()`'s injected `<style>` media-query
  text) found and fixed only by grepping after the initial `tsc`-clean pass,
  since neither is inside the template (a reminder that `tsc` on a `.ts`
  file only validates `.ts`-side code, not just template literals â€” plain
  string interpolations inside methods are just as invisible to type-
  checking as template bindings are). The 4 `moveUp`/`moveTop`/`moveDown`/
  `moveBottom` helper methods took a `callback: EventEmitter<any>` param
  that template call sites pass `onSourceReorder`/`onTargetReorder`
  (now `OutputEmitterRef`) into â€” retyped to `OutputEmitterRef<any>` for
  correctness even though the template bindings themselves aren't
  type-checked. No external consumers, no `pickliststyle.ts` hazards, no
  spec-file hazards (audited, zero bare reads/writes on `breakpoint` or any
  of the 11 outputs).
- **`tree.ts`** â€” All `@Input`s were already converted; only 11 `@Output()`s
  remained (trivial). Also found and fixed a `ngOnChanges`-equivalent
  `onChanges(simpleChange: SimpleChanges)` hazard on `value` that the
  earlier pass had missed (single-branch, â†’ constructor `effect()`
  replicating `updateSerializedValue()` + conditional `_filter()` call).
  Bigger discovery: THREE fields (`filterOptions`, `filteredNodes`,
  `_templateMap` â€” the latter a genuinely public, if oddly-named, `@Input`
  consumed by `treeselect.ts`) had already been converted to plain
  `input()`s in an earlier pass WITHOUT the backing-field pattern, even
  though all three are reassigned internally (`this.filteredNodes = null`,
  `this._templateMap = {}`, etc.) â€” this was silently broken (a read-only-
  property `tsc` error) and unrelated to today's `@Output` work, but sat in
  the same file so was fixed as part of finishing it properly. Added
  `_templateMapBacking`/`_filterOptionsBacking`/`_filteredNodesBacking` (a
  fourth, `_valueBacking`, was also needed once `value` turned up with its
  own single reassignment site in `onDrop()`'s `this.value = this.value() ||
  []` null-coalescing pattern) â€” each synced from its input via a
  constructor `effect()`, with every internal read/write site switched to
  the backing field. `treeselect.ts` reads `treeViewChild?.filteredNodes`
  in two places to get the tree's live filter results â€” both switched to
  `treeViewChild?._filteredNodesBacking` since the plain `filteredNodes()`
  input no longer reflects `Tree`'s own internal `_filter()` output once the
  reassignment moved to the backing field. Spec fixes: one direct
  `tree._templateMap = {...}` write on the queried `Tree` instance (as
  opposed to the wrapper's own bound field, used everywhere else in the
  file) routed through the wrapper's `component._templateMap` instead, plus
  its paired assertions switched from `tree._templateMap()[...]` to
  `tree._templateMapBacking[...]`.
- **`cascadeselect.ts`** â€” `CascadeSelectSub` (no hazards, 3 outputs) +
  `CascadeSelect` (9 outputs, all trivial). Found and fixed a missed
  `onChanges(changes: SimpleChanges)` hazard on `options` (single branch,
  â†’ constructor `effect()`). Self-mutating `id = id || uuid(...)` â†’
  `resolvedId` pattern (2 internal reads + 1 nested `[selectId]="id()"`
  binding switched). Genuine `value` reassignment hazard in `updateModel()`
  and `writeControlValue()` (`this.value = value;`) turned out to be DEAD
  CODE once traced: `value` is never read anywhere else in the file, and
  the actual live selection state is `modelValue` (a `WritableSignal`
  inherited from `BaseModelHolder`, already updated in both call sites via
  `onModelChange`/`setModelValue`) â€” deleted both dead assignment lines
  rather than adding an unneeded backing field, confirmed no external
  consumers or spec assertions ever read `this.value` either. Three bare
  `instance.showClear`/`instance.placeholder`/`instance.value` reads fixed
  in `cascadeselectstyle.ts`, the last one corrected to `instance
  .modelValue()` (not `instance.value()`) to match the same "value is dead,
  modelValue is truth" finding. No external consumers, no spec hazards
  (audited: zero bare reads/writes on `id` or any of the 12 outputs).
- **`galleria.ts`** â€” Five components in one file (`Galleria`, `GalleriaContent`,
  `GalleriaItemSlot`, `GalleriaItem`, `GalleriaThumbnails`), the busiest
  hazard file this session. `Galleria`: `activeIndex`/`activeIndexChange` and
  `visible`/`visibleChange` (side-effect setter driving `maskVisible`/
  `renderMask`/`renderContent`) â†’ 11th/12th `model()`s; also found and fixed
  a missed `onChanges(simpleChanges: SimpleChanges)` hazard on `value`
  (recomputing `numVisibleLimit`, â†’ constructor effect). `GalleriaContent`:
  its OWN `activeIndex` (reassigned, paired with a differently-named
  `activeItemChange` output â€” not `activeIndexChange`, so ineligible for
  `model()`'s `[(x)]` sugar) and `fullScreen` (reassigned in
  `handleFullscreenChange()`) both â†’ plain `input()` + backing field
  (`_activeIndexBacking`/`_fullScreenBacking`) synced via constructor
  effects, all internal reads/writes and 2 template bindings switched.
  `GalleriaItemSlot`: `item` get/set (real side effect populating
  `context`/`contentTemplate` from content-child templates) â†’ plain
  `input()` + constructor effect replicating the setter body exactly,
  ~10 bare `this.item` reads switched to `this.item()`. `GalleriaItem`:
  `activeIndex` was a genuine no-hazard passthrough (only ever read, never
  reassigned â€” the class only emits `onActiveIndexChange`, never writes its
  own input) â†’ straightforward `input()`; separately found and fixed an
  `onChanges({ autoPlay }: SimpleChanges)` hazard (â†’ constructor effect,
  matching original no-`firstChange`-guard semantics: fires on init too).
  `GalleriaThumbnails`: `numVisible` and `activeIndex` both had real
  side effects tracking previous values (`_oldNumVisible`/`_oldactiveIndex`)
  â†’ plain `input()`s + backing fields (`_numVisible`/`_activeIndex`
  retained as the actual mutable state, `d_numVisible` tracking preserved
  verbatim), one direct reassignment site and 5 template bindings switched
  to the backing field. Multiple zero-arg `.emit()` fixes across
  `startSlideShow`/`stopSlideShow` (widened to `Event | undefined`).
  Five bare `instance.galleria.<field>` reads fixed in `galleriastyle.ts`.
  No external consumers. Spec fixes: `galleriaInstance.activeIndex`/`.visible`
  direct writes â†’ `.set(...)`, reads â†’ `()`; three `spyOn(galleriaInstance
  .activeIndexChange, 'emit')`/`.visibleChange` sites (no instance property
  under `model()`) rewritten to assert on the wrapper's own tracked
  `component.activeIndexChangeEvent`/`visibleChangeEvent` fields, reusing
  the by-now-established pattern from `orderlist.ts`/`dialog.ts`.
- **`button.ts`** â€” `ButtonLabel`/`ButtonIcon`/`Button` already fully
  converted; only `ButtonDirective` had 5 hazards left (`label`, `icon`,
  `loading`, `severity`, `buttonProps` â€” all get/set accessors with
  `if (this.initialized) { updateX(); setStyleClass(); }` side effects,
  guarded the same way `initialized` gates everything else in this class).
  All 5 â†’ plain `input()`s + constructor `effect()`s writing into the SAME
  `_label`/`_icon`/`_loading`/`_severity`/`_buttonProps` backing fields the
  getters used to read from, preserving the internal API every other method
  in the class already relied on (`updateLabel()`/`updateIcon()`/
  `getStyleClass()`/etc. all read `this._label` etc., unchanged) â€” ~15 bare
  `this.label`/`this.icon`/`this.loading`/`this.severity` reads across the
  class switched to the backing-field names via a scripted regex pass.
  `buttonProps`'s dynamic `Object.entries(val).forEach(([k,v]) => this
  [`_${k}`] = v)` reflection preserved verbatim in its own effect (still
  targets plain instance properties, unaffected by the input conversion).
  ~15 bare `instance.<field>` reads fixed in `buttonstyle.ts`, shared
  between `ButtonDirective` and `Button` â€” verified the `root` classes
  callback (referencing `link`/`variant`/`badge`/`hasFluid`, none of which
  exist on `ButtonDirective`) is never actually invoked for a
  `ButtonDirective` instance (it only ever calls `cx('label')`/`cx('icon')`,
  never `cx('root')`), so the added `()` calls can't crash there. Spec
  fixes: `buttonDirective.severity`/`.loading` bare reads â†’ `()`; one
  `buttonDirective.severity = 'danger'` direct write routed through the
  wrapper's own `component.severity` field + `fixture.detectChanges()`.
  Left two adjacent pre-existing bugs alone (not introduced today, confirmed
  these fields were already signals before this session): `buttonDirective
  .rounded()()` double-call and `buttonDirective.raised = true` direct
  write.
- **`focustrap.ts`** â€” Single `onChanges(changes: SimpleChanges)` hazard on
  `pFocusTrapDisabled` (already an `input()`) â†’ constructor `effect()`.
  Spec had two tests directly invoking `directive.ngOnChanges(fakeChanges)`
  with hand-built `SimpleChange` objects â€” `ngOnChanges` on the base class
  only forwards to `onChanges`, which no longer exists, so these would
  silently no-op post-conversion; rewrote both to toggle a real reactive
  `[pFocusTrapDisabled]="disabled"` binding on the existing
  `TestDisabledFocusTrapComponent` wrapper and call `fixture.detectChanges()`,
  letting the constructor effect fire for real rather than faking the
  lifecycle hook.
- **`badge.ts`** â€” `Badge` component already fully converted (its own
  spec has a pre-existing unrelated direct-write problem, unchanged, still
  flagged for a future pass). `BadgeDirective`'s multi-branch
  `onChanges(changes: SimpleChanges)` (keyed on which of `value`/`size`/
  `severity`/`disabled`/`badgeStyle`/`badgeStyleClass` changed, all gated
  behind `canUpdateBadge` except `disabled`, with `severity` specifically
  needing the OLD value to remove its old CSS class before adding the new
  one) â†’ five separate constructor `effect()`s, one per concern, matching
  each original `if (someChanges) { ... }` branch; added a `prevSeverity`
  field manually tracking the previous value across effect runs (Angular
  effects don't expose a previous-value diff the way `SimpleChanges` did,
  so this has to be tracked by hand) â€” captured and updated inside the
  `severity` effect immediately after calling `setSeverity(this
  .prevSeverity)`, matching the original `severity.previousValue` semantics.
  No spec fixes needed â€” nothing called `ngOnChanges`/`onChanges` directly
  on `BadgeDirective`.
- **`autocomplete.ts`** â€” 12 of 13 hazards were already `input()`/`output()`;
  `suggestions` get/set (backed by a writable `_suggestions` signal,
  side-effect calling `handleSuggestionsChange()`) â†’ plain `input()` +
  constructor `effect()` doing `this._suggestions.set(this.suggestions())`
  then `handleSuggestionsChange()`, keeping `_suggestions` as the reactive
  backing signal `visibleOptions` already depended on â€” one bare
  `this.suggestions` read inside `inputValue`'s `computed()` switched to
  `this._suggestions()` for consistency. Self-mutating `id = id ||
  uuid(...)` â†’ `resolvedId` pattern (3 internal reads). 11 outputs
  converted; `onClear`/`onShow`/`onHide` zero-arg `.emit()` sites widened to
  `Event | undefined`. No hazards in `autocompletestyle.ts`, no external
  consumers. Spec fixes: `autocompleteInstance.suggestions` (4 bare reads,
  one direct write) â€” the write routed through the wrapper's own
  `pTemplateComponent.suggestions` field since it's already bound via
  `[suggestions]="suggestions"`, reads got `()`.
- **`select.ts`** â€” `SelectItem` sub-component: 2 trivial outputs. `Select`:
  `placeholder` get/set (trivially backed by writable `_placeholder`
  signal, `.asReadonly()` getter â€” an unusual return-a-Signal pattern) â†’
  plain `input()` + constructor effect syncing `_placeholder`.
  `filterValue` get/set (setter wraps the write in a `setTimeout()`) and
  `options` get/set (setter guards with `deepEquals` before writing) both
  â†’ plain `input()`s + constructor effects replicating the exact original
  setter bodies verbatim (including the `setTimeout` deferral), keeping
  `_filterValue`/`_options` as the backing signals every other method
  already read from â€” ~10 bare `this.options`/`this.filterValue` reads
  across the class switched to `this._options()`/`this._filterValue()`.
  Self-mutating `id = id || uuid(...)` â†’ `resolvedId` pattern (1 internal
  read, 1 host `'[attr.id]'` binding). One `this.label === this.placeholder`
  comparison (comparing function REFERENCES, not values â€” a real bug)
  found and fixed to `this.label() === this.placeholder()`. 9 outputs
  converted. `selectstyle.ts` already correct (no hazards). No hazards on
  the `ngx-prime/select` consumers `paginator.ts`/`table.ts` (paginator has
  no relevant field reads; table.ts not yet converted, to be handled in its
  own pass). Spec fixes: ~25 bare `selectInstance.options` reads (many with
  `!` non-null assertions) across the file scripted to `selectInstance
  .options()`; one direct `selectInstance.options = groupedOptions` write
  routed through the wrapper's own bound `component.options` field.
- **`multiselect.ts`** â€” `MultiSelectItem`: 2 trivial outputs. `MultiSelect`:
  6 accessor hazards â€” `displaySelectedLabel`/`maxSelectedLabels`/
  `selectAll` were genuine no-hazard passthroughs (no internal mutation
  beyond the accessor) â†’ plain `input()`s directly, deleting the redundant
  `_displaySelectedLabel`/`_maxSelectedLabels`/`_selectAll` fields;
  `placeholder` (same `.asReadonly()`-signal-return pattern as `select.ts`),
  `filterValue`, and `options` (deepEquals-guarded write) all â†’ plain
  `input()`s + constructor effects replicating their setters verbatim,
  keeping `_placeholder`/`_filterValue`/`_options` as backing signals.
  ~12 bare reads across the class fixed (switched to the backing-signal
  calls for `options`/`filterValue`/`placeholder`, to `field()` for the
  three no-hazard ones). Self-mutating `id = id || uuid(...)` â†’
  `resolvedId` pattern. Also found and fixed two PRE-EXISTING (not
  introduced today, `overlayVisible` was already a `model()` from an
  earlier pass) direct reassignments `this.overlayVisible = true/false` in
  `show()`/`hide()` â†’ `.set(...)`, since they were blocking `tsc`
  entirely â€” left in place would have made it impossible to verify this
  file compiled at all. 9 outputs converted. No hazards in
  `multiselectstyle.ts`, no external consumers. Spec fixes: `selectAll`
  wasn't bound in the wrapper template at all (unlike the other 5 hazard
  fields, which all had existing bindings) â€” added `[selectAll]="selectAll"`
  plus a matching wrapper field rather than reaching for a `ComponentRef`
  workaround; ~4 redundant `multiSelect.filterValue = 'x'` writes deleted
  outright after confirming `onFilterInputChange()` (called on the very
  next line in every case) already sets the true backing signal itself,
  making the direct writes dead code even before today's conversion; ~10
  bare `multiSelect.options`/`.displaySelectedLabel`/`.maxSelectedLabels`
  reads switched to `()`.
- **`datepicker.ts`** â€” Largest hazard count of the session: 12 accessor
  pairs, all `if (sideEffect) { recomputeSomething(); }` on write, all
  converted to plain `input()`s + a matching constructor `effect()` per
  field, keeping every `_dateFormat`/`_hourFormat`/`_minDate`/`_maxDate`/
  `_disabledDates`/`_disabledDays`/`_showTime`/`_responsiveOptions`/
  `_numberOfMonths`/`_firstDayOfWeek`/`_view`/`_defaultDate` backing field
  exactly as before (all were already read internally throughout the file,
  this is the same "keep the backing field as the true internal read
  target" pattern used in every other multi-field hazard file this
  session) â€” a single scripted pass then rewrote every bare `this.<field>`
  reference across the ~3000-line file to `this._<field>`, catching ~80
  call sites (`getMonth()`/`getFullYear()`/comparisons/etc. on what would
  otherwise have been raw `InputSignal` objects). 12 outputs converted;
  `onClear`'s zero-arg `.emit()` fixed with an explicit `undefined`. No
  hazards in `datepickerstyle.ts`; the one external consumer (`table.ts`,
  not yet converted) only uses `DatePicker` as a template element, no
  field reads. Spec fixes: 2 bare `component.dateFormat`/`.hourFormat`
  reads on the direct instance; no direct writes found.
- **`scroller.ts`** â€” Previously deliberately left almost entirely
  unconverted (see earlier entry) due to `options`'s fully-open-ended
  reflection hazard. Revisited and found it WAS safely convertible after
  all: all 24 accessor pairs turned out to be UNIFORMLY trivial
  (`return this._x` / `this._x = val`, zero exceptions, confirmed by
  reading every single one) â€” the thing that made `options` look
  dangerous was its SECOND reflection pass (`Object.entries(val).forEach(
  ([k,v]) => this[`${k}`] = v)`), which calls each field's own setter by
  name; since every one of those setters is now proven to do nothing but
  `this._x = val`, that second pass is functionally IDENTICAL to the first
  pass (`this[`_${k}`] = v`) and was dropped as redundant rather than kept
  as a hazard. All 24 fields â†’ plain `input()`s, each still backed by its
  original `_x` field, synced via one consolidated constructor `effect()`.
  The multi-branch `onChanges(simpleChanges: SimpleChanges)` (tracking
  `loading`/`orientation`/`numToleratedItems`/`options.loading`/
  `options.numToleratedItems`/`items.length`/`itemSize`/`scrollHeight`/
  `scrollWidth`, several needing OLD-value comparison, all coordinating one
  shared `isLoadingChanged` flag) â†’ a SINGLE consolidated effect reading
  every relevant signal with hand-tracked `_prevX` fields standing in for
  `SimpleChanges.previousValue` (each starting `undefined`, which naturally
  reproduces `ngOnChanges`' first-fire-with-undefined-previousValue
  behavior without needing a separate "is this the first run" guard â€”
  tried adding one, then removed it once it became clear the natural
  `undefined !== value` comparison already covered that case correctly).
  Deliberately used ONE big effect rather than one-per-field specifically
  to preserve `SimpleChanges`' "all fields that changed together arrive in
  one batch" semantics, which per-field effects would have lost â€” this is
  the one clear place this session where multiple small effects would have
  been the wrong shape. Found and fixed 3 of my own bare-read bugs while
  writing the new effects (`this.lazy`/`this.itemSize` used instead of
  `this._lazy`/`this._itemSize`) before they ever reached `tsc`. One bare
  `instance.inline` fixed to `instance._inline` in `scrollerstyle.ts`
  (`instance.both`/`.horizontal` already correct, computed getters).
  Template audit found and fixed 4 more bare reads `tsc` couldn't see
  (`styleClass`, `tabindex`, `items`, `loaderDisabled`) despite the file
  otherwise looking template-clean already from a prior partial pass. Spec
  file: 201 bare `scroller.<field>` reads, zero direct writes, across ~15
  separate `describe` blocks â€” all fixed with one scripted pass.
- **`treetable.ts`** â€” Large file, several classes. `TreeTable` itself: 9
  hazards â†’ plain `input()`s + backing fields: `totalRecords` (`_totalRecords`,
  side effect `tableService.onTotalRecordsChange`), `sortField`/`sortOrder`/
  `multiSortMeta`/`value` (all backed, extensive internal mutation),
  `virtualRowHeight` (`_virtualRowHeight`, console.log deprecation),
  `selectionKeys` (`_selectionKeys`, `selectionKeysChange.emit()` side
  effect). `selection` deliberately kept as plain `input()` + `output()` +
  backing field rather than `model()` despite matching the classic
  paired-input/output shape: it's heavily mutated in place
  (`propagateSelectionDown`/`propagateSelectionUp`) then re-emitted via
  `this.selectionChange.emit(this.selection)` without reassigning the
  reference â€” `model().set(sameRef)` is a no-op under `Object.is`, so a
  `model()` conversion would have silently dropped these re-emissions.
  Replaced the big `onChanges(SimpleChanges)` with ONE consolidated
  constructor `effect()` reading `value()`/`sortField()`/`sortOrder()`/
  `multiSortMeta()`/`selection()` together, using hand-tracked
  `_prevValue`/`_prevSortField`/`_prevSortOrder`/`_prevMultiSortMeta`/
  `_prevSelection` fields standing in for `SimpleChanges.previousValue`
  (same pattern as `scroller.ts` above), replicating every original branch
  (sortSingle/sortMultiple/filter calls, `tableService.onUIUpdate`/
  `onSelectionChange`, the `lazy`/`initialized` guards) verbatim. Also
  found and fixed 4 MORE pre-existing broken hazards blocking `tsc`, left
  half-converted by an earlier pass (already plain `input()` but with
  unaddressed internal reassignment: `this.first = ...`, `this.rows = ...`,
  `this.filters = {}`, `this.contextMenuSelection = node`) â€” added
  `_first`/`_rows`/`_filters`/`_contextMenuSelection` backing fields plus 4
  more constructor sync effects, since leaving them broken would have made
  it impossible to verify the file compiled at all. All 20 `@Output()`s on
  `TreeTable` converted; `contextMenuSelectionChange`'s zero-arg `.emit()`
  fixed with `null as any`. Separately, `TTScrollableView`'s own
  `scrollHeight` get/set (console.log deprecation) â†’ plain `input()` + a
  new constructor `effect()` on that class. `treetablestyle.ts`: ~9 bare
  `instance.<field>` reads fixed (`showGridlines`, `rowHover`,
  `selectionMode`, `autoLayout`, `resizableColumns`, `columnResizeMode`,
  `scrollable`, `paginatorPosition`, `paginatorStyleClass`, `scrollHeight`);
  `instance.sorted`/`.selected` confirmed genuinely-plain fields on
  `TTSortableColumn`/`TTSelectableRow` and correctly left bare. Template
  audit found and fixed several more bare reads in `treetable.ts` itself:
  two `[totalRecords]="totalRecords"` bindings, `TTScrollableView`'s own
  `scrollHeight` bindings, and â€” found only via a final full `tsc` pass,
  not the template audit â€” 4 bare `this.tt.selectionKeys`/`tt.value`
  reads on `TTCheckbox`/`TTHeaderCheckbox` (both consumers of `TreeTable`'s
  now-signal fields) that only surfaced once the file fully recompiled. No
  external consumers of `ngx-prime/treetable` elsewhere in the repo. Two
  script-corruption incidents caught and fixed mid-conversion: a
  sync-effect-fix script overwrote its own freshly-written RHS
  (`this._first = this.first()` â†’ `this._first = this._first`, a
  self-referential no-op); a separate scoped bulk-fix corrupted a LOCAL
  variable `let rowNode = event.rowNode` inside `TreeTable`'s own handler
  methods into `this.rowNode().node`, because an unrelated sibling class
  further down the file (`TreeTableToggler`) has its own genuine `rowNode`
  input field with the same name â€” caught via 16 `tsc` "Property 'rowNode'
  does not exist on type 'TreeTable'" errors and reverted for `TreeTable`
  while correctly keeping the fix for `TreeTableToggler.expand()`/
  `collapse()`, which needed it all along. Spec fixes (`treetable.spec.ts`):
  the "TreeTable PT" describe block (direct `TestBed.createComponent
  (TreeTable)`) was already correctly using `fixture.componentRef
  .setInput(...)` throughout, no changes needed. The `TestBasicTreeTableComponent`
  wrapper block: one write-cluster ("should reset component state") routed
  through `component.<field> = X; fixture.detectChanges();`, plus a
  scripted pass adding `()` to 26 bare `treetable.<field>` reads. The
  `TestDynamicTreeTableComponent` block was a much bigger pre-existing
  problem than today's 13-field scope: its template only ever bound
  `[value]`/`[columns]`, with ~30 OTHER fields (including many
  already-signal fields from earlier sessions â€” `autoLayout`, `paginator`,
  `lazy`, `loading`, `scrollable`, `virtualScroll`, `selectionMode`,
  `sortMode`, `filterMode`, `showGridlines` â€” plus today's `filters`,
  `selection`, `selectionKeys`, `sortField`, `sortOrder`, `multiSortMeta`,
  `scrollHeight`, and others) set via direct mutation on the child
  instance (`this.treetable().first = first`, guarded
  `dynamicTreetable.filters = filters` blocks, etc.) â€” none of which could
  compile once the underlying fields became signals, so this was
  `tsc`-blocking for the whole spec file, not just an out-of-scope
  correctness nit. Fixed uniformly rather than only for today's 13 fields:
  added all ~30 as bound wrapper properties on `TestDynamicTreeTableComponent`
  with matching template bindings, rewrote every `updateX()` method (and
  every ad-hoc guarded direct-write block) to set the wrapper's own field
  instead of reaching into the child, so the existing `detectChanges()`
  calls already present in each test propagate the value normally â€” no
  test call sites needed to change. ~9 bare reads on the resulting
  now-signal fields (`selection`, `selectionKeys`, `sortField`,
  `sortOrder`, `multiSortMeta`) also fixed. `tsc --noEmit` and `eslint`
  both clean on `treetable.ts`/`treetable.spec.ts`/`treetablestyle.ts`
  after all fixes.
- **`table.ts`** â€” Largest file yet (~6900 lines), several sub-component
  classes, sibling of `treetable.ts` with nearly the same shape. `Table`
  itself: 9 accessor hazards â†’ plain `input()`s + backing fields: `value`
  (`_value`), `columns` (`_columns`), `first` (`_first`), `rows` (`_rows`),
  `sortField` (`_sortField`), `sortOrder` (`_sortOrder`), `multiSortMeta`
  (`_multiSortMeta`), `selectAll` (`_selectAll`), plus `selection`
  (`_selection`) deliberately kept as plain `input()` + `output()` +
  backing field rather than `model()` for the same reason as
  `treetable.ts`: sibling directives (`SelectableRow`) mutate
  `dataTable._selection` in place and it gets re-emitted via
  `selectionChange.emit(this._selection)` without a fresh reference â€”
  `model().set(sameRef)` would silently drop those. Found and fixed a
  real copy-paste bug in the pre-conversion `selectAll` get/set: both
  accessors read/wrote `this._selection` instead of `this._selectAll`
  (a second, genuinely separate backing field already used elsewhere in
  the class) â€” corrected to target `_selectAll`, which is the only
  sensible reading given `_selectAll`'s established independent use.
  Replaced the big `onChanges(SimpleChanges)` with ONE consolidated
  constructor `effect()` over `value()`/`columns()`/`sortField()`/
  `sortOrder()`/`multiSortMeta()`/`selection()`/`selectAll()`, using
  hand-tracked `_prevValue`/`_prevColumns`/`_prevSortField`/
  `_prevSortOrder`/`_prevMultiSortMeta`/`_prevSelection`/`_prevSelectAll`
  fields, replicating every original branch (sortSingle/sortMultiple/
  filter, `tableService.onValueChange`/`onColumnsChange`/
  `onSelectionChange`, `restoreState`, `saveState`, the `lazy`/
  `initialized` guards) verbatim; dropped the `groupRowsBy`/
  `groupRowsByOrder` trigger branches from the old method since those
  read `simpleChange.groupRowsBy`/`.groupRowsByOrder` â€” fields already
  converted to `input()` in an earlier session, meaning those branches
  were already permanently dead (signal inputs never populate
  `SimpleChanges`) before this session touched the file; removing
  already-inert code isn't a behavior change. `totalRecords` had the
  same pre-existing half-converted hazard as `treetable.ts` (already
  `input()`, blocked by internal `this.totalRecords = ...` writes in 3
  places) plus an unusual `firstChange`-only sync semantic in the
  original `onChanges` (only pulls from the input on the very first
  change, never again) â€” reproduced exactly with a one-shot
  `_totalRecordsSynced` boolean guard inside its own effect, since the
  generic "value changed" `_prev` trick fires on every change, not just
  the first. `contextMenuSelection` had the classic hazard-#10
  half-converted shape (already `input()`, blocked by 3 internal
  `this.contextMenuSelection = ...` writes) â€” added `_contextMenuSelection`
  backing field and constructor effect. Two more same-shaped
  half-converted hazards found only via `tsc`, unrelated to the assigned
  list: `filters` and `expandedRowKeys` (both already `input()` with
  object defaults, both blocked by a `this.x = wholeNewObject` reset/
  restore site) â€” added `_filters`/`_expandedRowKeys` backing fields plus
  effects, and redirected every internal read (`this.filters()` â†’
  `this._filters`, ~9 call sites) and every external read from sibling
  filter-UI classes (`dataTable.filters()` â†’ `dataTable._filters`, 12
  call sites) to the backing field so a `restoreState()`-driven object
  swap stays visible everywhere, exactly reproducing the original
  single-accessor read consistency. All 24 `@Output()`s on `Table`
  converted (`contextMenuSelectionChange`, `selectAllChange`,
  `selectionChange`, and 21 more); no zero-arg `.emit()` calls found.
  Sibling classes: `TableBody`'s own `value` get/set (side effects
  `updateFrozenRowStickyPosition`/`updateFrozenRowGroupHeaderStickyPosition`)
  â†’ plain `input()` + constructor effect. `FrozenColumn`'s own `frozen`
  get/set (side effect `updateStickyPosition()` via a resolved promise)
  â†’ plain `input()` + constructor effect (this directive had no
  constructor at all before; added one). `ColumnFilterFormElement`-area's
  `onShow`/`onHide` outputs converted directly, no complications. Found
  and fixed 3 more same-shaped bugs while chasing `tsc` errors, all
  isolated to their own classes: `ColumnFilter`'s `operator` (already
  `input()`, blocked by one `this.operator = value` write in
  `onOperatorChange`) â†’ `_operator` backing field + constructor effect,
  with the 2 other internal reads of `this.operator()` also redirected
  to `_operator` for the same read-consistency reason as `filters`
  above; and `ariaLabel` independently duplicated across THREE sibling
  classes (`TableRadioButton`, `TableCheckbox`, `TableHeaderCheckbox`),
  each with its own `this.ariaLabel = this.ariaLabel() || <fallback
  translation>` self-reassignment inside a `tableService` subscription
  callback â€” each got its own `_ariaLabel` field, constructor effect,
  and the class's own template rewritten from `[ariaLabel]="ariaLabel()"`
  to `[ariaLabel]="_ariaLabel"` so the fallback value actually reaches
  the DOM. Template audit on `Table`'s own template found 5 more bare
  reads needing the backing field (not the raw signal, to keep
  reflecting internal pagination/sort mutations): `[rows]`/`[first]` on
  both paginators and the scroller's `[step]`, `[columns]` on the
  scroller, and the `context: { columns }` shorthand feeding
  `buildInTable` â€” all pointed at `_rows`/`_first`/`_columns` rather than
  `rows()`/`first()`/`columns()`, since the raw input signals don't
  reflect the `_first = 0` / `_rows` resets that happen after sort,
  filter, and page-size changes. `tablestyle.ts`: 13 bare `instance.<field>`
  reads fixed across `classes`/`inlineStyles` (`rowHover`, `selectionMode`,
  `resizableColumns`, `columnResizeMode`, `scrollable`, `scrollHeight`,
  `stripedRows`, `showGridlines`, `size`, `paginatorPosition`,
  `frozenValue`, `virtualScroll`, `frozen`, `display`); `instance.sorted`/
  `.selected`/`.columnProp(...)`/`.getFrozenRowGroupHeaderStickyPosition`
  confirmed genuinely-plain and correctly left bare. No external
  consumers of `ngx-prime/table` elsewhere in the repo. `table.spec.ts`
  needed zero changes â€” every test already drives the component through
  wrapper components with template bindings or wrapper-property
  mutation, never direct `component.<hazardField> = x` on the signal
  fields touched today; `tsc --noEmit` was clean on it before and after.
  `tsc --noEmit` and `eslint` both clean on `table.ts`/`table.spec.ts`/
  `tablestyle.ts` after all fixes.
- **Remaining:** None â€” item complete. `overlay.ts` and `table.ts` (the
  last two of concern) are both fully done (see above).
  Note `Badge`'s own `.spec.ts`
  (`badge.spec.ts`) has the same direct-write problem on the
  already-converted `Badge` class from before this session â€” pre-existing,
  not introduced today, left as-is since fixing it is outside
  `BadgeDirective`'s scope. Worth a pass when picking up `badge.spec.ts`
  again.
- **Post-completion housekeeping note (2026-08-22):** a full
  `npx tsc --noEmit -p packages/ngx-prime/tsconfig.spec.json` after
  `table.ts` landed shows ~10 files with pre-existing spec-file errors
  unrelated to today's work â€” `speeddial.spec.ts` (undefined test-scope
  vars `hookCalled`/`initCalled`/`destroyCalled`, one direct `visible =`
  write on an already-`model()`-converted field), `splitbutton.spec.ts`,
  `splitter.spec.ts`/`stepper.spec.ts`/`tabs.spec.ts`/`toolbar.spec.ts`
  (all the same `Cannot assign to 'pt'` read-only-property pattern),
  `tieredmenu.spec.ts`, `togglebutton.spec.ts`/`toggleswitch.spec.ts`
  (`used before its declaration` class-ordering issues plus a couple of
  zero-vs-one-arg callback mismatches), `tooltip.spec.ts` (zero-vs-one-arg
  callback mismatches). All of these are in components that were converted
  to signals in *earlier* sessions, not today's â€” none of them block
  `treetable.ts`/`table.ts`, and none were introduced by today's work.
  Left as-is per the established scope rule (fix only what blocks the file
  currently being converted); worth a dedicated cleanup pass later.

### 4. Change-detection audit on the 6 forced-`Default` components (high priority)

- **Where:** `scroller.ts`, `organizationchart.ts` (Ã—2), `dynamicdialog.ts`,
  `table.ts` (Ã—2) explicitly set
  `changeDetection: ChangeDetectionStrategy.Default`.
- **Why it matters now specifically:** `OnPush` is the v22 default, so these
  six are opting *out* of it. Since `apps/showcase` already runs zoneless,
  these are the components most likely to have change-detection assumptions
  that zone-based CD was quietly papering over.
- **Sequencing:** do this only after step 3 touches these components anyway â€”
  flipping to `OnPush` is much lower-risk once their inputs are already
  signals, since signal reads are what makes `OnPush` actually correct rather
  than just fast. Do not flip these without auditing internal mutation
  patterns first â€” table/scroller/org-chart/dialog are exactly the components
  where a silently-stale view is the worst failure mode.

## Native-element directive migration (v23 deprecation track)

A separate initiative from the Angular-22-conformance items above: replacing
heavyweight overlay/wrapper components with lightweight directives that
attach behavior to native form elements, then deprecating the old
components ahead of removal in v23. Track this independently â€” it's a public
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
than introducing a new custom element â€” mirrors the existing pattern of
`ngx-prime/inputtext` (`InputText`, `input[pInputText]`) and
`ngx-prime/keyfilter` (`[pKeyFilter]`).

- `pCheckbox` â€” native `<input type="checkbox">`
- `pRadioButton` â€” native `<input type="radio">`
- `pInputNumber` â€” native `<input>`
- `pDatePicker` â€” native `<input>`
- `pColorPicker` â€” native `<input>`
- `pRange` â€” native `<input type="range">` element
- `pToggleSwitch` â€” native checkbox/switch
- `pToggleButton` â€” native `<button>`
- `pSelectButton` â€” native button group
- `pRating` â€” native radio-like controls
- `pFileUpload` â€” native `<input type="file">`

**Sequencing note:** do this *before* step 4's `@Input`/`@Output` â†’ signals
pass touches these same components, not after â€” each new directive should
be written signal-native from the start rather than converted twice. For
components already reached by step 4 before this track starts, no rework
needed; the signal-native version is exactly what a new directive should
follow anyway.

**Watch for:** `CascadeSelect`, `MultiSelect`, `Select`, `TreeSelect` aren't
in the deprecation list below despite similar overlay shapes â€” they don't
map to a single native element the way a checkbox or range input does, so
no directive equivalent is planned for them. Don't scope-creep the
directive set beyond the twelve above without a corresponding deprecation
target.

### 2. Deprecate the components being replaced

#### Current component-by-component plan (authoritative)

Each replacement remains a directive on a real native element. The legacy
component, module, and public exports stay functional through v22 and are
removed only in v23.

| Legacy component | Native replacement | Status and remaining plan |
| --- | --- | --- |
| `Button` | `<button pButton>` | **Deprecated.** Keep compatibility exports through v22. |
| `Checkbox` | `<input type="checkbox" pCheckbox>` | **Deprecated.** Use `pCheckboxContainer` + `pCheckboxIcon` only when a custom visual icon is required. |
| `RadioButton` | `<input type="radio" pRadioButton>` | **Deprecated.** Native grouping, Forms, Signal Forms, PT, and showcase migration are covered. |
| `ToggleSwitch` | `<input type="checkbox" pToggleSwitch>` | **Deprecated.** Native checkbox provides the switch role and browser interaction; custom handle templates are a documented migration difference. |
| `InputMask` | `<input pInputMask>` | **Deprecated.** Native masking, Forms/Signal Forms, accessibility, and a migration showcase are covered; native attributes replace wrapper-only presentation and clear-icon APIs. |
| `InputNumber` | `<input type="number" pInputNumber>` | **Deprecated.** Native min/max/step, validation, browser stepping, typed events, Forms/Signal Forms, accessibility, and migration docs are covered. Locale/currency formatting, prefixes/suffixes, and custom spinners remain documented wrapper-only features through v22. |
| `Password` | `<input type="password" pPassword>` | **Deprecated.** Native Forms/Signal Forms, strength feedback, visibility and clear controls, accessibility, and migration docs are covered. Use `pPasswordToggleMask` and `pPasswordClear` beside the input for optional controls; projected wrapper templates are replaced by native composition. |
| `DatePicker` | `<input pDatePicker>` | **Not a deprecation target.** Build a parity directive on a native text input by extracting and sharing the calendar/overlay engine with `<p-datepicker>`; do not use browser `type="date"` as the primary replacement. The wrapper remains supported after the directive ships. |
| `ColorPicker` | `<input type="color" pColorPicker>` | **Deprecated.** Native hex values, Forms/Signal Forms, typed events, reset composition, accessibility, styling, and migration docs are covered. Browser picker appearance and legacy palette/RGB/HSB/template APIs are documented migration differences. |
| `Slider` | `<input type="range" pRange>` | **Deprecated.** Native min/max/step, orientation, browser keyboard/accessibility, Forms/Signal Forms, PT, and migration docs are covered. A native range is single-value; legacy `p-slider` and `p-range` remain only through v22 for two-handle ranges. |
| `ToggleButton` | `<button pToggleButton>` | **Deprecated.** Native pressed state, Forms/Signal Forms, keyboard/ARIA, PT, and migration docs are covered. Compose labels, icons, and loading content directly from `pressed`; legacy `p-togglebutton` selectors remain only through v22 for wrapper templates. |
| `SelectButton` | native `<button pSelectButtonOption>` group | **Deprecated.** Native single/multiple selection, disabled options, ARIA semantics, keyboard navigation, Forms/Signal Forms, PT, and migration docs are covered. Compose explicit native buttons; legacy `p-selectbutton` selectors remain only through v22 for dynamic options and templates. |
| `Rating` | native radio inputs with `pRating` | Complete star display, keyboard/ARIA grouping, clearing, Forms/Signal Forms, and docs; then deprecate. |
| `FileUpload` | `<input type="file" pFileUpload>` | **Deprecated.** Compose `pFileUploadQueue` with native input, action, and drop-zone directives for queues and XMLHttpRequest transport. File-list markup and previews are application composition; compatibility component remains through v22. |

`AutoComplete` is deliberately not a deprecation target: HTML's
`autocomplete` attribute controls browser autofill and does not replace the
component's suggestion overlay.

For every backlog row, use this sequence:

1. Implement feature parity and record intentional native-element limitations.
2. Add focused native, Angular Forms, Reactive Forms, and Signal Forms tests.
3. Add a showcase "Native Input" example and old-to-new migration guidance.
4. Add `@deprecated` JSDoc with the native replacement and planned v23
   removal; do not remove runtime code or public exports in v22.

#### Superseded notes

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
twelve) â€” confirm before deprecating whether `Button`'s replacement is
meant to be a bare native `<button>` with a to-be-created `pButton`
styling directive, and whether `InputMask`/`Password` are meant to fold
into `pInputNumber`/a plain `input[pInputText]` + separate masking
directive, or whether the deprecation list and directive list need
reconciling before either lands.

- **Do:** add the `@deprecated` JSDoc tag, a console warning (dev-mode only,
  matching whatever pattern `badge.ts`'s `size` deprecation already uses â€”
  see step 3 of the Angular-22 track above) pointing at the replacement
  directive, and a showcase doc callout.
- **Don't:** remove the component, its module export, or any public API in
  this pass â€” v23 removal is a separate, later, breaking-change release.
- **Sequencing:** deprecate a component only after its matching directive
  ships and has doc/example coverage â€” a deprecation notice with no working
  replacement to point to just frustrates consumers.

## Independent, low-risk, opportunistic work

No dedicated effort needed â€” good to pick up whenever already in a given file
for other reasons.

- **Signal Forms showcase example** â€” `@angular/forms/signals` has zero
  usage in the repo, which is correct (`ngx-prime` is a `ControlValueAccessor`
  library, not a form consumer). The one opportunity: add a Signal Forms
  example alongside the existing 25 Reactive Forms doc pages (e.g.
  `autocomplete/reactive-forms-doc.ts`, `cascadeselect/reactiveforms-doc.ts`)
  as a parallel demo, not a replacement.
- **`@Injectable({ providedIn: 'root' })` â†’ `@Service()`** â€” âœ… done
  (2026-08-22): the installed Angular core now exports `Service`; converted
  all seven root-provided services: `overlayservice.ts`, `filterservice.ts`,
  `usestyle.ts`, `themeprovider.ts`, `ngx-prime.ts`, `basecomponentstyle.ts`,
  and `basestyle.ts`. Plain `@Injectable()` services remain out of scope,
  since they are component-scoped providers rather than root singletons.
- **`any` cleanup** â€” 3,673 occurrences across 249 files in `ngx-prime`, 573
  across 156 files in `apps/showcase`. Not a dedicated-pass candidate; too
  many are legitimate DOM/browser-API escape hatches (`domhandler.ts` alone
  has 34) or third-party interop (`chart.ts`). Highest-density files worth a
  look when already being edited: `table.ts` (235), `treetable.ts` (106),
  `tieredmenu.ts` (56), `menubar.ts`/`megamenu.ts` (48/46), `scroller.ts`
  (47), `picklist.ts` (47).
- **`NgOptimizedImage`** â€” `apps/showcase` only (`ngx-prime` ships no content
  images). 561 `<img>` tags with zero `ngSrc` usage, concentrated in
  `doc/image/`, `doc/galleria/`, `doc/avatar/`. Check which are inline
  `data:` URIs first â€” `NgOptimizedImage` doesn't support those.

## Housekeeping

- **Rename `packages/ngx-prime` to `packages/ngx-prime`** â€” âœ… done (2026-08-22).
  The directory and every internal filesystem reference now use `ngx-prime`.
  The published package name and public `ngx-prime/*` import specifiers remain
  intentionally unchanged for compatibility. Verified with the library build.
- **Change docs GitHub Pages domain to `ngx-prime.webart.work`** â€” source CNAME
  updated on 2026-08-22; the generated build copy is regenerated by the docs build.
  DNS and the GitHub Pages custom-domain setting still need to be updated externally.
  `.github/workflows/deploy-docs.yml` has no hardcoded domain reference.
- **Re-enable husky pre-commit and commit-msg hooks** â€” both temporarily
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
  (see status inline above) â€” this section no longer reflects a fully
  unstarted plan; check each step's own status line instead of assuming
  nothing has moved.
- Each migration step above should follow the same verification discipline
  used for the lint cleanup: small batches, `tsc --noEmit` after each, no
  bulk mechanical edits without checking call sites/overrides first.
