import Versions from '@/assets/data/versions.json';
import { AppConfiguratorComponent } from '@/components/layout/configurator/app.configurator.component';
import { AppConfigService } from '@/service/appconfigservice';
import { CommonModule, DOCUMENT } from '@angular/common';
import { afterNextRender, booleanAttribute, Component, computed, ElementRef, Input, OnDestroy, Renderer2, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomHandler } from 'ngx-prime/dom';
import { StyleClass } from 'ngx-prime/styleclass';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, FormsModule, StyleClass, RouterModule, AppConfiguratorComponent],
    template: `<div class="layout-topbar">
        <div class="layout-topbar-inner">
            <div class="layout-topbar-logo-container">
                <a [routerLink]="['/']" class="layout-topbar-logo text-2xl font-semibold text-color" aria-label="ngx-prime home">ngx-prime</a>
                <a [routerLink]="['/']" class="layout-topbar-icon text-xl font-semibold text-primary" aria-label="ngx-prime home">ngx</a>
            </div>

            <ul class="topbar-items">
                <li>
                    <a href="https://github.com/WebArtWork/ngx-prime" target="_blank" rel="noopener noreferrer" class="topbar-item" aria-label="ngx-prime on GitHub">
                        <i class="pi pi-github text-surface-700 dark:text-surface-100"></i>
                    </a>
                </li>
                <li>
                    <button type="button" class="topbar-item" (click)="toggleDarkMode()" aria-label="Toggle color scheme">
                        <i class="pi" [ngClass]="{ 'pi-moon': isDarkMode(), 'pi-sun': !isDarkMode() }"></i>
                    </button>
                </li>
                @if (showConfigurator) {
                    <li class="relative">
                        <button
                            type="button"
                            class="topbar-item config-item"
                            enterActiveClass="px-overlay-enter-active"
                            enterFromClass="hidden"
                            leaveActiveClass="px-overlay-leave-active"
                            leaveToClass="hidden"
                            pStyleClass="@next"
                            [hideOnOutsideClick]="true"
                            aria-label="Open theme settings"
                        >
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator />
                    </li>
                }
                <li>
                    <button type="button" class="topbar-item" (click)="toggleDesigner()" aria-label="Open theme designer">
                        <i class="pi pi-cog"></i>
                    </button>
                </li>
                <li>
                    <button
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="px-overlay-enter-active"
                        leaveToClass="hidden"
                        leaveActiveClass="px-overlay-leave-active"
                        [hideOnOutsideClick]="true"
                        type="button"
                        class="topbar-item version-item"
                    >
                        <span class="version-text">{{ versions ? versions[0].name : 'Latest' }}</span>
                        <span class="version-icon pi pi-angle-down"></span>
                    </button>
                    <div class="versions-panel hidden">
                        <ul>
                            @for (v of versions; track v) {
                                <li role="none">
                                    <a [href]="v.url"
                                        ><span>{{ v.version }}</span></a
                                    >
                                </li>
                            }
                        </ul>
                    </div>
                </li>
                @if (showMenuButton) {
                    <li class="menu-button">
                        <button type="button" class="topbar-item menu-button" (click)="toggleMenu()" aria-label="Menu"><i class="pi pi-bars"></i></button>
                    </li>
                }
            </ul>
        </div>
    </div>`
})
export class AppTopBarComponent implements OnDestroy {
    private document = inject<Document>(DOCUMENT);
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);
    private configService = inject(AppConfigService);

    @Input({ transform: booleanAttribute }) showConfigurator = true;

    @Input({ transform: booleanAttribute }) showMenuButton = true;

    versions: any[] = Versions;

    scrollListener: VoidFunction | null;

    private window: Window;

    constructor() {
        this.window = this.document.defaultView as Window;

        afterNextRender(() => this.bindScrollListener());
    }

    isDarkMode = computed(() => this.configService.appState().darkTheme);

    isMenuActive = computed(() => this.configService.appState().menuActive);

    isDesignerActive = computed(() => this.configService.designerActive());

    toggleMenu() {
        if (this.isMenuActive()) {
            this.configService.hideMenu();
            DomHandler.unblockBodyScroll('blocked-scroll');
        } else {
            this.configService.showMenu();
            DomHandler.blockBodyScroll('blocked-scroll');
        }
    }

    toggleDesigner() {
        this.isDesignerActive() ? this.configService.hideDesigner() : this.configService.showDesigner();
    }

    toggleDarkMode() {
        this.configService.appState.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    bindScrollListener() {
        if (!this.scrollListener) {
            this.scrollListener = this.renderer.listen(this.window, 'scroll', () => {
                this.el.nativeElement.children[0].classList.toggle('layout-topbar-sticky', this.window.scrollY > 0);
            });
        }
    }

    ngOnDestroy() {
        this.scrollListener?.();
    }
}
