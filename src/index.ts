import path from 'path'
import { ESLint } from 'eslint'
import type { SnowpackPluginFactory, SnowpackPlugin } from 'snowpack'

export interface SnowpackEslintPluginOptions extends Object {
  input?: Array<string>
  eslintOptions?: ESLint.Options
  lintFormatter?: string
}

function normalisePath(id: string) {
  return path.relative(process.cwd(), id).split(path.sep).join('/')
}

const plugin: SnowpackPluginFactory = (
  _,
  pluginOptions: SnowpackEslintPluginOptions | undefined,
) => {
  const eslint = new ESLint(pluginOptions?.eslintOptions ?? {})
  const input = pluginOptions?.input ?? ['.ts', '.tsx']

  let nextPlugin: SnowpackPlugin | undefined
  return {
    name: 'snowpack-eslint-plugin',
    resolve: {
      input,
      output: [],
    },
    async config(snowpackConfig) {
      const inputSet = new Set(input)

      const candidateNextPlugins = snowpackConfig.plugins.filter((plugin) => {
        const inputs = plugin.resolve?.input ?? []

        return (
          inputs.some((input) => inputSet.has(input)) && plugin.name != this.name && plugin.load
        )
      })

      // If there is more than one potential candidate plugin that can be used after
      // eslint, then we won't set the output field for this plugin. Instead, it'll
      // be left to snowpack to handle the candidate config.
      if (candidateNextPlugins.length != 1) return

      this.resolve!.output = candidateNextPlugins[0].resolve!.output
      nextPlugin = candidateNextPlugins[0]
    },
    async load(plo) {
      const file = normalisePath(plo.filePath)

      if (!input.includes(plo.fileExt) || (await eslint.isPathIgnored(file))) return

      const report = await eslint.lintFiles(file)

      const warningOnlyLintResults = report.filter(
        (lintRes) => lintRes.errorCount <= 0 && lintRes.warningCount > 0,
      )
      const errorLintResults = report.filter((lintRes) => lintRes.errorCount >= 1)

      const formatter = await eslint.loadFormatter(pluginOptions?.lintFormatter ?? 'stylish')

      if (warningOnlyLintResults.length) console.warn(formatter.format(warningOnlyLintResults))
      if (errorLintResults.length) throw new Error(formatter.format(errorLintResults))

      return nextPlugin && nextPlugin.load && (await nextPlugin.load(plo))
    },
  }
}

export default plugin
