import { routes } from '@/router/app.routes';
import { DemoCodeService } from '@/service/democodeservice';
import { DesignerService } from '@/service/designerservice';
import Noir from '@/themes/app-theme';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { ConfirmationService, MessageService } from '@wawjs/ngx-prime/api';
import { provideNgxPrime } from '@wawjs/ngx-prime/config';

function initializeDemoCode(demoCodeService: DemoCodeService) {
    return () => demoCodeService.loadDemos();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })), // withEnabledBlockingInitialNavigation()
        provideHttpClient(withFetch()),
        provideNgxPrime({
            theme: Noir,
            ripple: false
        }),
        MessageService,
        DesignerService,
        ConfirmationService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeDemoCode,
            deps: [DemoCodeService],
            multi: true
        }
    ]
};
