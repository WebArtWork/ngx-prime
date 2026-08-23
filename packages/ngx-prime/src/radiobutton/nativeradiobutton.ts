import { booleanAttribute, computed, Directive, ElementRef, effect, forwardRef, inject, input, numberAttribute, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { equals } from '@wawjs/css-prime-utils';
import { BaseEditableHolder } from '@wawjs/ngx-prime/baseeditableholder';
import { Bind } from '@wawjs/ngx-prime/bind';
import type { RadioButtonClickEvent, RadioButtonPassThrough } from '@wawjs/ngx-prime/types/radiobutton';
import { RadioButtonStyle } from './style/radiobuttonstyle';

/**
 * Adds Prime styling and accessibility attributes to a native radio input.
 * Native radios retain Angular's built-in radio value accessor and grouping.
 *
 * @group Components
 */
@Directive({
    selector: "input[type='radio'][pRadioButton]",
    standalone: true,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.data-pc-name]': "'radiobutton'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p]': 'dataP',
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-required]': 'required() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[attr.id]': 'inputId() || null',
        '[autofocus]': 'autofocus()',
        '[disabled]': '$disabled()',
        '[required]': 'required()',
        '[attr.name]': 'name() || null',
        '[value]': 'value() ?? ""',
        '[checked]': 'checked',
        '[attr.aria-checked]': 'checked',
        '(change)': 'onInputChange($event)',
        '(focus)': 'onInputFocus($event)',
        '(blur)': 'onInputBlur($event)'
    },
    providers: [RadioButtonStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioButtonDirective), multi: true }],
    hostDirectives: [Bind]
})
export class RadioButtonDirective extends BaseEditableHolder<RadioButtonPassThrough> {
    componentName = 'RadioButton';

    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    _componentStyle = inject(RadioButtonStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /** @deprecated Use the native `class` attribute instead. */
    styleClass = input<string>();

    /** Compatibility input for the directive pass-through configuration. */
    ptRadioButton = input<RadioButtonPassThrough>();

    /** Pass-through configuration for the native radio button. */
    pRadioButtonPT = input<RadioButtonPassThrough>();

    /** Enables unstyled mode for this native radio button. */
    pRadioButtonUnstyled = input<boolean | undefined>();

    value = input<unknown>();
    binary = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    inputId = input<string>();
    autofocus = input(false, { transform: booleanAttribute });
    variant = input<'filled' | 'outlined'>();
    size = input<'small' | 'large'>();

    $variant = computed(() => this.variant() || this.config.inputStyle() || this.config.inputVariant());

    /** Emits when this native radio input is selected. */
    onClick = output<RadioButtonClickEvent>();
    onFocus = output<Event>();
    onBlur = output<Event>();
    touch = output<void>();

    onInputChange(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.checked && !this.$disabled()) {
            const value = this.binary() ? true : this.value();

            this.writeModelValue(value);
            this.onModelChange(value);
            this.onClick.emit({ originalEvent: event, value });
        }
    }

    onInputFocus(event: Event) {
        this.onFocus.emit(event);
    }

    onInputBlur(event: Event) {
        this.onModelTouched();
        this.touch.emit();
        this.onBlur.emit(event);
    }

    get checked() {
        return this.binary() ? !!this.modelValue() : equals(this.modelValue(), this.value());
    }

    get dataP() {
        return this.cn({
            invalid: this.invalid(),
            checked: this.checked,
            disabled: this.$disabled(),
            filled: this.$variant() === 'filled',
            [this.size() as string]: this.size()
        });
    }

    constructor() {
        super();
        effect(() => {
            const pt = this.ptRadioButton() || this.pRadioButtonPT();

            if (pt) {
                this.directivePT.set(pt);
            }
        });

        effect(() => {
            if (this.pRadioButtonUnstyled()) {
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
