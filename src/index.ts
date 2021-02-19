import type { SnowpackPluginFactory } from 'snowpack'

// export interface SnowpackEslintPluginOptions extends Object {
//   input?: Array<string>
// }

const plugin: SnowpackPluginFactory = () => {
  // const pOptions = pluginOptions as SnowpackEslintPluginOptions

  return {
    name: 'snowpack-eslint-plugin',
    config() {
      console.log('success')
    },
  }
}

export default plugin
