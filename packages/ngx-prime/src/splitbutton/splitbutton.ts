import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    ElementRef,
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
import { MotionOptions } from '@wawjs/css-prime-motion';
import { uuid } from '@wawjs/css-prime-utils';
import { MenuItem, PrimeTemplate, SharedModule, TooltipOptions } from 'primeng/api';
import { AutoFocus } from 'primeng/autofocus';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { ButtonDirective } from 'primeng/button';
import { ChevronDownIcon } from 'primeng/icons';
import { Ripple } from 'primeng/ripple';
import { TieredMenu } from 'primeng/tieredmenu';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonProps, MenuButtonProps, SplitButtonPassThrough } from 'primeng/types/splitbutton';
import { SplitButtonStyle } from './style/splitbuttonstyle';

const SPLITBUTTON_INSTANCE = new InjectionToken<SplitButton>('SPLITBUTTON_INSTANCE');

type SplitButtonIconPosition = 'left' | 'right';
/**
 * SplitButton groups a set of commands in an overlay with a default command.
 * @group Components
 */
@Component({
    selector: 'p-splitbutton, p-splitButton, p-split-button',
    standalone: true,
    imports: [CommonModule, ButtonDirective, TieredMenu, AutoFocus, ChevronDownIcon, Ripple, TooltipModule, SharedModule],
    template: `
        @if (contentTemplate || _contentTemplate) {
            <button
                [class]="cx('pcButton')"
                type="button"
                pButton
                pRipple
                [severity]="severity()"
                [text]="text()"
                [outlined]="outlined()"
                [size]="size()"
                [icon]="icon()"
                [iconPos]="iconPos()"
                (click)="onDefaultButtonClick($event)"
                [disabled]="disabled()"
                [attr.tabindex]="tabindex()"
                [attr.aria-label]="buttonProps()?.['ariaLabel'] || label()"
                [pAutoFocus]="autofocus()"
                [pTooltip]="tooltip()"
                [pTooltipUnstyled]="unstyled()"
                [tooltipOptions]="tooltipOptions()"
                [pt]="ptm('pcButton')"
                [unstyled]="unstyled()"
            >
                <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate"></ng-container>
            </button>
        } @else {
            <button
                #defaultbtn
                [class]="cx('pcButton')"
                type="button"
                pButton
                pRipple
                [severity]="severity()"
                [text]="text()"
                [outlined]="outlined()"
                [size]="size()"
                [icon]="icon()"
                [iconPos]="iconPos()"
                [label]="label()"
                (click)="onDefaultButtonClick($event)"
                [disabled]="$buttonDisabled()"
                [attr.tabindex]="tabindex()"
                [attr.aria-label]="buttonProps()?.['ariaLabel']"
                [pAutoFocus]="autofocus()"
                [pTooltip]="tooltip()"
                [pTooltipUnstyled]="unstyled()"
                [tooltipOptions]="tooltipOptions()"
                [pt]="ptm('pcButton')"
                [unstyled]="unstyled()"
            ></button>
        }
        <button
            type="button"
            pButton
            pRipple
            [size]="size()"
            [severity]="severity()"
            [text]="text()"
            [outlined]="outlined()"
            [class]="cx('pcDropdown')"
            (click)="onDropdownButtonClick($event)"
            (keydown)="onDropdownButtonKeydown($event)"
            [disabled]="$menuButtonDisabled()"
            [attr.aria-label]="menuButtonProps()?.['ariaLabel'] || expandAriaLabel()"
            [attr.aria-haspopup]="menuButtonProps()?.['ariaHasPopup'] || true"
            [attr.aria-expanded]="menuButtonProps()?.['ariaExpanded'] || isExpanded()"
            [attr.aria-controls]="menuButtonProps()?.['ariaControls'] || ariaId"
            [pt]="ptm('pcDropdown')"
            [unstyled]="unstyled()"
        >
            @if (dropdownIcon()) {
                <span [class]="dropdownIcon()"></span>
            }
            @if (!dropdownIcon()) {
                @if (!dropdownIconTemplate() && !_dropdownIconTemplate) {
                    <svg data-p-icon="chevron-down" />
                }
                <ng-template *ngTemplateOutlet="dropdownIconTemplate() || _dropdownIconTemplate"></ng-template>
            }
        </button>
        <p-tieredmenu
            [id]="ariaId"
            #menu
            [popup]="true"
            [model]="model()"
            [style]="menuStyle()"
            [styleClass]="menuStyleClass()"
            [appendTo]="$appendTo()"
            [motionOptions]="computedMotionOptions()"
            (onHide)="onHide()"
            (onShow)="onShow()"
            [pt]="ptm('pcMenu')"
            [unstyled]="unstyled()"
        ></p-tieredmenu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SplitButtonStyle, { provide: SPLITBUTTON_INSTANCE, useExisting: SplitButton }, { provide: PARENT_INSTANCE, useExisting: SplitButton }],
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '[attr.data-p-severity]': 'severity()'
    },
    hostDirectives: [Bind]
})
export class SplitButton extends BaseComponent<SplitButtonPassThrough> {
    componentName = 'SplitButton';
    $pcSplitButton: SplitButton | undefined = inject(SPLITBUTTON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * MenuModel instance to define the overlay items.
     * @group Props
     */
    model = input<MenuItem[]>();
    /**
     * Defines the style of the button.
     * @group Props
     */
    severity = input<'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null>();
    /**
     * Add a shadow to indicate elevation.
     * @group Props
     */
    raised = input(false, { transform: booleanAttribute });
    /**
     * Add a circular border radius to the button.
     * @group Props
     */
    rounded = input(false, { transform: booleanAttribute });
    /**
     * Add a textual class to the button without a background initially.
     * @group Props
     */
    text = input(false, { transform: booleanAttribute });
    /**
     * Add a border class without a background initially.
     * @group Props
     */
    outlined = input(false, { transform: booleanAttribute });
    /**
     * Defines the size of the button.
     * @group Props
     */
    size = input<'small' | 'large' | undefined | null>(null);
    /**
     * Add a plain textual class to the button without a background initially.
     * @group Props
     */
    plain = input(false, { transform: booleanAttribute });
    /**
     * Name of the icon.
     * @group Props
     */
    icon = input<string>();
    /**
     * Position of the icon.
     * @group Props
     */
    iconPos = input<SplitButtonIconPosition>('left');
    /**
     * Text of the button.
     * @group Props
     */
    label = input<string>();
    /**
     * Tooltip for the main button.
     * @group Props
     */
    tooltip = input<string>();
    /**
     * Tooltip options for the main button.
     * @group Props
     */
    tooltipOptions = input<TooltipOptions>();
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Inline style of the overlay menu.
     * @group Props
     */
    menuStyle = input<{ [klass: string]: any } | null>();
    /**
     * Style class of the overlay menu.
     * @group Props
     */
    menuStyleClass = input<string>();
    /**
     * Name of the dropdown icon.
     * @group Props
     */
    dropdownIcon = input<string>();
    /**
     * Target element to attach the overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @defaultValue 'body'
     * @group Props
     */
    appendTo = input<HTMLElement | ElementRef | TemplateRef<any> | 'self' | 'body' | null | undefined | any>('body');
    /**
     * Indicates the direction of the element.
     * @group Props
     */
    dir = input<string>();
    /**
     * Defines a string that labels the expand button for accessibility.
     * @group Props
     */
    expandAriaLabel = input<string>();
    /**
     * Transition options of the show animation.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    showTransitionOptions = input('.12s cubic-bezier(0, 0, 0.2, 1)');
    /**
     * Transition options of the hide animation.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    hideTransitionOptions = input('.1s linear');
    /**
     * The motion options.
     * @group Props
     */
    motionOptions = input<MotionOptions | undefined>(undefined);

    computedMotionOptions = computed<MotionOptions>(() => ({
        ...this.ptm('motion'),
        ...this.motionOptions()
    }));
    /**
     * Button Props
     */
    buttonProps = input<ButtonProps>();
    /**
     * Menu Button Props
     */
    menuButtonProps = input<MenuButtonProps>();
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    autofocus = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * When present, it specifies that the element should be disabled.
     * @group Props
     */
    disabled = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * When present, it specifies that the menu button element should be disabled.
     * @group Props
     */
    menuButtonDisabled = input(false, { transform: booleanAttribute });
    /**
     * When present, it specifies that the button element should be disabled.
     * @group Props
     */
    buttonDisabled = input(false, { transform: booleanAttribute });

    /**
     * `disabled`, when explicitly set, overrides the per-button disabled flags.
     */
    $buttonDisabled = computed(() => this.disabled() ?? this.buttonDisabled());

    $menuButtonDisabled = computed(() => this.disabled() ?? this.menuButtonDisabled());
    /**
     * Callback to invoke when default command button is clicked.
     * @param {MouseEvent} event - Mouse event.
     * @group Emits
     */
    onClick = output<MouseEvent>();
    /**
     * Callback to invoke when overlay menu is hidden.
     * @group Emits
     */
    onMenuHide = output<any>();
    /**
     * Callback to invoke when overlay menu is shown.
     * @group Emits
     */
    onMenuShow = output<any>();
    /**
     * Callback to invoke when dropdown button is clicked.
     * @param {MouseEvent} event - Mouse event.
     * @group Emits
     */
    onDropdownClick = output<MouseEvent | undefined>();

    readonly buttonViewChild = viewChild<ElementRef>('defaultbtn');

    readonly menu = viewChild<TieredMenu>('menu');
    /**
     * Custom content template.
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: TemplateRef<void> | undefined;
    /**
     * Custom dropdown icon template.
     * @group Templates
     **/
    readonly dropdownIconTemplate = contentChild<TemplateRef<void>>('dropdownicon', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    ariaId: string | undefined;

    isExpanded = signal<boolean>(false);

    _componentStyle = inject(SplitButtonStyle);

    _contentTemplate: TemplateRef<void> | undefined;

    _dropdownIconTemplate: TemplateRef<void> | undefined;

    $appendTo = computed(() => this.appendTo() || this.config.overlayAppendTo());

    onInit() {
        this.ariaId = uuid('pn_id_');
    }

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this._contentTemplate = item.template;
                    break;

                case 'dropdownicon':
                    this._dropdownIconTemplate = item.template;
                    break;

                default:
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }

    onDefaultButtonClick(event: MouseEvent) {
        this.onClick?.emit(event);
        this.menu()?.hide();
    }

    onDropdownButtonClick(event?: MouseEvent) {
        this.onDropdownClick.emit(event);
        this.menu()?.toggle({ currentTarget: this.el?.nativeElement, relativeAlign: this.$appendTo() == 'self' });
    }

    onDropdownButtonKeydown(event: KeyboardEvent) {
        if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
            this.onDropdownButtonClick();
            event.preventDefault();
        }
    }

    onHide() {
        this.isExpanded.set(false);
        this.onMenuHide.emit(undefined);
    }

    onShow() {
        this.isExpanded.set(true);
        this.onMenuShow.emit(undefined);
    }
}

@NgModule({
    imports: [SplitButton, SharedModule],
    exports: [SplitButton, SharedModule]
})
export class SplitButtonModule {}
