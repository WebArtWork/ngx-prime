import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { MessageService } from '@wawjs/ngx-prime/api';
import { ProgressBarModule } from '@wawjs/ngx-prime/progressbar';
import { ToastModule } from '@wawjs/ngx-prime/toast';
import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';

@Component({
    selector: 'app-dynamic-doc',
    standalone: true,
    imports: [ProgressBarModule, ToastModule, AppCode, AppDocSectionText],
    providers: [MessageService],
    template: `
        <app-docsectiontext>
            <p>Value is reactive so updating it dynamically changes the bar as well.</p>
        </app-docsectiontext>
        <div class="card">
            <p-toast />
            <p-progressbar [value]="value" />
        </div>
        <app-code></app-code>
    `
})
export class DynamicDoc implements OnInit, OnDestroy {
    private messageService = inject(MessageService);
    private cd = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);

    value: number = 0;

    interval: any;

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.interval = setInterval(() => {
                this.ngZone.run(() => {
                    this.value = this.value + Math.floor(Math.random() * 10) + 1;

                    if (this.value >= 100) {
                        this.value = 100;
                        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Process Completed' });
                        clearInterval(this.interval);
                    }

                    this.cd.markForCheck();
                });
            }, 2000);
        });
    }

    ngOnDestroy() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
