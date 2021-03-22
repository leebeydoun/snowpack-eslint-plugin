import type { SnowpackPluginFactory } from 'snowpack'

import { ESLint } from 'eslint'

type PluginOptions = {
  cache?: boolean
  fix?: boolean
  include?: string[]
  formatter?: string | ESLint.Formatter
}

const defaultOptions = {
  cache: true,
  fix: false,
  include: [],
  formatter: 'stylish',
}

const plugin: SnowpackPluginFactory = (_, pluginOptions?: PluginOptions) => {
  const opts = { ...defaultOptions, ...pluginOptions }

  const { cache = true, fix = false } = opts
  const eslint = new ESLint({
    cache,
    fix,
  })

  const runLint = async () => {
    const lintResult = await eslint.lintFiles(opts.include)

    const formatter =
      typeof opts.formatter === 'function'
        ? opts.formatter
        : await eslint.loadFormatter(opts.formatter as string)

    const resultText = formatter.format(lintResult)

    if (opts.fix && lintResult) ESLint.outputFixes(lintResult)

    console.log(resultText)
  }

  return {
    name: '@canarise/snowpack-eslint-plugin',
    run() {
      return runLint()
    },
    onChange() {
      return runLint()
    },
  }
}

export default plugin
