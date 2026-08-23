import { booleanAttribute, computed, contentChildren, Directive, ElementRef, forwardRef, inject, input, model, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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
        '(keydown)': 'onKeyDown($event)',
        '(focusin)': 'onFocus.emit($event)',
        '(focusout)': 'onFocusOut($event)'
    },
    providers: [SelectButtonStyle, ToggleButtonStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectButtonDirective), multi: true }],
    hostDirectives: [Bind]
})
export class SelectButtonDirective extends BaseEditableHolder<SelectButtonPassThrough> {
    componentName = 'SelectButton';

    _componentStyle = inject(SelectButtonStyle);

    readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    multiple = input(false, { transform: booleanAttribute });
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

    onKeyDown(event: KeyboardEvent) {
        const option = this.optionDirectives().find((candidate) => candidate.element.nativeElement === event.target);

        if (!option || this.$disabled()) return;

        const options = this.optionDirectives().filter((candidate) => !candidate.isDisabled());
        const currentIndex = options.indexOf(option);
        let nextIndex: number | undefined;

        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = (currentIndex - 1 + options.length) % options.length;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % options.length;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = options.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        const next = options[nextIndex];

        next.focus();
        if (!this.multiple()) this.select(event, next.value(), next.resolvedIndex());
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
        '[attr.tabindex]': 'tabindex()',
        '[disabled]': 'isDisabled()',
        '[value]': 'value() ?? ""',
        '(click)': 'select($event)'
    },
    hostDirectives: [Bind]
})
export class SelectButtonOptionDirective {
    readonly group = inject(SelectButtonDirective, { host: true });

    readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    value = input<unknown>();
    disabled = input(false, { transform: booleanAttribute });
    type = input<'button' | 'submit' | 'reset'>('button');
    index = input<number>();
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();

    selected = () => this.group.isSelected(this.value());

    resolvedIndex = computed(() => this.index() ?? this.group.getOptionIndex(this));

    tabindex = computed(() => {
        if (this.isDisabled()) return -1;
        if (this.group.multiple()) return 0;

        return this.selected() || (!this.group.optionDirectives().some((option) => option.selected()) && this.group.isFirstEnabledOption(this)) ? 0 : -1;
    });

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
