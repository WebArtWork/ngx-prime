import { booleanAttribute, Directive, input, output } from '@angular/core';

/** Adds Prime state attributes to a browser-native date input. */
@Directive({
    selector: "input[type='date'][pDatePicker]",
    standalone: true,
    host: {
        class: 'p-datepicker-input',
        '[attr.data-pc-name]': "'datepicker'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '(blur)': 'touch.emit()'
    }
})
export class DatePickerDirective {
    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaDescribedBy = input<string>();
    touch = output<void>();
}
