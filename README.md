# @canarise/snowpack-eslint-plugin

`@canarise/snowpack-eslint-plugin` is a snowpack plugin to integrate [eslint](https://eslint.org/) into the snowpack develop
and build process.

![picture 1](images/7b4c02c22c961527774f75c5d8e195163d4f78bf3deafa8087d9b0f2c6f02da0.png)

## Install

** Note, you must have eslint `^7.0.0` installed, [eslint](https://www.npmjs.com/package/eslint).
We recommend at least having eslint `v7.21.0` installed.**

With **yarn**

```shell
> yarn add @canarise/snowpack-eslint-plugin
```

With **npm**

```shell
> npm install @canarise/snowpack-eslint-plugin
```

With **pnpm**

```shell
pnpm i @canarise/snowpack-eslint-plugin
```

## Usage:

Simply add it to your snowpack config:

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
    ['@canarise/snowpack-eslint-plugin', { globs: ['src/**/*.tsx', 'src/**/*.ts'], options: { /* any eslint options here */ } }],
  ],
  routes: [
    ...
  ],
}
```

## Configuration

There are a few options you can use. The `PluginOptions` type is:

```ts
type PluginOptions = {
  options?: ESLint.Options
  globs?: string[]
  formatter?: string | ESLint.Formatter
}
```

### `options`

Options is any valid eslint option. We pass this to `ESlint`, so it may be useful to refer to (this for possible
values you can use)[https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions]. By default the following
options are passed to `ESLint` unless overridden:

```js
{
  cache: true,
  cacheStrategy: 'content',
  fix: false
}
```

### `globs`

Globs is an array of string globs to lint files, for example `['**/*.ts', '**/*.tsx']`. By default this is an empty
array. **In almost all cases you will need to provide this**. We cannot predict want sort of files you would like to
lint, and would rather not make the decision for you. Furthermore, at least one file for each glob you provide must be present,
otherwise an error will be thrown, which the plugin will not catch. This error is thrown by `eslint` and is the default behaviour.

### `formatter`

The formatter to use for lint output. You can provide your own, or use one of `eslint`'s built in ones. By
default we use `stylish`. See (eslint formatters)[https://eslint.org/docs/user-guide/formatters/] for other options.
