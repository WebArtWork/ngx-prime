import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, effect, ElementRef, inject, InjectionToken, input, NgModule, OnDestroy, ViewEncapsulation, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@wawjs/ngx-prime/api';
import { BaseComponent, PARENT_INSTANCE } from '@wawjs/ngx-prime/basecomponent';
import { Bind } from '@wawjs/ngx-prime/bind';
import { TerminalPassThrough } from '@wawjs/ngx-prime/types/terminal';
import { Subscription } from 'rxjs';
import { TerminalStyle } from './style/terminalstyle';
import { TerminalService } from './terminalservice';

const TERMINAL_INSTANCE = new InjectionToken<Terminal>('TERMINAL_INSTANCE');

/**
 * Terminal is a text based user interface.
 * @group Components
 */
@Component({
    selector: 'p-terminal',
    standalone: true,
    imports: [FormsModule, SharedModule, Bind],
    template: `
        @if (welcomeMessage()) {
            <div [class]="cx('welcomeMessage')" [pBind]="ptm('welcomeMessage')">{{ welcomeMessage() }}</div>
        }
        <div [class]="cx('commandList')" [pBind]="ptm('commandList')">
            @for (command of commands; track command) {
                <div [class]="cx('command')" [pBind]="ptm('command')">
                    <span [class]="cx('promptLabel')" [pBind]="ptm('promptLabel')">{{ prompt() }}</span>
                    <span [class]="cx('commandValue')" [pBind]="ptm('commandValue')">{{ command.text }}</span>
                    <div [class]="cx('commandResponse')" [pBind]="ptm('commandResponse')" [attr.aria-live]="'polite'">{{ command.response }}</div>
                </div>
            }
        </div>
        <div [class]="cx('prompt')" [pBind]="ptm('prompt')">
            <span [class]="cx('promptLabel')" [pBind]="ptm('promptLabel')">{{ prompt() }}</span>
            <input
                #in
                type="text"
                [(ngModel)]="command"
                [class]="cx('promptValue')"
                [pBind]="ptm('promptValue')"
                autocomplete="off"
                (keydown)="handleCommand($event)"
                autofocus
                [attr.aria-label]="ariaLabel()"
                [attr.aria-labelledby]="ariaLabelledBy()"
            />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [TerminalStyle, { provide: TERMINAL_INSTANCE, useExisting: Terminal }, { provide: PARENT_INSTANCE, useExisting: Terminal }],
    host: {
        '[class]': "cn(cx('root'), styleClass())",
        '(click)': 'onHostClick()'
    },
    hostDirectives: [Bind]
})
export class Terminal extends BaseComponent<TerminalPassThrough> implements AfterViewInit, AfterViewChecked, OnDestroy {
    terminalService = inject(TerminalService);

    componentName = 'Terminal';
    $pcTerminal: Terminal | undefined = inject(TERMINAL_INSTANCE, { optional: true, skipSelf: true }) ?? undefined;

    bindDirectiveInstance = inject(Bind, { self: true });

    /**
     * Initial text to display on terminal.
     * @group Props
     */
    welcomeMessage = input<string>();
    /**
     * Prompt text for each command.
     * @group Props
     */
    prompt = input<string>();
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    styleClass = input<string>();
    /**
     * Response to display for the last command.
     * @group Props
     */
    response = input<string>();
    /**
     * Establishes a string value that labels the command input element for accessibility.
     * @group Props
     */
    ariaLabel = input<string>();
    /**
     * Establishes relationships between the command input element and its label(s) for accessibility.
     * @group Props
     */
    ariaLabelledBy = input<string>();

    commands: any[] = [];

    command!: string;

    container!: Element;

    commandProcessed!: boolean;

    subscription: Subscription;

    _componentStyle = inject(TerminalStyle);

    readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('in');

    onHostClick() {
        this.focus(this.inputRef()?.nativeElement);
    }

    constructor() {
        super();
        const terminalService = this.terminalService;

        this.subscription = terminalService.responseHandler.subscribe((response) => {
            this.commands[this.commands.length - 1].response = response;
            this.commandProcessed = true;
        });

        effect(() => {
            const value = this.response();

            if (value) {
                this.commands[this.commands.length - 1].response = value;
                this.commandProcessed = true;
            }
        });
    }

    onAfterViewInit() {
        this.container = this.el.nativeElement;
    }

    onAfterViewChecked() {
        this.bindDirectiveInstance.setAttrs(this.ptms(['host', 'root']));

        if (this.commandProcessed) {
            this.container.scrollTop = this.container.scrollHeight;
            this.commandProcessed = false;
        }
    }

    handleCommand(event: KeyboardEvent) {
        if (event.keyCode == 13) {
            this.commands.push({ text: this.command });
            this.terminalService.sendCommand(this.command);
            this.command = '';
        }
    }

    focus(element: HTMLElement) {
        element.focus();
    }

    onDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

@NgModule({
    exports: [Terminal, SharedModule],
    imports: [Terminal, SharedModule]
})
export class TerminalModule {}
