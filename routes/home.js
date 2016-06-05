'use strict'

// npm
const bcrypt = require('bcrypt')
const got = require('got')

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
      path: '/init',
      config: {
        auth: false,
        handler: function (request, reply) {
          if (request.server.settings.app.vault) {
            return reply.redirect('/')
          }
          reply.view('init')
        }
      }
    },
    {
      method: 'POST',
      path: '/init',
      handler: function (request, reply) {
        if (request.server.settings.app.vault) { return reply.redirect('/') }
        if (!request.payload || !request.payload.name || !request.payload.password) {
          return reply.view('init', { error: 'Username and password required.' })
        }

        const p1 = got('https://btcart.com/now-vault/', { auth: `${request.payload.name}:${request.payload.password}` })

        const Users = request.collections.users
        const p2 = Users.findOrCreate({ name: request.payload.name })

        Promise.all([p1, p2])
          .then((pp) => {
            const res = pp[0]
            request.server.settings.app.vault = JSON.parse(res.body)
            request.cookieAuth.set({ id: pp[1].id, name: pp[1].name })
            reply.redirect('/me')
          })
          .catch((err) => { reply.view('init', { error: err }) })
      }
    },
    {
      method: 'GET',
      path: '/me',
      config: {
        auth: { mode: 'required' },
        handler: function (request, reply) {
          const Users = request.collections.users
          Users.findOne(request.auth.credentials.id)
            .then((user) => {
              if (user.password) {
                delete user.password
              } else {
                user.needsPassword = true
              }
              reply.view('me', { user })
            })
        }
      }
    },
    {
      method: 'POST',
      path: '/me',
      config: {
        auth: { mode: 'required' },
        handler: function (request, reply) {
          if (!request.payload.pw || !request.payload.pw2 || request.payload.pw !== request.payload.pw2) {
            return reply.redirect('me')
          }

          bcrypt.hash(request.payload.pw, saltRounds, (err, hash) => {
            if (err) {
              console.error('ERROR:', err)
              reply.redirect('me')
            }
            const Users = request.collections.users
            Users.update(request.auth.credentials.id, { password: hash })
              .then(() => reply.redirect('me'))
          })
        }
      }
    },
    {
      method: 'GET',
      path: '/users/{name}',
      handler: function (request, reply) {
        const Users = request.collections.users
        Users.findOne({name: request.params.name})
          .then((user) => {
            delete user.password
            delete user.email
            delete user.id
            reply.view('public-profile', { user })
          })
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
                      reply.redirect('/me')
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
            if (x.length === 1 && request.payload.pw) {
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
