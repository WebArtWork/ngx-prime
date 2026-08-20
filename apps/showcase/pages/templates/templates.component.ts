import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Bind } from '../../../../packages/primeng/src/bind/bind';
import { ButtonDirective, ButtonLabel } from '../../../../packages/primeng/src/button/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-templates',
    templateUrl: './templates.component.html',
    imports: [Bind, ButtonDirective, ButtonLabel, RouterLink]
})
export class TemplatesComponent {
    private titleService = inject(Title);
    private metaService = inject(Meta);

    constructor() {
        this.titleService.setTitle('Angular Application Templates - PrimeNG');
        this.metaService.updateTag({ name: 'description', content: 'PrimeNG Angular application templates.' });
    }
}
