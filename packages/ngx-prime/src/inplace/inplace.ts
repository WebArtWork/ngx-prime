import { booleanAttribute, ChangeDetectionStrategy, Component, inject, InjectionToken, input, model, NgModule, output, TemplateRef, ViewEncapsulation, contentChild, contentChildren } from '@angular/core';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { ButtonModule } from 'primeng/button';
import { TimesIcon } from 'primeng/icons';
import { Ripple } from 'primeng/ripple';
import { InplaceContentTemplateContext, InplacePassThrough } from 'primeng/types/inplace';
import { InplaceStyle } from './style/inplacestyle';

const INPLACE_INSTANCE = new InjectionToken<Inplace>('INPLACE_INSTANCE');

@Component({
    selector: 'p-inplacedisplay, p-inplaceDisplay',
    standalone: true,
    imports: [],
    template: '<ng-content></ng-content>'
})
export class InplaceDisplay extends BaseComponent {}

@Component({
    selector: 'p-inplacecontent, p-inplaceContent',
    standalone: true,
    imports: [],
    template: '<ng-content></ng-content>'
})
export class InplaceContent extends BaseComponent {}
/**
 * Inplace provides an easy to do editing and display at the same time where clicking the output displays the actual content.
 * @group Components
 */
@Component({
    selector: 'p-inplace',
    standalone: true,
    imports: [ButtonModule, TimesIcon, SharedModule, Ripple, Bind],
    template: `
        @if (!active()) {
            <div [class]="cx('display')" [pBind]="ptm('display')" (click)="onActivateClick($event)" tabindex="0" role="button" (keydown)="onKeydown($event)" [attr.data-p-disabled]="disabled()">
                <ng-content select="[pInplaceDisplay]"></ng-content>
                <ng-container *ngTemplateOutlet="displayTemplate() || _displayTemplate"></ng-container>
            </div>
        }
        @if (active()) {
            <div [class]="cx('content')" [pBind]="ptm('content')">
                <ng-content select="[pInplaceContent]"></ng-content>
                <ng-container *ngTemplateOutlet="contentTemplate() || _contentTemplate; context: { closeCallback: onDeactivateClick.bind(this) }"></ng-container>
                @if (closable()) {
                    @if (closeIcon()) {
                        <p-button [pt]="ptm('pcButton')" type="button" [icon]="closeIcon()" pRipple (click)="onDeactivateClick($event)" [attr.aria-label]="closeAriaLabel()"></p-button>
                    }
                    @if (!closeIcon()) {
                        <p-button [pt]="ptm('pcButton')" type="button" pRipple (click)="onDeactivateClick($event)" [attr.aria-label]="closeAriaLabel()">
                            <ng-template #icon>
                                @if (!closeIconTemplate() && !_closeIconTemplate) {
                                    <svg data-p-icon="times" />
                                }
                            </ng-template>
                            <ng-template *ngTemplateOutlet="closeIconTemplate() || _closeIconTemplate"></ng-template>
                        </p-button>
                    }
                }
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [InplaceStyle, { provide: INPLACE_INSTANCE, useExisting: Inplace }, { provide: PARENT_INSTANCE, useExisting: Inplace }],
    host: {
        '[attr.aria-live]': "'polite'",
        '[class]': "cn(cx('root'), styleClass())"
    },
    hostDirectives: [Bind]
})
export class Inplace extends BaseComponent<InplacePassThrough> {
    componentName = 'Inplace';

    $pcInplace: Inplace | undefined = inject(INPLACE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Whether the content is displayed or not.
     * @group Props
     */
    active = model(false);
    /**
     * Displays a button to switch back to display mode.
     * @deprecated since v20.0.0, use `closeCallback` within content template.
     * @group Props
     */
    closable = input(false, { transform: booleanAttribute });
    /**
     * When present, it specifies that the element should be disabled.
     * @group Props
     */
    disabled = input(false, { transform: booleanAttribute });
    /**
     * Allows to prevent clicking.
     * @group Props
     */
    preventClick = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Icon to display in the close button.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    closeIcon = input<string>();
    /**
     * Establishes a string value that labels the close button.
     * @group Props
     */
    closeAriaLabel = input<string>();
    /**
     * Callback to invoke when inplace is opened.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onActivate = output<Event | undefined>();
    /**
     * Callback to invoke when inplace is closed.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onDeactivate = output<Event | undefined>();

    hover!: boolean;
    /**
     * Custom display template.
     * @group Templates
     */
    readonly displayTemplate = contentChild<TemplateRef<void>>('display', { descendants: false });
    /**
     * Custom content template.
     * @group Templates
     */
    readonly contentTemplate = contentChild<TemplateRef<InplaceContentTemplateContext>>('content', { descendants: false });
    /**
     * Custom close icon template.
     * @group Templates
     */
    readonly closeIconTemplate = contentChild<TemplateRef<void>>('closeicon', { descendants: false });

    _componentStyle = inject(InplaceStyle);

    onActivateClick(event: MouseEvent) {
        if (!this.preventClick()) this.activate(event);
    }

    onDeactivateClick(event: MouseEvent) {
        if (!this.preventClick()) this.deactivate(event);
    }
    /**
     * Activates the content.
     * @param {Event} event - Browser event.
     * @group Method
     */
    activate(event?: Event) {
        if (!this.disabled()) {
            this.active.set(true);
            this.onActivate.emit(event);
            this.cd.markForCheck();
        }
    }
    /**
     * Deactivates the content.
     * @param {Event} event - Browser event.
     * @group Method
     */
    deactivate(event?: Event) {
        if (!this.disabled()) {
            this.active.set(false);
            this.hover = false;
            this.onDeactivate.emit(event);
            this.cd.markForCheck();
        }
    }

    onKeydown(event: KeyboardEvent) {
        if (event.code === 'Enter') {
            this.activate(event);
            event.preventDefault();
        }
    }

    readonly templates = contentChildren(PrimeTemplate);

    _displayTemplate: TemplateRef<void> | undefined;

    _closeIconTemplate: TemplateRef<void> | undefined;

    _contentTemplate: TemplateRef<InplaceContentTemplateContext> | undefined;

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'display':
                    this._displayTemplate = item.template;
                    break;

                case 'closeicon':
                    this._closeIconTemplate = item.template;
                    break;

                case 'content':
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }
}

@NgModule({
    imports: [Inplace, InplaceContent, InplaceDisplay, SharedModule],
    exports: [Inplace, InplaceContent, InplaceDisplay, SharedModule]
})
export class InplaceModule {}
