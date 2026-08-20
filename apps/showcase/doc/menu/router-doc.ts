import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AppCodeModule } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-router-doc',
    standalone: true,
    imports: [MenuModule, AppCodeModule, AppDocSectionText],
    template: `
        <app-docsectiontext>
            <p>Menu items support navigation via routerLink, programmatic routing using commands, or external URLs.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-menu [model]="items" />
        </div>
        <app-code></app-code>
    `
})
export class RouterDoc implements OnInit {
    private router = inject(Router);

    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Navigate',
                items: [
                    {
                        label: 'Router Link',
                        icon: 'pi pi-palette',
                        routerLink: '/theming'
                    },
                    {
                        label: 'Programmatic',
                        icon: 'pi pi-link',
                        command: () => {
                            this.router.navigate(['/installation']);
                        }
                    },
                    {
                        label: 'External',
                        icon: 'pi pi-home',
                        url: 'https://angular.io//'
                    }
                ]
            }
        ];
    }
}
