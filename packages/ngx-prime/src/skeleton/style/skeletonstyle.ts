import { Injectable } from '@angular/core';
import { style } from '@wawjs/css-prime-styles/skeleton';
import { BaseStyle } from 'ngx-prime/base';

const inlineStyles = {
    root: { position: 'relative' }
};

const classes = {
    root: ({ instance }) => [
        'p-skeleton p-component',
        {
            'p-skeleton-circle': instance.shape() === 'circle',
            'p-skeleton-animation-none': instance.animation() === 'none'
        }
    ]
};

@Injectable()
export class SkeletonStyle extends BaseStyle {
    name = 'skeleton';

    style = style;

    classes = classes;

    inlineStyles = inlineStyles;
}

/**
 *
 * Skeleton is a placeholder to display instead of the actual content.
 *
 * [Live Demo](https://www.ngx-prime.org/skeleton/)
 *
 * @module skeletonstyle
 *
 */
export enum SkeletonClasses {
    /**
     * Class name of the root element
     */
    root = 'p-skeleton'
}
