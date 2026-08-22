import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    model,
    NgModule,
    numberAttribute,
    output,
    TemplateRef,
    ViewEncapsulation,
    viewChild,
    contentChild,
    contentChildren
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { findIndexInList, setAttribute, uuid } from '@wawjs/css-prime-utils';
import { FilterService, PrimeTemplate, SharedModule } from 'ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from 'ngx-prime/basecomponent';
import { Bind } from 'ngx-prime/bind';
import { ButtonModule, ButtonProps } from 'ngx-prime/button';
import { AngleDoubleDownIcon, AngleDoubleUpIcon, AngleDownIcon, AngleUpIcon } from 'ngx-prime/icons';
import { Listbox, ListboxChangeEvent } from 'ngx-prime/listbox';
import { Ripple } from 'ngx-prime/ripple';
import { Nullable } from 'ngx-prime/ts-helpers';
import { OrderListFilterEvent, OrderListFilterOptions, OrderListFilterTemplateContext, OrderListItemTemplateContext, OrderListPassThrough, OrderListSelectionChangeEvent } from 'ngx-prime/types/orderlist';
import { OrderListStyle } from './style/orderliststyle';

const ORDERLIST_INSTANCE = new InjectionToken<OrderList>('ORDERLIST_INSTANCE');

/**
 * OrderList is used to manage the order of a collection.
 * @group Components
 */
@Component({
    selector: 'p-orderList, p-orderlist, p-order-list',
    standalone: true,
    imports: [CommonModule, ButtonModule, Ripple, DragDropModule, AngleDoubleDownIcon, AngleDoubleUpIcon, AngleUpIcon, AngleDownIcon, Listbox, FormsModule, SharedModule, Bind],
    template: `
        <div [pBind]="ptm('controls')" [class]="cx('controls')">
            <button [pt]="ptm('pcMoveUpButton')" type="button" [disabled]="moveDisabled()" pButton pRipple (click)="moveUp()" [attr.aria-label]="moveUpAriaLabel" [buttonProps]="getButtonProps('up')" hostName="orderlist" [unstyled]="unstyled()">
                @if (!moveUpIconTemplate() && !_moveUpIconTemplate) {
                    <svg data-p-icon="angle-up" pButtonIcon [pt]="ptm('pcMoveUpButton')['icon']" />
                }
                <ng-template *ngTemplateOutlet="moveUpIconTemplate() || _moveUpIconTemplate"></ng-template>
            </button>
            <button [pt]="ptm('pcMoveTopButton')" type="button" [disabled]="moveDisabled()" pButton pRipple (click)="moveTop()" [attr.aria-label]="moveTopAriaLabel" [buttonProps]="getButtonProps('top')" hostName="orderlist" [unstyled]="unstyled()">
                @if (!moveTopIconTemplate() && !_moveTopIconTemplate) {
                    <svg data-p-icon="angle-double-up" pButtonIcon [pt]="ptm('pcMoveTopButton')['icon']" />
                }
                <ng-template *ngTemplateOutlet="moveTopIconTemplate() || _moveTopIconTemplate"></ng-template>
            </button>
            <button
                [pt]="ptm('pcMoveDownButton')"
                type="button"
                [disabled]="moveDisabled()"
                pButton
                pRipple
                (click)="moveDown()"
                [attr.aria-label]="moveDownAriaLabel"
                [buttonProps]="getButtonProps('down')"
                hostName="orderlist"
                [unstyled]="unstyled()"
            >
                @if (!moveDownIconTemplate() && !_moveDownIconTemplate) {
                    <svg data-p-icon="angle-down" pButtonIcon [pt]="ptm('pcMoveDownButton')['icon']" />
                }
                <ng-template *ngTemplateOutlet="moveDownIconTemplate() || _moveDownIconTemplate"></ng-template>
            </button>
            <button
                [pt]="ptm('pcMoveBottomButton')"
                type="button"
                [disabled]="moveDisabled()"
                pButton
                pRipple
                (click)="moveBottom()"
                [attr.aria-label]="moveBottomAriaLabel"
                [buttonProps]="getButtonProps('bottom')"
                hostName="orderlist"
                [unstyled]="unstyled()"
            >
                @if (!moveBottomIconTemplate() && !_moveBottomIconTemplate) {
                    <svg data-p-icon="angle-double-down" pButtonIcon [pt]="ptm('pcMoveBottomButton')['icon']" />
                }
                <ng-template *ngTemplateOutlet="moveBottomIconTemplate() || _moveBottomIconTemplate"></ng-template>
            </button>
        </div>
        <p-listbox
            [pt]="ptm('pcListbox')"
            #listelement
            [multiple]="true"
            [options]="value()"
            [(ngModel)]="d_selection"
            [optionLabel]="dataKey() ?? 'name'"
            [id]="id + '_list'"
            [listStyle]="listStyle()"
            [striped]="stripedRows()"
            [tabindex]="tabindex()"
            (onFocus)="onListFocus($event)"
            (onBlur)="onListBlur($event)"
            (onChange)="onChangeSelection($event)"
            [ariaLabel]="ariaLabel()"
            [disabled]="disabled()"
            [metaKeySelection]="metaKeySelection()"
            [scrollHeight]="scrollHeight()"
            [autoOptionFocus]="autoOptionFocus()"
            [filter]="filterBy()"
            [filterBy]="filterBy()"
            [filterLocale]="filterLocale()"
            [filterPlaceHolder]="filterPlaceholder()"
            [dragdrop]="dragdrop()"
            (onDrop)="onDrop($event)"
            hostName="orderlist"
            [unstyled]="unstyled()"
        >
            @if (headerTemplate || _headerTemplate) {
                <ng-template #header>
                    <ng-template *ngTemplateOutlet="headerTemplate || _headerTemplate"></ng-template>
                </ng-template>
            }
            @if (itemTemplate || _itemTemplate) {
                <ng-template #item let-option let-selected="selected" let-index="index">
                    <ng-template *ngTemplateOutlet="itemTemplate || _itemTemplate; context: { $implicit: option, selected: selected, index: index }"></ng-template>
                </ng-template>
            }
            @if (emptyMessageTemplate || _emptyMessageTemplate) {
                <ng-template #empty>
                    <ng-template *ngTemplateOutlet="emptyMessageTemplate || _emptyMessageTemplate"></ng-template>
                </ng-template>
            }
            @if (emptyFilterMessageTemplate || _emptyFilterMessageTemplate) {
                <ng-template #emptyfilter>
                    <ng-template *ngTemplateOutlet="emptyFilterMessageTemplate || _emptyFilterMessageTemplate"></ng-template>
                </ng-template>
            }
            @if (filterIconTemplate || _filterIconTemplate) {
                <ng-template #filtericon>
                    <ng-template *ngTemplateOutlet="filterIconTemplate || _filterIconTemplate"></ng-template>
                </ng-template>
            }
            @if (filterTemplate || _filterTemplate) {
                <ng-template #filter let-options="options">
                    <ng-template *ngTemplateOutlet="filterTemplate || _filterTemplate; context: { options: options }"></ng-template>
                </ng-template>
            }
        </p-listbox>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [OrderListStyle, { provide: ORDERLIST_INSTANCE, useExisting: OrderList }, { provide: PARENT_INSTANCE, useExisting: OrderList }],
    host: {
        '[class]': "cn(cx('root'), styleClass())"
    },
    hostDirectives: [Bind]
})
export class OrderList extends BaseComponent<OrderListPassThrough> {
    componentName = 'OrderList';

    bindDirectiveInstance = inject(Bind, { self: true });

    $pcOrderList: OrderList | undefined = inject(ORDERLIST_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    onAfterViewChecked(): void {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));
    }
    /**
     * Text for the caption.
     * @group Props
     */
    header = input<string>();

    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();

    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });

    /**
     * Defines a string that labels the input for accessibility.
     * @group Props
     */
    ariaLabel = input<string>();

    /**
     * Specifies one or more IDs in the DOM that labels the input field.
     * @group Props
     */
    ariaLabelledBy = input<string>();

    /**
     * Inline style of the list element.
     * @group Props
     */
    listStyle = input<{ [klass: string]: any } | null>();

    /**
     * A boolean value that indicates whether the component should be responsive.
     * @group Props
     */
    responsive = input<boolean, unknown>(undefined, { transform: booleanAttribute });

    /**
     * When specified displays an input field to filter the items on keyup and decides which fields to search against.
     * @group Props
     */
    filterBy = input<string>();

    /**
     * Placeholder of the filter input.
     * @group Props
     */
    filterPlaceholder = input<string>();

    /**
     * Locale to use in filtering. The default locale is the host environment's current locale.
     * @group Props
     */
    filterLocale = input<string>();

    /**
     * When true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically.
     * @group Props
     */
    metaKeySelection = input(false, { transform: booleanAttribute });

    /**
     * Whether to enable dragdrop based reordering.
     * @group Props
     */
    dragdrop = input(false, { transform: booleanAttribute });

    /**
     * Defines the location of the buttons with respect to the list.
     * @group Props
     */
    controlsPosition = input<'left' | 'right'>('left');

    /**
     * Defines a string that labels the filter input.
     * @group Props
     */
    ariaFilterLabel = input<string>();

    /**
     * Defines how the items are filtered.
     * @group Props
     */
    filterMatchMode = input<'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte'>('contains');

    /**
     * Indicates the width of the screen at which the component should change its behavior.
     * @group Props
     */
    breakpoint = input('960px');

    /**
     * Whether to displays rows with alternating colors.
     * @group Props
     */
    stripedRows = input<boolean, unknown>(undefined, { transform: booleanAttribute });

    /**
     * When present, it specifies that the component should be disabled.
     * @group Props
     */
    disabled = input<boolean, unknown>(undefined, { transform: booleanAttribute });

    /**
     * Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity.
     * @group Props
     */
    trackBy = input<(...args: any[]) => any>((index: number, item: any) => item);

    /**
     * Height of the viewport, a scrollbar is defined if height of list exceeds this value.
     * @group Props
     */
    scrollHeight = input('14rem');

    /**
     * Whether to focus on the first visible or selected element.
     * @group Props
     */
    autoOptionFocus = input(true, { transform: booleanAttribute });
    /**
     * Name of the field that uniquely identifies the record in the data.
     * @group Props
     */
    dataKey = input<string>();
    /**
     * A list of values that are currently selected.
     * @group Props
     */
    selection = model<any[]>([]);

    /**
     * Array of values to be displayed in the component.
     * It represents the data source for the list of items.
     * @group Props
     */
    value = input<any[]>();

    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @group Props
     */
    buttonProps = input<ButtonProps>({ severity: 'secondary' });

    /**
     * Used to pass all properties of the ButtonProps to the move up button inside the component.
     * @group Props
     */
    moveUpButtonProps = input<ButtonProps>();

    /**
     * Used to pass all properties of the ButtonProps to the move top button inside the component.
     * @group Props
     */
    moveTopButtonProps = input<ButtonProps>();

    /**
     * Used to pass all properties of the ButtonProps to the move down button inside the component.
     * @group Props
     */
    moveDownButtonProps = input<ButtonProps>();

    /**
     * Used to pass all properties of the ButtonProps to the move bottom button inside the component.
     * @group Props
     */
    moveBottomButtonProps = input<ButtonProps>();

    /**
     * Callback to invoke when list is reordered.
     * @param {*} any - list instance.
     * @group Emits
     */
    onReorder = output<any>();

    /**
     * Callback to invoke when selection changes.
     * @param {OrderListSelectionChangeEvent} event - Custom change event.
     * @group Emits
     */
    onSelectionChange = output<OrderListSelectionChangeEvent>();

    /**
     * Callback to invoke when filtering occurs.
     * @param {OrderListFilterEvent} event - Custom filter event.
     * @group Emits
     */
    onFilterEvent = output<OrderListFilterEvent>();

    /**
     * Callback to invoke when the list is focused
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onFocus = output<Event>();

    /**
     * Callback to invoke when the list is blurred
     * @param {Event} event - Browser event.
     * @group Emits
     */
    onBlur = output<Event>();

    readonly listViewChild = viewChild.required<Listbox>('listelement');

    readonly filterViewChild = viewChild<Nullable<ElementRef>>('filter');

    /**
     * Custom item template.
     * @param {OrderListItemTemplateContext} context - item context.
     * @see {@link OrderListItemTemplateContext}
     * @group Templates
     */
    @ContentChild('item', { descendants: false }) itemTemplate: TemplateRef<OrderListItemTemplateContext> | undefined;

    /**
     * Custom empty template.
     * @group Templates
     */
    @ContentChild('empty', { descendants: false }) emptyMessageTemplate: TemplateRef<void> | undefined;

    /**
     * Custom empty filter template.
     * @group Templates
     */
    @ContentChild('emptyfilter', { descendants: false }) emptyFilterMessageTemplate: TemplateRef<void> | undefined;

    /**
     * Custom filter template.
     * @param {OrderListFilterTemplateContext} context - filter context.
     * @see {@link OrderListFilterTemplateContext}
     * @group Templates
     */
    @ContentChild('filter', { descendants: false }) filterTemplate: TemplateRef<OrderListFilterTemplateContext> | undefined;

    /**
     * Custom header template.
     * @group Templates
     */
    @ContentChild('header', { descendants: false }) headerTemplate: TemplateRef<void> | undefined;

    /**
     * Custom move up icon template.
     * @group Templates
     */
    readonly moveUpIconTemplate = contentChild<TemplateRef<void>>('moveupicon', { descendants: false });

    /**
     * Custom move top icon template.
     * @group Templates
     */
    readonly moveTopIconTemplate = contentChild<TemplateRef<void>>('movetopicon', { descendants: false });

    /**
     * Custom move down icon template.
     * @group Templates
     */
    readonly moveDownIconTemplate = contentChild<TemplateRef<void>>('movedownicon', { descendants: false });

    /**
     * Custom move bottom icon template.
     * @group Templates
     */
    readonly moveBottomIconTemplate = contentChild<TemplateRef<void>>('movebottomicon', { descendants: false });

    /**
     * Custom filter icon template.
     * @group Templates
     */
    @ContentChild('filtericon', { descendants: false }) filterIconTemplate: TemplateRef<void> | undefined;

    get moveUpAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.moveUp : undefined;
    }

    get moveTopAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.moveTop : undefined;
    }

    get moveDownAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.moveDown : undefined;
    }

    get moveBottomAriaLabel() {
        return this.config.translation.aria ? this.config.translation.aria.moveBottom : undefined;
    }

    _componentStyle = inject(OrderListStyle);

    filterOptions: Nullable<OrderListFilterOptions>;

    d_selection: any[] = [];

    movedUp: Nullable<boolean>;

    movedDown: Nullable<boolean>;

    itemTouched: Nullable<boolean>;

    styleElement: any;

    id: string = uuid('pn_id_');

    public filterValue: Nullable<string>;

    public visibleOptions: Nullable<any[]>;

    filterService = inject(FilterService);

    constructor() {
        super();

        effect(() => {
            this.d_selection = this.selection();
        });

        effect(() => {
            const val = this.value();

            if (this.filterValue) {
                this.filter();
            } else if (this.dragdrop()) {
                // Initialize visibleOptions for drag&drop even when no filtering is active
                this.visibleOptions = [...(val || [])];
            }
        });
    }

    getButtonProps(direction: string) {
        switch (direction) {
            case 'up':
                return { ...this.buttonProps(), ...this.moveUpButtonProps() };
            case 'top':
                return { ...this.buttonProps(), ...this.moveTopButtonProps() };
            case 'down':
                return { ...this.buttonProps(), ...this.moveDownButtonProps() };
            case 'bottom':
                return { ...this.buttonProps(), ...this.moveBottomButtonProps() };
            default:
                return this.buttonProps();
        }
    }

    onInit() {
        if (this.responsive()) {
            this.createStyle();
        }

        if (this.filterBy()) {
            this.filterOptions = {
                filter: (value) => this.onFilterKeyup(value),
                reset: () => this.resetFilter()
            };
        }

        // Initialize visibleOptions for drag&drop if enabled and value exists
        if (this.dragdrop() && this.value() && !this.visibleOptions) {
            this.visibleOptions = [...this.value()!];
        }
    }

    readonly templates = contentChildren(PrimeTemplate);

    _itemTemplate: TemplateRef<OrderListItemTemplateContext> | undefined;

    _emptyMessageTemplate: TemplateRef<void> | undefined;

    _emptyFilterMessageTemplate: TemplateRef<void> | undefined;

    _filterTemplate: TemplateRef<OrderListFilterTemplateContext> | undefined;

    _headerTemplate: TemplateRef<void> | undefined;

    _moveUpIconTemplate: TemplateRef<void> | undefined;

    _moveTopIconTemplate: TemplateRef<void> | undefined;

    _moveDownIconTemplate: TemplateRef<void> | undefined;

    _moveBottomIconTemplate: TemplateRef<void> | undefined;

    _filterIconTemplate: TemplateRef<void> | undefined;

    onAfterContentInit() {
        this.templates().forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this._itemTemplate = item.template;
                    break;

                case 'empty':
                    this._emptyMessageTemplate = item.template;
                    break;

                case 'emptyfilter':
                    this._emptyFilterMessageTemplate = item.template;
                    break;

                case 'filter':
                    this._filterTemplate = item.template;
                    break;

                case 'header':
                    this._headerTemplate = item.template;
                    break;

                case 'moveupicon':
                    this._moveUpIconTemplate = item.template;
                    break;

                case 'movetopicon':
                    this._moveTopIconTemplate = item.template;
                    break;

                case 'movedownicon':
                    this._moveDownIconTemplate = item.template;
                    break;

                case 'movebottomicon':
                    this._moveBottomIconTemplate = item.template;
                    break;

                case 'filtericon':
                    this._filterIconTemplate = item.template;
                    break;

                default:
                    this._itemTemplate = item.template;
                    break;
            }
        });
    }

    onChangeSelection(e: ListboxChangeEvent) {
        this.d_selection = e.value;

        //binding
        this.selection.set(e.value);

        //event
        this.onSelectionChange.emit({ originalEvent: e.originalEvent, value: e.value });
    }

    onFilterKeyup(event: KeyboardEvent) {
        this.filterValue = ((<HTMLInputElement>event.target).value.trim() as any).toLocaleLowerCase(this.filterLocale());
        this.filter();

        this.onFilterEvent.emit({
            originalEvent: event,
            value: this.visibleOptions as any[]
        });
    }

    filter() {
        let searchFields: string[] = (this.filterBy() as string).split(',');

        this.visibleOptions = this.filterService.filter(this.value() as any[], searchFields, this.filterValue, this.filterMatchMode(), this.filterLocale());
    }

    /**
     * Callback to invoke on filter reset.
     * @group Method
     */
    public resetFilter() {
        this.filterValue = '';
        const filterViewChild = this.filterViewChild();

        filterViewChild && ((<HTMLInputElement>filterViewChild.nativeElement).value = '');
    }

    isItemVisible(item: any): boolean | undefined {
        if (this.filterValue && this.filterValue.trim().length) {
            for (let i = 0; i < (this.visibleOptions as any[]).length; i++) {
                if (item == (this.visibleOptions as any[])[i]) {
                    return true;
                }
            }
        } else {
            return true;
        }
    }

    isSelected(item: any) {
        return findIndexInList(item, this.d_selection) !== -1;
    }

    isEmpty() {
        const value = this.value();

        return this.filterValue ? !this.visibleOptions || this.visibleOptions.length === 0 : !value || value.length === 0;
    }

    moveUp() {
        const value = this.value();
        const selection = this.selection();

        if (selection && value instanceof Array) {
            // Sort selection by their current index to process them from top to bottom
            const sortedSelection = this.sortByIndexInList(selection, value);

            for (let selectedItem of sortedSelection) {
                let selectedItemIndex: number = findIndexInList(selectedItem, value);

                // Only move if not at top and there's a valid position above
                if (selectedItemIndex > 0) {
                    let movedItem = value[selectedItemIndex];
                    let temp = value[selectedItemIndex - 1];

                    value[selectedItemIndex - 1] = movedItem;
                    value[selectedItemIndex] = temp;
                }
                // Don't break - continue with other items even if one can't move
            }

            if (this.dragdrop()) {
                if (this.filterValue) {
                    this.filter();
                } else if (this.visibleOptions) {
                    // Update visibleOptions to match value when no filtering
                    this.visibleOptions = [...value];
                }
            }

            this.movedUp = true;
            this.onReorder.emit(selection);
        }

        this.listViewChild()?.cd?.markForCheck();
    }

    moveTop() {
        const selection = this.selection();
        let value = this.value();

        if (selection) {
            for (let i = selection.length - 1; i >= 0; i--) {
                let selectedItem = selection[i];
                let selectedItemIndex: number = findIndexInList(selectedItem, value || []);

                if (selectedItemIndex != 0 && value instanceof Array) {
                    let movedItem = value.splice(selectedItemIndex, 1)[0];

                    value.unshift(movedItem);
                } else {
                    break;
                }
            }

            if (this.dragdrop()) {
                if (this.filterValue) {
                    this.filter();
                } else if (this.visibleOptions) {
                    // Update visibleOptions to match value when no filtering
                    this.visibleOptions = [...(value || [])];
                }
            }

            this.onReorder.emit(selection);
            setTimeout(() => {
                this.listViewChild().scrollInView(0);
            });
        }

        this.listViewChild()?.cd?.markForCheck();
    }

    moveDown() {
        const value = this.value();
        const selection = this.selection();

        if (selection && value instanceof Array) {
            const sortedSelection = this.sortByIndexInList(selection, value).reverse();

            for (let selectedItem of sortedSelection) {
                let selectedItemIndex: number = findIndexInList(selectedItem, value);

                if (selectedItemIndex < value.length - 1) {
                    let movedItem = value[selectedItemIndex];
                    let temp = value[selectedItemIndex + 1];

                    value[selectedItemIndex + 1] = movedItem;
                    value[selectedItemIndex] = temp;
                }
            }

            if (this.dragdrop()) {
                if (this.filterValue) {
                    this.filter();
                } else if (this.visibleOptions) {
                    this.visibleOptions = [...value];
                }
            }

            this.movedDown = true;
            this.onReorder.emit(selection);
        }

        this.listViewChild()?.cd?.markForCheck();
    }

    moveBottom() {
        const selection = this.selection();
        let value = this.value();

        if (selection) {
            for (let i = 0; i < selection.length; i++) {
                let selectedItem = selection[i];
                let selectedItemIndex: number = findIndexInList(selectedItem, value || []);

                if (value instanceof Array && selectedItemIndex != value.length - 1) {
                    let movedItem = value.splice(selectedItemIndex, 1)[0];

                    value.push(movedItem);
                } else {
                    break;
                }
            }

            if (this.dragdrop()) {
                if (this.filterValue) {
                    this.filter();
                } else if (this.visibleOptions) {
                    this.visibleOptions = [...(value || [])];
                }
            }

            this.onReorder.emit(selection);
            this.listViewChild()?.scrollInView(value?.length ? value.length - 1 : 0);
        }

        this.listViewChild()?.cd?.markForCheck();
    }

    onDrop(event: CdkDragDrop<string[]>) {
        let previousIndex = event.previousIndex;
        let currentIndex = event.currentIndex;

        // Store the original state before any modifications
        const originalValue = [...(this.value() || [])];
        const originalVisibleOptions = this.visibleOptions ? [...this.visibleOptions] : null;

        if (previousIndex !== currentIndex) {
            // Determine items to move
            let itemsToMove: any[] = [];

            // Check if dragged item is in selected items AND we have multiple selections
            if (this.selection() && this.selection().length > 1 && findIndexInList(event.item.data, this.selection()) !== -1) {
                // Multi-selection: Move all selected items
                itemsToMove = [...this.selection()];

                // For multi-selection, restore original state to undo Listbox's automatic reordering
                const currentValue = this.value();

                if (currentValue) {
                    currentValue.length = 0;
                    currentValue.push(...originalValue);
                }

                if (originalVisibleOptions && this.visibleOptions) {
                    this.visibleOptions.length = 0;
                    this.visibleOptions.push(...originalVisibleOptions);
                }

                // Sort items by their index in the array to maintain relative order
                itemsToMove = this.sortByIndexInList(itemsToMove, this.value() || []);

                // Calculate how many selected items are before the drop position
                let itemsBefore = 0;

                for (const item of itemsToMove) {
                    const itemIndex = findIndexInList(item, this.value() || []);

                    if (itemIndex !== -1 && itemIndex < currentIndex) {
                        itemsBefore++;
                    }
                }

                // Remove all selected items (in reverse order to avoid index shifting)
                for (let i = itemsToMove.length - 1; i >= 0; i--) {
                    const itemIndex = findIndexInList(itemsToMove[i], this.value() || []);

                    if (itemIndex !== -1) {
                        this.value()?.splice(itemIndex, 1);
                    }
                }

                // Calculate the final target index
                // If we're dragging down, we need to subtract the number of items that were before the target
                const targetIndex = Math.max(0, currentIndex - itemsBefore);

                // Insert all selected items at the target position
                for (let i = 0; i < itemsToMove.length; i++) {
                    this.value()?.splice(targetIndex + i, 0, itemsToMove[i]);
                }

                // Update visibleOptions to match value
                if (this.dragdrop()) {
                    if (this.filterValue) {
                        this.filter();
                    } else if (this.visibleOptions) {
                        this.visibleOptions = [...(this.value() || [])];
                    }
                }

                // Ensure change detection runs
                this.cd?.markForCheck();

                this.onReorder.emit(itemsToMove);
            } else {
                // Single item: Move only the dragged item (let Listbox handle it)
                itemsToMove = [event.item.data];

                if (this.filterValue) {
                    previousIndex = findIndexInList(event.item.data, this.value() || []);
                    currentIndex = findIndexInList(this.visibleOptions?.[currentIndex], this.value() || []);
                }

                moveItemInArray(this.value() as any[], previousIndex, currentIndex);

                // Sync visibleOptions for non-filtered case
                if (this.dragdrop() && this.visibleOptions && !this.filterValue) {
                    this.visibleOptions = [...(this.value() || [])];
                }

                this.onReorder.emit([event.item.data]);
            }
        }
    }

    // Helper method to sort items by their index in a list
    private sortByIndexInList(items: any[], list: any[]): any[] {
        return items.sort((a, b) => {
            const indexA = findIndexInList(a, list);
            const indexB = findIndexInList(b, list);

            return indexA - indexB;
        });
    }

    onListFocus(event: any) {
        this.onFocus.emit(event);
    }

    onListBlur(event: any) {
        this.onBlur.emit(event);
    }

    getVisibleOptions() {
        const value = this.value();

        return this.visibleOptions && this.visibleOptions.length > 0 ? this.visibleOptions : value && value.length > 0 ? value : null;
    }

    moveDisabled() {
        if (this.disabled() || !this.selection().length) {
            return true;
        }
    }

    createStyle() {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.styleElement) {
                this.renderer.setAttribute(this.el.nativeElement.children[0], this.id, '');
                this.styleElement = this.renderer.createElement('style');
                this.renderer.setAttribute(this.styleElement, 'type', 'text/css');
                setAttribute(this.styleElement, 'nonce', this.config?.csp()?.nonce);
                this.renderer.appendChild(this.document.head, this.styleElement);

                let innerHTML = `
                    @media screen and (max-width: ${this.breakpoint()}) {
                        .p-orderlist[${this.$attrSelector}] {
                            flex-direction: column;
                        }

                        .p-orderlist[${this.$attrSelector}] .p-orderlist-controls {
                            padding: var(--content-padding);
                            flex-direction: row;
                        }

                        .p-orderlist[${this.$attrSelector}] .p-orderlist-controls .p-button {
                            margin-right: var(--inline-spacing);
                            margin-bottom: 0;
                        }

                        .p-orderlist[${this.$attrSelector}] .p-orderlist-controls .p-button:last-child {
                            margin-right: 0;
                        }
                    }
                `;

                this.renderer.setProperty(this.styleElement, 'innerHTML', innerHTML);
                setAttribute(this.styleElement, 'nonce', this.config?.csp()?.nonce);
            }
        }
    }

    destroyStyle() {
        if (isPlatformBrowser(this.platformId)) {
            if (this.styleElement) {
                this.renderer.removeChild(this.document, this.styleElement);
                this.styleElement = null;
            }
        }
    }

    onDestroy() {
        this.destroyStyle();
    }
}

@NgModule({
    imports: [OrderList, SharedModule],
    exports: [OrderList, SharedModule]
})
export class OrderListModule {}
