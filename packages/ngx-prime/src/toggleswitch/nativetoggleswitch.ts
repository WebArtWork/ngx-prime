import { booleanAttribute, Directive, ElementRef, forwardRef, inject, input, numberAttribute, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { equals } from '@wawjs/css-prime-utils';
import { BaseEditableHolder } from 'primeng/baseeditableholder';
import type { ToggleSwitchChangeEvent, ToggleSwitchPassThrough } from 'primeng/types/toggleswitch';
import { ToggleSwitchStyle } from './style/toggleswitchstyle';

/** Adds switch semantics and Prime state attributes to a native checkbox. */
@Directive({
    selector: "input[type='checkbox'][pToggleSwitch]",
    standalone: true,
    host: {
        '[class]': "cx('root')",
        role: 'switch',
        '[attr.data-pc-name]': "'toggleswitch'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[attr.id]': 'inputId() || null',
        '[autofocus]': 'autofocus()',
        '[disabled]': '$disabled()',
        '[required]': 'required()',
        '[attr.name]': 'name() || null',
        '[checked]': 'checked()',
        '(click)': 'onInputClick($event)',
        '(change)': 'onInputChange($event)',
        '(blur)': 'onInputBlur($event)'
    },
    providers: [ToggleSwitchStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleSwitchDirective), multi: true }]
})
export class ToggleSwitchDirective extends BaseEditableHolder<ToggleSwitchPassThrough> {
    componentName = 'ToggleSwitch';

    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    _componentStyle = inject(ToggleSwitchStyle);

    readonly = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    inputId = input<string>();
    autofocus = input(false, { transform: booleanAttribute });
    trueValue = input<unknown>(true);
    falseValue = input<unknown>(false);
    size = input<'small' | 'large'>();

    onChange = output<ToggleSwitchChangeEvent>();
    touch = output<void>();

    onInputClick(event: MouseEvent) {
        if (this.readonly()) {
            event.preventDefault();
        }
    }

    onInputChange(event: Event) {
        const checked = (event.target as HTMLInputElement).checked ? this.trueValue() : this.falseValue();

        this.writeModelValue(checked);
        this.onModelChange(checked);
        this.onChange.emit({ originalEvent: event, checked: (event.target as HTMLInputElement).checked });
    }

    onInputBlur(_event: Event) {
        this.onModelTouched();
        this.touch.emit();
    }

    checked() {
        return equals(this.modelValue(), this.trueValue());
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        setModelValue(value);
    }
}
