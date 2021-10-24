module.exports = {
	"root": true,
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript"
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		sourceType: "module"
	},
	plugins: [
		"@typescript-eslint",
		"import",
	],
	settings: {
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"]
		},
		"import/resolver": {
			typescript: {}
		}
	},
	rules: {
		"@typescript-eslint/array-type": "error",
		"@typescript-eslint/consistent-type-assertions": "error",
		"@typescript-eslint/consistent-type-definitions": "error",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-member-accessibility": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-parameter-properties": "off",
		"@typescript-eslint/no-unused-expressions": "warn",
		"@typescript-eslint/no-use-before-define": ["error", { functions: false }],
		"@typescript-eslint/prefer-for-of": "error",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-empty-function": "warn",
		"@typescript-eslint/no-unsafe-member-access": "off",
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/no-namespace": "off",
		"@typescript-eslint/unified-signatures": "error",
		"@typescript-eslint/method-signature-style": ["error", "method"],
		"@typescript-eslint/type-annotation-spacing": ["error", {before: false, after: true}],
		"@typescript-eslint/brace-style": ["error", "allman", {"allowSingleLine": true}],
		"@typescript-eslint/comma-dangle": ["error", "always-multiline"],
		"@typescript-eslint/comma-spacing": ["error"],
		"@typescript-eslint/func-call-spacing": ["error"],
		"@typescript-eslint/indent": ["warn", "tab"],
		"@typescript-eslint/keyword-spacing": ["error",
		{
			before: true,
			after: false,
			overrides:
			{
				import:{after: true,},
				from:{after: true,},
				as:{after: true,},
				async:{after: true,},
			},
		}],
		"@typescript-eslint/lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
		"@typescript-eslint/quotes": ["error", "double"],
		"@typescript-eslint/space-before-function-paren": ["error", "never"],
		"@typescript-eslint/space-infix-ops": "error",
		"arrow-parens": ["off", "as-needed"],
		"space-in-parens": ["error", "never"],
		camelcase: "error",
		complexity: "off",
		"dot-notation": "error",
		"eol-last": ["error", "never"],
		eqeqeq: ["error", "smart"],
		"guard-for-in": "off",
		"id-blacklist": ["error", "any", "Number", "number", "String", "string", "Boolean", "boolean", "Undefined"],
		"id-match": "error",
		"linebreak-style": "off",
		"max-classes-per-file": ["error", 3],
		"new-parens": "off",
		"newline-per-chained-call": "off",
		"no-bitwise": "error",
		"no-caller": "error",
		"no-cond-assign": "error",
		"no-console": "off",
		"no-eval": "error",
		"no-invalid-this": "off",
		"no-multiple-empty-lines": "off",
		"no-new-wrappers": "error",
		"no-shadow": [
			"error",
			{
				hoist: "all"
			}
		],
		"no-throw-literal": "error",
		"no-trailing-spaces": "error",
		"no-undef-init": "error",
		"no-underscore-dangle": "warn",
		"no-var": "error",
		"object-shorthand": "error",
		"one-var": ["error", "never"],
		"quote-props": "off",
		radix: "error",
		"sort-imports": "off",
		"spaced-comment": "error",
		"indent": ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		"space-infix-ops": "off",
		"quotes": "off",
		"brace-style": "off",
		"comma-dangle": "off",
		"comma-spacing": "off",
		"func-call-spacing": "off",
		"keyword-spacing": "off",
		"lines-between-class-members": "off",
		"space-before-function-paren": "off",
	}
};