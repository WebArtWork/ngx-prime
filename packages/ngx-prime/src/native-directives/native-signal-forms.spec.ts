import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { ColorPickerDirective } from '../colorpicker/nativecolorpicker';
import { DatePickerDirective } from '../datepicker/nativedatepicker';
import { FileUploadDirective } from '../fileupload/nativefileupload';
import { InputMaskDirective } from '../inputmask/inputmask';
import { InputNumberDirective } from '../inputnumber/nativeinputnumber';
import { PasswordDirective } from '../password/password';
import { RatingDirective } from '../rating/nativerating';
import { SelectButtonDirective, SelectButtonOptionDirective } from '../selectbutton/nativeselectbutton';
import { RangeDirective } from '../slider/nativeslider';
import { ToggleButtonDirective } from '../togglebutton/nativetogglebutton';
import { ToggleSwitchDirective } from '../toggleswitch/nativetoggleswitch';

@Component({
    imports: [ToggleSwitchDirective, RangeDirective, InputNumberDirective],
    template: `
        <input type="checkbox" pToggleSwitch [field]="nativeForm.enabled" />
        <input type="range" pRange [field]="nativeForm.level" min="0" max="10" />
        <input type="number" pInputNumber [field]="nativeForm.quantity" />
    `
})
class TestNativeValueControlsComponent {
    model = signal({ enabled: false, level: 2, quantity: 1 });
    nativeForm = form(this.model);
}

@Component({
    imports: [ToggleButtonDirective, SelectButtonDirective, SelectButtonOptionDirective],
    template: `
        <button pToggleButton [field]="nativeForm.pinned">Pin</button>
        <div pSelectButton [field]="nativeForm.choice">
            <button pSelectButtonOption [value]="'one'">One</button>
            <button pSelectButtonOption [value]="'two'">Two</button>
        </div>
    `
})
class TestNativeButtonControlsComponent {
    model = signal({ pinned: false, choice: 'one' });
    nativeForm = form(this.model);
}

@Component({
    imports: [RatingDirective, FileUploadDirective],
    template: `
        <input type="radio" pRating name="rating" [value]="1" [field]="nativeForm.rating" />
        <input type="radio" pRating name="rating" [value]="2" [field]="nativeForm.rating" />
        <input type="file" pFileUpload [field]="nativeForm.files" />
    `
})
class TestNativeRatingAndFileControlsComponent {
    model = signal<{ rating: number; files: FileList | null }>({ rating: 1, files: null });
    nativeForm = form(this.model);
}

@Component({
    imports: [DatePickerDirective, ColorPickerDirective, InputMaskDirective, PasswordDirective],
    template: `
        <input type="date" pDatePicker [field]="nativeForm.date" />
        <input type="color" pColorPicker [field]="nativeForm.color" />
        <input type="text" pInputMask="99-99" [field]="nativeForm.masked" />
        <input type="password" pPassword [field]="nativeForm.password" />
    `
})
class TestNativeTextControlsComponent {
    model = signal({ date: '2026-01-01', color: '#ff0000', masked: '', password: '' });
    nativeForm = form(this.model);
}

describe('Native directives with Signal Forms', () => {
    async function createComponent<T>(component: new () => T): Promise<ComponentFixture<T>> {
        await TestBed.configureTestingModule({
            imports: [component],
            providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        const fixture = TestBed.createComponent(component);

        fixture.detectChanges();

        return fixture;
    }

    it('binds toggle switches, sliders, and number inputs to signal-form fields', async () => {
        const fixture = await createComponent(TestNativeValueControlsComponent);
        const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        inputs[0].click();
        inputs[1].value = '7';
        inputs[1].dispatchEvent(new Event('input'));
        inputs[2].value = '3';
        inputs[2].dispatchEvent(new Event('input'));
        await fixture.whenStable();

        expect(fixture.componentInstance.model()).toEqual({ enabled: true, level: 7, quantity: 3 });
    });

    it('binds toggle and select buttons to signal-form fields', async () => {
        const fixture = await createComponent(TestNativeButtonControlsComponent);
        const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

        buttons[0].click();
        buttons[2].click();
        await fixture.whenStable();

        expect(fixture.componentInstance.model()).toEqual({ pinned: true, choice: 'two' });
    });

    it('binds ratings and selected files to signal-form fields', async () => {
        const fixture = await createComponent(TestNativeRatingAndFileControlsComponent);
        const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);
        Object.defineProperty(inputs[2], 'files', { value: dataTransfer.files });
        inputs[1].click();
        inputs[2].dispatchEvent(new Event('change'));
        await fixture.whenStable();

        expect(fixture.componentInstance.model().rating).toBe(2);
        expect(fixture.componentInstance.model().files?.[0].name).toBe('test.txt');
    });

    it('binds date, color, masked, and password inputs to signal-form fields', async () => {
        const fixture = await createComponent(TestNativeTextControlsComponent);
        const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

        inputs[0].value = '2026-02-03';
        inputs[1].value = '#00ff00';
        inputs[2].value = '1234';
        inputs[3].value = 'secret';
        inputs.forEach((input) => input.dispatchEvent(new Event('input')));
        await fixture.whenStable();

        expect(fixture.componentInstance.model().date).toBe('2026-02-03');
        expect(fixture.componentInstance.model().color).toBe('#00ff00');
        expect(fixture.componentInstance.model().password).toBe('secret');
    });
});
