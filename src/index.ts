import execa from 'execa'
import type { SnowpackPluginFactory } from 'snowpack'
import npmRunPath from 'npm-run-path'
import chalk from 'chalk'

const CLEAR_SEQUENCES = ['\x1Bc', '\x1B[2J\x1B[0;0f']

const applyColour = (lintErr: string, formatter: string) => {
  const lines = lintErr.split('\n')

  if (formatter.toLowerCase() === 'codeframe') {
    const formattedLines = lines.map((line) => {
      if (line.startsWith('error')) return chalk.red(line)
      else if (line.startsWith('warning')) return chalk.yellow(line)
      return line
    })
    return formattedLines.join('\n')
  }

  // Matches strings like:
  //   1:17  warning  'FC' is
  const warningRegex = /^\s*[0-9]*:[0-9]*\s+warning/g
  const errorRegex = /^\s*[0-9]*:[0-9]*\s+error/g

  const formattedLines = lines.map((line) => {
    if (warningRegex.test(line)) return chalk.yellow(line)
    else if (errorRegex.test(line)) return chalk.red(line)
    return line
  })

  return formattedLines.join('\n')
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
      const workerPromise = execa.command(isDev ? watchCmd : cmd, {
        env: npmRunPath.env(),
        extendEnv: true,
        shell: true,
        windowsHide: false,
        cwd: snowpackConfig.root || process.cwd(),
      })
      const { stdout, stderr } = workerPromise

      function dataListener(chunk: any) {
        let stdOutput = applyColour(chunk.toString(), '')
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
