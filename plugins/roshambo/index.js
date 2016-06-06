'use strict'

exports.register = (server, pluginOptions, next) => {
  if (typeof pluginOptions !== 'object') {
    pluginOptions = {
      encoding: 'iron'
    }
  } else {
    pluginOptions.encoding = 'iron'
  }
  server.state('antispam', pluginOptions)

  next()
}

exports.register.attributes = require('./package.json')
