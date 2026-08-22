import { booleanAttribute, computed, contentChild, Directive, ElementRef, effect, forwardRef, inject, input, numberAttribute, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { contains, equals } from '@wawjs/css-prime-utils';
import { BaseEditableHolder } from 'primeng/baseeditableholder';
import { BaseComponent } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import type { CheckboxChangeEvent, CheckboxPassThrough } from 'primeng/types/checkbox';
import { CheckboxStyle } from './style/checkboxstyle';

/**
 * Provides the themed visual container for a native checkbox.
 *
 * Use it only when a custom checkbox icon is required. For the usual case,
 * use `<input type="checkbox" pCheckbox>` directly.
 *
 * @group Components
 */
@Directive({
    selector: 'label[pCheckboxContainer]',
    standalone: true,
    host: {
        '[class]': "cx('root')",
        '[attr.data-pc-name]': "'checkbox'",
        '[attr.data-pc-section]': "'root'"
    },
    providers: [CheckboxStyle],
    hostDirectives: [Bind]
})
export class CheckboxContainerDirective extends BaseComponent<CheckboxPassThrough> {
    componentName = 'Checkbox';

    _componentStyle = inject(CheckboxStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    readonly checkbox = contentChild<CheckboxDirective>(forwardRef(() => CheckboxDirective));

    get checked() {
        return this.checkbox()?.checked ?? false;
    }

    $disabled() {
        return this.checkbox()?.$disabled() ?? false;
    }

    invalid() {
        return this.checkbox()?.invalid() ?? false;
    }

    $variant() {
        return this.checkbox()?.$variant();
    }

    size() {
        return this.checkbox()?.size();
    }

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptm('root'));
    }
}

/**
 * Marks an element as the visual box of a `pCheckboxContainer`.
 * Its content is the custom checked icon; an empty element receives the
 * default checkmark from the checkbox theme.
 *
 * @group Components
 */
@Directive({
    selector: '[pCheckboxIcon]',
    standalone: true,
    host: {
        class: 'p-checkbox-box p-checkbox-native-icon',
        '[attr.aria-hidden]': 'true'
    }
})
export class CheckboxIconDirective {}

/**
 * Adds Prime styling and accessibility attributes to a native checkbox.
 * Native form controls retain Angular's built-in checkbox value accessor.
 *
 * @group Components
 */
@Directive({
    selector: "input[type='checkbox'][pCheckbox]",
    standalone: true,
    host: {
        '[class]': 'rootClass',
        '[attr.data-pc-name]': "'checkbox'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p]': 'dataP',
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-required]': 'required() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[attr.id]': 'inputId() || null',
        '[indeterminate]': 'indeterminate()',
        '[readOnly]': 'readonly()',
        '[autofocus]': 'autofocus()',
        '[disabled]': '$disabled()',
        '[required]': 'required()',
        '[attr.name]': 'name() || null',
        '[value]': 'value() ?? ""',
        '[checked]': 'checked',
        '(click)': 'onInputClick($event)',
        '(change)': 'onInputChange($event)',
        '(focus)': 'onInputFocus($event)',
        '(blur)': 'onInputBlur($event)'
    },
    providers: [CheckboxStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxDirective), multi: true }],
    hostDirectives: [Bind]
})
export class CheckboxDirective extends BaseEditableHolder<CheckboxPassThrough> {
    componentName = 'Checkbox';

    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    private readonly container = inject(CheckboxContainerDirective, { optional: true, skipSelf: true });

    _componentStyle = inject(CheckboxStyle);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /** @deprecated Use the native `class` attribute instead. */
    styleClass = input<string>();

    /** Compatibility input for the directive pass-through configuration. */
    ptCheckbox = input<CheckboxPassThrough>();

    /** Pass-through configuration for the native checkbox. */
    pCheckboxPT = input<CheckboxPassThrough>();

    /** Enables unstyled mode for this native checkbox. */
    pCheckboxUnstyled = input<boolean | undefined>();
    /** Allows a boolean value instead of an array of selected values. */
    binary = input(false, { transform: booleanAttribute });

    /** Value represented by this checkbox in an array model. */
    value = input<unknown>();

    /** Accessible label for the native checkbox. */
    ariaLabel = input<string>();

    /** IDs of elements that label the native checkbox. */
    ariaLabelledBy = input<string>();

    /** Index of the native input in tabbing order. */
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });

    /** Compatibility alias for the native input id. Prefer the native `id` attribute in new templates. */
    inputId = input<string>();

    /** Reflects the native checkbox indeterminate state. */
    indeterminate = input(false, { transform: booleanAttribute });

    /** Prevents user changes while retaining the checkbox in the tab order. */
    readonly = input(false, { transform: booleanAttribute });

    /** Requests focus when the browser initializes the control. */
    autofocus = input(false, { transform: booleanAttribute });

    trueValue = input<unknown>(true);
    falseValue = input<unknown>(false);

    variant = input<'filled' | 'outlined'>();
    size = input<'small' | 'large'>();

    $variant = computed(() => this.variant() || this.config.inputStyle() || this.config.inputVariant());

    /** Emits the browser change with the native checked value. */
    onChange = output<CheckboxChangeEvent>();

    /** Emits when the native checkbox receives focus. */
    onFocus = output<Event>();

    /** Emits when the native checkbox loses focus. */
    onBlur = output<Event>();
    touch = output<void>();

    onInputClick(event: MouseEvent) {
        if (this.readonly()) {
            event.preventDefault();
        }
    }

    onInputChange(event: Event) {
        const input = event.target as HTMLInputElement;

        if (this.readonly()) {
            input.checked = this.checked;

            return;
        }

        let checked: unknown;

        if (this.binary()) {
            checked = input.checked ? this.trueValue() : this.falseValue();
        } else {
            const currentValue = this.modelValue() as unknown[] | null | undefined;

            checked = input.checked ? [...(currentValue ?? []), this.value()] : (currentValue ?? []).filter((value) => !equals(value, this.value()));
        }

        this.writeModelValue(checked);
        this.onModelChange(checked);
        input.indeterminate = false;
        this.onChange.emit({ checked, originalEvent: event });
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
        const modelValue = this.modelValue();

        return this.indeterminate() ? false : this.binary() ? equals(modelValue, this.trueValue()) : contains(this.value(), modelValue);
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
            const pt = this.ptCheckbox() || this.pCheckboxPT();

            if (pt) {
                this.directivePT.set(pt);
            }
        });

        effect(() => {
            if (this.pCheckboxUnstyled()) {
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

    get rootClass() {
        return this.container ? this.cx('input') : this.cn(this.cx('root'), this.styleClass());
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        setModelValue(value);
    }
}
