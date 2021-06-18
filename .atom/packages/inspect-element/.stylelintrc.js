module.exports = {
  plugins: ['stylelint-scss', 'stylelint-order', 'stylelint-prettier'],
  extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
  rules: {
    'prettier/prettier': true,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'order/order': ['custom-properties', 'declarations'],
    'order/properties-alphabetical-order': true
  }
};
