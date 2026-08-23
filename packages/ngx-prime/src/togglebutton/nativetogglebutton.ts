import { booleanAttribute, Directive, ElementRef, forwardRef, inject, input, model, numberAttribute, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseEditableHolder } from '@wawjs/ngx-prime/baseeditableholder';
import { Bind } from '@wawjs/ngx-prime/bind';
import type { ToggleButtonChangeEvent, ToggleButtonPassThrough } from '@wawjs/ngx-prime/types/togglebutton';
import { ToggleButtonStyle } from './style/togglebuttonstyle';

/** Adds toggle semantics to a native button. */
@Directive({
    selector: 'button[pToggleButton]',
    standalone: true,
    host: {
        '[class]': "cx('root')",
        '[attr.data-pc-name]': "'togglebutton'",
        '[attr.data-pc-section]': "'root'",
        '[attr.data-p-checked]': 'checked() || null',
        '[attr.data-p-disabled]': '$disabled() || null',
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.type]': 'type()',
        '[attr.aria-pressed]': 'checked()',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.aria-disabled]': '$disabled() || null',
        '[attr.id]': 'inputId() || null',
        '[attr.name]': 'name() || null',
        '[disabled]': '$disabled()',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[autofocus]': 'autofocus()',
        '(click)': 'toggle($event)',
        '(focus)': 'onFocus.emit($event)',
        '(blur)': 'handleBlur($event)'
    },
    providers: [ToggleButtonStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleButtonDirective), multi: true }],
    hostDirectives: [Bind]
})
export class ToggleButtonDirective extends BaseEditableHolder<ToggleButtonPassThrough> {
    componentName = 'ToggleButton';

    _componentStyle = inject(ToggleButtonStyle);

    private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    /** Signal Forms checkbox contract; binds publicly as `[(pressed)]`. */
    checked = model(false, { alias: 'pressed' });
    allowEmpty = input(true, { transform: booleanAttribute });
    type = input<'button' | 'submit' | 'reset'>('button');
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    autofocus = input(false, { transform: booleanAttribute });
    size = input<'small' | 'large'>();
    fluid = input(false, { transform: booleanAttribute });
    inputId = input<string>();
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();

    onChange = output<ToggleButtonChangeEvent>();
    onFocus = output<Event>();
    onBlur = output<Event>();
    touch = output<void>();

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptms(['button', 'root']));
    }

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

    handleBlur(event: Event) {
        this.onModelTouched();
        this.touch.emit();
        this.onBlur.emit(event);
    }

    focus(options?: FocusOptions) {
        this.element.nativeElement.focus(options);
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        const checked = !!value;

        setModelValue(checked);
        this.checked.set(checked);
    }
}
