import { AppDocPtViewer, getPTOptions } from '@/components/doc/app.docptviewer';

import { Component } from '@angular/core';
import { BlockUIModule } from 'ngx-prime/blockui';
import { ButtonModule } from 'ngx-prime/button';
import { PanelModule } from 'ngx-prime/panel';

@Component({
    selector: 'app-blockui-pt-viewer',
    standalone: true,
    imports: [AppDocPtViewer, BlockUIModule, ButtonModule, PanelModule],
    template: `
        <app-docptviewer [docs]="docs">
            <div class="flex flex-col gap-4">
                <div class="flex gap-2">
                    <p-button label="Block" (click)="blocked = true"></p-button>
                    <p-button label="Unblock" (click)="blocked = false"></p-button>
                </div>
                <p-blockui [target]="pnl" [blocked]="blocked"></p-blockui>
                <p-panel #pnl header="Header">
                    <p class="m-0">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                </p-panel>
            </div>
        </app-docptviewer>
    `
})
export class PTViewer {
    blocked: boolean = false;

    docs = [
        {
            data: getPTOptions('BlockUI'),
            key: 'BlockUI'
        }
    ];
}
