import { Injectable } from '@angular/core';
import { style } from '@wawjs/css-prime-styles/link';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const classes = {
    root: ({ instance }) => [
        'p-link p-component',
        {
            'p-disabled': instance.disabled()
        }
    ],
    icon: ({ instance }) => [
        'p-link-icon',
        {
            'p-link-icon-right': instance.iconPos() === 'right'
        }
    ]
};

@Injectable()
export class LinkStyle extends BaseStyle {
    name = 'link';

    style = style;

    classes = classes;
}

/**
 *
 * Link renders a semantic, styled anchor for display-only navigation.
 *
 * [Live Demo](https://ngx-prime.org/link)
 *
 * @module linkstyle
 *
 */
export enum LinkClasses {
    /**
     * Class name of the root element
     */
    root = 'p-link',
    /**
     * Class name of the icon element
     */
    icon = 'p-link-icon'
}
