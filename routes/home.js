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
      handler: function (request, reply) {
        reply.view('user', request.auth)
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
                  reply.redirect('/')
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
      handler: function (request, reply) {
        request.cookieAuth.clear()
        reply.redirect('/')
      }
    }
  ]
)
