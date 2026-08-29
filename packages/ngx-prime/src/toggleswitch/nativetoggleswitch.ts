import { booleanAttribute, Directive, ElementRef, effect, forwardRef, inject, input, numberAttribute, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { equals } from '@wawjs/css-prime-utils';
import { BaseEditableHolder } from '@wawjs/ngx-prime/baseeditableholder';
import { Bind } from '@wawjs/ngx-prime/bind';
import type { ToggleSwitchChangeEvent, ToggleSwitchPassThrough } from '@wawjs/ngx-prime/types/toggleswitch';
import { ToggleSwitchStyle } from './style/toggleswitchstyle';

/** Adds switch semantics and Prime state attributes to a native checkbox. */
@Directive({
    selector: "input[type='checkbox'][pToggleSwitch]",
    standalone: true,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        role: 'switch',
        '[attr.data-pc-name]': "'toggleswitch'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[attr.id]': 'inputId() || null',
        '[autofocus]': 'autofocus()',
        '[disabled]': '$disabled()',
        '[required]': 'required()',
        '[attr.name]': 'name() || null',
        '[checked]': 'checked()',
        '[attr.aria-checked]': 'checked()',
        '(click)': 'onInputClick($event)',
        '(change)': 'onInputChange($event)',
        '(focus)': 'onInputFocus($event)',
        '(blur)': 'onInputBlur($event)'
    },
    providers: [ToggleSwitchStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleSwitchDirective), multi: true }],
    hostDirectives: [Bind]
})
export class ToggleSwitchDirective extends BaseEditableHolder<ToggleSwitchPassThrough> {
    componentName = 'ToggleSwitch';

    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    _componentStyle = inject(ToggleSwitchStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /** @deprecated Use the native `class` attribute instead. */
    styleClass = input<string>();

    /** Compatibility input for the directive pass-through configuration. */
    ptToggleSwitch = input<ToggleSwitchPassThrough>();

    /** Pass-through configuration for the native toggle switch. */
    pToggleSwitchPT = input<ToggleSwitchPassThrough>();

    /** Enables unstyled mode for this native toggle switch. */
    pToggleSwitchUnstyled = input<boolean | undefined>();

    readonly = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    inputId = input<string>();
    autofocus = input(false, { transform: booleanAttribute });
    trueValue = input<unknown>(true);
    falseValue = input<unknown>(false);
    size = input<'small' | 'large'>();

    onChange = output<ToggleSwitchChangeEvent>();
    onFocus = output<Event>();
    onBlur = output<Event>();
    touch = output<void>();

    onInputClick(event: MouseEvent) {
        if (this.readonly() || this.$disabled()) {
            event.preventDefault();
        }
    }

    onInputChange(event: Event) {
        const input = event.target as HTMLInputElement;

        if (this.readonly()) {
            input.checked = this.checked();

            return;
        }

        const checked = input.checked ? this.trueValue() : this.falseValue();

        this.writeModelValue(checked);
        this.onModelChange(checked);
        this.onChange.emit({ originalEvent: event, checked: input.checked });
    }

    onInputFocus(event: Event) {
        this.onFocus.emit(event);
    }

    onInputBlur(event: Event) {
        this.onModelTouched();
        this.touch.emit();
        this.onBlur.emit(event);
    }

    checked() {
        return equals(this.modelValue(), this.trueValue());
    }

    constructor() {
        super();
        effect(() => {
            const pt = this.ptToggleSwitch() || this.pToggleSwitchPT();

            if (pt) {
                this.directivePT.set(pt);
            }
        });

        effect(() => {
            if (this.pToggleSwitchUnstyled()) {
                this.directiveUnstyled.set(true);
            }
        });
    }

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }

    focus(options?: FocusOptions) {
        this.element.nativeElement.focus(options);
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        setModelValue(value);
    }
}
