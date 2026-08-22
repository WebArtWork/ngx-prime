import { booleanAttribute, computed, Directive, ElementRef, inject, input, numberAttribute, output } from '@angular/core';
import { BaseModelHolder } from 'primeng/basemodelholder';
import type { SliderChangeEvent, SliderPassThrough, SliderSlideEndEvent } from 'primeng/types/slider';
import { SliderStyle } from './style/sliderstyle';

/** Adds Prime state attributes to a native range input. */
@Directive({
    selector: "input[type='range'][pSlider]",
    standalone: true,
    host: {
        '[class]': "cx('root')",
        '[attr.data-pc-name]': "'slider'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-orientation]': 'resolvedOrientation()',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[autofocus]': 'autofocus()',
        '[min]': 'min()',
        '[max]': 'max()',
        '[step]': 'step() ?? "any"',
        '(input)': 'onInput($event)',
        '(change)': 'onNativeChange($event)',
        '(blur)': 'touch.emit()'
    },
    providers: [SliderStyle]
})
export class SliderDirective extends BaseModelHolder<SliderPassThrough> {
    componentName = 'Slider';

    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    _componentStyle = inject(SliderStyle);

    invalid = input(false, { transform: booleanAttribute });
    vertical = input(false, { transform: booleanAttribute });
    orientation = input<'horizontal' | 'vertical'>('horizontal');
    animate = input(false, { transform: booleanAttribute });
    min = input(0, { transform: numberAttribute });
    max = input(100, { transform: numberAttribute });
    step = input<number, unknown>(undefined, { transform: numberAttribute });
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    autofocus = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();

    onChange = output<SliderChangeEvent>();
    onSlideEnd = output<SliderSlideEndEvent>();
    touch = output<void>();

    resolvedOrientation = computed(() => (this.vertical() ? 'vertical' : this.orientation()));

    onInput(event: Event) {
        const value = (event.target as HTMLInputElement).valueAsNumber;

        this.writeModelValue(value);
        this.onChange.emit({ event, value });
    }

    onNativeChange(event: Event) {
        const value = (event.target as HTMLInputElement).valueAsNumber;

        this.writeModelValue(value);
        this.onSlideEnd.emit({ originalEvent: event, value });
    }

    $disabled() {
        return this.element.nativeElement.disabled;
    }
}
