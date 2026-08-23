import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { ToggleButtonDirective } from '@wawjs/ngx-prime/togglebutton';

@Component({
    selector: 'app-togglebutton-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, ToggleButtonDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pToggleButton</i> on a native <i>button</i> for new toggle controls. It exposes a two-way <i>pressed</i> model, native keyboard activation, Forms support, and <i>aria-pressed</i>.</p>
            <p>
                The native button defaults to <i>type="button"</i>. Compose labels, icons, and loading content directly from the <i>pressed</i> state; the deprecated <i>p-togglebutton</i> component remains available through v22 for its wrapper
                templates.
            </p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <button pToggleButton [(pressed)]="pressed" aria-label="Pin item">
                {{ pressed ? 'Pinned' : 'Pin' }}
            </button>
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    pressed = false;
}
