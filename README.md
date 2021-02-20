# @lee/snowpack-eslint-plugin

`@lee/snowpack-eslint-plugin` is a snowpack plugin to integrate [eslint](https://eslint.org/) into the snowpack develop
and build process. This plugin will simply run eslint as a subprocess. It also provides some terminal coloring for
errors and warnings via [chalk.js](https://github.com/chalk/chalk).

![eslint errors in the terminal](.README_images/eslint_in_terminal.png)

## Install

With **yarn**
```shell
> yarn add @lee/snowpack-eslint-plugin
```

With **npm**
```shell
> npm install @lee/snowpack-elsint-plugin
```

## Usage:

Simple add it to your snowpack config:

```js
module.exports = {
  mount: {
    ...
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    '@snowpack/plugin-postcss',
    '@lee/snowpack-eslint-plugin',
  ],
  routes: [
    ...
  ],
}
```

Or with some arguments:

```js
module.exports = {
  mount: {
    ...
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    '@snowpack/plugin-postcss',
    [
      'snowpack-eslint-plugin',
      {
        name: 'lee'
        disableColoring: true,
      },
    ],
  ],
  routes: [
    ...
  ],
}
```