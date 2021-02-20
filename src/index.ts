import execa from 'execa'
import type { SnowpackPluginFactory } from 'snowpack'
import npmRunPath from 'npm-run-path'
import chalk from 'chalk'

const CLEAR_SEQUENCES = ['\x1Bc', '\x1B[2J\x1B[0;0f']

const enum SupportedEslintFormatters {
  CODEFRAME,
  STYLISH,
  UNSUPPORTED,
}

const applyColour = (lintResultString: string, formatter: SupportedEslintFormatters) => {
  const lines = lintResultString.split('\n')

  if (formatter === SupportedEslintFormatters.CODEFRAME) {
    const formattedLines = lines.map((line) => {
      if (line.startsWith('error')) return chalk.red(line)
      else if (line.startsWith('warning')) return chalk.yellow(line)
      return line
    })
    return formattedLines.join('\n')
  }

  if (SupportedEslintFormatters.STYLISH) {
    const formattedLines = lines.map((line) => {
      if (/^\s*[0-9]*:[0-9]*\s+warning/g.test(line)) return chalk.yellow(line)
      else if (/^\s*[0-9]*:[0-9]*\s+error/g.test(line)) return chalk.red(line)
      return line
    })

    return formattedLines.join('\n')
  }

  return lintResultString
}

export interface SnowpackEslintPluginOptions extends Object {
  eslintArgs?: string
  eslintCommand?: string
  eslintWatchCommand?: string
  eslintWatchArgs?: string
  output?: 'dashboard' | 'stream'
  name?: string
  disableColoring?: boolean
}

const plugin: SnowpackPluginFactory = (
  snowpackConfig,
  pluginOptions: SnowpackEslintPluginOptions | undefined,
) => {
  const {
    output = 'dashboard',
    name = '@lee/snowpack-eslint-plugin',
    eslintArgs = 'src --ext .ts,.tsx,.js,.jsx',
    eslintCommand = 'eslint',
    eslintWatchArgs = '-w --clear src --ext .ts,.tsx,.js,.jsx',
    eslintWatchCommand = 'esw',
  } = pluginOptions ?? {}

  const cmd = `${eslintCommand} ${eslintArgs}`
  const watchCmd = `${eslintWatchCommand} ${eslintWatchArgs}`

  return {
    name,
    // @ts-ignore
    async run({ isDev, log }) {
      const commandToRun = isDev ? watchCmd : cmd
      const workerPromise = execa.command(commandToRun, {
        env: npmRunPath.env(),
        extendEnv: true,
        shell: true,
        windowsHide: false,
        cwd: snowpackConfig.root || process.cwd(),
      })
      const { stdout, stderr } = workerPromise

      // Stylish by default
      let formatter = SupportedEslintFormatters.STYLISH

      // If a format flag was specified, we check what value was provided.
      if (/\s+-f\s+(?!stylish)/.test(commandToRun)) {
        formatter = /-f\s+codeframe\s*/g.test(commandToRun.toLowerCase())
          ? SupportedEslintFormatters.CODEFRAME
          : SupportedEslintFormatters.UNSUPPORTED
      }

      function dataListener(chunk: any) {
        let stdOutput = applyColour(chunk.toString(), formatter)
        if (output === 'stream') {
          log('CONSOLE_INFO', { msg: stdOutput })
          return
        }
        if (CLEAR_SEQUENCES.some((s) => stdOutput.includes(s))) {
          log('WORKER_RESET', {})
          for (const s of CLEAR_SEQUENCES) {
            stdOutput = stdOutput.replace(s, '')
          }
        }
        log('WORKER_MSG', { level: 'log', msg: stdOutput })
      }

      stdout && stdout.on('data', dataListener)
      stderr && stderr.on('data', dataListener)
      return workerPromise
    },
  }
}

export default plugin
