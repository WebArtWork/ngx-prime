import type { ElementRef, TemplateRef } from '@angular/core';
import type { OverlayOptions, PassThroughOptions, Translation } from 'ngx-prime/api';
import type { AccordionPassThrough } from 'ngx-prime/types/accordion';
import type { AutoCompletePassThrough } from 'ngx-prime/types/autocomplete';
import type { AvatarPassThrough } from 'ngx-prime/types/avatar';
import type { AvatarGroupPassThrough } from 'ngx-prime/types/avatargroup';
import type { BadgePassThrough } from 'ngx-prime/types/badge';
import type { BlockUIPassThrough } from 'ngx-prime/types/blockui';
import type { BreadcrumbPassThrough } from 'ngx-prime/types/breadcrumb';
import type { ButtonPassThrough } from 'ngx-prime/types/button';
import type { CardPassThrough } from 'ngx-prime/types/card';
import type { CarouselPassThrough } from 'ngx-prime/types/carousel';
import type { CascadeSelectPassThrough } from 'ngx-prime/types/cascadeselect';
import type { CheckboxPassThrough } from 'ngx-prime/types/checkbox';
import type { ChipPassThrough } from 'ngx-prime/types/chip';
import type { ColorPickerPassThrough } from 'ngx-prime/types/colorpicker';
import type { ConfirmDialogPassThrough } from 'ngx-prime/types/confirmdialog';
import type { ConfirmPopupPassThrough } from 'ngx-prime/types/confirmpopup';
import type { DialogPassThrough } from 'ngx-prime/types/dialog';
import type { DividerPassThrough } from 'ngx-prime/types/divider';
import type { DockPassThrough } from 'ngx-prime/types/dock';
import type { DrawerPassThrough } from 'ngx-prime/types/drawer';
import type { EditorPassThrough } from 'ngx-prime/types/editor';
import type { FieldsetPassThrough } from 'ngx-prime/types/fieldset';
import type { FileUploadPassThrough } from 'ngx-prime/types/fileupload';
import type { FloatLabelPassThrough } from 'ngx-prime/types/floatlabel';
import type { FluidPassThrough } from 'ngx-prime/types/fluid';
import type { GalleriaPassThrough } from 'ngx-prime/types/galleria';
import type { IconFieldPassThrough } from 'ngx-prime/types/iconfield';
import type { IftaLabelPassThrough } from 'ngx-prime/types/iftalabel';
import type { ImagePassThrough } from 'ngx-prime/types/image';
import type { ImageComparePassThrough } from 'ngx-prime/types/imagecompare';
import type { InplacePassThrough } from 'ngx-prime/types/inplace';
import type { InputGroupPassThrough } from 'ngx-prime/types/inputgroup';
import type { InputGroupAddonPassThrough } from 'ngx-prime/types/inputgroupaddon';
import type { InputIconPassThrough } from 'ngx-prime/types/inputicon';
import type { InputMaskPassThrough } from 'ngx-prime/types/inputmask';
import type { InputNumberPassThrough } from 'ngx-prime/types/inputnumber';
import type { InputOtpPassThrough } from 'ngx-prime/types/inputotp';
import type { InputTextPassThrough } from 'ngx-prime/types/inputtext';
import type { KnobPassThrough } from 'ngx-prime/types/knob';
import type { MegaMenuPassThrough } from 'ngx-prime/types/megamenu';
import type { MenuPassThrough } from 'ngx-prime/types/menu';
import type { MenubarPassThrough } from 'ngx-prime/types/menubar';
import type { MessagePassThrough } from 'ngx-prime/types/message';
import type { MeterGroupPassThrough } from 'ngx-prime/types/metergroup';
import type { OrderListPassThrough } from 'ngx-prime/types/orderlist';
import type { OrganizationChartPassThrough } from 'ngx-prime/types/organizationchart';
import type { OverlayBadgePassThrough } from 'ngx-prime/types/overlaybadge';
import type { PanelPassThrough } from 'ngx-prime/types/panel';
import type { PanelMenuPassThrough } from 'ngx-prime/types/panelmenu';
import type { PopoverPassThrough } from 'ngx-prime/types/popover';
import type { ProgressBarPassThrough } from 'ngx-prime/types/progressbar';
import type { ProgressSpinnerPassThrough } from 'ngx-prime/types/progressspinner';
import type { RadioButtonPassThrough } from 'ngx-prime/types/radiobutton';
import type { RatingPassThrough } from 'ngx-prime/types/rating';
import type { VirtualScrollerPassThrough } from 'ngx-prime/types/scroller';
import type { ScrollPanelPassThrough } from 'ngx-prime/types/scrollpanel';
import type { ScrollTopPassThrough } from 'ngx-prime/types/scrolltop';
import type { SelectPassThrough } from 'ngx-prime/types/select';
import type { SelectButtonPassThrough } from 'ngx-prime/types/selectbutton';
import type { SkeletonPassThrough } from 'ngx-prime/types/skeleton';
import type { SliderPassThrough } from 'ngx-prime/types/slider';
import type { SpeedDialPassThrough } from 'ngx-prime/types/speeddial';
import type { SplitButtonPassThrough } from 'ngx-prime/types/splitbutton';
import type { SplitterPassThrough } from 'ngx-prime/types/splitter';
import type { StepperPassThrough } from 'ngx-prime/types/stepper';
import type { ColumnFilterPassThrough, TablePassThrough } from 'ngx-prime/types/table';
import type { TabListPassThrough, TabPanelPassThrough, TabPanelsPassThrough, TabPassThrough, TabsPassThrough } from 'ngx-prime/types/tabs';
import type { TagPassThrough } from 'ngx-prime/types/tag';
import type { TerminalPassThrough } from 'ngx-prime/types/terminal';
import type { TieredMenuPassThrough } from 'ngx-prime/types/tieredmenu';
import type { TimelinePassThrough } from 'ngx-prime/types/timeline';
import type { ToastPassThrough } from 'ngx-prime/types/toast';
import type { ToggleButtonPassThrough } from 'ngx-prime/types/togglebutton';
import type { ToggleSwitchPassThrough } from 'ngx-prime/types/toggleswitch';
import type { ToolbarPassThrough } from 'ngx-prime/types/toolbar';
import type { TreePassThrough } from 'ngx-prime/types/tree';
import type { TreeSelectPassThrough } from 'ngx-prime/types/treeselect';
import type { TreeTablePassThrough } from 'ngx-prime/types/treetable';

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
