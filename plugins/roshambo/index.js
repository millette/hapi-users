'use strict'

exports.register = (server, pluginOptions, next) => {
  server.state('antispam', {
    password: pluginOptions.password,
    encoding: 'iron'
  })

  next()
}

exports.register.attributes = require('./package.json')
