import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { SelectButtonDirective, SelectButtonOptionDirective } from 'ngx-prime/selectbutton';

@Component({
    selector: 'app-selectbutton-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, SelectButtonDirective, SelectButtonOptionDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pSelectButton</i> with native <i>button pSelectButtonOption</i> elements. Single-select groups use radio semantics and arrow-key navigation; add <i>multiple</i> for independently pressed toggle buttons.</p>
            <p>Native groups use explicit buttons and their <i>value</i> inputs instead of the deprecated component's <i>options</i> renderer. Compose labels, icons, and custom content directly inside each button.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <div pSelectButton [(value)]="value" aria-label="Trip type">
                <button pSelectButtonOption value="one-way">One-Way</button>
                <button pSelectButtonOption value="return">Return</button>
            </div>
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    value = 'one-way';
}
