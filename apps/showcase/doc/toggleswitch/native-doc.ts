import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchDirective } from '@wawjs/ngx-prime/toggleswitch';

@Component({
    selector: 'app-toggleswitch-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FormsModule, ToggleSwitchDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pToggleSwitch</i> on a native checkbox instead of the deprecated <i>p-toggleswitch</i> component. The element keeps native form and keyboard behavior while exposing switch semantics to assistive technology.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <div class="flex items-center gap-2">
                <input id="native-toggle" type="checkbox" pToggleSwitch [(ngModel)]="enabled" />
                <label for="native-toggle">Enable notifications</label>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    enabled = false;
}
