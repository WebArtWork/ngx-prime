import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, InjectionToken, input, NgModule, numberAttribute, signal, TemplateRef, ViewEncapsulation, contentChild, contentChildren } from '@angular/core';
import { MotionEvent, MotionOptions } from '@wawjs/css-prime-motion';
import { getWindowScrollTop } from '@wawjs/css-prime-utils';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { Button, ButtonProps } from 'primeng/button';
import { ChevronUpIcon } from 'primeng/icons';
import { MotionDirective } from 'primeng/motion';
import { ScrollTopIconTemplateContext, ScrollTopPassThrough } from 'primeng/types/scrolltop';
import { ZIndexUtils } from 'primeng/utils';
import { ScrollTopStyle } from './style/scrolltopstyle';

const SCROLLTOP_INSTANCE = new InjectionToken<ScrollTop>('SCROLLTOP_INSTANCE');

/**
 * ScrollTop gets displayed after a certain scroll position and used to navigates to the top of the page quickly.
 * @group Components
 */
@Component({
    selector: 'p-scrollTop, p-scrolltop, p-scroll-top',
    standalone: true,
    imports: [CommonModule, ChevronUpIcon, Button, SharedModule, MotionDirective],
    template: `
        @if (render()) {
            <p-button
                [pMotion]="visible()"
                [pMotionAppear]="true"
                [pMotionName]="'p-scrolltop'"
                [pMotionOptions]="computedMotionOptions()"
                (pMotionOnBeforeEnter)="onBeforeEnter($event)"
                (pMotionOnBeforeLeave)="onBeforeLeave()"
                (pMotionOnAfterLeave)="onAfterLeave()"
                [attr.aria-label]="buttonAriaLabel()"
                (click)="onClick()"
                [pt]="ptm('pcButton')"
                [styleClass]="cn(cx('root'), styleClass())"
                [ngStyle]="style()"
                type="button"
                [buttonProps]="buttonProps()"
                [unstyled]="unstyled()"
            >
                <ng-template #icon>
                    @if (!iconTemplate() && !_iconTemplate) {
                        @if (_icon) {
                            <span [class]="cn(cx('icon'), _icon)"></span>
                        }
                        @if (!_icon) {
                            <svg data-p-icon="chevron-up" [class]="cx('icon')" />
                        }
                    }
                    @if (!icon()) {
                        <ng-template *ngTemplateOutlet="iconTemplate() || _iconTemplate; context: { styleClass: cx('icon') }"></ng-template>
                    }
                </ng-template>
            </p-button>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ScrollTopStyle, { provide: SCROLLTOP_INSTANCE, useExisting: ScrollTop }, { provide: PARENT_INSTANCE, useExisting: ScrollTop }],
    hostDirectives: [Bind]
})
export class ScrollTop extends BaseComponent<ScrollTopPassThrough> {
    componentName = 'ScrollTop';

    $pcScrollTop: ScrollTop | undefined = inject(SCROLLTOP_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Class of the element.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Inline style of the element.
     * @group Props
     */
    style = input<{ [klass: string]: any } | null>();
    /**
     * Target of the ScrollTop.
     * @group Props
     */
    target = input<'window' | 'parent'>('window');
    /**
     * Defines the threshold value of the vertical scroll position of the target to toggle the visibility.
     * @group Props
     */
    threshold = input(400, { transform: numberAttribute });
    /**
     * Name of the icon or JSX.Element for icon.
     * @group Props
     */
    icon = input<string>();
    /**
     * Defines the scrolling behavior, "smooth" adds an animation and "auto" scrolls with a jump.
     * @group Props
     */
    behavior = input<'auto' | 'smooth'>('smooth');
    /**
     * A string value used to determine the display transition options.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    showTransitionOptions = input('.15s');
    /**
     * A string value used to determine the hiding transition options.
     * @group Props
     * @deprecated since v21.0.0. Use `motionOptions` instead.
     */
    hideTransitionOptions = input('.15s');
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
     * Establishes a string value that labels the scroll-top button.
     * @group Props
     */
    buttonAriaLabel = input<string>();
    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    buttonProps = input<ButtonProps>({ rounded: true });
    /**
     * Custom icon template.
     * @param {ScrollTopIconTemplateContext} context - icon context.
     * @see {@link ScrollTopIconTemplateContext}
     * @group Templates
     */
    readonly iconTemplate = contentChild<TemplateRef<ScrollTopIconTemplateContext>>('icon', { descendants: false });

    readonly templates = contentChildren(PrimeTemplate);

    _iconTemplate: TemplateRef<ScrollTopIconTemplateContext> | undefined;

    _icon: string | undefined;

    constructor() {
        super();
        effect(() => {
            this._icon = this.icon();
        });
    }

    documentScrollListener: VoidFunction | null | undefined;

    parentScrollListener: VoidFunction | null | undefined;

    visible = signal<boolean>(false);

    render = signal<boolean>(false);

    overlay: any;

    _componentStyle = inject(ScrollTopStyle);

    onInit() {
        if (this.target() === 'window') this.bindDocumentScrollListener();
        else if (this.target() === 'parent') this.bindParentScrollListener();
    }

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'icon':
                    this._iconTemplate = item.template;
                    break;
            }
        });
    }

    onClick() {
        let scrollElement = this.target() === 'window' ? this.document.defaultView : this.el.nativeElement.parentElement;

        scrollElement.scroll({
            top: 0,
            behavior: this.behavior()
        });
    }

    onBeforeEnter(event: MotionEvent) {
        this.overlay = event.element as HTMLElement;
        this.overlay.style.position = this.target() === 'parent' ? 'sticky' : 'fixed';
        ZIndexUtils.set('overlay', this.overlay, this.config.zIndex.overlay);
    }

    onBeforeLeave() {
        ZIndexUtils.clear(this.overlay);
        this.overlay = null;
    }

    onAfterLeave() {
        this.render.set(false);
    }

    checkVisibility(scrollY: number) {
        if (scrollY > this.threshold()) {
            this.visible.set(true);

            if (!this.render()) {
                this.render.set(true);
            }
        } else {
            this.visible.set(false);
        }
    }

    bindParentScrollListener() {
        if (isPlatformBrowser(this.platformId)) {
            this.parentScrollListener = this.renderer.listen(this.el.nativeElement.parentElement, 'scroll', () => {
                this.checkVisibility(this.el.nativeElement.parentElement.scrollTop);
            });
        }
    }

    bindDocumentScrollListener() {
        if (isPlatformBrowser(this.platformId)) {
            this.documentScrollListener = this.renderer.listen(this.document.defaultView, 'scroll', () => {
                this.checkVisibility(getWindowScrollTop());
            });
        }
    }

    unbindParentScrollListener() {
        if (this.parentScrollListener) {
            this.parentScrollListener();
            this.parentScrollListener = null;
        }
    }

    unbindDocumentScrollListener() {
        if (this.documentScrollListener) {
            this.documentScrollListener();
            this.documentScrollListener = null;
        }
    }

    onDestroy() {
        if (this.target() === 'window') this.unbindDocumentScrollListener();
        else if (this.target() === 'parent') this.unbindParentScrollListener();

        if (this.overlay) {
            ZIndexUtils.clear(this.overlay);
            this.overlay = null;
        }
    }
}

@NgModule({
    imports: [ScrollTop, SharedModule],
    exports: [ScrollTop, SharedModule]
})
export class ScrollTopModule {}
