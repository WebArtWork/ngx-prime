import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonDirective } from '@wawjs/ngx-prime/radiobutton';

@Component({
    selector: 'app-radiobutton-native-doc',
    standalone: true,
    imports: [AppCode, AppDocSectionText, FormsModule, RadioButtonDirective],
    template: `
        <app-docsectiontext>
            <p>Use <i>pRadioButton</i> on a native radio input. Native browser grouping, keyboard navigation, labels, and Angular forms remain available.</p>
        </app-docsectiontext>
        <div class="card flex justify-center">
            <div class="flex flex-wrap gap-4">
                @for (option of options; track option) {
                    <div class="flex items-center">
                        <input type="radio" pRadioButton name="native-pizza" [value]="option" [(ngModel)]="ingredient" [id]="'native-' + option" />
                        <label [for]="'native-' + option" class="ml-2">{{ option }}</label>
                    </div>
                }
            </div>
        </div>
        <app-code></app-code>
    `
})
export class NativeDoc {
    options = ['Cheese', 'Mushroom', 'Pepper', 'Onion'];
    ingredient = this.options[0];
}
