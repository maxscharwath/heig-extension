module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'max-len': ['warn', { code: 120 }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    semi: 'off',
    'no-param-reassign': ['error', { props: false }],
    'global-require': 'off',
    'no-undef': 'off',
    'import/no-named-as-default-member': 'off',
    'vuejs-accessibility/no-autofocus': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
