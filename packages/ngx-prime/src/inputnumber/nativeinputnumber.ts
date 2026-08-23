import { booleanAttribute, Directive, ElementRef, inject, input, numberAttribute, output } from '@angular/core';
import type { InputNumberInputEvent } from '@wawjs/ngx-prime/types/inputnumber';

/** Adds Prime state attributes to a native number input. */
@Directive({
    selector: "input[type='number'][pInputNumber]",
    standalone: true,
    host: {
        class: 'p-inputnumber-input p-inputtext p-component',
        '[class.p-invalid]': 'invalid()',
        '[attr.data-pc-name]': "'inputnumber'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.aria-required]': 'required() || null',
        '[attr.aria-valuemin]': 'min() ?? null',
        '[attr.aria-valuemax]': 'max() ?? null',
        '[attr.aria-valuenow]': 'valueAsNumber ?? null',
        '[attr.id]': 'inputId() || null',
        '[attr.name]': 'name() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[attr.placeholder]': 'placeholder() || null',
        '[attr.title]': 'title() || null',
        '[readOnly]': 'readonly()',
        '[autofocus]': 'autofocus()',
        '[disabled]': '$disabled()',
        '[required]': 'required()',
        '[min]': 'min() ?? null',
        '[max]': 'max() ?? null',
        '[step]': 'step() ?? null',
        '(input)': 'onNativeInput($event)',
        '(focus)': 'onFocus.emit($event)',
        '(blur)': 'onNativeBlur($event)',
        '(keydown)': 'onKeyDown.emit($event)'
    }
})
export class InputNumberDirective {
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    readonly = input(false, { transform: booleanAttribute });
    min = input<number, unknown>(undefined, { transform: numberAttribute });
    max = input<number, unknown>(undefined, { transform: numberAttribute });
    step = input<number, unknown>(undefined, { transform: numberAttribute });
    inputId = input<string>();
    name = input<string>();
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    placeholder = input<string>();
    title = input<string>();
    autofocus = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();

    /** Signal Forms marks a field as touched when this emits after blur. */
    touch = output<void>();

    onInput = output<InputNumberInputEvent>();
    onFocus = output<Event>();
    onBlur = output<Event>();
    onKeyDown = output<KeyboardEvent>();

    $disabled() {
        return this.disabled();
    }

    get valueAsNumber() {
        const value = this.element.nativeElement.valueAsNumber;

        return Number.isNaN(value) ? null : value;
    }

    onNativeInput(event: Event) {
        const input = event.target as HTMLInputElement;

        this.onInput.emit({ originalEvent: event, value: Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber, formattedValue: input.value });
    }

    onNativeBlur(event: Event) {
        this.touch.emit();
        this.onBlur.emit(event);
    }

    increment(steps = 1) {
        this.stepBy('stepUp', steps);
    }

    decrement(steps = 1) {
        this.stepBy('stepDown', steps);
    }

    focus(options?: FocusOptions) {
        this.element.nativeElement.focus(options);
    }

    private stepBy(method: 'stepUp' | 'stepDown', steps: number) {
        if (this.$disabled() || this.readonly()) {
            return;
        }

        if (method === 'stepUp') {
            this.element.nativeElement.stepUp(steps);
        } else {
            this.element.nativeElement.stepDown(steps);
        }

        this.element.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
