import { booleanAttribute, ChangeDetectionStrategy, Component, effect, inject, InjectionToken, input, NgModule, ViewEncapsulation } from '@angular/core';
import { SharedModule } from '@wawjs/ngx-prime/api';
import { BadgeModule } from '@wawjs/ngx-prime/badge';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import { OverlayBadgePassThrough } from '@wawjs/ngx-prime/types/overlaybadge';
import { OverlayBadgeStyle } from './style/overlaybadgestyle';

const OVERLAYBADGE_INSTANCE = new InjectionToken<OverlayBadge>('OVERLAYBADGE_INSTANCE');

/**
 * OverlayPanel is a container component positioned as connected to its target.
 * @group Components
 */
@Component({
    selector: 'p-overlayBadge, p-overlay-badge, p-overlaybadge',
    standalone: true,
    imports: [BadgeModule, SharedModule, Bind],
    template: `
        <div [class]="cx('root')" [pBind]="ptm('root')">
            <ng-content></ng-content>
            <p-badge
                [pt]="ptm('pcBadge')"
                [styleClass]="styleClass()"
                [style]="style()"
                [badgeSize]="badgeSize()"
                [severity]="severity()"
                [value]="value()"
                [badgeDisabled]="badgeDisabled()"
                [attr.aria-label]="ariaLabel()"
                [attr.role]="ariaLabel() ? 'status' : null"
            />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [OverlayBadgeStyle, { provide: OVERLAYBADGE_INSTANCE, useExisting: OverlayBadge }, { provide: PARENT_INSTANCE, useExisting: OverlayBadge }],
    hostDirectives: [Bind]
})
export class OverlayBadge extends BaseComponent<OverlayBadgePassThrough> {
    componentName = 'OverlayBadge';

    $pcOverlayBadge: OverlayBadge | undefined = inject(OVERLAYBADGE_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

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
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     */
    badgeSize = input<'small' | 'large' | 'xlarge' | null>();
    /**
     * Severity type of the badge.
     * @group Props
     */
    severity = input<'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'contrast' | null>();
    /**
     * Value to display inside the badge.
     * @group Props
     */
    value = input<string | number | null>();
    /**
     * When specified, disables the component.
     * @group Props
     */
    badgeDisabled = input(false, { transform: booleanAttribute });
    /**
     * Defines a string that labels the badge value for accessibility (e.g. "5 unread notifications"), since the value is otherwise conveyed visually only.
     * @group Props
     */
    ariaLabel = input<string>();
    /**
     * Size of the badge, valid options are "large" and "xlarge".
     * @group Props
     * @deprecated use badgeSize instead.
     */
    size = input<'large' | 'xlarge' | 'small' | null>();

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptm('host'));
    }

    _componentStyle = inject(OverlayBadgeStyle);

    constructor() {
        super();
        effect(() => {
            const size = this.size();

            !this.badgeSize() && size && console.log('size property is deprecated and will removed in v18, use badgeSize instead.');
        });
    }
}

@NgModule({
    imports: [OverlayBadge, SharedModule],
    exports: [OverlayBadge, SharedModule]
})
export class OverlayBadgeModule {}
