import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, inject, input, NgModule, PLATFORM_ID } from '@angular/core';
import { BaseComponent } from '@wawjs/ngx-prime/basecomponent';
import { DomHandler } from '@wawjs/ngx-prime/dom';

/**
 * AutoFocus manages focus on focusable element on load.
 * @group Components
 */
@Directive({
    selector: '[pAutoFocus]',
    standalone: true,
    host: {
        '[attr.autofocus]': "autofocus() ? 'true' : null"
    }
})
export class AutoFocus extends BaseComponent {
    /**
     * When present, it specifies that the component should automatically get focus on load.
     * @group Props
     */
    autofocus = input(false, { alias: 'pAutoFocus' });

    focused: boolean = false;

    platformId = inject(PLATFORM_ID);

    document: Document = inject(DOCUMENT);

    host: ElementRef = inject(ElementRef);

    onAfterContentChecked() {
        if (!this.focused) {
            this.autoFocus();
        }
    }

    onAfterViewChecked() {
        if (!this.focused) {
            this.autoFocus();
        }
    }

    autoFocus() {
        if (isPlatformBrowser(this.platformId) && this.autofocus()) {
            setTimeout(() => {
                const focusableElements = DomHandler.getFocusableElements(this.host?.nativeElement);

                if (focusableElements.length === 0) {
                    this.host.nativeElement.focus();
                }

                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }

                this.focused = true;
            });
        }
    }
}

@NgModule({
    imports: [AutoFocus],
    exports: [AutoFocus]
})
export class AutoFocusModule {}
