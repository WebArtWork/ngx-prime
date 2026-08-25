import { DOCUMENT } from '@angular/common';
import { EnvironmentProviders, InjectionToken, Service, inject, makeEnvironmentProviders, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
    /**
     * CSS selector `Theme` toggles on `<html>` to switch mode — a
     * class (`'.p-dark'`) or an attribute (`"[data-mode='dark']"`). Defaults
     * to `'.p-dark'`. Owned entirely by `Theme` — configure it here,
     * not by reading anything from `provideNgxPrime`. If your preset's own
     * dark tokens should track this too, pass the same value to
     * `provideNgxPrime({ theme: { options: { darkModeSelector } } })`
     * explicitly.
     */
    darkModeSelector?: string;
    /** `localStorage` key used to persist the chosen mode. Defaults to `'ngx-prime-theme'`. */
    storageKey?: string;
}

const DEFAULT_CONFIG: Required<ThemeConfig> = {
    darkModeSelector: '.p-dark',
    storageKey: 'ngx-prime-theme'
};

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');

export function provideTheme(config: ThemeConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([{ provide: THEME_CONFIG, useValue: config }]);
}

/**
 * Generic runtime dark/light mode manager, plus a small escape hatch for
 * arbitrary app-owned design tokens (e.g. a density scale) that have no
 * ngx-prime equivalent.
 *
 * Owns its own `darkModeSelector` (configurable via `provideTheme`,
 * default `.p-dark`) rather than reading it from `provideNgxPrime`'s theme
 * config — the two are deliberately independent. If a consuming app wants
 * ngx-prime's own dark tokens to follow the same toggle, it passes the same
 * selector to `provideNgxPrime({ theme: { options: { darkModeSelector } } })`
 * itself.
 */
@Service()
export class Theme {
    private readonly document: Document = inject(DOCUMENT);
    private readonly config: Required<ThemeConfig> = {
        ...DEFAULT_CONFIG,
        ...inject(THEME_CONFIG, { optional: true })
    };

    readonly mode = signal<ThemeMode>(this.restore());

    constructor() {
        this.apply(this.mode());
    }

    setMode(mode: ThemeMode): void {
        this.mode.set(mode);
        this.apply(mode);
        this.persist(mode);
    }

    toggle(): void {
        this.setMode(this.mode() === 'dark' ? 'light' : 'dark');
    }

    /**
     * Writes an arbitrary named group of CSS custom properties to `target`
     * (defaults to `<html>`). Not tied to any naming convention — use it for
     * app-owned tokens ngx-prime has no concept of, e.g.:
     * `theme.setTokens({ '--sp-1': '2px', '--sp-2': '6px' })`.
     */
    setTokens(vars: Record<string, string>, target: HTMLElement = this.document.documentElement): void {
        for (const [name, value] of Object.entries(vars)) {
            target.style.setProperty(name.startsWith('--') ? name : `--${name}`, value);
        }
    }

    private apply(mode: ThemeMode): void {
        const selector = this.config.darkModeSelector;
        const root = this.document.documentElement;
        const isDark = mode === 'dark';

        const attrMatch = /^\[(.+?)(?:=['"]?(.+?)['"]?)?\]$/.exec(selector);
        if (attrMatch) {
            const [, attr, value] = attrMatch;
            if (isDark) root.setAttribute(attr, value ?? '');
            else root.removeAttribute(attr);
            return;
        }

        if (selector.startsWith('.')) {
            root.classList.toggle(selector.slice(1), isDark);
        }
    }

    private restore(): ThemeMode {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored === 'light' || stored === 'dark') return stored;
        } catch {
            // ignore read failures (e.g. storage disabled)
        }

        return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    private persist(mode: ThemeMode): void {
        try {
            localStorage.setItem(this.config.storageKey, mode);
        } catch {
            // ignore write failures (e.g. storage disabled/full)
        }
    }
}
