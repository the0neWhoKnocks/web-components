module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:wc/best-practice',
    'plugin:wc/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    'html',
  ],
  rules: {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      exports: 'always-multiline',
      functions: 'only-multiline',
      imports: 'always-multiline',
      objects: 'always-multiline',
    }],
    'keyword-spacing': ['error', { after: true, before: true }],
    'no-unused-vars': ['error', { args: 'after-used' }],
    'space-before-blocks': ['error', 'always'],
  },
};
