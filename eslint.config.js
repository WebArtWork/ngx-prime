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
    '@typescript-eslint/member-ordering': [
        'error',
        {
            default: ['public-static-field', 'static-field', 'instance-field', 'public-instance-method', 'public-static-field']
        }
    ],
    'no-console': 'off',
    'prefer-const': 'off',
    // `condition && doSomething()` is used pervasively in this codebase as a
    // guard idiom, not an accidentally-unused expression.
    '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    // Several *Style classes intentionally merge a same-named `interface` into
    // the `class` to widen its instance type (e.g. accordionstyle.ts) — a
    // deliberate, repeated pattern here, not an accidental unsafe merge.
    '@typescript-eslint/no-unsafe-declaration-merging': 'off'
};

// The component library (packages/primeng) ships selectors under the `p-` prefix;
// the showcase app is a standalone Angular app configured with its own `app` prefix
// (see apps/showcase/angular.json), so the two need separate selector rules.
function selectorRules(prefix) {
    return {
        '@angular-eslint/component-selector': [
            'error',
            {
                type: 'element',
                prefix,
                style: 'kebab-case'
            }
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
        ignores: ['packages/**/*.spec.ts'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended, prettierRecommended],
        processor: angular.processInlineTemplates,
        rules: {
            ...commonTsRules,
            ...selectorRules('p')
        }
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
