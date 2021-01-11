module.exports = {
  css: {
    sourceMap: true
  },
  chainWebpack: config => config.resolve.set('symlinks', false)
}

