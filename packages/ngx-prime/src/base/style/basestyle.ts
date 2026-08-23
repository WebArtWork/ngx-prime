import { inject, Service } from '@angular/core';
import { css as Css, dt, Theme } from '@wawjs/css-prime-styled';
import { style as base_style } from '@wawjs/css-prime-styles/base';
import { minifyCSS, resolve } from '@wawjs/css-prime-utils';
import { UseStyle } from '@wawjs/ngx-prime/usestyle';

const css = /*css*/ `
.p-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.p-hidden-accessible input,
.p-hidden-accessible select {
    transform: scale(0);
}

.p-overflow-hidden {
    overflow: hidden;
    padding-right: dt('scrollbar.width');
}
`;

@Service()
export class BaseStyle {
    name = 'base';

    useStyle: UseStyle = inject(UseStyle);

    css: string | undefined = undefined;

    style: any = undefined;

    classes = {};

    inlineStyles = {};

    load = (style, options = {}, transform = (cs) => cs) => {
        const computedStyle = transform(Css`${resolve(style, { dt })}`);

        return computedStyle ? this.useStyle.use(minifyCSS(computedStyle), { name: this.name, ...options }) : {};
    };

    loadCSS = (options = {}) => this.load(this.css, options);

    loadStyle = (options: any = {}, style: string = '') => this.load(this.style, options, (computedStyle = '') => Theme.transformCSS(options.name || this.name, `${computedStyle}${Css`${style}`}`));

    loadBaseCSS = (options = {}) => this.load(css, options);

    loadBaseStyle = (options: any = {}, style: string = '') => this.load(base_style, options, (computedStyle = '') => Theme.transformCSS(options.name || this.name, `${computedStyle}${Css`${style}`}`));

    getCommonTheme = (params?) => Theme.getCommon(this.name, params);

    getComponentTheme = (params) => Theme.getComponent(this.name, params);

    getPresetTheme = (preset, selector, params) => Theme.getCustomPreset(this.name, preset, selector, params);

    getLayerOrderThemeCSS = () => Theme.getLayerOrderCSS(this.name);

    getStyleSheet = (extendedCSS = '', props = {}) => {
        if (this.css) {
            const _css = resolve(this.css, { dt });
            const _style = minifyCSS(Css`${_css}${extendedCSS}`);
            const _props = Object.entries(props)
                .reduce<any>((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, [])
                .join(' ');

            return `<style type="text/css" data-ngx-prime-style-id="${this.name}" ${_props}>${_style}</style>`;
        }

        return '';
    };

    getCommonThemeStyleSheet = (params, props = {}) => Theme.getCommonStyleSheet(this.name, params, props);

    getThemeStyleSheet = (params, props = {}) => {
        let css = [Theme.getStyleSheet(this.name, params, props)];

        if (this.style) {
            const name = this.name === 'base' ? 'global-style' : `${this.name}-style`;
            const _css = Css`${resolve(this.style, { dt })}`;
            const _style = minifyCSS(Theme.transformCSS(name, _css as string));
            const _props = Object.entries(props)
                .reduce<any>((acc, [k, v]) => acc.push(`${k}="${v}"`) && acc, [])
                .join(' ');

            css.push(`<style type="text/css" data-ngx-prime-style-id="${name}" ${_props}>${_style}</style>`);
        }

        return css.join('');
    };
}
