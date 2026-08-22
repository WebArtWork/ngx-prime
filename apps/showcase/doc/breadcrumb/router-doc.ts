import { Component } from '@angular/core';
import { MenuItem } from 'ngx-prime/api';
import { BreadcrumbModule } from 'ngx-prime/breadcrumb';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-router-doc',
    standalone: true,
    imports: [BreadcrumbModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Menu items support navigation via routerLink, programmatic routing using commands, or external URLs.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-breadcrumb [home]="home" [model]="items" />
        </div>
        <app-code></app-code>
    `
})
export class RouterDoc {
    items: MenuItem[] = [{ label: 'Components' }, { label: 'Form' }, { label: 'InputText', routerLink: '/inputtext' }];

    home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
}
