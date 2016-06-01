'use strict'

exports.register = require('../lib/utils').routePlugin(
  {
    name: 'home',
    version: '0.0.0',
    dependencies: ['hapi-auth-cookie']
  },
  [
    {
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        reply.view('user', request.auth)
      }
    },
    {
      method: 'GET',
      path: '/p2',
      handler: function (request, reply) {
        reply.view('user', request.auth)
      }
    },
    {
      method: 'GET',
      path: '/login',
      handler: function (request, reply) {
        if (request.auth && request.auth.isAuthenticated) {
          reply.view('logged', request.auth)
        } else {
          reply.view('login', request.auth)
        }
      }
    },
    {
      method: 'POST',
      path: '/login',
      handler: function (request, reply) {
        if (request.payload && request.payload.name && request.payload.pw === 'bob') {
          request.cookieAuth.set({ name: request.payload.name })
        }
        reply.redirect('/login')
      }
    },
    {
      method: 'GET',
      path: '/logout',
      handler: function (request, reply) {
        request.cookieAuth.clear()
        reply.redirect('/')
      }
    }
  ]
)
