// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // require or disallow padding within blocks
    'padded-blocks': 0,
    'camelcase': 0,
    'no-useless-return': 0,
    'no-multiple-empty-lines': 0,
    'prefer-promise-reject-errors': 0,
    'no-new': 0,

    'indent': 0,
    'vue/script-indent': 0,
    'vue/no-parsing-error': [2, { "x-invalid-end-tag": false }],
  }
}
