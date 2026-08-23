import { booleanAttribute, Directive, ElementRef, inject, input, output } from '@angular/core';
import type { ColorPickerChangeEvent } from '@wawjs/ngx-prime/types/colorpicker';

/** Enhances a browser-native color input while preserving native color selection. */
@Directive({
    selector: "input[type='color'][pColorPicker]",
    standalone: true,
    exportAs: 'pColorPicker',
    host: {
        class: 'p-colorpicker-input p-component',
        '[class.p-invalid]': 'invalid()',
        '[attr.data-pc-name]': "'colorpicker'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-pc-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.id]': 'inputId() || null',
        '[attr.name]': 'name() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[readOnly]': 'readonly()',
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '(input)': 'onInput($event)',
        '(change)': 'handleChange($event)',
        '(focus)': 'onFocus.emit($event)',
        '(blur)': 'onNativeBlur($event)'
    }
})
export class ColorPickerDirective {
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    readonly = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaDescribedBy = input<string>();
    inputId = input<string>();
    name = input<string>();
    tabindex = input<number>();
    colorChange = output<string>();
    touch = output<void>();
    onInputChange = output<ColorPickerChangeEvent>({ alias: 'onInput' });
    onChange = output<ColorPickerChangeEvent>();
    onFocus = output<Event>();
    onBlur = output<Event>();
    onClear = output<string>();

    onInput(event: Event) {
        const value = (event.target as HTMLInputElement).value.toUpperCase();

        this.colorChange.emit(value);
        this.onInputChange.emit({ originalEvent: event, value });
    }

    onNativeBlur(event: Event) {
        this.touch.emit();
        this.onBlur.emit(event);
    }

    handleChange(event: Event) {
        this.onChange.emit({ originalEvent: event, value: (event.target as HTMLInputElement).value.toUpperCase() });
    }

    clear(value = '#000000') {
        if (this.disabled() || this.readonly()) return;

        this.element.nativeElement.value = value;
        this.element.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
        this.element.nativeElement.dispatchEvent(new Event('change', { bubbles: true }));
        this.onClear.emit(value.toUpperCase());
        this.element.nativeElement.focus();
    }
}

/** Resets a native `pColorPicker` input to its configured default color. */
@Directive({
    selector: 'button[pColorPickerClear]',
    standalone: true,
    host: {
        type: 'button',
        class: 'p-colorpicker-clear',
        '[attr.aria-label]': 'ariaLabel()',
        '[disabled]': 'picker().disabled() || picker().readonly()',
        '(click)': 'clear()'
    }
})
export class ColorPickerClearDirective {
    picker = input.required<ColorPickerDirective>({ alias: 'pColorPickerClear' });
    value = input('#000000');
    ariaLabel = input('Reset color');

    clear() {
        this.picker().clear(this.value());
    }
}
