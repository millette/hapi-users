'use strict'

// npm
const bcrypt = require('bcrypt')

const saltRounds = 10

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
      handler: { view: { template: 'home' } }
    },
    {
      method: 'GET',
      path: '/me',
      config: {
        auth: { mode: 'required' },
        handler: { view: { template: 'me' } }
      }
    },
    {
      method: 'GET',
      path: '/register',
      handler: function (request, reply) {
        const template = request.auth && request.auth.isAuthenticated ? 'logged' : 'register'
        reply.view(template, request.auth)
      }
    },
    {
      method: 'POST',
      path: '/register',
      handler: function (request, reply) {
        if (!request.payload.name || !request.payload.pw) {
          // missing/empty fields
          return reply.redirect('/register')
        }
        if (request.payload.pw !== request.payload.pw2) {
          // passwords don't match
          return reply.redirect('/register')
        }

        const Users = request.collections.users
        Users.findOneByName(request.payload.name)
          .then((z) => {
            if (z) {
              // name already exists
              return reply.redirect('/register')
            }

            Users.findOneByEmail(request.payload.email)
              .then((z) => {
                if (z) {
                  // email already exists
                  return reply.redirect('/register')
                }

                bcrypt.hash(request.payload.pw, saltRounds, function (err, hash) {
                  if (err) {
                    console.error('ERROR:', err)
                  }

                  const obj = {
                    name: request.payload.name,
                    password: hash
                  }
                  if (request.payload.email) {
                    obj.email = request.payload.email
                  }

                  Users.create(obj)
                    .then((u) => {
                      request.cookieAuth.set({ id: u.id, name: u.name })
                      reply.redirect('/')
                    })
                })
              })
          })
      }
    },
    {
      method: 'GET',
      path: '/login',
      handler: function (request, reply) {
        const template = request.auth && request.auth.isAuthenticated ? 'logged' : 'login'
        reply.view(template, request.auth)
      }
    },
    {
      method: 'POST',
      path: '/login',
      handler: function (request, reply) {
        const Users = request.collections.users
        Users.find({ or: [
          { name: request.payload.name },
          { email: request.payload.name }
        ]})
          .then((x) => {
            if (x.length === 1) {
              bcrypt.compare(request.payload.pw, x[0].password, function (err, valid) {
                if (err) {
                  console.error('ERROR:', err)
                }
                if (valid) {
                  request.cookieAuth.set({ id: x[0].id, name: x[0].name })
                  reply.redirect('/me')
                } else {
                  reply.redirect('/login')
                }
              })
            } else {
              reply.redirect('/login')
            }
          })
      }
    },
    {
      method: 'GET',
      path: '/logout',
      config: {
        auth: { mode: 'required' },
        handler: { view: { template: 'logout' } }
      }
    },
    {
      method: 'POST',
      path: '/logout',
      config: {
        auth: { mode: 'required' },
        handler: function (request, reply) {
          request.cookieAuth.clear()
          reply.redirect('/')
        }
      }
    },
    {
      method: 'GET',
      path: '/api/by/email/users/{email}',
      handler: {
        bedwetter: {
          omit: ['password', 'name', 'id', 'createdAt', 'updatedAt'],
          prefix: '/api/by/email',
          pkAttr: 'email'
        }
      }
    },
    {
      method: 'GET',
      path: '/api/by/name/users/{name}',
      handler: {
        bedwetter: {
          omit: ['password', 'email', 'id', 'createdAt', 'updatedAt'],
          prefix: '/api/by/name',
          pkAttr: 'name'
        }
      }
    }
  ]
)
