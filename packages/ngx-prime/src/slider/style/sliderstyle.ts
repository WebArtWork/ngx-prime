import { Injectable } from '@angular/core';
import { style } from '@wawjs/css-prime-styles/slider';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const nativeStyle = `
input[pRange] { inline-size: 100%; accent-color: dt('primary.color'); cursor: pointer; }
input[pRange]:focus-visible { outline: 2px solid dt('inputtext.focus.border.color'); outline-offset: 3px; }
input[pRange].p-invalid { accent-color: dt('inputtext.invalid.border.color'); }
input[pRange]:disabled { cursor: default; opacity: .6; }
input[pRange][aria-orientation='vertical'] { block-size: 100%; inline-size: auto; writing-mode: vertical-lr; direction: rtl; }
`;

const inlineStyles = {
    handle: { position: 'absolute' },
    range: { position: 'absolute' }
};

const classes = {
    root: ({ instance }) => [
        'p-slider p-component',
        {
            'p-disabled': instance.$disabled(),
            'p-invalid': instance.invalid(),
            'p-slider-horizontal': instance.orientation() === 'horizontal',
            'p-slider-vertical': instance.orientation() === 'vertical',
            'p-slider-animate': instance.animate()
        }
    ],
    range: 'p-slider-range',
    handle: 'p-slider-handle'
};

@Injectable()
export class SliderStyle extends BaseStyle {
    name = 'slider';

    style = `${style}\n${nativeStyle}`;

    classes = classes;

    inlineStyles = inlineStyles;
}

/**
 *
 * Slider is a component to provide input with a drag handle.
 *
 * [Live Demo](https://www.ngx-prime.org/slider/)
 *
 * @module sliderstyle
 *
 */
export enum SliderClasses {
    /**
     * Class name of the root element
     */
    root = 'p-slider',
    /**
     * Class name of the range element
     */
    range = 'p-slider-range',
    /**
     * Class name of the handle element
     */
    handle = 'p-slider-handle'
}
