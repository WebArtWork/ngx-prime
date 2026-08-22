import { Injectable } from '@angular/core';
import { style } from '@wawjs/css-prime-styles/fileupload';
import { BaseStyle } from 'ngx-prime/base';

const nativeStyle = `
input[pFileUpload] { cursor: pointer; }
input[pFileUpload].p-invalid { outline: 1px solid dt('fileupload.invalid.border.color'); outline-offset: 2px; }
input[pFileUpload]:disabled { cursor: default; opacity: .6; }
`;

const classes = {
    input: 'p-fileupload-input p-component',
    root: ({ instance }) => `p-fileupload p-fileupload-${instance.mode()} p-component`,
    header: 'p-fileupload-header',
    pcChooseButton: 'p-fileupload-choose-button',
    pcUploadButton: 'p-fileupload-upload-button',
    pcCancelButton: 'p-fileupload-cancel-button',
    content: 'p-fileupload-content',
    fileList: 'p-fileupload-file-list',
    file: 'p-fileupload-file',
    fileThumbnail: 'p-fileupload-file-thumbnail',
    fileInfo: 'p-fileupload-file-info',
    fileName: 'p-fileupload-file-name',
    fileSize: 'p-fileupload-file-size',
    pcFileBadge: 'p-fileupload-file-badge',
    fileActions: 'p-fileupload-file-actions',
    pcFileRemoveButton: 'p-fileupload-file-remove-button',
    basicContent: 'p-fileupload-basic-content'
};

@Injectable()
export class FileUploadStyle extends BaseStyle {
    name = 'fileupload';

    style = `${style}\n${nativeStyle}`;

    classes = classes;
}

/**
 *
 * FileUpload is an advanced uploader with dragdrop support, multi file uploads, auto uploading, progress tracking and validations.
 *
 * [Live Demo](https://www.ngx-prime.org/fileupload/)
 *
 * @module fileuploadstyle
 *
 */

export enum FileUploadClasses {
    /**
     * Class name of the root element
     */
    root = 'p-fileupload',
    /**
     * Class name of the header element
     */
    header = 'p-fileupload-header',
    /**
     * Class name of the choose button element
     */
    pcChooseButton = 'p-fileupload-choose-button',
    /**
     * Class name of the upload button element
     */
    pcUploadButton = 'p-fileupload-upload-button',
    /**
     * Class name of the cancel button element
     */
    pcCancelButton = 'p-fileupload-cancel-button',
    /**
     * Class name of the content element
     */
    content = 'p-fileupload-content',
    /**
     * Class name of the file list element
     */
    fileList = 'p-fileupload-file-list',
    /**
     * Class name of the file element
     */
    file = 'p-fileupload-file',
    /**
     * Class name of the file thumbnail element
     */
    fileThumbnail = 'p-fileupload-file-thumbnail',
    /**
     * Class name of the file info element
     */
    fileInfo = 'p-fileupload-file-info',
    /**
     * Class name of the file name element
     */
    fileName = 'p-fileupload-file-name',
    /**
     * Class name of the file size element
     */
    fileSize = 'p-fileupload-file-size',
    /**
     * Class name of the file badge element
     */
    pcFileBadge = 'p-fileupload-file-badge',
    /**
     * Class name of the file actions element
     */
    fileActions = 'p-fileupload-file-actions',
    /**
     * Class name of the file remove button element
     */
    pcFileRemoveButton = 'p-fileupload-file-remove-button',
    /**
     * Class name of the content in basic mode
     */
    basicContent = 'p-fileupload-basic-content'
}
