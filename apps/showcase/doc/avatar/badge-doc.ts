import { Component } from '@angular/core';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { AppCode } from '@/components/doc/app.code';
import { AvatarModule } from '@wawjs/ngx-prime/avatar';
import { BadgeModule } from '@wawjs/ngx-prime/badge';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-badge-doc',
    standalone: true,
    imports: [AppDocSectionText, AppCode, AvatarModule, BadgeModule, RouterModule],
    template: `
        <app-docsectiontext>
            <p>A <i>badge</i> can be added to an Avatar with the <a href="#" [routerLink]="['/badge']">Badge</a> directive.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <p-avatar image="https://primefaces.org/cdn/ngx-prime/images/demo/avatar/amyelsner.png" pBadge value="4" severity="danger" />
        </div>
        <app-code></app-code>
    `
})
export class BadgeDoc {}
