import path from 'path'
import { ESLint } from 'eslint'
import type { SnowpackPluginFactory } from 'snowpack'

export interface SnowpackEslintPluginOptions extends Object {
  eslintOptions?: ESLint.Options
  lintFormatter?: string
  strict?: boolean
}

function normalisePath(id: string) {
  return path.relative(process.cwd(), id).split(path.sep).join('/')
}

const plugin: SnowpackPluginFactory = (
  _,
  pluginOptions: SnowpackEslintPluginOptions | undefined,
) => {
  const eslint = new ESLint(pluginOptions?.eslintOptions ?? {})
  const input = ['.ts', '.tsx']

  return {
    name: 'snowpack-eslint-plugin',
    resolve: {
      input,
      output: [],
    },
    async load(plo) {
      const file = normalisePath(plo.filePath)

      if (!input.includes(plo.fileExt) || (await eslint.isPathIgnored(file))) return null

      const report = await eslint.lintFiles(file)

      const warningOnlyLintResults = report.filter(
        (lintRes) => lintRes.errorCount <= 0 && lintRes.warningCount > 0,
      )
      const errorLintResults = report.filter((lintRes) => lintRes.errorCount >= 1)

      const formatter = await eslint.loadFormatter(pluginOptions?.lintFormatter ?? 'stylish')

      if (warningOnlyLintResults.length) console.warn(formatter.format(warningOnlyLintResults))
      if (errorLintResults.length) {
        const isStrict = plo.isDev ? pluginOptions?.strict : true
        if (isStrict) throw new Error(formatter.format(errorLintResults))
        else console.error(formatter.format(errorLintResults))
      }

      return null
    },
  }
}

export default plugin
