import { Component, OnInit } from '@angular/core';
import { MenuItem } from '@wawjs/ngx-prime/api';
import { MenuModule } from '@wawjs/ngx-prime/menu';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-basic-doc',
    standalone: true,
    imports: [MenuModule, AppCodeModule, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Menu requires a collection of menuitems as its <i>model</i>.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-menu [model]="items" />
        </div>
        <app-code></app-code>
    `
})
export class BasicDoc implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            { label: 'New', icon: 'pi pi-plus' },
            { label: 'Search', icon: 'pi pi-search' }
        ];
    }
}
