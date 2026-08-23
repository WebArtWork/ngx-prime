import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { AvatarModule } from '@wawjs/ngx-prime/avatar';
import { AvatarGroupModule } from '@wawjs/ngx-prime/avatargroup';

@Component({
    selector: 'app-avatar-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, AvatarModule, AvatarGroupModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div class="flex flex-wrap gap-8">
                <p-avatargroup>
                    <p-avatar label="P" size="xlarge" shape="circle"></p-avatar>
                    <p-avatar icon="pi pi-user" size="xlarge" shape="circle"></p-avatar>
                    <p-avatar image="https://www.gravatar.com/avatar/05dfd4b41340d09cae045235eb0893c3?d=mp" styleClass="flex items-center justify-center" size="xlarge" shape="circle"></p-avatar>
                </p-avatargroup>
            </div>
        </app-docptviewer>
    `
})
export class PTViewer {
    docs = [
        {
            data: getPTOptions('Avatar'),
            key: 'Avatar'
        },
        {
            data: getPTOptions('AvatarGroup'),
            key: 'AvatarGroup'
        }
    ];
}
