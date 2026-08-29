import { booleanAttribute, computed, Directive, ElementRef, inject, input, numberAttribute, output } from '@angular/core';
import { BaseModelHolder } from '@wawjs/ngx-prime/basemodelholder';
import { Bind } from '@wawjs/ngx-prime/bind';
import type { SliderChangeEvent, SliderPassThrough, SliderSlideEndEvent } from '@wawjs/ngx-prime/types/slider';
import { SliderStyle } from './style/sliderstyle';

/** Adds Prime behavior to a native range input. */
@Directive({
    selector: "input[type='range'][pRange]",
    standalone: true,
    exportAs: 'pRange',
    host: {
        '[class]': "cx('root')",
        '[attr.data-pc-name]': "'slider'",
        '[attr.data-pc-section]': "'input'",
        '[class.p-invalid]': 'invalid()',
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.aria-orientation]': 'resolvedOrientation()',
        '[attr.aria-readonly]': 'readonly() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[disabled]': '$disabled()',
        '[autofocus]': 'autofocus()',
        '[min]': 'min()',
        '[max]': 'max()',
        '[step]': 'step() ?? "any"',
        '(input)': 'handleInput($event)',
        '(change)': 'onNativeChange($event)',
        '(focus)': 'onFocus.emit($event)',
        '(blur)': 'onNativeBlur($event)'
    },
    providers: [SliderStyle],
    hostDirectives: [Bind]
})
export class RangeDirective extends BaseModelHolder<SliderPassThrough> {
    componentName = 'Slider';

    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    _componentStyle = inject(SliderStyle);

    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    readonly = input(false, { transform: booleanAttribute });
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
    ariaDescribedBy = input<string>();

    onChange = output<SliderChangeEvent>();
    onSlideEnd = output<SliderSlideEndEvent>();
    onInput = output<SliderChangeEvent>();
    onFocus = output<Event>();
    onBlur = output<Event>();
    touch = output<void>();

    resolvedOrientation = computed(() => (this.vertical() ? 'vertical' : this.orientation()));

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptms(['input', 'root']));
    }

    handleInput(event: Event) {
        const value = (event.target as HTMLInputElement).valueAsNumber;

        this.writeModelValue(value);
        this.onInput.emit({ event, value });
        this.onChange.emit({ event, value });
    }

    onNativeChange(event: Event) {
        const value = (event.target as HTMLInputElement).valueAsNumber;

        this.writeModelValue(value);
        this.onSlideEnd.emit({ originalEvent: event, value });
    }

    $disabled() {
        // Native range inputs do not support `readonly`; disabled is the
        // accessible native equivalent for a non-editable range control.
        return this.disabled() || this.readonly();
    }

    onNativeBlur(event: Event) {
        this.touch.emit();
        this.onBlur.emit(event);
    }

    focus(options?: FocusOptions) {
        this.element.nativeElement.focus(options);
    }
}
