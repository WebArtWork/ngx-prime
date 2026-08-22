import { booleanAttribute, Directive, forwardRef, inject, input, model, numberAttribute, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseEditableHolder } from 'primeng/baseeditableholder';
import type { ToggleButtonChangeEvent, ToggleButtonPassThrough } from 'primeng/types/togglebutton';
import { ToggleButtonStyle } from './style/togglebuttonstyle';

/** Adds toggle semantics to a native button. */
@Directive({
    selector: 'button[pToggleButton]',
    standalone: true,
    host: {
        '[class]': "cx('root')",
        '[attr.data-pc-name]': "'togglebutton'",
        '[attr.data-pc-section]': "'root'",
        '[attr.aria-pressed]': 'checked()',
        '[disabled]': '$disabled()',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[autofocus]': 'autofocus()',
        '(click)': 'toggle($event)',
        '(blur)': 'onBlur()'
    },
    providers: [ToggleButtonStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleButtonDirective), multi: true }]
})
export class ToggleButtonDirective extends BaseEditableHolder<ToggleButtonPassThrough> {
    componentName = 'ToggleButton';

    _componentStyle = inject(ToggleButtonStyle);

    /** Signal Forms checkbox contract; binds publicly as `[(pressed)]`. */
    checked = model(false, { alias: 'pressed' });
    allowEmpty = input<boolean>();
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    autofocus = input(false, { transform: booleanAttribute });
    size = input<'small' | 'large'>();
    fluid = input(false, { transform: booleanAttribute });

    onChange = output<ToggleButtonChangeEvent>();
    touch = output<void>();

    toggle(event: MouseEvent) {
        if (this.$disabled() || (this.allowEmpty() === false && this.checked())) {
            return;
        }

        const checked = !this.checked();

        this.checked.set(checked);
        this.writeModelValue(checked);
        this.onModelChange(checked);
        this.onModelTouched();
        this.onChange.emit({ originalEvent: event, checked });
    }

    onBlur() {
        this.onModelTouched();
        this.touch.emit();
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        const checked = !!value;

        setModelValue(checked);
        this.checked.set(checked);
    }
}
