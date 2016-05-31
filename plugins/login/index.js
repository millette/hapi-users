'use strict'

// Terrible idea but required if not using HTTPS especially if developing locally
const secure = false
const cookiePassword = 'cookie_encryption_password_secure'

exports.register = (server, pluginOptions, next) => {
  const mode = pluginOptions && pluginOptions.auth && pluginOptions.auth.mode
  const options = {
    password: cookiePassword,
    isSecure: secure
  }
  if (mode) {
    server.auth.strategy('session', 'cookie', mode, options)
  } else {
    server.auth.strategy('session', 'cookie', options)
  }

  next()
}

exports.register.attributes = require('./package.json')
