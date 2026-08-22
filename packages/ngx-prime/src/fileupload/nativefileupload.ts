import { booleanAttribute, DestroyRef, Directive, ElementRef, inject, input, model, numberAttribute, OnInit, output } from '@angular/core';
import { BaseModelHolder } from 'primeng/basemodelholder';
import { Bind } from 'primeng/bind';
import type { FileSelectEvent, FileUploadPassThrough, NativeFileUploadValidationErrorEvent } from 'primeng/types/fileupload';
import { FileUploadStyle } from './style/fileuploadstyle';

/**
 * Adds Prime state attributes to a native file input and emits its selected files.
 * The browser remains responsible for file selection and form integration.
 *
 * @group Components
 */
@Directive({
    selector: "input[type='file'][pFileUpload]",
    standalone: true,
    host: {
        '[class]': "cx('input')",
        '[class.p-invalid]': 'invalid()',
        '[attr.data-pc-name]': "'fileupload'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[attr.aria-labelledby]': 'ariaLabelledBy() || null',
        '[attr.aria-describedby]': 'ariaDescribedBy() || null',
        '[attr.id]': 'inputId() || null',
        '[attr.name]': 'name() || null',
        '[attr.accept]': 'accept() || null',
        '[multiple]': 'multiple()',
        '[attr.capture]': 'capture() || null',
        '[attr.webkitdirectory]': 'webkitdirectory() || null',
        '[attr.tabindex]': 'tabindex() ?? null',
        '[autofocus]': 'autofocus()',
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '(change)': 'onChange($event)',
        '(focus)': 'onFocus.emit($event)',
        '(blur)': 'onInputBlur($event)'
    },
    providers: [FileUploadStyle],
    hostDirectives: [Bind],
    exportAs: 'pFileUpload'
})
export class FileUploadDirective extends BaseModelHolder<FileUploadPassThrough> {
    componentName = 'FileUpload';

    private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    private readonly bindDirectiveInstance = inject(Bind, { self: true });

    _componentStyle = inject(FileUploadStyle);

    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    accept = input<string>();
    multiple = input(false, { transform: booleanAttribute });
    capture = input<string>();
    webkitdirectory = input(false, { transform: booleanAttribute });
    inputId = input<string>();
    name = input<string>();
    tabindex = input<number, unknown>(undefined, { transform: numberAttribute });
    autofocus = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    ariaLabelledBy = input<string>();
    ariaDescribedBy = input<string>();
    maxFileSize = input<number, unknown>(undefined, { transform: numberAttribute });
    fileLimit = input<number, unknown>(undefined, { transform: numberAttribute });
    allowDuplicate = input(false, { transform: booleanAttribute });
    /** Signal Forms value contract. Browsers only permit this value to be set by user selection. */
    value = model<File[]>([]);
    touch = output<void>();
    filesSelected = output<File[]>();
    onSelect = output<FileSelectEvent>();
    onError = output<NativeFileUploadValidationErrorEvent>();
    onClear = output<void>();
    onFocus = output<FocusEvent>();
    onBlur = output<FocusEvent>();

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptm('input'));
    }

    onChange(event: Event) {
        const files = Array.from(this.element.nativeElement.files ?? []);
        const validationError = this.getValidationError(files);

        if (validationError) {
            this.element.nativeElement.value = '';
            this.value.set([]);
            this.writeModelValue([]);
            this.onError.emit({ originalEvent: event, files, reason: validationError });

            return;
        }

        this.value.set(files);
        this.filesSelected.emit(files);
        this.writeModelValue(files);
        this.onSelect.emit({ originalEvent: event, files, currentFiles: files });
    }

    clear() {
        if (this.disabled()) return;

        this.element.nativeElement.value = '';
        this.value.set([]);
        this.writeModelValue([]);
        this.filesSelected.emit([]);
        this.onClear.emit();
    }

    focus(options?: FocusOptions) {
        this.element.nativeElement.focus(options);
    }

    choose() {
        if (!this.disabled()) this.element.nativeElement.click();
    }

    private onInputBlur(event: FocusEvent) {
        this.touch.emit();
        this.onBlur.emit(event);
    }

    private getValidationError(files: File[]): NativeFileUploadValidationErrorEvent['reason'] | undefined {
        const fileLimit = this.fileLimit();
        const maxFileSize = this.maxFileSize();

        if (fileLimit !== undefined && files.length > fileLimit) return 'fileLimit';
        if (maxFileSize !== undefined && files.some((file) => file.size > maxFileSize)) return 'maxFileSize';
        if (!this.allowDuplicate() && new Set(files.map((file) => `${file.name}:${file.size}:${file.lastModified}`)).size !== files.length) return 'duplicate';

        return undefined;
    }
}

/** Clears the selected files of a native `pFileUpload` input. */
@Directive({
    selector: 'button[pFileUploadClear]',
    standalone: true,
    host: {
        type: 'button',
        '[disabled]': 'uploader().disabled()',
        '(click)': 'uploader().clear()'
    }
})
export class FileUploadClearDirective {
    uploader = input.required<FileUploadDirective>({ alias: 'pFileUploadClear' });
}

/** Holds an explicit native upload queue and optionally sends it with XMLHttpRequest. */
@Directive({ selector: '[pFileUploadQueue]', standalone: true, exportAs: 'pFileUploadQueue', host: { '[attr.data-pc-name]': "'fileupload'", '[attr.data-pc-section]': "'queue'", '[attr.aria-busy]': 'uploading() || null' } })
export class FileUploadQueueDirective implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private request?: XMLHttpRequest;
    uploader = input.required<FileUploadDirective>({ alias: 'pFileUploadQueue' });
    url = input<string>();
    method = input<'post' | 'put'>('post');
    name = input('files');
    headers = input<Record<string, string>>({});
    withCredentials = input(false, { transform: booleanAttribute });
    auto = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    files = model<File[]>([]);
    uploadedFiles = model<File[]>([]);
    progress = model(0);
    uploading = model(false);
    onSelect = output<File[]>();
    onBeforeUpload = output<FormData>();
    onSend = output<{ originalEvent: Event; formData: FormData }>();
    onProgress = output<{ originalEvent: ProgressEvent; progress: number }>();
    onUpload = output<{ originalEvent: Event; files: File[] }>();
    onError = output<{ originalEvent?: Event; files: File[]; error?: unknown }>();
    onRemove = output<{ originalEvent?: Event; file: File }>();
    onClear = output<void>();
    ngOnInit() {
        const subscription = this.uploader().filesSelected.subscribe((files) => this.add(files));

        this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
    add(files: File[]) {
        if (this.disabled()) return;
        const next = [...this.files()];

        for (const file of files) if (!next.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) next.push(file);
        this.files.set(next);
        this.onSelect.emit(next);
        if (this.auto() && next.length) this.upload();
    }
    remove(file: File, event?: Event) {
        this.files.set(this.files().filter((item) => item !== file));
        this.onRemove.emit({ originalEvent: event, file });
    }
    clear() {
        if (this.uploading()) this.cancel();
        this.files.set([]);
        this.progress.set(0);
        this.uploader().clear();
        this.onClear.emit();
    }
    choose() {
        this.uploader().choose();
    }
    cancel() {
        this.request?.abort();
        this.request = undefined;
        this.uploading.set(false);
        this.progress.set(0);
    }
    upload() {
        const files = this.files(),
            url = this.url();

        if (!files.length || !url || this.disabled() || this.uploading()) return;
        const formData = new FormData();

        files.forEach((file) => formData.append(this.name(), file, file.name));
        this.onBeforeUpload.emit(formData);
        const request = (this.request = new XMLHttpRequest());

        request.open(this.method().toUpperCase(), url);
        request.withCredentials = this.withCredentials();
        Object.entries(this.headers()).forEach(([key, value]) => request.setRequestHeader(key, value));

        request.upload.onprogress = (event) => {
            const progress = event.lengthComputable ? Math.round((event.loaded * 100) / event.total) : 0;

            this.progress.set(progress);
            this.onProgress.emit({ originalEvent: event, progress });
        };

        request.onload = () => {
            this.uploading.set(false);
            if (request.status >= 200 && request.status < 300) {
                this.uploadedFiles.set([...this.uploadedFiles(), ...files]);
                this.files.set([]);
                this.onUpload.emit({ originalEvent: request, files });
            } else this.onError.emit({ originalEvent: request, files });
            this.progress.set(0);
            this.request = undefined;
        };

        request.onerror = () => {
            this.uploading.set(false);
            this.onError.emit({ originalEvent: request, files });
            this.request = undefined;
        };

        this.uploading.set(true);
        request.send(formData);
        this.onSend.emit({ originalEvent: request, formData });
    }
}
@Directive({ selector: 'button[pFileUploadChoose]', standalone: true, host: { type: 'button', '(click)': 'queue().choose()' } })
export class FileUploadChooseDirective {
    queue = input.required<FileUploadQueueDirective>({ alias: 'pFileUploadChoose' });
}
@Directive({ selector: 'button[pFileUploadUpload]', standalone: true, host: { type: 'button', '[disabled]': 'queue().uploading() || !queue().files().length', '(click)': 'queue().upload()' } })
export class FileUploadUploadDirective {
    queue = input.required<FileUploadQueueDirective>({ alias: 'pFileUploadUpload' });
}
@Directive({ selector: 'button[pFileUploadCancel]', standalone: true, host: { type: 'button', '[disabled]': '!queue().uploading()', '(click)': 'queue().cancel()' } })
export class FileUploadCancelDirective {
    queue = input.required<FileUploadQueueDirective>({ alias: 'pFileUploadCancel' });
}
@Directive({ selector: '[pFileUploadDropZone]', standalone: true, host: { '(dragover)': 'onDragOver($event)', '(drop)': 'onDrop($event)' } })
export class FileUploadDropZoneDirective {
    queue = input.required<FileUploadQueueDirective>({ alias: 'pFileUploadDropZone' });
    onDragOver(event: DragEvent) {
        event.preventDefault();
    }
    onDrop(event: DragEvent) {
        event.preventDefault();
        this.queue().add(Array.from(event.dataTransfer?.files ?? []));
    }
}
