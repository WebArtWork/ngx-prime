import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export interface TemplateConfig {
    /** Slug of the template this app was built from, e.g. `'sakai'`. */
    slug?: string;
}

export const TEMPLATE_CONFIG = new InjectionToken<TemplateConfig>('TEMPLATE_CONFIG');

/**
 * Declares which template (by slug) this app was built from. Consumed by
 * `@wawjs/ngx-prime/buylicense`'s `BuyLicense` button to link out to that
 * template's purchase page — nothing renders until a slug is provided.
 */
export function provideTemplate(config: TemplateConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: TEMPLATE_CONFIG, useValue: config }]);
}
