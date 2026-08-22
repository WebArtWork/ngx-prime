import { booleanAttribute, Directive, ElementRef, inject, input, model, output } from '@angular/core';
import type { FileSelectEvent } from 'primeng/types/fileupload';

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
        class: 'p-fileupload-input',
        '[attr.data-pc-name]': "'fileupload'",
        '[attr.data-pc-section]': "'input'",
        '[attr.data-p-invalid]': 'invalid() || null',
        '[attr.aria-label]': 'ariaLabel() || null',
        '[disabled]': 'disabled()',
        '[required]': 'required()',
        '(change)': 'onChange($event)',
        '(blur)': 'touch.emit()'
    }
})
export class FileUploadDirective {
    private element = inject<ElementRef<HTMLInputElement>>(ElementRef);

    invalid = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });
    ariaLabel = input<string>();
    /** Signal Forms value contract. Browsers only permit this value to be set by user selection. */
    value = model<FileList | null>(null);
    touch = output<void>();
    filesSelected = output<FileList | null>();
    onSelect = output<FileSelectEvent>();

    onChange(event: Event) {
        const files = this.element.nativeElement.files;

        this.value.set(files);
        this.filesSelected.emit(files);
        this.onSelect.emit({ originalEvent: event, files: files ? Array.from(files) : [], currentFiles: files ? Array.from(files) : [] });
    }
}
