import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TemplateConfiguration } from '@/components/template/templateconfiguration';
import { TemplateFeatures } from '@/components/template/templatefeatures';
import { TemplateFeaturesAnimation } from '@/components/template/templatefeaturesanimation/templatefeaturesanimation';
import { TemplateFeaturesAnimationInline } from '@/components/template/templatefeaturesanimation/templatefeaturesanimationinline';
import { TemplateHero } from '@/components/template/templatehero/templatehero';
import { TemplateLicense } from '@/components/template/templatelicense';
import { TemplateRelated } from '@/components/template/templaterelated';
import { TemplateSeparator } from '@/components/template/templateseparator';
import { TemplateYoutube } from '@/components/template/templateyoutube';
@Component({
    selector: 'app-templates',
    imports: [CommonModule, TemplateHero, TemplateSeparator, TemplateYoutube, TemplateLicense, TemplateFeatures, TemplateFeaturesAnimation, TemplateConfiguration, TemplateRelated, TemplateFeaturesAnimationInline],
    templateUrl: './learnmore.component.html',
    styleUrl: './learnmore.scss'
})
export class LearnMoreComponent {
    id: string;

    selectedTemplate: any;

    templateName: string;
}
