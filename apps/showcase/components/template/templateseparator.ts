import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { DividerModule } from 'ngx-prime/divider';

@Component({
    selector: 'app-template-separator',
    standalone: true,
    imports: [DividerModule],
    template: `
        <div class="flex items-center w-full gap-6">
            <p-divider class="flex-1" />
            <div class="w-12 h-12 overflow-hidden flex items-center justify-center border border-surface rounded-full bg-surface-0 dark:bg-surface-900">
                <ng-content></ng-content>
            </div>
            <p-divider class="flex-1" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TemplateSeparator {}
