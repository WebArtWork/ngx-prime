import { Injectable } from '@angular/core';
import { style } from '@wawjs/css-prime-styles/blockui';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const classes = {
    root: ({ instance }) => [
        'p-blockui p-blockui-mask',
        {
            'p-blockui-mask-document': !instance.target()
        }
    ]
};

@Injectable()
export class BlockUiStyle extends BaseStyle {
    name = 'blockui';

    style = style;

    classes = classes;
}

/**
 *
 * BlockUI represents people using icons, labels and images.
 *
 * [Live Demo](https://www.ngx-prime.org/blockui)
 *
 * @module blockuistyle
 *
 */
export enum BlockUIClasses {
    /**
     * Class name of the root element
     */
    root = 'p-blockui'
}

export type BlockUIStyle = BaseStyle;
