import { EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { NgxPrime } from './ngx-prime';
import type { NgxPrimeConfigType } from './ngx-prime.types';

export const PRIME_NG_CONFIG = new InjectionToken<NgxPrimeConfigType>('PRIME_NG_CONFIG');

export function provideNgxPrime(...features: NgxPrimeConfigType[]): EnvironmentProviders {
    const providers = features?.map((feature) => ({
        provide: PRIME_NG_CONFIG,
        useValue: feature,
        multi: false
    }));

    const initializer = provideAppInitializer(() => {
        const NgxPrimeConfig = inject(NgxPrime);

        features?.forEach((feature) => NgxPrimeConfig.setConfig(feature));

        return;
    });

    return makeEnvironmentProviders([...providers, initializer]);
}
