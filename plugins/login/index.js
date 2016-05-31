'use strict'

// Terrible idea but required if not using HTTPS especially if developing locally
const secure = false
const cookiePassword = 'cookie_encryption_password_secure'

exports.register = (server, options, next) => {
  server.auth.strategy('session', 'cookie', 'try', {
    password: cookiePassword,
    isSecure: secure
  })

  next()
}

exports.register.attributes = require('./package.json')
