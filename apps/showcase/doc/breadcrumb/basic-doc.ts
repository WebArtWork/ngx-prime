import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'ngx-prime/api';
import { BreadcrumbModule } from 'ngx-prime/breadcrumb';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [BreadcrumbModule, AppCode, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Breadcrumb provides contextual information about page hierarchy.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-breadcrumb [model]="items" [home]="home" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc implements OnInit {
    items: MenuItem[] | undefined;

    home: MenuItem | undefined;

    ngOnInit() {
        this.items = [{ label: 'Electronics' }, { label: 'Computer' }, { label: 'Accessories' }, { label: 'Keyboard' }, { label: 'Wireless' }];

        this.home = { icon: 'pi pi-home' };
    }
}
