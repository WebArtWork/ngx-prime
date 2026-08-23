import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@wawjs/ngx-prime/button';
import { DialogModule } from '@wawjs/ngx-prime/dialog';
import { InputTextModule } from '@wawjs/ngx-prime/inputtext';

@Component({
    selector: 'app-dialog-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, DialogModule, ButtonModule, InputTextModule, FormsModule],
    template: `
        <app-docptviewer [docs]="docs">
            <p-dialog [(visible)]="visible" header="Edit Profile" [maximizable]="true" maskStyleClass="!relative" [draggable]="false" class="!my-auto w-full">
                <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your information.</span>
                <div class="flex items-center gap-4 mb-4">
                    <label for="username" class="font-semibold w-24">Username</label>
                    <input pInputText id="username" class="flex-auto" autocomplete="off" />
                </div>
                <div class="flex items-center gap-4 mb-8">
                    <label for="email" class="font-semibold w-24">Email</label>
                    <input pInputText id="email" class="flex-auto" autocomplete="off" />
                </div>
                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button type="button" label="Cancel" severity="secondary"></p-button>
                        <p-button type="button" label="Save"></p-button>
                    </div>
                </ng-template>
            </p-dialog>
        </app-docptviewer>
    `
})
export class PTViewer {
    visible: boolean = true;

    docs = [
        {
            data: getPTOptions('Dialog'),
            key: 'Dialog'
        }
    ];
}
