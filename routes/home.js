'use strict'

exports.register = require('../lib/utils').routePlugin(
  {
    name: 'home',
    version: '0.0.0',
    dependencies: []
  },
  [
    {
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        reply.view('user', { ctx: { request } })
      }
    },
    {
      method: 'GET',
      path: '/p2',
      handler: function (request, reply) {
        reply.view('p2', { ctx: { request } })
      }
    },
    {
      method: 'GET',
      path: '/login',
      handler: function (request, reply) {
        request.cookieAuth.set({ bam: 'paff' })
        reply.redirect('/')
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
