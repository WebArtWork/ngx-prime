# Installation

Setting up ngx-prime in an Angular CLI project.

## Download-

ngx-prime is available for download on the npm registry .

```bash
# Using npm
npm install ngx-prime @wawjs/css-prime-themes

# Using yarn
yarn add ngx-prime @wawjs/css-prime-themes

# Using pnpm
pnpm add ngx-prime @wawjs/css-prime-themes
```

## Examples-

An example starter with Angular CLI is available at GitHub .

## Nextsteps-

Welcome to the Prime UI Ecosystem! Once you have ngx-prime up and running, we recommend exploring the following resources to gain a deeper understanding of the library. Global configuration Customization of styles Getting support

## Provider-

Add provideNgxPrime to the list of providers in your app.config.ts and use the theme property to configure a theme such as Aura.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideNgxPrime } from '@wawjs/ngx-prime/config';
import Aura from '@wawjs/css-prime-themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        provideNgxPrime({
            theme: {
                preset: Aura
            }
        })
    ]
};
```

## Theme-

Configure ngx-prime to use a theme like Aura.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgxPrime } from '@wawjs/ngx-prime/config';
import Aura from '@wawjs/css-prime-themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        provideNgxPrime({
            theme: Aura
        })
    ]
};
```

## Verify-

Verify your setup by adding a component such as Button. Each component can be imported and registered individually so that you only include what you use for bundle optimization. Import path is available in the documentation of the corresponding component.

## Videos

Angular CLI is the recommended way to build Angular applications with ngx-prime.

