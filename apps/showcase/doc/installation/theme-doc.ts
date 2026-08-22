import { Code } from '@/domain/code';
import { Component } from '@angular/core';

@Component({
    selector: 'app-theme-doc',
    template: `
        <app-docsectiontext>
            <p>Configure ngx-prime to use a theme like Aura.</p>
            <app-code [code]="code" [hideToggleCode]="true"></app-code>
        </app-docsectiontext>
    `
})
export class ThemeDoc {
    code: Code = {
        typescript: `import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providengx-prime } from 'ngx-prime/config';
import Aura from '@wawjs/css-prime-themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        providengx-prime({
            theme: Aura
        })
    ]
};`
    };
}
