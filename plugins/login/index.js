'use strict'

exports.register = (server, pluginOptions, next) => {
  const mode = pluginOptions && pluginOptions.auth && pluginOptions.auth.mode

  /*
  pluginOptions.strategy.validateFunc = function (request, session, callback) {
    console.log('request:', Object.keys(request))
    console.log('session:', Object.keys(session))
    console.log('session:', session)
    callback(null, true, { fe: 'fi', fo: 'fu' })

    cache.get(session.sid, (err, cached) => {
        if (err) {
            return callback(err, false)
        }

        if (!cached) {
            return callback(null, false)
        }

        return callback(null, true, cached.account)
    })
  }
  */

  if (mode) {
    server.auth.strategy('session', 'cookie', mode, pluginOptions.strategy)
  } else {
    server.auth.strategy('session', 'cookie', pluginOptions.strategy)
  }

  next()
}

exports.register.attributes = require('./package.json')
