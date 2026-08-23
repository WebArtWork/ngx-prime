import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';

@Component({
    selector: 'app-provider-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>Add <i>provideNgxPrime</i> to the list of providers in your <i>app.config.ts</i> and use the <i>theme</i> property to configure a theme such as Aura.</p>
            <app-code [code]="code" [hideToggleCode]="true"></app-code>
        </app-docsectiontext>
    `
})
export class ProviderDoc {
    code: Code = {
        typescript: `import { ApplicationConfig } from '@angular/core';
import { provideNgxPrime } from '@wawjs/ngx-prime/config';
import Aura from '@wawjs/css-prime-themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgxPrime({
            theme: {
                preset: Aura
            }
        })
    ]
};`
    };
}
