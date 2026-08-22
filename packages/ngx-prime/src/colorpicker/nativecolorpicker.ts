import { booleanAttribute, Directive, input, output } from '@angular/core';

/** Enhances a browser-native color input while preserving native color selection. */
@Directive({
    selector: "input[type='color'][pColorPicker]",
    standalone: true,
    host: {
        class: 'p-colorpicker-input',
        '[attr.data-pc-name]': "'colorpicker'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-pc-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '(input)': 'onInput($event)',
        '(blur)': 'touch.emit()'
    }
})
export class ColorPickerDirective {
    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    colorChange = output<string>();
    touch = output<void>();

    onInput(event: Event) {
        this.colorChange.emit((event.target as HTMLInputElement).value);
    }
}
