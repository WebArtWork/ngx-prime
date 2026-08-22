import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import type { InputNumberInputEvent } from 'primeng/types/inputnumber';

/** Adds Prime state attributes to a native number input. */
@Directive({
    selector: "input[type='number'][pInputNumber]",
    standalone: true,
    host: {
        class: 'p-inputnumber-input',
        '[attr.data-pc-name]': "'inputnumber'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '[min]': 'min() ?? null',
        '[max]': 'max() ?? null',
        '[step]': 'step() ?? "any"',
        '(input)': 'onNativeInput($event)',
        '(blur)': 'touch.emit()'
    }
})
export class InputNumberDirective {
    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    min = input<number, unknown>(undefined, { transform: numberAttribute });
    max = input<number, unknown>(undefined, { transform: numberAttribute });
    step = input<number, unknown>(undefined, { transform: numberAttribute });
    ariaLabel = input<string>();
    ariaDescribedBy = input<string>();

    /** Signal Forms marks a field as touched when this emits after blur. */
    touch = output<void>();

    onInput = output<InputNumberInputEvent>();

    onNativeInput(event: Event) {
        const input = event.target as HTMLInputElement;

        this.onInput.emit({ originalEvent: event, value: Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber, formattedValue: input.value });
    }
}
