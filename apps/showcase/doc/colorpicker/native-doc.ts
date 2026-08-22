import { AppCode } from '@/components/doc/app.code';
import { AppDocSectionText } from '@/components/doc/app.docsectiontext';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerClearDirective, ColorPickerDirective } from 'primeng/colorpicker';

@Component({
    standalone: true,
    imports: [AppCode, AppDocSectionText, FormsModule, ColorPickerDirective, ColorPickerClearDirective],
    template: `<app-docsectiontext
            ><p>Use <i>pColorPicker</i> with a native color input. Values are normalized to uppercase hex; picker UI is browser controlled.</p></app-docsectiontext
        >
        <div class="card flex gap-2"><input type="color" pColorPicker #picker="pColorPicker" [(ngModel)]="color" aria-label="Theme color" /><button [pColorPickerClear]="picker">Reset</button></div>
        <app-code></app-code>`
})
export class NativeDoc {
    color = '#0EA5E9';
}
