import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, effect, ElementRef, inject, InjectionToken, input, NgModule, numberAttribute, output, TemplateRef, ViewEncapsulation, contentChild } from '@angular/core';
import { resolveFieldData } from '@wawjs/css-prime-utils';
import { BlockableUI, FilterService, Footer, Header, SharedModule, TranslationKeys } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import { SpinnerIcon } from '@wawjs/ngx-prime/icons';
import { PaginatorModule } from '@wawjs/ngx-prime/paginator';
import { Nullable } from '@wawjs/ngx-prime/ts-helpers';
import {
    DataViewGridTemplateContext,
    DataViewLayoutChangeEvent,
    DataViewLazyLoadEvent,
    DataViewListTemplateContext,
    DataViewPageEvent,
    DataViewPaginatorDropdownItemTemplateContext,
    DataViewPaginatorLeftTemplateContext,
    DataViewPaginatorRightTemplateContext,
    DataViewPaginatorState,
    DataViewPassThrough,
    DataViewSortEvent
} from '@wawjs/ngx-prime/types/dataview';
import { Subscription } from 'rxjs';
import { DataViewStyle } from './style/dataviewstyle';

const DATAVIEW_INSTANCE = new InjectionToken<DataView>('DATAVIEW_INSTANCE');

/**
 * DataView displays data in grid or list layout with pagination and sorting features.
 * @group Components
 */
@Component({
    selector: 'p-dataView, p-dataview, p-data-view',
    standalone: true,
    imports: [CommonModule, PaginatorModule, SpinnerIcon, SharedModule, Bind],
    template: `
        @if (loading()) {
            <div [pBind]="ptm('loading')" [class]="cx('loading')">
                <div [pBind]="ptm('loadingOverlay')" [class]="cx('loadingOverlay')">
                    @if (loadingIcon()) {
                        <i [class]="cn(cx('loadingIcon'), 'pi-spin' + loadingIcon())"></i>
                    } @else {
                        <ng-container>
                            <svg [pBind]="ptm('loadingIcon')" data-p-icon="spinner" [spin]="true" [class]="cx('loadingIcon')" />
                            <ng-template *ngTemplateOutlet="loadingicon()"></ng-template>
                        </ng-container>
                    }
                </div>
            </div>
        }
        @if (header() || headerTemplate) {
            <div [pBind]="ptm('header')" [class]="cx('header')">
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
            </div>
        }
        @if (paginator() && (paginatorPosition() === 'top' || paginatorPosition() === 'both')) {
            <p-paginator
                [rows]="_rows"
                [first]="_first"
                [totalRecords]="_totalRecords"
                [pageLinkSize]="pageLinks()"
                [alwaysShow]="alwaysShowPaginator()"
                (onPageChange)="paginate($event)"
                [rowsPerPageOptions]="rowsPerPageOptions()"
                [appendTo]="paginatorDropdownAppendTo()"
                [dropdownScrollHeight]="paginatorDropdownScrollHeight()"
                [templateLeft]="paginatorleft()"
                [templateRight]="paginatorright()"
                [currentPageReportTemplate]="currentPageReportTemplate()"
                [showFirstLastIcon]="showFirstLastIcon()"
                [dropdownItemTemplate]="paginatordropdownitem()"
                [showCurrentPageReport]="showCurrentPageReport()"
                [showJumpToPageDropdown]="showJumpToPageDropdown()"
                [showPageLinks]="showPageLinks()"
                [styleClass]="cn(cx('pcPaginator', { position: 'top' }), paginatorStyleClass())"
                [pt]="ptm('pcPaginator')"
                [unstyled]="unstyled()"
            ></p-paginator>
        }
        <div [pBind]="ptm('content')" [class]="cx('content')">
            @if (layout() === 'list') {
                <ng-container
                    *ngTemplateOutlet="
                        listTemplate();
                        context: {
                            $implicit: paginator() ? (filteredValue || value() | slice: (lazy() ? 0 : _first) : (lazy() ? 0 : _first) + _rows) : filteredValue || value()
                        }
                    "
                ></ng-container>
            }
            @if (layout() === 'grid') {
                <ng-container
                    *ngTemplateOutlet="
                        gridTemplate();
                        context: {
                            $implicit: paginator() ? (filteredValue || value() | slice: (lazy() ? 0 : _first) : (lazy() ? 0 : _first) + _rows) : filteredValue || value()
                        }
                    "
                ></ng-container>
            }
            @if (isEmpty() && !loading()) {
                <div [pBind]="ptm('emptyMessage')" [class]="cx('emptyMessage')">
                    @if (!emptymessageTemplate()) {
                        {{ emptyMessageLabel }}
                    } @else {
                        <ng-template [ngTemplateOutlet]="empty"></ng-template>
                    }
                    <ng-container #empty *ngTemplateOutlet="emptymessageTemplate()"></ng-container>
                </div>
            }
        </div>
        @if (paginator() && (paginatorPosition() === 'bottom' || paginatorPosition() === 'both')) {
            <p-paginator
                [rows]="_rows"
                [first]="_first"
                [totalRecords]="_totalRecords"
                [pageLinkSize]="pageLinks()"
                [alwaysShow]="alwaysShowPaginator()"
                (onPageChange)="paginate($event)"
                [rowsPerPageOptions]="rowsPerPageOptions()"
                [appendTo]="paginatorDropdownAppendTo()"
                [dropdownScrollHeight]="paginatorDropdownScrollHeight()"
                [templateLeft]="paginatorleft()"
                [templateRight]="paginatorright()"
                [currentPageReportTemplate]="currentPageReportTemplate()"
                [showFirstLastIcon]="showFirstLastIcon()"
                [dropdownItemTemplate]="paginatordropdownitem()"
                [showCurrentPageReport]="showCurrentPageReport()"
                [showJumpToPageDropdown]="showJumpToPageDropdown()"
                [showPageLinks]="showPageLinks()"
                [styleClass]="cn(cx('pcPaginator', { position: 'bottom' }), paginatorStyleClass())"
                [pt]="ptm('pcPaginator')"
                [unstyled]="unstyled()"
            ></p-paginator>
        }
        @if (footer() || footerTemplate) {
            <div [pBind]="ptm('footer')" [class]="cx('footer')">
                <ng-content select="p-footer"></ng-content>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DataViewStyle, { provide: DATAVIEW_INSTANCE, useExisting: DataView }, { provide: PARENT_INSTANCE, useExisting: DataView }],
    host: {
        '[class]': "cn(cx('root'), styleClass())"
    },
    hostDirectives: [Bind]
})
export class DataView extends BaseComponent<DataViewPassThrough> implements BlockableUI {
    componentName = 'DataView';

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcDataView: DataView | undefined = inject(DATAVIEW_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }

    /**
     * When specified as true, enables the pagination.
     * @group Props
     */
    paginator = input(false, { transform: booleanAttribute });
    /**
     * Number of rows to display per page.
     * @group Props
     */
    rows = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * Number of total records, defaults to length of value when not defined.
     * @group Props
     */
    totalRecords = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * Number of page links to display in paginator.
     * @group Props
     */
    pageLinks = input(5, { transform: numberAttribute });
    /**
     * Array of integer/object values to display inside rows per page dropdown of paginator
     * @group Props
     */
    rowsPerPageOptions = input<number[] | any[]>();
    /**
     * Position of the paginator.
     * @group Props
     */
    paginatorPosition = input<'top' | 'bottom' | 'both'>('bottom');
    /**
     * Custom style class for paginator
     * @group Props
     */
    paginatorStyleClass = input<string>();
    /**
     * Whether to show it even there is only one page.
     * @group Props
     */
    alwaysShowPaginator = input(true, { transform: booleanAttribute });
    /**
     * Target element to attach the paginator dropdown overlay, valid values are "body" or a local ng-template variable of another element (note: use binding with brackets for template variables, e.g. [appendTo]="mydiv" for a div element having #mydiv as variable name).
     * @group Props
     */
    paginatorDropdownAppendTo = input<HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any>();
    /**
     * Paginator dropdown height of the viewport in pixels, a scrollbar is defined if height of list exceeds this value.
     * @group Props
     */
    paginatorDropdownScrollHeight = input('200px');
    /**
     * Template of the current page report element. Available placeholders are {currentPage},{totalPages},{rows},{first},{last} and {totalRecords}
     * @group Props
     */
    currentPageReportTemplate = input('{currentPage} of {totalPages}');
    /**
     * Whether to display current page report.
     * @group Props
     */
    showCurrentPageReport = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * Whether to display a dropdown to navigate to any page.
     * @group Props
     */
    showJumpToPageDropdown = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * When enabled, icons are displayed on paginator to go first and last page.
     * @group Props
     */
    showFirstLastIcon = input(true, { transform: booleanAttribute });
    /**
     * Whether to show page links.
     * @group Props
     */
    showPageLinks = input(true, { transform: booleanAttribute });
    /**
     * Defines if data is loaded and interacted with in lazy manner.
     * @group Props
     */
    lazy = input(false, { transform: booleanAttribute });
    /**
     * Whether to call lazy loading on initialization.
     * @group Props
     */
    lazyLoadOnInit = input(true, { transform: booleanAttribute });
    /**
     * Text to display when there is no data. Defaults to global value in i18n translation configuration.
     * @group Props
     */
    emptyMessage = input('');
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Style class of the grid.
     * @group Props
     */
    gridStyleClass = input('');
    /**
     * Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity.
     * @group Props
     */
    trackBy = input<(...args: any[]) => any>((index: number, item: any) => item);
    /**
     * Comma separated list of fields in the object graph to search against.
     * @group Props
     */
    filterBy = input<string>();
    /**
     * Locale to use in filtering. The default locale is the host environment's current locale.
     * @group Props
     */
    filterLocale = input<string>();
    /**
     * Displays a loader to indicate data load is in progress.
     * @group Props
     */
    loading = input<boolean, unknown>(undefined, { transform: booleanAttribute });
    /**
     * The icon to show while indicating data load is in progress.
     * @group Props
     */
    loadingIcon = input<string>();
    /**
     * Index of the first row to be displayed.
     * @group Props
     */
    first = input(0, { transform: numberAttribute });
    /**
     * Property name of data to use in sorting by default.
     * @group Props
     */
    sortField = input<string>();
    /**
     * Order to sort the data by default.
     * @group Props
     */
    sortOrder = input<number, unknown>(undefined, { transform: numberAttribute });
    /**
     * An array of objects to display.
     * @group Props
     */
    value = input<any[]>();
    /**
     * Defines the layout mode.
     * @group Props
     */
    layout = input<'list' | 'grid'>('list');
    /**
     * Callback to invoke when paging, sorting or filtering happens in lazy mode.
     * @param {DataViewLazyLoadEvent} event - Custom lazy load event.
     * @group Emits
     */
    onLazyLoad = output<DataViewLazyLoadEvent>();
    /**
     * Callback to invoke when pagination occurs.
     * @param {DataViewPageEvent} event - Custom page event.
     * @group Emits
     */
    onPage = output<DataViewPageEvent>();
    /**
     * Callback to invoke when sorting occurs.
     * @param {DataViewSortEvent} event - Custom sort event.
     * @group Emits
     */
    onSort = output<DataViewSortEvent>();
    /**
     * Callback to invoke when changing layout.
     * @param {DataViewLayoutChangeEvent} event - Custom layout change event.
     * @group Emits
     */
    onChangeLayout = output<DataViewLayoutChangeEvent>();
    /**
     * Template for the list layout.
     * @param {DataViewListTemplateContext} context - list template context.
     * @group Templates
     */
    readonly listTemplate = contentChild<Nullable<TemplateRef<DataViewListTemplateContext>>>('list');
    /**
     * Template for grid layout.
     * @param {DataViewGridTemplateContext} context - grid template context.
     * @group Templates
     */
    readonly gridTemplate = contentChild<TemplateRef<DataViewGridTemplateContext>>('grid');
    /**
     * Template for the header section.
     * @group Templates
     */
    @ContentChild('header') headerTemplate: TemplateRef<void>;
    /**
     * Template for the empty message section.
     * @group Templates
     */
    readonly emptymessageTemplate = contentChild<TemplateRef<void>>('emptymessage');
    /**
     * Template for the footer section.
     * @group Templates
     */
    @ContentChild('footer') footerTemplate: TemplateRef<void>;
    /**
     * Template for the left side of paginator.
     * @param {DataViewPaginatorLeftTemplateContext} context - paginator left template context.
     * @group Templates
     */
    readonly paginatorleft = contentChild<TemplateRef<DataViewPaginatorLeftTemplateContext>>('paginatorleft');
    /**
     * Template for the right side of paginator.
     * @param {DataViewPaginatorRightTemplateContext} context - paginator right template context.
     * @group Templates
     */
    readonly paginatorright = contentChild<TemplateRef<DataViewPaginatorRightTemplateContext>>('paginatorright');
    /**
     * Template for items in paginator dropdown.
     * @param {DataViewPaginatorDropdownItemTemplateContext} context - paginator dropdown item template context.
     * @group Templates
     */
    readonly paginatordropdownitem = contentChild<TemplateRef<DataViewPaginatorDropdownItemTemplateContext>>('paginatordropdownitem');
    /**
     * Template for loading icon.
     * @group Templates
     */
    readonly loadingicon = contentChild<TemplateRef<void>>('loadingicon');
    /**
     * Template for list icon.
     * @group Templates
     */
    readonly listicon = contentChild<TemplateRef<void>>('listicon');
    /**
     * Template for grid icon.
     * @group Templates
     */
    readonly gridicon = contentChild<TemplateRef<void>>('gridicon');

    readonly header = contentChild(Header);

    readonly footer = contentChild(Footer);

    filteredValue: Nullable<any[]>;

    filterValue: Nullable<string>;

    initialized: Nullable<boolean>;

    _layout: 'list' | 'grid' = 'list';

    translationSubscription: Nullable<Subscription>;

    _componentStyle = inject(DataViewStyle);

    _first: number = 0;

    _rows: number | undefined;

    _totalRecords: number | undefined;

    private isFirstLayoutChange = true;

    get emptyMessageLabel(): string {
        return this.emptyMessage() || this.config.getTranslation(TranslationKeys.EMPTY_MESSAGE);
    }

    filterService = inject(FilterService);

    constructor() {
        super();

        effect(() => {
            const layout = this.layout();

            if (!this.isFirstLayoutChange) {
                this.onChangeLayout.emit({ layout });
            }

            this.isFirstLayoutChange = false;
        });

        effect(() => {
            const first = this.first();

            this._first = first;
        });

        effect(() => {
            const rows = this.rows();

            this._rows = rows;
        });

        effect(() => {
            const totalRecords = this.totalRecords();

            this._totalRecords = totalRecords;
        });

        effect(() => {
            this.value();
            this.updateTotalRecords();

            if (!this.lazy() && this.hasFilter()) {
                this.filter(this.filterValue as string);
            }
        });

        effect(() => {
            this.sortField();
            this.sortOrder();

            //avoid triggering lazy load prior to lazy initialization at onInit
            if (!this.lazy() || this.initialized) {
                this.sort();
            }
        });
    }

    onInit() {
        if (this.lazy() && this.lazyLoadOnInit()) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }

        this.translationSubscription = this.config.translationObserver.subscribe(() => {
            this.cd.markForCheck();
        });
        this.initialized = true;
    }

    onAfterViewInit() {}

    updateTotalRecords() {
        const value = this.value();

        this._totalRecords = this.lazy() ? this._totalRecords : value ? value.length : 0;
    }

    paginate(event: DataViewPaginatorState) {
        this._first = event.first ?? 0;
        this._rows = event.rows;

        if (this.lazy()) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        }

        this.onPage.emit({
            first: <number>this._first,
            rows: <number>this._rows
        });
    }

    sort() {
        this._first = 0;

        const value = this.value();

        if (this.lazy()) {
            this.onLazyLoad.emit(this.createLazyLoadMetadata());
        } else if (value) {
            const sortField = this.sortField();

            value.sort((data1, data2) => {
                let value1 = resolveFieldData(data1, sortField);
                let value2 = resolveFieldData(data2, sortField);
                let result: number;

                if (value1 == null && value2 != null) result = -1;
                else if (value1 != null && value2 == null) result = 1;
                else if (value1 == null && value2 == null) result = 0;
                else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
                else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

                return (this.sortOrder() as number) * result;
            });

            if (this.hasFilter()) {
                this.filter(this.filterValue as string);
            }
        }

        this.onSort.emit({
            sortField: <string>this.sortField(),
            sortOrder: <number>this.sortOrder()
        });
    }

    isEmpty() {
        let data = this.filteredValue || this.value();

        return data == null || data.length == 0;
    }

    createLazyLoadMetadata(): DataViewLazyLoadEvent {
        return {
            first: <number>this._first,
            rows: <number>this._rows,
            sortField: <string>this.sortField(),
            sortOrder: <number>this.sortOrder()
        };
    }

    getBlockableElement(): HTMLElement {
        return this.el.nativeElement.children[0];
    }

    filter(filter: string, filterMatchMode: string = 'contains') {
        this.filterValue = filter;

        const value = this.value();

        if (value && value.length) {
            let searchFields = (this.filterBy() as string).split(',');

            this.filteredValue = this.filterService.filter(value, searchFields, filter, filterMatchMode, this.filterLocale());

            if (this.filteredValue.length === value.length) {
                this.filteredValue = null;
            }

            if (this.paginator()) {
                this._first = 0;
                this._totalRecords = this.filteredValue ? this.filteredValue.length : value ? value.length : 0;
            }

            this.cd.markForCheck();
        }
    }

    hasFilter() {
        return this.filterValue && this.filterValue.trim().length > 0;
    }

    onDestroy() {
        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }
    }
}

@NgModule({
    imports: [DataView, SharedModule],
    exports: [DataView, SharedModule]
})
export class DataViewModule {}
