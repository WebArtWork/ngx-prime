import { ChangeDetectionStrategy, Component, inject, InjectionToken, input, NgModule, ViewEncapsulation } from '@angular/core';
import { SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import { SkeletonPassThrough } from '@wawjs/ngx-prime/types/skeleton';
import { SkeletonStyle } from './style/skeletonstyle';

const SKELETON_INSTANCE = new InjectionToken<Skeleton>('SKELETON_INSTANCE');

/**
 * Skeleton is a placeholder to display instead of the actual content.
 * @group Components
 */
@Component({
    selector: 'p-skeleton',
    standalone: true,
    imports: [SharedModule],
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [SkeletonStyle, { provide: SKELETON_INSTANCE, useExisting: Skeleton }, { provide: PARENT_INSTANCE, useExisting: Skeleton }],
    host: {
        '[attr.aria-hidden]': 'true',
        '[class]': "cn(cx('root'), styleClass())",
        '[style]': 'containerStyle',
        '[attr.data-p]': 'dataP'
    },
    hostDirectives: [Bind]
})
export class Skeleton extends BaseComponent<SkeletonPassThrough> {
    componentName = 'Skeleton';
    $pcSkeleton: Skeleton | undefined = inject(SKELETON_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Shape of the element.
     * @group Props
     */
    shape = input('rectangle');
    /**
     * Type of the animation.
     * @gruop Props
     */
    animation = input('wave');
    /**
     * Border radius of the element, defaults to value from theme.
     * @group Props
     */
    borderRadius = input<string>();
    /**
     * Size of the skeleton.
     * @group Props
     */
    size = input<string>();
    /**
     * Width of the element.
     * @group Props
     */
    width = input('100%');
    /**
     * Height of the element.
     * @group Props
     */
    height = input('1rem');

    _componentStyle = inject(SkeletonStyle);

    get containerStyle() {
        const inlineStyles = this._componentStyle?.inlineStyles['root'];
        let style;

        if (!this.$unstyled()) {
            if (this.size()) style = { ...inlineStyles, width: this.size(), height: this.size(), borderRadius: this.borderRadius() };
            else style = { ...inlineStyles, width: this.width(), height: this.height(), borderRadius: this.borderRadius() };
        }

        return style;
    }

    get dataP() {
        return this.cn({
            [this.shape()]: this.shape()
        });
    }
}

@NgModule({
    imports: [Skeleton, SharedModule],
    exports: [Skeleton, SharedModule]
})
export class SkeletonModule {}
