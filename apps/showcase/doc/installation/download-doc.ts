import { Code } from '@/domain/code';
import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';

@Component({
    selector: 'app-download-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode],
    template: `
        <app-docsectiontext>
            <p>PrimeNG is available for download on the <a href="https://www.npmjs.com/package/primeng">npm registry</a>.</p>
        </app-docsectiontext>
        <app-code [code]="code" [hideToggleCode]="true"></app-code>
    `
})
export class DownloadDoc {
    code: Code = {
        command: `# Using npm
npm install primeng @wawjs/css-prime-themes

# Using yarn
yarn add primeng @wawjs/css-prime-themes

# Using pnpm
pnpm add primeng @wawjs/css-prime-themes`
    };
}
