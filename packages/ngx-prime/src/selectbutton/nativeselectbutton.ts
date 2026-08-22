import { booleanAttribute, Directive, forwardRef, inject, input, model, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { equals } from '@wawjs/css-prime-utils';
import { BaseEditableHolder } from 'primeng/baseeditableholder';
import type { SelectButtonChangeEvent, SelectButtonOptionClickEvent, SelectButtonPassThrough } from 'primeng/types/selectbutton';
import { SelectButtonStyle } from './style/selectbuttonstyle';

/** Manages selection for a group of native `button[pSelectButtonOption]` elements. */
@Directive({
    selector: '[pSelectButton]',
    standalone: true,
    host: {
        '[class]': "cx('root')",
        role: 'group',
        '[attr.data-pc-name]': "'selectbutton'",
        '[attr.data-pc-section]': "'root'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null'
    },
    providers: [SelectButtonStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectButtonDirective), multi: true }]
})
export class SelectButtonDirective extends BaseEditableHolder<SelectButtonPassThrough> {
    componentName = 'SelectButton';

    _componentStyle = inject(SelectButtonStyle);

    multiple = input(false, { transform: booleanAttribute });
    allowEmpty = input(true, { transform: booleanAttribute });
    unselectable = input(false, { transform: booleanAttribute });
    ariaLabelledBy = input<string>();
    fluid = input(false, { transform: booleanAttribute });

    onOptionClick = output<SelectButtonOptionClickEvent>();
    onChange = output<SelectButtonChangeEvent>();
    /** Signal Forms value contract. */
    value = model<unknown>(null);
    touch = output<void>();

    isSelected(value: unknown) {
        const modelValue = this.value();

        return this.multiple() ? Array.isArray(modelValue) && modelValue.some((selected) => equals(selected, value)) : equals(modelValue, value);
    }

    select(event: MouseEvent, option: unknown, index?: number) {
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

                value = current.filter((selectedValue) => !equals(selectedValue, option));
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
        this.onModelTouched();
        this.touch.emit();
        this.onChange.emit({ originalEvent: event, value });
        this.onOptionClick.emit({ originalEvent: event, option, index });
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        setModelValue(value);
        this.value.set(value);
    }
}

/** Registers a native button as an option in a `pSelectButton` group. */
@Directive({
    selector: 'button[pSelectButtonOption]',
    standalone: true,
    host: {
        class: 'p-togglebutton p-component',
        '[class.p-togglebutton-checked]': 'selected()',
        '[attr.aria-pressed]': 'selected()',
        '[disabled]': 'disabled() || group.$disabled()',
        '[value]': 'value() ?? ""',
        '(click)': 'select($event)'
    }
})
export class SelectButtonOptionDirective {
    readonly group = inject(SelectButtonDirective, { host: true });

    value = input<unknown>();
    disabled = input(false, { transform: booleanAttribute });
    index = input<number>();

    selected = () => this.group.isSelected(this.value());

    select(event: MouseEvent) {
        if (!this.disabled()) {
            this.group.select(event, this.value(), this.index());
        }
    }
}
