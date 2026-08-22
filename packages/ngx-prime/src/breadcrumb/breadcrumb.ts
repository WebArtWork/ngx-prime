import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, inject, InjectionToken, input, NgModule, output, TemplateRef, ViewEncapsulation, contentChild, contentChildren } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { MenuItem, PrimeTemplate, SharedModule } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { BaseComponent, PARENT_INSTANCE } from 'primeng/basecomponent';
import { Bind } from 'primeng/bind';
import { ChevronRightIcon, HomeIcon } from 'primeng/icons';
import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbItemClickEvent, BreadcrumbItemTemplateContext, BreadcrumbPassThrough } from 'primeng/types/breadcrumb';
import { BreadCrumbStyle } from './style/breadcrumbstyle';

const BREADCRUMB_INSTANCE = new InjectionToken<Breadcrumb>('BREADCRUMB_INSTANCE');

/**
 * Breadcrumb provides contextual information about page hierarchy.
 * @group Components
 */
@Component({
    selector: 'p-breadcrumb',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, TooltipModule, ChevronRightIcon, HomeIcon, SharedModule, Bind, Badge],
    template: `
        <nav [pBind]="ptm('root')" [class]="cn(cx('root'), styleClass())" [style]="style()">
            <ol [class]="cx('list')" [pBind]="ptm('list')">
                @if (home() && home()!.visible !== false) {
                    <li [attr.id]="home()!.id" [class]="cn(cx('homeItem'), home()!.styleClass)" [ngStyle]="home()!.style" pTooltip [tooltipOptions]="home()!.tooltipOptions" [pBind]="ptm('homeItem')" [unstyled]="unstyled()">
                        @if (itemTemplate || _itemTemplate) {
                            <ng-template *ngTemplateOutlet="itemTemplate || _itemTemplate; context: { $implicit: home() }"></ng-template>
                        } @else {
                            @if (!home()!.routerLink) {
                                <a
                                    [href]="home()!.url ? home()!.url : null"
                                    [attr.aria-label]="homeAriaLabel()"
                                    [class]="cn(cx('itemLink'), home()!.linkClass)"
                                    [ngStyle]="home()!.linkStyle"
                                    (click)="onClick($event, home()!)"
                                    [target]="home()!.target"
                                    [attr.title]="home()!.title"
                                    [attr.tabindex]="home()!.disabled ? null : home()!.tabindex || '0'"
                                    [attr.data-automationid]="home()!.automationId"
                                    [pBind]="ptm('itemLink')"
                                >
                                    @if (home()!.icon) {
                                        <span [class]="cn(cx('itemIcon'), home()!.icon, home()!.iconClass)" [ngStyle]="home()!.iconStyle" [pBind]="ptm('itemIcon')"></span>
                                    }
                                    @if (!home()!.icon) {
                                        <svg data-p-icon="home" [class]="cx('itemIcon')" [pBind]="ptm('itemIcon')" />
                                    }
                                    @if (home()!.label) {
                                        @if (home()!.escape !== false) {
                                            <span [class]="cn(cx('itemLabel'), home()!.labelClass)" [ngStyle]="home()!.labelStyle" [pBind]="ptm('itemLabel')">{{ home()!.label }}</span>
                                        } @else {
                                            <span [class]="cn(cx('itemLabel'), home()!.labelClass)" [ngStyle]="home()!.labelStyle" [innerHTML]="home()!.label" [pBind]="ptm('itemLabel')"></span>
                                        }
                                    }
                                    @if (home()!.badge) {
                                        <p-badge [styleClass]="home()!.badgeStyleClass" [value]="home()!.badge" [pt]="ptm('pcBadge')" [unstyled]="unstyled()" />
                                    }
                                </a>
                            }
                            @if (home()!.routerLink) {
                                <a
                                    [routerLink]="home()!.routerLink"
                                    routerLinkActive="p-menuitem-link-active"
                                    [attr.aria-label]="homeAriaLabel()"
                                    [queryParams]="home()!.queryParams"
                                    [routerLinkActiveOptions]="home()!.routerLinkActiveOptions || { exact: false }"
                                    [class]="cn(cx('itemLink'), home()!.linkClass)"
                                    [ngStyle]="home()!.linkStyle"
                                    (click)="onClick($event, home()!)"
                                    [target]="home()!.target"
                                    [attr.title]="home()!.title"
                                    [attr.tabindex]="home()!.disabled ? null : home()!.tabindex || '0'"
                                    [attr.data-automationid]="home()!.automationId"
                                    [fragment]="home()!.fragment"
                                    [queryParamsHandling]="home()!.queryParamsHandling"
                                    [preserveFragment]="home()!.preserveFragment"
                                    [skipLocationChange]="home()!.skipLocationChange"
                                    [replaceUrl]="home()!.replaceUrl"
                                    [state]="home()!.state"
                                    [pBind]="ptm('itemLink')"
                                >
                                    @if (home()!.icon) {
                                        <span [class]="cn(cx('itemIcon'), home()!.icon, home()!.iconClass)" [ngStyle]="home()!.iconStyle" [pBind]="ptm('itemIcon')"></span>
                                    }
                                    @if (!home()!.icon) {
                                        <svg data-p-icon="home" [class]="cx('itemIcon')" [pBind]="ptm('itemIcon')" />
                                    }
                                    @if (home()!.label) {
                                        @if (home()!.escape !== false) {
                                            <span [class]="cn(cx('itemLabel'), home()!.labelClass)" [ngStyle]="home()!.labelStyle" [pBind]="ptm('itemLabel')">{{ home()!.label }}</span>
                                        } @else {
                                            <span [class]="cn(cx('itemLabel'), home()!.labelClass)" [ngStyle]="home()!.labelStyle" [innerHTML]="home()!.label" [pBind]="ptm('itemLabel')"></span>
                                        }
                                    }
                                    @if (home()!.badge) {
                                        <p-badge [styleClass]="home()!.badgeStyleClass" [value]="home()!.badge" [pt]="ptm('pcBadge')" [unstyled]="unstyled()" />
                                    }
                                </a>
                            }
                        }
                    </li>
                }
                @if (model() && home()) {
                    <li [class]="cx('separator')" [pBind]="ptm('separator')">
                        @if (!separatorTemplate() && !_separatorTemplate) {
                            <svg data-p-icon="chevron-right" [pBind]="ptm('separatorIcon')" />
                        }
                        <ng-template *ngTemplateOutlet="separatorTemplate() || _separatorTemplate"></ng-template>
                    </li>
                }
                @for (menuitem of model(); track menuitem; let end = $last; let i = $index) {
                    @if (menuitem.visible !== false) {
                        <li
                            [class]="cn(cx('item', { menuitem }), menuitem.styleClass)"
                            [attr.id]="menuitem.id"
                            [style]="menuitem.style"
                            pTooltip
                            [tooltipOptions]="menuitem.tooltipOptions"
                            [pBind]="getPTOptions(menuitem, i, 'item')"
                            [pTooltipUnstyled]="unstyled()"
                        >
                            @if (itemTemplate || _itemTemplate) {
                                <ng-template *ngTemplateOutlet="itemTemplate || _itemTemplate; context: { $implicit: menuitem }"></ng-template>
                            } @else {
                                @if (!menuitem?.routerLink) {
                                    <a
                                        [attr.href]="menuitem?.url ? menuitem?.url : null"
                                        [class]="cn(cx('itemLink'), menuitem?.linkClass)"
                                        [ngStyle]="menuitem?.linkStyle"
                                        (click)="onClick($event, menuitem)"
                                        [target]="menuitem?.target"
                                        [attr.title]="menuitem?.title"
                                        [attr.tabindex]="menuitem?.disabled ? null : menuitem?.tabindex || '0'"
                                        [attr.data-automationid]="menuitem?.automationId"
                                        [pBind]="getPTOptions(menuitem, i, 'itemLink')"
                                    >
                                        @if (!itemTemplate && !_itemTemplate) {
                                            @if (menuitem?.icon) {
                                                <span [class]="cn(cx('itemIcon'), menuitem?.icon, menuitem?.iconClass)" [ngStyle]="menuitem?.iconStyle" [pBind]="getPTOptions(menuitem, i, 'itemIcon')"></span>
                                            }
                                            @if (menuitem?.label) {
                                                @if (menuitem?.escape !== false) {
                                                    <span [class]="cn(cx('itemLabel'), menuitem?.labelClass)" [ngStyle]="menuitem?.labelStyle" [pBind]="getPTOptions(menuitem, i, 'itemLabel')">{{ menuitem?.label }}</span>
                                                } @else {
                                                    <span [class]="cn(cx('itemLabel'), menuitem?.labelClass)" [ngStyle]="menuitem?.labelStyle" [innerHTML]="menuitem?.label" [pBind]="getPTOptions(menuitem, i, 'itemLabel')"></span>
                                                }
                                            }
                                            @if (menuitem?.badge) {
                                                <p-badge [styleClass]="menuitem?.badgeStyleClass" [value]="menuitem?.badge" [pt]="getPTOptions(menuitem, i, 'pcBadge')" [unstyled]="unstyled()" />
                                            }
                                        }
                                    </a>
                                }
                                @if (menuitem?.routerLink) {
                                    <a
                                        [routerLink]="menuitem?.routerLink"
                                        routerLinkActive="p-menuitem-link-active"
                                        [queryParams]="menuitem?.queryParams"
                                        [routerLinkActiveOptions]="menuitem?.routerLinkActiveOptions || { exact: false }"
                                        [class]="cn(cx('itemLink'), menuitem?.linkClass)"
                                        [ngStyle]="menuitem?.linkStyle"
                                        (click)="onClick($event, menuitem)"
                                        [target]="menuitem?.target"
                                        [attr.title]="menuitem?.title"
                                        [attr.tabindex]="menuitem?.disabled ? null : menuitem?.tabindex || '0'"
                                        [attr.data-automationid]="menuitem?.automationId"
                                        [fragment]="menuitem?.fragment"
                                        [queryParamsHandling]="menuitem?.queryParamsHandling"
                                        [preserveFragment]="menuitem?.preserveFragment"
                                        [skipLocationChange]="menuitem?.skipLocationChange"
                                        [replaceUrl]="menuitem?.replaceUrl"
                                        [state]="menuitem?.state"
                                        [pBind]="getPTOptions(menuitem, i, 'itemLink')"
                                    >
                                        @if (menuitem?.icon) {
                                            <span [class]="cn(cx('itemIcon'), menuitem?.icon, menuitem?.iconClass)" [ngStyle]="menuitem?.iconStyle" [pBind]="getPTOptions(menuitem, i, 'itemIcon')"></span>
                                        }
                                        @if (menuitem?.label) {
                                            @if (menuitem?.escape !== false) {
                                                <span [class]="cn(cx('itemLabel'), menuitem?.labelClass)" [ngStyle]="menuitem?.labelStyle" [pBind]="getPTOptions(menuitem, i, 'itemLabel')">{{ menuitem?.label }}</span>
                                            } @else {
                                                <span [class]="cn(cx('itemLabel'), menuitem?.labelClass)" [ngStyle]="menuitem?.labelStyle" [innerHTML]="menuitem?.label" [pBind]="getPTOptions(menuitem, i, 'itemLabel')"></span>
                                            }
                                        }
                                        @if (menuitem?.badge) {
                                            <p-badge [styleClass]="menuitem?.badgeStyleClass" [value]="menuitem?.badge" [pt]="getPTOptions(menuitem, i, 'pcBadge')" [unstyled]="unstyled()" />
                                        }
                                    </a>
                                }
                            }
                        </li>
                    }
                    @if (!end && menuitem.visible !== false) {
                        <li [class]="cx('separator')" [pBind]="ptm('separator')">
                            @if (!separatorTemplate() && !_separatorTemplate) {
                                <svg data-p-icon="chevron-right" [pBind]="ptm('separatorIcon')" />
                            }
                            <ng-template *ngTemplateOutlet="separatorTemplate() || _separatorTemplate"></ng-template>
                        </li>
                    }
                }
            </ol>
        </nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [BreadCrumbStyle, { provide: BREADCRUMB_INSTANCE, useExisting: Breadcrumb }, { provide: PARENT_INSTANCE, useExisting: Breadcrumb }],
    hostDirectives: [Bind]
})
export class Breadcrumb extends BaseComponent<BreadcrumbPassThrough> {
    componentName = 'Breadcrumb';

    bindDirectiveInstance = inject(Bind, { self: true });
    /**
     * An array of menuitems.
     * @group Props
     */
    model = input<MenuItem[]>();
    /**
     * Inline style of the component.
     * @group Props
     */
    style = input<{ [klass: string]: any } | null>();
    /**
     * Style class of the component.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * MenuItem configuration for the home icon.
     * @group Props
     */
    home = input<MenuItem>();
    /**
     * Defines a string that labels the home icon for accessibility.
     * @group Props
     */
    homeAriaLabel = input<string>();
    /**
     * Fired when an item is selected.
     * @param {BreadcrumbItemClickEvent} event - custom click event.
     * @group Emits
     */
    onItemClick = output<BreadcrumbItemClickEvent>();

    _componentStyle = inject(BreadCrumbStyle);

    router = inject(Router);

    onClick(event: MouseEvent, item: MenuItem) {
        if (item.disabled) {
            event.preventDefault();

            return;
        }

        if (!item.url && !item.routerLink) {
            event.preventDefault();
        }

        if (item.command) {
            item.command({
                originalEvent: event,
                item: item
            });
        }

        this.onItemClick.emit({
            originalEvent: event,
            item: item
        });
    }

    /**
     * Custom item template.
     * @group Templates
     */
    @ContentChild('item') itemTemplate: TemplateRef<BreadcrumbItemTemplateContext> | undefined;

    /**
     * Custom separator template.
     * @group Templates
     */
    readonly separatorTemplate = contentChild<TemplateRef<void>>('separator');

    readonly templates = contentChildren(PrimeTemplate);

    _separatorTemplate: TemplateRef<void> | undefined;

    _itemTemplate: TemplateRef<BreadcrumbItemTemplateContext> | undefined;

    onAfterContentInit() {
        this.templates()?.forEach((item) => {
            switch (item.getType()) {
                case 'separator':
                    this._separatorTemplate = item.template;
                    break;

                case 'item':
                    this._itemTemplate = item.template;
                    break;

                default:
                    this._itemTemplate = item.template;
                    break;
            }
        });
    }

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    getPTOptions(item: MenuItem, index: number, key: string) {
        return this.ptm(key, {
            context: {
                item,
                index
            }
        });
    }
}

@NgModule({
    imports: [Breadcrumb, SharedModule],
    exports: [Breadcrumb, SharedModule]
})
export class BreadcrumbModule {}
