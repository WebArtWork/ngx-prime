import { isPlatformBrowser } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, effect, ElementRef, inject, InjectionToken, input, NgModule, NgZone, output, ViewEncapsulation } from '@angular/core';
import Chart from 'chart.js/auto';
import { SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent } from '@wawjs/ngx-prime/basecomponent';
import { ChartStyle } from './style/chartstyle';
import { Bind, BindModule } from '@wawjs/ngx-prime/bind';
import type { ChartPassThrough } from '@wawjs/ngx-prime/types/chart';

const CHART_INSTANCE = new InjectionToken<UIChart>('CHART_INSTANCE');

/**
 * Chart groups a collection of contents in tabs.
 * @group Components
 */
@Component({
    selector: 'p-chart',
    standalone: true,
    imports: [SharedModule, BindModule],
    template: `
        <canvas
            role="img"
            [attr.aria-label]="ariaLabel()"
            [attr.aria-labelledby]="ariaLabelledBy()"
            [attr.aria-describedby]="data() ? dataTableId : null"
            [attr.width]="responsive() && !width() ? null : width()"
            [attr.height]="responsive() && !height() ? null : height()"
            (click)="onCanvasClick($event)"
            [pBind]="ptm('canvas')"
        ></canvas>
        @if (data(); as chartData) {
            <table [id]="dataTableId" class="p-chart-data-table" [style]="{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', 'white-space': 'nowrap' }">
                <caption>
                    {{
                        ariaLabel() || 'Chart data'
                    }}
                </caption>
                <thead>
                    <tr>
                        <th scope="col"></th>
                        @for (dataset of chartData.datasets; track dataset.label) {
                            <th scope="col">{{ dataset.label }}</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    @for (label of chartData.labels; track label; let i = $index) {
                        <tr>
                            <th scope="row">{{ label }}</th>
                            @for (dataset of chartData.datasets; track dataset.label) {
                                <td>{{ dataset.data[i] }}</td>
                            }
                        </tr>
                    }
                </tbody>
            </table>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': "cx('root')",
        '[style]': "sx('root')"
    },
    providers: [ChartStyle, { provide: CHART_INSTANCE, useExisting: UIChart }],
    hostDirectives: [Bind]
})
export class UIChart extends BaseComponent<ChartPassThrough> {
    el = inject(ElementRef);
    private zone = inject(NgZone);

    componentName = 'Chart';

    $pcChart: UIChart | undefined = inject(CHART_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * Type of the chart.
     * @group Props
     */
    type = input<'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar'>();
    /**
     * Array of per-chart plugins to customize the chart behaviour.
     * @group Props
     */
    plugins = input<any[]>([]);
    /**
     * Width of the chart.
     * @group Props
     */
    width = input<string>();
    /**
     * Height of the chart.
     * @group Props
     */
    height = input<string>();
    /**
     * Whether the chart is redrawn on screen size change.
     * @group Props
     */
    responsive = input(true, { transform: booleanAttribute });
    /**
     * Used to define a string that autocomplete attribute the current element.
     * @group Props
     */
    ariaLabel = input<string>();
    /**
     * Establishes relationships between the component and label(s) where its value should be one or more element IDs.
     * @group Props
     */
    ariaLabelledBy = input<string>();
    /**
     * Data to display.
     * @group Props
     */
    data = input<any>();
    /**
     * Options to customize the chart.
     * @group Props
     */
    options = input<any>({});
    /**
     * Callback to execute when an element on chart is clicked.
     * @group Emits
     */
    onDataSelect = output<any>();

    isBrowser: boolean = false;

    initialized: boolean | undefined;

    chart: any;

    dataTableId = `p-chart-data-${Math.random().toString(36).slice(2, 9)}`;

    _componentStyle = inject(ChartStyle);

    constructor() {
        super();
        effect(() => {
            this.data();
            this.options();
            this.reinit();
        });
    }

    onAfterViewInit() {
        this.initChart();
        this.initialized = true;
    }

    onCanvasClick(event: Event) {
        if (this.chart) {
            const element = this.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            const dataset = this.chart.getElementsAtEventForMode(event, 'dataset', { intersect: true }, false);

            if (element && element[0] && dataset) {
                this.onDataSelect.emit({ originalEvent: event, element: element[0], dataset: dataset });
            }
        }
    }

    initChart() {
        if (isPlatformBrowser(this.platformId)) {
            let opts = this.options() || {};

            opts.responsive = this.responsive();

            // allows chart to resize in responsive mode
            if (opts.responsive && (this.height() || this.width())) {
                opts.maintainAspectRatio = false;
            }

            this.zone.runOutsideAngular(() => {
                this.chart = new Chart(this.el.nativeElement.children[0], {
                    type: this.type(),
                    data: this.data(),
                    options: this.options(),
                    plugins: this.plugins()
                });
            });
        }
    }

    getCanvas() {
        return this.el.nativeElement.children[0];
    }

    getBase64Image() {
        return this.chart.toBase64Image();
    }

    generateLegend() {
        if (this.chart) {
            return this.chart.generateLegend();
        }
    }

    refresh() {
        if (this.chart) {
            this.chart.update();
        }
    }

    reinit() {
        if (this.chart) {
            this.chart.destroy();
            this.initChart();
        }
    }

    onDestroy() {
        if (this.chart) {
            this.chart.destroy();
            this.initialized = false;
            this.chart = null;
        }
    }
}

@NgModule({
    imports: [UIChart, SharedModule],
    exports: [UIChart, SharedModule]
})
export class ChartModule {}
