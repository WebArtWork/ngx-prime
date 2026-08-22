const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

const PADDING_RULES = [
    'error',
    { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
    { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
    { blankLine: 'any', prev: ['case', 'default'], next: 'break' },
    { blankLine: 'any', prev: 'case', next: 'case' },
    { blankLine: 'always', prev: '*', next: 'return' },
    { blankLine: 'always', prev: 'block', next: '*' },
    { blankLine: 'always', prev: '*', next: 'block' },
    { blankLine: 'always', prev: 'block-like', next: '*' },
    { blankLine: 'always', prev: '*', next: 'block-like' },
    { blankLine: 'always', prev: ['import'], next: ['const', 'let', 'var'] }
];

const commonTsRules = {
    'padding-line-between-statements': PADDING_RULES,
    '@angular-eslint/component-class-suffix': [
        'error',
        {
            suffixes: ['']
        }
    ],
    '@angular-eslint/no-host-metadata-property': 'off',
    '@angular-eslint/no-output-on-prefix': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    'arrow-body-style': ['error', 'as-needed'],
    curly: 'off',
    // This codebase's real convention groups a field next to the method(s)
    // that use it rather than hoisting all fields above all methods, so a
    // strict field-before-method ordering fights ~3000 legitimate call sites.
    '@typescript-eslint/member-ordering': 'off',
    'no-console': 'off',
    'prefer-const': 'off',
    // Sharing a body across adjacent case labels (`case A:\ncase B: { ... }`) is used
    // throughout this codebase's keydown handlers and is not an accidental fallthrough.
    'no-fallthrough': ['error', { allowEmptyCase: true }],
    // `condition && doSomething()` is used pervasively in this codebase as a
    // guard idiom, not an accidentally-unused expression.
    '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    // Destructuring some properties out purely to exclude them from a `...rest`
    // spread (e.g. bind.ts) is a legitimate idiom, not an accidental unused var.
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    // Several *Style classes intentionally merge a same-named `interface` into
    // the `class` to widen its instance type (e.g. accordionstyle.ts) — a
    // deliberate, repeated pattern here, not an accidental unsafe merge.
    '@typescript-eslint/no-unsafe-declaration-merging': 'off'
};

// The component library (packages/ngx-prime) ships selectors under the `p-` prefix;
// the showcase app is a standalone Angular app configured with its own `app` prefix
// (see apps/showcase/angular.json), so the two need separate selector rules.
function selectorRules(prefix) {
    return {
        '@angular-eslint/component-selector': [
            'error',
            // Several internal sub-components (e.g. CascadeSelectSub, GalleriaContent,
            // MenuItemContent) intentionally render via an attribute selector on their host
            // element rather than as a standalone element, to avoid an extra wrapper — those
            // follow the same camelCase convention as attribute directives.
            [
                { type: 'element', prefix, style: 'kebab-case' },
                { type: 'attribute', prefix, style: 'camelCase' }
            ]
        ],
        '@angular-eslint/directive-selector': [
            'error',
            {
                type: 'attribute',
                prefix,
                style: 'camelCase'
            }
        ]
    };
}

module.exports = tseslint.config(
    {
        ignores: ['**/dist/**', '**/.angular/**', '**/node_modules/**']
    },
    {
        files: ['packages/**/*.ts'],
        ignores: ['packages/**/*.spec.ts', 'packages/ngx-prime/src/icons/**'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended, prettierRecommended],
        processor: angular.processInlineTemplates,
        rules: {
            ...commonTsRules,
            // `tt` is TreeTable's own established prefix for its attribute directives
            // (e.g. [ttSortableColumn]), distinct from but alongside the library-wide `p-` prefix.
            ...selectorRules(['p', 'tt'])
        }
    },
    {
        // Icon subcomponents use their own PascalCase, no-prefix selector
        // convention (e.g. AngleDownIcon) — internal building blocks, not part
        // of the library's p-* public component surface.
        files: ['packages/ngx-prime/src/icons/**/*.ts'],
        ignores: ['packages/ngx-prime/src/icons/**/*.spec.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended, prettierRecommended],
        processor: angular.processInlineTemplates,
        rules: commonTsRules
    },
    {
        files: ['apps/**/*.ts'],
        ignores: ['apps/**/*.spec.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended, prettierRecommended],
        processor: angular.processInlineTemplates,
        rules: {
            ...commonTsRules,
            ...selectorRules('app')
        }
    },
    {
        // Test-harness components declared inline in specs are private test
        // fixtures, not public API — they shouldn't be held to the library's
        // selector-prefix convention.
        files: ['packages/**/*.spec.ts', 'apps/**/*.spec.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended, prettierRecommended],
        processor: angular.processInlineTemplates,
        rules: commonTsRules
    },
    {
        files: ['packages/**/*.html', 'apps/**/*.html'],
        extends: [...angular.configs.templateRecommended, prettierRecommended],
        rules: {
            '@angular-eslint/template/eqeqeq': [
                'error',
                {
                    allowNullOrUndefined: true
                }
            ]
        }
    }
);
