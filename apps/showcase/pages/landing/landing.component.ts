import { AppNewsComponent } from '@/components/layout/news/app.news.component';
import { AppTopBarComponent } from '@/components/layout/topbar/app.topbar.component';
import { AppConfigService } from '@/service/appconfigservice';
import { CommonModule } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FooterSectionComponent } from './footersection.component';
import { HeroSectionComponent } from './herosection.component';
import { UsersSectionComponent } from './userssection.component';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'landing',
    standalone: true,
    templateUrl: './landing.component.html',
    imports: [CommonModule, AppNewsComponent, AppTopBarComponent, ButtonModule, HeroSectionComponent, UsersSectionComponent, FooterSectionComponent]
})
export class LandingComponent implements OnInit {
    subscription!: Subscription;

    isNewsActive = computed(() => this.configService.newsActive());

    isDarkMode = computed(() => this.configService.appState().darkTheme);

    landingClass = computed(() => ({
        'layout-dark': this.isDarkMode(),
        'layout-light': !this.isDarkMode(),
        'layout-news-active': this.isNewsActive()
    }));

    constructor(
        private configService: AppConfigService,
        private metaService: Meta,
        private titleService: Title
    ) {}

    ngOnInit() {
        this.titleService.setTitle('ngx-prime - Angular UI Component Library');
        this.metaService.updateTag({
            name: 'description',
            content: 'An independent MIT-licensed Angular UI component library maintained by Web Art Work.'
        });
    }
}
