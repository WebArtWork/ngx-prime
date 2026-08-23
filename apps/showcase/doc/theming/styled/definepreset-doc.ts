import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-definepreset-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>The <i>definePreset</i> utility is used to customize an existing preset during the ngx-prime setup. The first parameter is the preset to customize and the second is the design tokens to override.</p>
        </app-docsectiontext>
        <app-code [code]="code1" [hideToggleCode]="true" class="block mb-4"></app-code>
        <app-code [code]="code2" [hideToggleCode]="true"></app-code>
    `
})
export class DefinePresetDoc {
    code1: Code = {
        typescript: `//mypreset.ts
import { definePreset } from '@wawjs/css-prime-themes';
import Aura from '@wawjs/css-prime-themes/aura';

const MyPreset = definePreset(Aura, {
    //Your customizations, see the following sections for examples
});

export MyPreset;`
    };

    code2: Code = {
        typescript: `import { ApplicationConfig } from '@angular/core';
import { provideNgxPrime } from 'ngx-prime/config';
import MyPreset from './mypreset';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgxPrime({
            theme: {
                preset: MyPreset
            }
        })
    ]
};`
    };
}
