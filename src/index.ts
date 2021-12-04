import type { SnowpackPluginFactory, PluginRunOptions } from 'snowpack'

import { ESLint } from 'eslint'

type PluginOptions = {
  options?: ESLint.Options
  globs?: string[]
  formatter?: string | ESLint.Formatter
}

const defaultOptions = {
  options: {
    cache: true,
    cacheStrategy: 'content' as 'content',
    fix: false,
  },
  globs: [],
  formatter: 'stylish',
}

type Logger = (s: string, { msg }: { msg: string }) => void;
interface PluginFactory extends ReturnType<SnowpackPluginFactory> {
  run({ isDev, log } : PluginRunOptions & {
    log: Logger,
  }): Promise<unknown>
}

let logger: Logger;

const plugin: SnowpackPluginFactory = (_, pluginOptions?: PluginOptions): PluginFactory => {
  const opts = { ...defaultOptions, ...pluginOptions }
  const eslint = new ESLint(opts.options)

  const runLint = async () => {
    const lintResult = await eslint.lintFiles(opts.globs)

    const formatter =
      typeof opts.formatter === 'function'
        ? opts.formatter
        : await eslint.loadFormatter(opts.formatter as string)

    const resultText = formatter.format(lintResult)

    if (opts.options.fix && lintResult) ESLint.outputFixes(lintResult)
    
    if(resultText.length === 0){
      logger('WORKER_MSG', {msg: `No lint errors found.`})
    } else {
      logger('WORKER_MSG', {msg: resultText})
    }
  }

  return {
    name: '@canarise/snowpack-eslint-plugin',
    run({log}) {
      logger = log;
      return runLint()
    },
    onChange() {
      logger('WORKER_RESET', {});
      return runLint()
    },
  }
}

export default plugin
