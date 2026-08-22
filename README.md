# ngx-prime

**An MIT-licensed Angular UI component library continuing from the PrimeNG v21 codebase.**

### About ngx-prime

ngx-prime is an independent, free and open-source Angular UI library maintained by Web Art Work and contributors.

The project continues development from the MIT-licensed PrimeNG v21.1.9 codebase and will remain MIT licensed.

### Why this project exists

We love and greatly appreciate the work created by the PrimeNG team and community over the years.

**We hoped to see PrimeNG v22+ continue as an open-source MIT-licensed project. When that direction changed, we decided to continue the final MIT-licensed v21 codebase independently through ngx-prime on Angular v22+.**

Our goal is to preserve and build upon the substantial work already contributed by the PrimeNG team and community instead of starting another Angular UI library from zero.

ngx-prime continues exclusively from the MIT-licensed PrimeNG v21 codebase and does not use PrimeNG v22 or later source code.

### Project direction

Our initial goals are to:

* Bring the PrimeNG v21.1.9 codebase forward to Angular 22 through ngx-prime v22.
* Maintain compatibility with future Angular releases.
* Fix bugs and improve existing components.
* Continue developing the component library and its documentation.
* Keep the project free and open source under the MIT license.
* Welcome community contributions.

Our intended versioning follows Angular releases:

* ngx-prime v22 → Angular 22
* ngx-prime v23 → Angular 23
* and so on.

### Current status

ngx-prime v22 is available as an Angular 22-compatible continuation of the
final MIT-licensed PrimeNG v21 codebase.

Angular 22 support is in progress and should not yet be considered complete or production-ready.

### Installation

The intended npm package is:

`primeng`

```bash
npm install primeng
```

The package name and `primeng/*` import specifiers are intentionally retained
for source compatibility with existing applications:

```ts
import { Button } from 'primeng/button';
```

### Development

This repository uses pnpm workspaces. With a supported Node.js version installed:

```bash
pnpm install
pnpm dev
```

Useful commands include:

* `pnpm build`
* `pnpm format:check`
* `pnpm test:unit`

### Origin & attribution

* Based on [PrimeNG v21.1.9](https://github.com/primefaces/primeng).
* Original PrimeNG work remains attributed to its original authors and contributors.
* ngx-prime modifications and ongoing development are maintained by Web Art Work and contributors.
* All legally required original copyright and license notices are retained.

We are grateful to everyone who contributed to PrimeNG over the years. ngx-prime would not exist without that work.

### License

**MIT License**

ngx-prime continues from the MIT-licensed PrimeNG v21 codebase and retains all required original copyright and license notices.

See [LICENSE.md](LICENSE.md).

### Trademark notice

PrimeNG, PrimeTek, and related names and trademarks belong to their respective owners.

ngx-prime is an independent project and is not affiliated with, sponsored by, or endorsed by PrimeTek.
