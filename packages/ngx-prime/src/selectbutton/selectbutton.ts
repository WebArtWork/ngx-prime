import { CommonModule } from '@angular/common';
import {
    AfterViewChecked,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    forwardRef,
    inject,
    InjectionToken,
    input,
    isDevMode,
    NgModule,
    numberAttribute,
    output,
    TemplateRef,
    ViewEncapsulation,
    contentChildren
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { equals, resolveFieldData } from '@wawjs/css-prime-utils';
import { PrimeTemplate, SharedModule } from '@wawjs/ngx-prime/api';
import { PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { BaseEditableHolder } from '@wawjs/ngx-prime/baseeditableholder';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import { ToggleButton } from '@wawjs/ngx-prime/togglebutton';
import { SelectButtonChangeEvent, SelectButtonItemTemplateContext, SelectButtonOptionClickEvent, SelectButtonPassThrough } from '@wawjs/ngx-prime/types/selectbutton';
import { SelectButtonStyle } from './style/selectbuttonstyle';
import { SelectButtonDirective, SelectButtonOptionDirective } from './nativeselectbutton';

const SELECTBUTTON_INSTANCE = new InjectionToken<SelectButton>('SELECTBUTTON_INSTANCE');

export const SELECTBUTTON_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectButton),
    multi: true
};
/**
 * Legacy SelectButton component.
 * @deprecated since v22, use native `pSelectButton` and `pSelectButtonOption` directives. The legacy component selectors will be removed in v23.
 * @group Components
 */
@Component({
    selector: 'p-selectButton, p-selectbutton, p-select-button',
    standalone: true,
    imports: [ToggleButton, FormsModule, CommonModule, SharedModule, BindModule],
    template: `
        @for (option of options(); track getOptionLabel(option); let i = $index) {
            <p-togglebutton
                [autofocus]="autofocus()"
                [styleClass]="styleClass()"
                [ngModel]="isSelected(option)"
                [onLabel]="this.getOptionLabel(option)"
                [offLabel]="this.getOptionLabel(option)"
                [disabled]="$disabled() || isOptionDisabled(option)"
                (onChange)="onOptionSelect($event, option, i)"
                [allowEmpty]="getAllowEmpty()"
                [size]="size()"
                [fluid]="fluid()"
                [pt]="ptm('pcToggleButton')"
                [unstyled]="unstyled()"
            >
                @if (itemTemplate || _itemTemplate) {
                    <ng-template #content>
                        <ng-container *ngTemplateOutlet="itemTemplate || _itemTemplate; context: { $implicit: option, index: i }"></ng-container>
                    </ng-template>
                }
            </p-togglebutton>
        }
    `,
    providers: [SELECTBUTTON_VALUE_ACCESSOR, SelectButtonStyle, { provide: SELECTBUTTON_INSTANCE, useExisting: SelectButton }, { provide: PARENT_INSTANCE, useExisting: SelectButton }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cx('root')",
        '[attr.role]': '"group"',
        '[attr.aria-labelledby]': 'ariaLabelledBy()',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class SelectButton extends BaseEditableHolder<SelectButtonPassThrough> implements AfterViewChecked {
    componentName = 'SelectButton';

    constructor() {
        super();

        if (isDevMode()) {
            // eslint-disable-next-line no-console
            console.warn('`<p-selectbutton>` is deprecated and will be removed in a future major version. ' + 'Use the native `pSelectButton`/`pSelectButtonOption` directives instead.');
        }
    }

    /**
     * An array of selectitems to display as the available options.
     * @group Props
     */
    options = input<any[]>();
    /**
     * Name of the label field of an option.
     * @group Props
     */
    optionLabel = input<string>();
    /**
     * Name of the value field of an option.
     * @group Props
     */
    optionValue = input<string>();
    /**
     * Name of the disabled field of an option.
     * @group Props
     */
    optionDisabled = input<string>();
    /**
     * Whether selection can be cleared.
     * @group Props
     */
    unselectable = input(false, { transform: booleanAttribute });
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    tabindex = input(0, { transform: numberAttribute });
    /**
     * When specified, allows selecting multiple values.
     * @group Props
     */
    multiple = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Whether selection can not be cleared.
     * @group Props
     */
    allowEmpty = input(true, { transform: booleanAttribute });
    /**
     * Style class of the component.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    ariaLabelledBy = input<string>();
    /**
     * A property to uniquely identify a value in options.
     * @group Props
     */
    dataKey = input<string>();
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    autofocus = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Specifies the size of the component.
     * @defaultValue undefined
     * @group Props
     */
    size = input<'large' | 'small' | undefined>();
    /**
     * Spans 100% width of the container when enabled.
     * @defaultValue undefined
     * @group Props
     */
    fluid = input(undefined, { transform: booleanAttribute });
    /**
     * Callback to invoke on input click.
     * @param {SelectButtonOptionClickEvent} event - Custom click event.
     * @group Emits
     */
    onOptionClick = output<SelectButtonOptionClickEvent>();
    /**
     * Callback to invoke on selection change.
     * @param {SelectButtonChangeEvent} event - Custom change event.
     * @group Emits
     */
    onChange = output<SelectButtonChangeEvent>();
    /**
     * Custom item template.
     * @param {SelectButtonItemTemplateContext} context - item context.
     * @see {@link SelectButtonItemTemplateContext}
     * @group Templates
     */
    @ContentChild('item', { descendants: false }) itemTemplate: TemplateRef<SelectButtonItemTemplateContext> | undefined;

    _itemTemplate: TemplateRef<SelectButtonItemTemplateContext> | undefined;

    get equalityKey() {
        return this.optionValue() ? null : this.dataKey();
    }

    value: any;

    focusedIndex: number = 0;

    _componentStyle = inject(SelectButtonStyle);

    $pcSelectButton: SelectButton | undefined = inject(SELECTBUTTON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    getAllowEmpty() {
        if (this.unselectable()) {
            return false;
        }

        if (this.multiple()) {
            return this.allowEmpty() || this.value?.length !== 1;
        }

        return this.allowEmpty();
    }

    getOptionLabel(option: any) {
        const optionLabel = this.optionLabel();

        return optionLabel ? resolveFieldData(option, optionLabel) : option.label != undefined ? option.label : option;
    }

    getOptionValue(option: any) {
        const optionValue = this.optionValue();

        return optionValue ? resolveFieldData(option, optionValue) : this.optionLabel() || option.value === undefined ? option : option.value;
    }

    isOptionDisabled(option: any) {
        const optionDisabled = this.optionDisabled();

        return optionDisabled ? resolveFieldData(option, optionDisabled) : option.disabled !== undefined ? option.disabled : false;
    }

    onOptionSelect(event, option, index) {
        if (this.$disabled() || this.isOptionDisabled(option)) {
            return;
        }

        let selected = this.isSelected(option);

        if (selected && this.unselectable()) {
            return;
        }

        let optionValue = this.getOptionValue(option);
        let newValue;

        if (this.multiple()) {
            if (selected) newValue = this.value.filter((val) => !equals(val, optionValue, this.equalityKey || undefined));
            else newValue = this.value ? [...this.value, optionValue] : [optionValue];
        } else {
            if (selected && !this.allowEmpty()) {
                return;
            }

            newValue = selected ? null : optionValue;
        }

        this.focusedIndex = index;
        this.value = newValue;
        this.writeModelValue(this.value);
        this.onModelChange(this.value);

        this.onChange.emit({
            originalEvent: event,
            value: this.value
        });

        this.onOptionClick.emit({
            originalEvent: event,
            option: option,
            index: index
        });
    }

    changeTabIndexes(event, direction) {
        let firstTabableChild, index;

        for (let i = 0; i <= this.el.nativeElement.children.length - 1; i++) {
            if (this.el.nativeElement.children[i].getAttribute('tabindex') === '0') firstTabableChild = { elem: this.el.nativeElement.children[i], index: i };
        }

        if (direction === 'prev') {
            if (firstTabableChild.index === 0) index = this.el.nativeElement.children.length - 1;
            else index = firstTabableChild.index - 1;
        } else {
            if (firstTabableChild.index === this.el.nativeElement.children.length - 1) index = 0;
            else index = firstTabableChild.index + 1;
        }

        this.focusedIndex = index;
        this.el.nativeElement.children[index].focus();
    }

    onFocus(event: Event, index: number) {
        this.focusedIndex = index;
    }

    onBlur() {
        this.onModelTouched();
    }

    removeOption(option: any): void {
        this.value = this.value.filter((val: any) => !equals(val, this.getOptionValue(option), this.dataKey()));
    }

    isSelected(option: any) {
        let selected = false;
        const optionValue = this.getOptionValue(option);

        if (this.multiple()) {
            if (this.value && Array.isArray(this.value)) {
                for (let val of this.value) {
                    if (equals(val, optionValue, this.dataKey())) {
                        selected = true;
                        break;
                    }
                }
            }
        } else {
            selected = equals(this.getOptionValue(option), this.value, this.equalityKey || undefined);
        }

        return selected;
    }

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this._itemTemplate = item.template;
                    break;
            }
        });
    }

    /**
     * @override
     *
     * @see {@link BaseEditableHolder.writeControlValue}
     * Writes the value to the control.
     */
    writeControlValue(value: any, setModelValue: (value: any) => void): void {
        this.value = value;
        setModelValue(this.value);
        this.cd.markForCheck();
    }

    get dataP() {
        return this.cn({
            invalid: this.invalid()
        });
    }
}

@NgModule({
    imports: [SelectButton, SelectButtonDirective, SelectButtonOptionDirective, SharedModule],
    exports: [SelectButton, SelectButtonDirective, SelectButtonOptionDirective, SharedModule]
})
export class SelectButtonModule {}
