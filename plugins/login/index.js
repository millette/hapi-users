'use strict'

exports.register = (server, pluginOptions, next) => {
  const mode = pluginOptions && pluginOptions.auth && pluginOptions.auth.mode

  const validate = (request, session, callback) => {
    const Users = request.collections.users
    Users.findOne(session.id)
      .then((x) => {
        if (x) {
          callback(null, true)
        } else {
          callback(null, false, {})
        }
      })
  }

  pluginOptions.strategy.validateFunc = validate

  if (mode) {
    server.auth.strategy('session', 'cookie', mode, pluginOptions.strategy)
  } else {
    server.auth.strategy('session', 'cookie', pluginOptions.strategy)
  }

  next()
}

exports.register.attributes = require('./package.json')
