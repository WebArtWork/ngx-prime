import { booleanAttribute, computed, contentChildren, Directive, effect, ElementRef, forwardRef, inject, input, model, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Listbox as AriaListbox, Option as AriaOption } from '@angular/aria/listbox';
import { equals } from '@wawjs/css-prime-utils';
import { BaseEditableHolder } from '@wawjs/ngx-prime/baseeditableholder';
import { Bind } from '@wawjs/ngx-prime/bind';
import type { SelectButtonChangeEvent, SelectButtonOptionClickEvent, SelectButtonPassThrough } from '@wawjs/ngx-prime/types/selectbutton';
import { ToggleButtonStyle } from '@wawjs/ngx-prime/togglebutton';
import { SelectButtonStyle } from './style/selectbuttonstyle';

/** Manages selection for a group of native `button[pSelectButtonOption]` elements. */
@Directive({
    selector: '[pSelectButton]',
    standalone: true,
    host: {
        '[class]': "cx('root')",
        '[attr.role]': 'role()',
        '[attr.data-pc-name]': "'selectbutton'",
        '[attr.data-pc-section]': "'root'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.data-p-disabled]': '$disabled() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.aria-disabled]': '$disabled() || null',
        '(focusin)': 'onFocus.emit($event)',
        '(focusout)': 'onFocusOut($event)'
    },
    providers: [SelectButtonStyle, ToggleButtonStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectButtonDirective), multi: true }],
    hostDirectives: [Bind, { directive: AriaListbox, inputs: ['multi: multiple'] }]
})
export class SelectButtonDirective extends BaseEditableHolder<SelectButtonPassThrough> {
    componentName = 'SelectButton';

    _componentStyle = inject(SelectButtonStyle);

    readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /** The `ngListbox` instance applied to this component's host, forwarding `multiple` to `multi`. */
    readonly ariaListbox = inject(AriaListbox, { self: true });

    multiple = this.ariaListbox.multi;
    allowEmpty = input(true, { transform: booleanAttribute });
    unselectable = input(false, { transform: booleanAttribute });
    dataKey = input<string>();
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();
    fluid = input(false, { transform: booleanAttribute });

    onOptionClick = output<SelectButtonOptionClickEvent>();
    onChange = output<SelectButtonChangeEvent>();
    onFocus = output<FocusEvent>();
    onBlur = output<FocusEvent>();
    /** Signal Forms value contract. */
    value = model<unknown>(null);
    touch = output<void>();

    readonly optionDirectives = contentChildren(SelectButtonOptionDirective, { descendants: true });

    role = computed(() => (this.multiple() ? 'group' : 'radiogroup'));

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptms(['group', 'root']));
    }

    /** Keeps the aria listbox's internal `value` (array-shaped) mirrored to our own `value` model. */
    private readonly syncAriaValueEffect = effect(() => {
        const value = this.value();
        const arr = this.multiple() ? ((value as unknown[] | null | undefined) ?? []) : value == null ? [] : [value];

        if (!this.sameAsAriaValue(arr)) {
            this.ariaListbox.value.set(arr as unknown[]);
        }
    });

    /**
     * Propagates keyboard-driven selection (arrow-key "follow focus" in single-select mode,
     * handled internally by `@angular/aria`) back through our own `select()` pipeline, since
     * `ngListbox`'s own click/keydown handling only updates its internal `value` model directly.
     */
    private readonly syncFromAriaEffect = effect(() => {
        const ariaArr = this.ariaListbox.value();
        const nextValue = this.multiple() ? ariaArr : ariaArr.length ? ariaArr[0] : null;

        if (!equals(nextValue, this.value(), this.dataKey() || undefined)) {
            this.value.set(nextValue);
            this.writeModelValue(nextValue);
            this.onModelChange(nextValue);
            this.onChange.emit({ originalEvent: undefined as unknown as Event, value: nextValue });
        }
    });

    private sameAsAriaValue(arr: unknown[]): boolean {
        const current = this.ariaListbox.value();

        return current.length === arr.length && current.every((val, i) => equals(val, arr[i], this.dataKey() || undefined));
    }

    isSelected(value: unknown) {
        const modelValue = this.value();

        return this.multiple() ? Array.isArray(modelValue) && modelValue.some((selected) => equals(selected, value, this.dataKey() || undefined)) : equals(modelValue, value, this.dataKey() || undefined);
    }

    select(event: Event, option: unknown, index?: number) {
        if (this.$disabled()) {
            return;
        }

        const selected = this.isSelected(option);
        let value: unknown;

        if (this.multiple()) {
            const current = (this.value() as unknown[] | null | undefined) ?? [];

            if (selected) {
                if (this.unselectable() || (!this.allowEmpty() && current.length === 1)) {
                    return;
                }

                value = current.filter((selectedValue) => !equals(selectedValue, option, this.dataKey() || undefined));
            } else {
                value = [...current, option];
            }
        } else {
            if (selected && (this.unselectable() || !this.allowEmpty())) {
                return;
            }

            value = selected ? null : option;
        }

        this.value.set(value);
        this.writeModelValue(value);
        this.onModelChange(value);
        this.onChange.emit({ originalEvent: event, value });
        this.onOptionClick.emit({ originalEvent: event, option, index });
    }

    getOptionIndex(option: SelectButtonOptionDirective) {
        return this.optionDirectives().indexOf(option);
    }

    isFirstEnabledOption(option: SelectButtonOptionDirective) {
        return this.optionDirectives().find((candidate) => !candidate.isDisabled()) === option;
    }

    onFocusOut(event: FocusEvent) {
        if (this.element.nativeElement.contains(event.relatedTarget as Node | null)) return;

        this.onModelTouched();
        this.touch.emit();
        this.onBlur.emit(event);
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        setModelValue(value);
        this.value.set(value);
    }

    focus(options?: FocusOptions) {
        this.optionDirectives()
            .find((option) => !option.isDisabled() && (option.selected() || this.isFirstEnabledOption(option)))
            ?.focus(options);
    }
}

/** Registers a native button as an option in a `pSelectButton` group. */
@Directive({
    selector: 'button[pSelectButtonOption]',
    standalone: true,
    host: {
        class: 'p-togglebutton p-component',
        '[class.p-togglebutton-checked]': 'selected()',
        '[class.p-disabled]': 'isDisabled()',
        '[attr.type]': 'type()',
        '[attr.role]': 'group.multiple() ? null : "radio"',
        '[attr.aria-checked]': 'group.multiple() ? null : selected()',
        '[attr.aria-pressed]': 'group.multiple() ? selected() : null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.aria-disabled]': 'isDisabled() || null',
        '[disabled]': 'isDisabled()',
        '[value]': 'value() ?? ""',
        '(click)': 'select($event)'
    },
    hostDirectives: [Bind, { directive: AriaOption, inputs: ['value', 'disabled'] }]
})
export class SelectButtonOptionDirective {
    readonly group = inject(SelectButtonDirective, { host: true });

    readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /** The `ngOption` instance applied to this element's host, forwarding `value`/`disabled`. */
    readonly ariaOption = inject(AriaOption, { self: true });

    value = computed(() => this.ariaOption.value());
    disabled = computed(() => this.ariaOption.disabled());
    type = input<'button' | 'submit' | 'reset'>('button');
    index = input<number>();
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();

    selected = () => this.group.isSelected(this.value());

    resolvedIndex = computed(() => this.index() ?? this.group.getOptionIndex(this));

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.group.ptm('option', { instance: this }));
    }

    isDisabled() {
        return this.disabled() || this.group.$disabled();
    }

    select(event: Event) {
        if (!this.isDisabled()) {
            this.group.select(event, this.value(), this.resolvedIndex());
        }
    }

    focus(options?: FocusOptions) {
        this.element.nativeElement.focus(options);
    }
}
