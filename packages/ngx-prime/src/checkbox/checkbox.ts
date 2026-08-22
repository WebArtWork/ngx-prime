import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    forwardRef,
    inject,
    InjectionToken,
    input,
    NgModule,
    numberAttribute,
    output,
    signal,
    TemplateRef,
    ViewEncapsulation,
    viewChild,
    contentChild,
    contentChildren
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { contains, equals } from '@wawjs/css-prime-utils';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { PARENT_INSTANCE } from 'primeng/basecomponent';
import { BaseEditableHolder } from 'primeng/baseeditableholder';
import { Bind, BindModule } from 'primeng/bind';
import { CheckIcon } from 'primeng/icons/check';
import { MinusIcon } from 'primeng/icons/minus';
import { Nullable } from 'primeng/ts-helpers';
import { CheckboxChangeEvent, CheckboxIconTemplateContext, CheckboxPassThrough } from 'primeng/types/checkbox';
import { CheckboxStyle } from './style/checkboxstyle';
import { CheckboxContainerDirective, CheckboxDirective, CheckboxIconDirective } from './nativecheckbox';

const CHECKBOX_INSTANCE = new InjectionToken<Checkbox>('CHECKBOX_INSTANCE');

export const CHECKBOX_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Checkbox),
    multi: true
};
/**
 * Checkbox is an extension to standard checkbox element with theming.
 *
 * @deprecated Use a native `<input type="checkbox" pCheckbox>` instead. For
 * custom visual icons, use `pCheckboxContainer` and `pCheckboxIcon`. This
 * component remains available for compatibility and is planned for removal in v23.
 * @group Components
 */
@Component({
    selector: 'p-checkbox, p-checkBox, p-check-box',
    standalone: true,
    imports: [CommonModule, SharedModule, CheckIcon, MinusIcon, BindModule],
    template: `
        <input
            #input
            [attr.id]="inputId()"
            type="checkbox"
            [attr.value]="value()"
            [attr.name]="name()"
            [checked]="checked"
            [attr.tabindex]="tabindex()"
            [attr.required]="required() ? '' : undefined"
            [attr.readonly]="readonly() ? '' : undefined"
            [attr.disabled]="$disabled() ? '' : undefined"
            [attr.aria-labelledby]="ariaLabelledBy()"
            [attr.aria-label]="ariaLabel()"
            [style]="inputStyle()"
            [class]="cn(cx('input'), inputClass())"
            [pBind]="ptm('input')"
            (focus)="onInputFocus($event)"
            (blur)="onInputBlur($event)"
            (change)="handleChange($event)"
        />
        <div [class]="cx('box')" [pBind]="ptm('box')" [attr.data-p]="dataP">
            @if (!checkboxIconTemplate() && !_checkboxIconTemplate) {
                @if (checked) {
                    @if (checkboxIcon()) {
                        <span [class]="cx('icon')" [ngClass]="checkboxIcon()" [pBind]="ptm('icon')" [attr.data-p]="dataP"></span>
                    }
                    @if (!checkboxIcon()) {
                        <svg data-p-icon="check" [class]="cx('icon')" [pBind]="ptm('icon')" [attr.data-p]="dataP" />
                    }
                }
                @if (_indeterminate()) {
                    <svg data-p-icon="minus" [class]="cx('icon')" [pBind]="ptm('icon')" [attr.data-p]="dataP" />
                }
            }
            <ng-template *ngTemplateOutlet="checkboxIconTemplate() || _checkboxIconTemplate; context: { checked: checked, class: cx('icon'), dataP: dataP }"></ng-template>
        </div>
    `,
    providers: [CHECKBOX_VALUE_ACCESSOR, CheckboxStyle, { provide: CHECKBOX_INSTANCE, useExisting: Checkbox }, { provide: PARENT_INSTANCE, useExisting: Checkbox }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.data-p-highlight]': 'checked',
        '[attr.data-p-checked]': 'checked',
        '[attr.data-p-disabled]': '$disabled()',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Checkbox extends BaseEditableHolder<CheckboxPassThrough> {
    componentName = 'Checkbox';

    hostName = input<any>('');
    /**
     * Value of the checkbox.
     * @group Props
     */
    value = input<any>();
    /**
     * Allows to select a boolean value instead of multiple values.
     * @group Props
     */
    binary = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    ariaLabelledBy = input<string>();
    /**
     * Used to define a string that labels the input element.
     * @group Props
     */
    ariaLabel = input<string>();
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * Identifier of the focus input to match a label defined for the component.
     * @group Props
     */
    inputId = input<string>();
    /**
     * Inline style of the input element.
     * @group Props
     */
    inputStyle = input<{ [klass: string]: any } | null>();
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Style class of the input element.
     * @group Props
     */
    inputClass = input<string>();
    /**
     * When present, it specifies input state as indeterminate.
     * @group Props
     */
    indeterminate = input(false, { transform: booleanAttribute });
    /**
     * Form control value.
     * @group Props
     */
    formControl = input<FormControl>();
    /**
     * Icon class of the checkbox icon.
     * @group Props
     */
    checkboxIcon = input<string>();
    /**
     * When present, it specifies that the component cannot be edited.
     * @group Props
     */
    readonly = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    autofocus = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Value in checked state.
     * @group Props
     */
    trueValue = input<any>(true);
    /**
     * Value in unchecked state.
     * @group Props
     */
    falseValue = input<any>(false);
    /**
     * Specifies the input variant of the component.
     * @defaultValue undefined
     * @group Props
     */
    variant = input<'filled' | 'outlined' | undefined>();
    /**
     * Specifies the size of the component.
     * @defaultValue undefined
     * @group Props
     */
    size = input<'large' | 'small' | undefined>();
    /**
     * Callback to invoke on value change.
     * @param {CheckboxChangeEvent} event - Custom value change event.
     * @group Emits
     */
    onChange = output<CheckboxChangeEvent>();
    /**
     * Callback to invoke when the receives focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onFocus = output<Event>();
    /**
     * Callback to invoke when the loses focus.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onBlur = output<Event>();

    readonly inputViewChild = viewChild<Nullable<ElementRef>>('input');

    get checked() {
        return this._indeterminate() ? false : this.binary() ? this.modelValue() === this.trueValue() : contains(this.value(), this.modelValue());
    }

    _indeterminate = signal<any>(undefined);
    /**
     * Custom checkbox icon template.
     * @group Templates
     */
    readonly checkboxIconTemplate = contentChild<TemplateRef<CheckboxIconTemplateContext>>('icon', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    _checkboxIconTemplate: TemplateRef<CheckboxIconTemplateContext> | undefined;

    focused: boolean = false;

    _componentStyle = inject(CheckboxStyle);

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcCheckbox: Checkbox | undefined = inject(CHECKBOX_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    $variant = computed(() => this.variant() || this.config.inputStyle() || this.config.inputVariant());

    constructor() {
        super();
        effect(() => {
            this._indeterminate.set(this.indeterminate());
        });
    }

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'icon':
                    this._checkboxIconTemplate = item.template;
                    break;
                case 'checkboxicon':
                    this._checkboxIconTemplate = item.template;
                    break;
            }
        });
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    updateModel(event) {
        let newModelValue;

        /*
         * When `formControlName` or `formControl` is used - `writeValue` is not called after control changes.
         * Otherwise it is causing multiple references to the actual value: there is one array reference inside the component and another one in the control value.
         * `selfControl` is the source of truth of references, it is made to avoid reference loss.
         * */
        const selfControl = this.injector.get<NgControl | null>(NgControl, null, { optional: true, self: true });

        const formControl = this.formControl();
        const currentModelValue = selfControl && !formControl ? selfControl.value : this.modelValue();

        if (!this.binary()) {
            if (this.checked || this._indeterminate()) newModelValue = currentModelValue.filter((val) => !equals(val, this.value()));
            else newModelValue = currentModelValue ? [...currentModelValue, this.value()] : [this.value()];

            this.onModelChange(newModelValue);
            this.writeModelValue(newModelValue);

            if (formControl) {
                formControl.setValue(newModelValue);
            }
        } else {
            newModelValue = this._indeterminate() ? this.trueValue() : this.checked ? this.falseValue() : this.trueValue();
            this.writeModelValue(newModelValue);
            this.onModelChange(newModelValue);
        }

        if (this._indeterminate()) {
            this._indeterminate.set(false);
        }

        this.onChange.emit({ checked: newModelValue, originalEvent: event });
    }

    handleChange(event) {
        if (!this.readonly()) {
            this.updateModel(event);
        }
    }

    onInputFocus(event) {
        this.focused = true;
        this.onFocus.emit(event);
    }

    onInputBlur(event) {
        this.focused = false;
        this.onBlur.emit(event);
        this.onModelTouched();
    }

    focus() {
        this.inputViewChild()?.nativeElement.focus();
    }

    /**
     * @override
     *
     * @see {@link BaseEditableHolder.writeControlValue}
     * Writes the value to the control.
     */
    writeControlValue(value: any, setModelValue: (value: any) => void): void {
        setModelValue(value);
        this.cd.markForCheck();
    }

    get dataP() {
        return this.cn({
            invalid: this.invalid(),
            checked: this.checked,
            disabled: this.$disabled(),
            filled: this.$variant() === 'filled',
            [this.size() as string]: this.size()
        });
    }
}

@NgModule({
    imports: [Checkbox, CheckboxContainerDirective, CheckboxDirective, CheckboxIconDirective, SharedModule],
    exports: [Checkbox, CheckboxContainerDirective, CheckboxDirective, CheckboxIconDirective, SharedModule]
})
export class CheckboxModule {}
