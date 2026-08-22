import { booleanAttribute, input, numberAttribute, signal } from '@angular/core';

/** Shared state and date constraints for native DatePicker building blocks. */
export abstract class BaseDatePicker {
    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    readonly = input(false, { transform: booleanAttribute });
    readonlyInput = input(false, { transform: booleanAttribute });
    showOnFocus = input(true, { transform: booleanAttribute });
    keepInvalid = input(false, { transform: booleanAttribute });
    minDate = input<Date | undefined>();
    maxDate = input<Date | undefined>();
    disabledDates = input<readonly Date[] | undefined>();
    disabledDays = input<readonly number[] | undefined>();
    dateFormat = input('yy-mm-dd');
    placeholder = input<string>();
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();

    readonly value = signal<Date | null>(null);
    readonly overlayVisible = signal(false);

    isSelectable(date: Date): boolean {
        const day = this.startOfDay(date).getTime();

        return !(
            (this.minDate() && day < this.startOfDay(this.minDate()!).getTime()) ||
            (this.maxDate() && day > this.startOfDay(this.maxDate()!).getTime()) ||
            this.disabledDays()?.includes(date.getDay()) ||
            this.disabledDates()?.some((disabledDate) => this.startOfDay(disabledDate).getTime() === day)
        );
    }

    protected startOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
}
