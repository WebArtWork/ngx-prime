import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'ngx-prime/progressspinner';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [ProgressSpinnerModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>An infinite spin animation is displayed by default.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-progress-spinner ariaLabel="loading" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc {}
