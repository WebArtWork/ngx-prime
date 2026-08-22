import { Directive, ElementRef, inject, output } from '@angular/core';
import { BaseDatePicker } from './basedatepicker';

/**
 * Native host contract for the DatePicker calendar overlay.
 *
 * The host is intentionally a text input: browser `type="date"` cannot
 * provide DatePicker's locale formatting, ranges, time selection, or panel.
 */
@Directive({
    selector: 'input[pDatePicker]',
    standalone: true,
    exportAs: 'pDatePicker',
    host: {
        class: 'p-datepicker-input p-inputtext p-component',
        '[attr.data-pc-name]': "'datepicker'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.aria-expanded]': 'overlayVisible()',
        '[attr.aria-haspopup]': "'dialog'",
        '[attr.role]': "'combobox'",
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '[readOnly]': 'readonly() || readonlyInput()',
        '[attr.placeholder]': 'placeholder() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '(focus)': 'open($event)',
        '(click)': 'open($event)',
        '(keydown.escape)': 'close()',
        '(blur)': 'handleBlur($event)'
    }
})
export class DatePickerDirective extends BaseDatePicker {
    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    touch = output<void>();
    onFocus = output<Event>();
    onBlur = output<Event>();
    onShow = output<Event>();
    onHide = output<void>();

    open(event: Event) {
        if (!this.disabled() && this.showOnFocus() && !this.overlayVisible()) {
            this.overlayVisible.set(true);
            this.onShow.emit(event);
        }

        if (event.type === 'focus') {
            this.onFocus.emit(event);
        }
    }

    close() {
        if (this.overlayVisible()) {
            this.overlayVisible.set(false);
            this.onHide.emit();
        }
    }

    focus(options?: FocusOptions) {
        this.element.nativeElement.focus(options);
    }

    private handleBlur(event: Event) {
        this.touch.emit();
        this.onBlur.emit(event);
    }
}
