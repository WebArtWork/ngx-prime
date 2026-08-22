import { booleanAttribute, Directive, forwardRef, inject, input, numberAttribute, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { equals } from '@wawjs/css-prime-utils';
import { BaseEditableHolder } from 'ngx-prime/baseeditableholder';
import type { RatingPassThrough, RatingRateEvent } from 'ngx-prime/types/rating';
import { RatingStyle } from './style/ratingstyle';

/** Adds Prime state attributes to a native radio used in a rating group. */
@Directive({
    selector: "input[type='radio'][pRating]",
    standalone: true,
    host: {
        '[class]': "cx('root')",
        '[attr.data-pc-name]': "'rating'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[autofocus]': 'autofocus()',
        '[disabled]': '$disabled()',
        '[required]': 'required()',
        '[attr.name]': 'name() || null',
        '[value]': 'value()',
        '[checked]': 'checked',
        '(click)': 'onInputClick($event)',
        '(change)': 'onInputChange($event)',
        '(focus)': 'onInputFocus($event)',
        '(blur)': 'onInputBlur($event)'
    },
    providers: [RatingStyle, { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingDirective), multi: true }]
})
export class RatingDirective extends BaseEditableHolder<RatingPassThrough> {
    componentName = 'Rating';

    _componentStyle = inject(RatingStyle);

    readonly = input(false, { transform: booleanAttribute });
    value = input(0, { transform: numberAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    autofocus = input(false, { transform: booleanAttribute });

    onRate = output<RatingRateEvent>();
    onFocus = output<FocusEvent>();
    onBlur = output<FocusEvent>();
    touch = output<void>();

    onInputClick(event: MouseEvent) {
        if (this.readonly()) {
            event.preventDefault();

            return;
        }

        if (this.checked) {
            event.preventDefault();
            this.setRating(event, null);
        }
    }

    onInputChange(event: Event) {
        if (!this.readonly() && (event.target as HTMLInputElement).checked) {
            this.setRating(event, this.value());
        }
    }

    onInputFocus(event: FocusEvent) {
        this.onFocus.emit(event);
    }

    onInputBlur(event: FocusEvent) {
        this.onModelTouched();
        this.touch.emit();
        this.onBlur.emit(event);
    }

    get checked() {
        return equals(this.modelValue(), this.value());
    }

    private setRating(event: Event, value: number | null) {
        this.writeModelValue(value);
        this.onModelChange(value);

        if (value !== null) {
            this.onRate.emit({ originalEvent: event, value });
        }
    }

    override writeControlValue(value: unknown, setModelValue: (value: unknown) => void) {
        setModelValue(value);
    }
}
