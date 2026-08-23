import type { ElementRef, TemplateRef } from '@angular/core';
import type { OverlayOptions, PassThroughOptions, Translation } from '@wawjs/ngx-prime/api';
import type { AccordionPassThrough } from '@wawjs/ngx-prime/types/accordion';
import type { AutoCompletePassThrough } from '@wawjs/ngx-prime/types/autocomplete';
import type { AvatarPassThrough } from '@wawjs/ngx-prime/types/avatar';
import type { AvatarGroupPassThrough } from '@wawjs/ngx-prime/types/avatargroup';
import type { BadgePassThrough } from '@wawjs/ngx-prime/types/badge';
import type { BlockUIPassThrough } from '@wawjs/ngx-prime/types/blockui';
import type { BreadcrumbPassThrough } from '@wawjs/ngx-prime/types/breadcrumb';
import type { ButtonPassThrough } from '@wawjs/ngx-prime/types/button';
import type { CardPassThrough } from '@wawjs/ngx-prime/types/card';
import type { CarouselPassThrough } from '@wawjs/ngx-prime/types/carousel';
import type { CascadeSelectPassThrough } from '@wawjs/ngx-prime/types/cascadeselect';
import type { CheckboxPassThrough } from '@wawjs/ngx-prime/types/checkbox';
import type { ChipPassThrough } from '@wawjs/ngx-prime/types/chip';
import type { ColorPickerPassThrough } from '@wawjs/ngx-prime/types/colorpicker';
import type { ConfirmDialogPassThrough } from '@wawjs/ngx-prime/types/confirmdialog';
import type { ConfirmPopupPassThrough } from '@wawjs/ngx-prime/types/confirmpopup';
import type { DialogPassThrough } from '@wawjs/ngx-prime/types/dialog';
import type { DividerPassThrough } from '@wawjs/ngx-prime/types/divider';
import type { DockPassThrough } from '@wawjs/ngx-prime/types/dock';
import type { DrawerPassThrough } from '@wawjs/ngx-prime/types/drawer';
import type { EditorPassThrough } from '@wawjs/ngx-prime/types/editor';
import type { FieldsetPassThrough } from '@wawjs/ngx-prime/types/fieldset';
import type { FileUploadPassThrough } from '@wawjs/ngx-prime/types/fileupload';
import type { FloatLabelPassThrough } from '@wawjs/ngx-prime/types/floatlabel';
import type { FluidPassThrough } from '@wawjs/ngx-prime/types/fluid';
import type { GalleriaPassThrough } from '@wawjs/ngx-prime/types/galleria';
import type { IconFieldPassThrough } from '@wawjs/ngx-prime/types/iconfield';
import type { IftaLabelPassThrough } from '@wawjs/ngx-prime/types/iftalabel';
import type { ImagePassThrough } from '@wawjs/ngx-prime/types/image';
import type { ImageComparePassThrough } from '@wawjs/ngx-prime/types/imagecompare';
import type { InplacePassThrough } from '@wawjs/ngx-prime/types/inplace';
import type { InputGroupPassThrough } from '@wawjs/ngx-prime/types/inputgroup';
import type { InputGroupAddonPassThrough } from '@wawjs/ngx-prime/types/inputgroupaddon';
import type { InputIconPassThrough } from '@wawjs/ngx-prime/types/inputicon';
import type { InputMaskPassThrough } from '@wawjs/ngx-prime/types/inputmask';
import type { InputNumberPassThrough } from '@wawjs/ngx-prime/types/inputnumber';
import type { InputOtpPassThrough } from '@wawjs/ngx-prime/types/inputotp';
import type { InputTextPassThrough } from '@wawjs/ngx-prime/types/inputtext';
import type { KnobPassThrough } from '@wawjs/ngx-prime/types/knob';
import type { MegaMenuPassThrough } from '@wawjs/ngx-prime/types/megamenu';
import type { MenuPassThrough } from '@wawjs/ngx-prime/types/menu';
import type { MenubarPassThrough } from '@wawjs/ngx-prime/types/menubar';
import type { MessagePassThrough } from '@wawjs/ngx-prime/types/message';
import type { MeterGroupPassThrough } from '@wawjs/ngx-prime/types/metergroup';
import type { OrderListPassThrough } from '@wawjs/ngx-prime/types/orderlist';
import type { OrganizationChartPassThrough } from '@wawjs/ngx-prime/types/organizationchart';
import type { OverlayBadgePassThrough } from '@wawjs/ngx-prime/types/overlaybadge';
import type { PanelPassThrough } from '@wawjs/ngx-prime/types/panel';
import type { PanelMenuPassThrough } from '@wawjs/ngx-prime/types/panelmenu';
import type { PopoverPassThrough } from '@wawjs/ngx-prime/types/popover';
import type { ProgressBarPassThrough } from '@wawjs/ngx-prime/types/progressbar';
import type { ProgressSpinnerPassThrough } from '@wawjs/ngx-prime/types/progressspinner';
import type { RadioButtonPassThrough } from '@wawjs/ngx-prime/types/radiobutton';
import type { RatingPassThrough } from '@wawjs/ngx-prime/types/rating';
import type { VirtualScrollerPassThrough } from '@wawjs/ngx-prime/types/scroller';
import type { ScrollPanelPassThrough } from '@wawjs/ngx-prime/types/scrollpanel';
import type { ScrollTopPassThrough } from '@wawjs/ngx-prime/types/scrolltop';
import type { SelectPassThrough } from '@wawjs/ngx-prime/types/select';
import type { SelectButtonPassThrough } from '@wawjs/ngx-prime/types/selectbutton';
import type { SkeletonPassThrough } from '@wawjs/ngx-prime/types/skeleton';
import type { SliderPassThrough } from '@wawjs/ngx-prime/types/slider';
import type { SpeedDialPassThrough } from '@wawjs/ngx-prime/types/speeddial';
import type { SplitButtonPassThrough } from '@wawjs/ngx-prime/types/splitbutton';
import type { SplitterPassThrough } from '@wawjs/ngx-prime/types/splitter';
import type { StepperPassThrough } from '@wawjs/ngx-prime/types/stepper';
import type { ColumnFilterPassThrough, TablePassThrough } from '@wawjs/ngx-prime/types/table';
import type { TabListPassThrough, TabPanelPassThrough, TabPanelsPassThrough, TabPassThrough, TabsPassThrough } from '@wawjs/ngx-prime/types/tabs';
import type { TagPassThrough } from '@wawjs/ngx-prime/types/tag';
import type { TerminalPassThrough } from '@wawjs/ngx-prime/types/terminal';
import type { TieredMenuPassThrough } from '@wawjs/ngx-prime/types/tieredmenu';
import type { TimelinePassThrough } from '@wawjs/ngx-prime/types/timeline';
import type { ToastPassThrough } from '@wawjs/ngx-prime/types/toast';
import type { ToggleButtonPassThrough } from '@wawjs/ngx-prime/types/togglebutton';
import type { ToggleSwitchPassThrough } from '@wawjs/ngx-prime/types/toggleswitch';
import type { ToolbarPassThrough } from '@wawjs/ngx-prime/types/toolbar';
import type { TreePassThrough } from '@wawjs/ngx-prime/types/tree';
import type { TreeSelectPassThrough } from '@wawjs/ngx-prime/types/treeselect';
import type { TreeTablePassThrough } from '@wawjs/ngx-prime/types/treetable';

/** ZIndex configuration */
export type ZIndex = {
    modal: number;
    overlay: number;
    menu: number;
    tooltip: number;
};

/** Theme configuration */
export type ThemeType = { preset?: any; options?: any } | 'none' | boolean | undefined;

export type ThemeConfigType = {
    theme?: ThemeType;
    csp?: {
        nonce: string | undefined;
    };
};

export interface GlobalPassThrough {
    accordion?: AccordionPassThrough;
    autoComplete?: AutoCompletePassThrough;
    avatar?: AvatarPassThrough;
    avatarGroup?: AvatarGroupPassThrough;
    blockUI?: BlockUIPassThrough;
    breadcrumb?: BreadcrumbPassThrough;
    card?: CardPassThrough;
    carousel?: CarouselPassThrough;
    cascadeSelect?: CascadeSelectPassThrough;
    checkbox?: CheckboxPassThrough;
    chip?: ChipPassThrough;
    colorPicker?: ColorPickerPassThrough;
    columnFilter?: ColumnFilterPassThrough;
    confirmDialog?: ConfirmDialogPassThrough;
    confirmPopup?: ConfirmPopupPassThrough;
    dialog?: DialogPassThrough;
    divider?: DividerPassThrough;
    dock?: DockPassThrough;
    megaMenu?: MegaMenuPassThrough;
    drawer?: DrawerPassThrough;
    editor?: EditorPassThrough;
    fileUpload?: FileUploadPassThrough;
    floatLabel?: FloatLabelPassThrough;
    menu?: MenuPassThrough;
    menubar?: MenubarPassThrough;
    fluid?: FluidPassThrough;
    galleria?: GalleriaPassThrough;
    iconField?: IconFieldPassThrough;
    iftaLabel?: IftaLabelPassThrough;
    inputIcon?: InputIconPassThrough;
    image?: ImagePassThrough;
    imageCompare?: ImageComparePassThrough;
    inplace?: InplacePassThrough;
    inputText?: InputTextPassThrough;
    inputGroup?: InputGroupPassThrough;
    inputGroupAddon?: InputGroupAddonPassThrough;
    inputMask?: InputMaskPassThrough;
    inputNumber?: InputNumberPassThrough;
    inputOtp?: InputOtpPassThrough;
    knob?: KnobPassThrough;
    popover?: PopoverPassThrough;
    message?: MessagePassThrough;
    meterGroup?: MeterGroupPassThrough;
    orderList?: OrderListPassThrough;
    organizationChart?: OrganizationChartPassThrough;
    overlayBadge?: OverlayBadgePassThrough;
    progressBar?: ProgressBarPassThrough;
    progressSpinner?: ProgressSpinnerPassThrough;
    radioButton?: RadioButtonPassThrough;
    rating?: RatingPassThrough;
    virtualScroller?: VirtualScrollerPassThrough;
    scrollPanel?: ScrollPanelPassThrough;
    scrollTop?: ScrollTopPassThrough;
    select?: SelectPassThrough;
    selectButton?: SelectButtonPassThrough;
    skeleton?: SkeletonPassThrough;
    slider?: SliderPassThrough;
    speedDial?: SpeedDialPassThrough;
    splitButton?: SplitButtonPassThrough;
    splitter?: SplitterPassThrough;
    stepper?: StepperPassThrough;
    tabs?: TabsPassThrough;
    tab?: TabPassThrough;
    tabList?: TabListPassThrough;
    tabPanel?: TabPanelPassThrough;
    tabPanels?: TabPanelsPassThrough;
    table?: TablePassThrough;
    tieredMenu?: TieredMenuPassThrough;
    timeline?: TimelinePassThrough;
    tag?: TagPassThrough;
    terminal?: TerminalPassThrough;
    toast?: ToastPassThrough;
    toggleButton?: ToggleButtonPassThrough;
    toggleSwitch?: ToggleSwitchPassThrough;
    toolbar?: ToolbarPassThrough;
    tree?: TreePassThrough;
    treeSelect?: TreeSelectPassThrough;
    treeTable?: TreeTablePassThrough;
    panel?: PanelPassThrough;
    panelMenu?: PanelMenuPassThrough;
    button?: ButtonPassThrough;
    badge?: BadgePassThrough;
    fieldset?: FieldsetPassThrough;
    global?: {
        css?: string;
    };
    [key: string]: any;
}

export type NgxPrimeConfigType = {
    ripple?: boolean;
    overlayAppendTo?: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any;
    /**
     * @deprecated Since v20. Use `inputVariant` instead.
     */
    inputStyle?: 'outlined' | 'filled';
    inputVariant?: 'outlined' | 'filled';
    overlayOptions?: OverlayOptions;
    translation?: Translation;
    /**
     * @experimental
     * This property is not yet implemented. It will be available in a future release.
     */
    unstyled?: boolean;
    zIndex?: ZIndex | null | undefined;
    pt?: GlobalPassThrough | null | undefined;
    ptOptions?: PassThroughOptions | null | undefined;
    filterMatchModeOptions?: any;
} & ThemeConfigType;
