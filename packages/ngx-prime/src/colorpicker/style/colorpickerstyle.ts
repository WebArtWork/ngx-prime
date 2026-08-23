import { Injectable } from '@angular/core';
import { style } from '@wawjs/css-prime-styles/colorpicker';
import { BaseStyle } from '@wawjs/ngx-prime/base';

const nativeStyle = `
.p-colorpicker-input { inline-size: 2.5rem; block-size: 2.5rem; padding: .125rem; cursor: pointer; border-radius: dt('inputtext.border.radius'); }
.p-colorpicker-input:focus-visible { outline: 2px solid dt('inputtext.focus.border.color'); outline-offset: 2px; }
.p-colorpicker-input.p-invalid { border-color: dt('inputtext.invalid.border.color'); }
.p-colorpicker-input:disabled { cursor: default; opacity: .6; }
.p-colorpicker-clear { cursor: pointer; }
.p-colorpicker-clear:disabled { cursor: default; opacity: .6; }
`;

const classes = {
    root: ({ instance }) => ['p-colorpicker p-component', { 'p-colorpicker-overlay': !instance.inline(), 'p-colorpicker-dragging': instance.colorDragging || instance.hueDragging }],
    preview: ({ instance }) => ['p-colorpicker-preview', { 'p-disabled': instance.$disabled() }],
    panel: ({ instance }) => [
        'p-colorpicker-panel',
        {
            'p-colorpicker-panel-inline': instance.inline(),
            'p-disabled': instance.$disabled()
        }
    ],
    content: 'p-colorpicker-content',
    colorSelector: 'p-colorpicker-color-selector',
    colorBackground: 'p-colorpicker-color-background',
    colorHandle: 'p-colorpicker-color-handle',
    hue: 'p-colorpicker-hue',
    hueHandle: 'p-colorpicker-hue-handle'
};

@Injectable()
export class ColorPickerStyle extends BaseStyle {
    name = 'colorpicker';

    style = `${style}\n${nativeStyle}`;

    classes = classes;
}

/**
 *
 * ColorPicker groups a collection of contents in tabs.
 *
 * [Live Demo](https://www.ngx-prime.org/colorpicker/)
 *
 * @module colorpickerstyle
 *
 */
export enum ColorPickerClasses {
    /**
     * Class name of the root element
     */
    root = 'p-colorpicker',
    /**
     * Class name of the preview element
     */
    preview = 'p-colorpicker-preview',
    /**
     * Class name of the panel element
     */
    panel = 'p-colorpicker-panel',
    /**
     * Class name of the color selector element
     */
    colorSelector = 'p-colorpicker-color-selector',
    /**
     * Class name of the color background element
     */
    colorBackground = 'p-colorpicker-color-background',
    /**
     * Class name of the color handle element
     */
    colorHandle = 'p-colorpicker-color-handle',
    /**
     * Class name of the hue element
     */
    hue = 'p-colorpicker-hue',
    /**
     * Class name of the hue handle element
     */
    hueHandle = 'p-colorpicker-hue-handle'
}
