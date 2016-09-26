module.exports = {
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 7,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "experimentalObjectRestSpread": true,
    },
  },
  "extends": "airbnb",
  "rules": {
    "no-func-assign": 0,
    "no-class-assign": 0,
    "react/jsx-filename-extension": 0,
    "react/sort-comp": 0,
    "react/prop-types": 1,
    "no-underscore-dangle": 0,
    "comma-dangle": 0
  },
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ]
};
