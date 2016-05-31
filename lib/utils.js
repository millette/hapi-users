'use strict'

exports.routePlugin = function (attributes, routes) {
  const register = function (server, options, next) {
    routes.forEach((route) => server.route(route))
    next()
  }

  register.attributes = { pkg: attributes }
  return register
}
