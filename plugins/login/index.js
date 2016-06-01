'use strict'

exports.register = (server, pluginOptions, next) => {
  const mode = pluginOptions && pluginOptions.auth && pluginOptions.auth.mode

  if (mode) {
    server.auth.strategy('session', 'cookie', mode, pluginOptions.strategy)
  } else {
    server.auth.strategy('session', 'cookie', pluginOptions.strategy)
  }

  next()
}

exports.register.attributes = require('./package.json')
