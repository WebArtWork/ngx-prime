import { InjectOptions, Injector, ProviderToken } from '@angular/core';

export class DynamicDialogInjector implements Injector {
    constructor(
        private _parentInjector: Injector,
        private _additionalTokens: WeakMap<any, any>
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept to satisfy the `Injector` interface signature.
    get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T {
        const value = this._additionalTokens.get(token);

        if (value) return value;

        return this._parentInjector.get<any>(token, notFoundValue);
    }
}
