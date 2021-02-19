import type { SnowpackPluginFactory } from 'snowpack'

const plugin: SnowpackPluginFactory = () => ({
  name: 'snowpack-eslint-plugin',
})

export default plugin
