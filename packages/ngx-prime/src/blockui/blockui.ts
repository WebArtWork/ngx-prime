import { CommonModule, isPlatformBrowser } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, effect, ElementRef, inject, InjectionToken, input, NgModule, numberAttribute, TemplateRef, ViewEncapsulation, contentChildren } from '@angular/core';
import { PrimeTemplate, SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import { blockBodyScroll, unblockBodyScroll } from '@wawjs/ngx-prime/dom';
import { BlockUIPassThrough } from '@wawjs/ngx-prime/types/blockui';
import { ZIndexUtils } from '@wawjs/ngx-prime/utils';
import { BlockUiStyle } from './style/blockuistyle';

const BLOCKUI_INSTANCE = new InjectionToken<BlockUI>('BLOCKUI_INSTANCE');

/**
 * BlockUI can either block other components or the whole page.
 * @group Components
 */
@Component({
    selector: 'p-blockUI, p-blockui, p-block-ui',
    standalone: true,
    imports: [CommonModule, SharedModule],
    template: `
        <ng-content></ng-content>
        <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate"></ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BlockUiStyle, { provide: BLOCKUI_INSTANCE, useExisting: BlockUI }, { provide: PARENT_INSTANCE, useExisting: BlockUI }],
    host: {
        '[attr.aria-busy]': '_blocked',
        '[class]': "cn(cx('root'), styleClass())"
    },
    hostDirectives: [Bind]
})
export class BlockUI extends BaseComponent<BlockUIPassThrough> {
    componentName = 'BlockUI';

    $pcBlockUI: BlockUI | undefined = inject(BLOCKUI_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * Name of the local ng-template variable referring to another component.
     * @group Props
     */
    target = input<any>();
    /**
     * Whether to automatically manage layering.
     * @group Props
     */
    autoZIndex = input(true, { transform: booleanAttribute });
    /**
     * Base zIndex value to use in layering.
     * @group Props
     */
    baseZIndex = input(0, { transform: numberAttribute });
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Current blocked state as a boolean.
     * @group Props
     */
    blocked = input(false, { transform: booleanAttribute });
    /**
     * template of the content
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: TemplateRef<any> | undefined;

    _blocked: boolean = false;

    animationEndListener: VoidFunction | null | undefined;

    /** Sibling elements of the mask (inside the blocked target) that were made inert while blocked, so they can be restored on unblock. */
    private _inertedSiblings: HTMLElement[] = [];

    _componentStyle = inject(BlockUiStyle);

    constructor() {
        super();
        effect(() => {
            const val = this.blocked();

            if (this.el && this.el.nativeElement) {
                if (val) {
                    this.block();
                } else if (this._blocked) {
                    // Only unblock if currently blocked
                    this.unblock();
                }
            } else {
                this._blocked = val;
            }
        });
    }

    onAfterViewInit() {
        if (this._blocked) this.block();

        if (this.target() && !this.target().getBlockableElement) {
            throw 'Target of BlockUI must implement BlockableUI interface';
        }
    }

    _contentTemplate: TemplateRef<any> | undefined;

    readonly templates = contentChildren(PrimeTemplate);

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this.contentTemplate = item.template;
                    break;

                default:
                    this.contentTemplate = item.template;
                    break;
            }
        });
    }

    block() {
        if (isPlatformBrowser(this.platformId)) {
            this._blocked = true;
            (this.el as ElementRef).nativeElement.style.display = 'flex';

            if (this.target()) {
                this.target()
                    .getBlockableElement()
                    .appendChild((this.el as ElementRef).nativeElement);
                this.target().getBlockableElement().style.position = 'relative';
            } else {
                this.renderer.appendChild(this.document.body, (this.el as ElementRef).nativeElement);
                blockBodyScroll();
            }

            if (this.autoZIndex()) {
                ZIndexUtils.set('modal', (this.el as ElementRef).nativeElement, this.baseZIndex() + this.config.zIndex.modal);
            }

            this.renderer.addClass(this.el.nativeElement, 'p-overlay-mask');
            this.renderer.addClass(this.el.nativeElement, 'p-overlay-mask-enter-active');

            // The mask visually covers the blocked content, but without this its focusable
            // descendants remain reachable by keyboard/AT (WCAG 2.4.3/1.3.1). Make everything
            // else in the blocked container inert while blocked.
            this.setSiblingsInert();
        }
    }

    unblock() {
        if (isPlatformBrowser(this.platformId) && this.el && this._blocked) {
            this._blocked = false;

            if (!this.animationEndListener) {
                this.animationEndListener = this.renderer.listen(this.el.nativeElement, 'animationend', this.destroyModal.bind(this));
            }

            this.renderer.removeClass(this.el.nativeElement, 'p-overlay-mask-enter-active');
            this.renderer.addClass(this.el.nativeElement, 'p-overlay-mask-leave-active');

            this.clearSiblingsInert();
        }
    }

    private setSiblingsInert(): void {
        const maskEl = (this.el as ElementRef).nativeElement as HTMLElement;
        const container: HTMLElement = this.target() ? this.target().getBlockableElement() : this.document.body;

        this._inertedSiblings = Array.from(container.children).filter((child) => child !== maskEl && !(child as HTMLElement).hasAttribute('inert')) as HTMLElement[];

        this._inertedSiblings.forEach((sibling) => this.renderer.setAttribute(sibling, 'inert', ''));
    }

    private clearSiblingsInert(): void {
        this._inertedSiblings.forEach((sibling) => this.renderer.removeAttribute(sibling, 'inert'));
        this._inertedSiblings = [];
    }

    destroyModal() {
        this._blocked = false;

        if (this.el && isPlatformBrowser(this.platformId)) {
            this.el.nativeElement.style.display = 'none';
            this.renderer.removeClass(this.el.nativeElement, 'p-overlay-mask');
            this.renderer.removeClass(this.el.nativeElement, 'p-overlay-mask-leave-active');
            ZIndexUtils.clear(this.el.nativeElement);

            if (!this.target()) {
                this.document.body.removeChild(this.el.nativeElement);
                unblockBodyScroll();
            }
        }

        this.unbindAnimationEndListener();
        this.cd.markForCheck();
    }

    unbindAnimationEndListener() {
        if (this.animationEndListener && this.el) {
            this.animationEndListener();
            this.animationEndListener = null;
        }
    }

    onDestroy() {
        if (this._blocked) {
            // Skip animation on destroy, just cleanup
            this._blocked = false;

            this.clearSiblingsInert();

            if (this.el && isPlatformBrowser(this.platformId)) {
                ZIndexUtils.clear(this.el.nativeElement);

                if (!this.target()) {
                    unblockBodyScroll();
                }
            }

            this.unbindAnimationEndListener();
        }
    }
}

@NgModule({
    imports: [BlockUI, SharedModule],
    exports: [BlockUI, SharedModule]
})
export class BlockUIModule {}
