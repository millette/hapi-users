'use strict'

// npm
const bcrypt = require('bcrypt')
const human = require('human-format')
const shuffle = require('lodash.shuffle')

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
      path: '/load',
      config: {
        auth: { mode: 'required' },
        handler: (request, reply) => reply.view('load', { human: human, load: request.server.load })
      }
    },
    {
      method: 'GET',
      path: '/me',
      config: {
        auth: { mode: 'required' },
        handler: function (request, reply) {
          const Users = request.collections.users
          Users.findOne({ _id: request.auth.credentials.id })
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
          if (!request.payload.pw || !request.payload.pw2 || request.payload.pw !== request.payload.pw2) { return reply.redirect('me') }

          bcrypt.hash(request.payload.pw, saltRounds, (err, hash) => {
            if (err) {
              console.error('ERROR:', err)
              return reply.redirect('me')
            }
            const Users = request.collections.users
            Users.update(request.auth.credentials.id, { password: hash }).then(() => reply.redirect('me'))
          })
        }
      }
    },
    {
      method: 'GET',
      path: '/users/{name}',
      handler: function (request, reply) {
        const Users = request.collections.users
        Users.findOne({ name: request.params.name })
          .then((user) => {
            delete user.password
            delete user.email
            // delete user.id
            reply.view('public-profile', { user })
          })
          .catch((e) => {
            reply(`The user "${request.params.name}" was not found`).code(404)
          })
      }
    },
    {
      method: 'GET',
      path: '/userid/{id}',
      handler: function (request, reply) {
        const Users = request.collections.users
        Users.findOne({ _id: request.params.id })
          .then((user) => {
            console.log('USER:', user)
            delete user.password
            delete user.email
            // delete user.id
            reply.view('public-profile', { user })
          })
          .catch((e) => {
            reply(`The user with ID "${request.params.id}" was not found`).code(404)
          })
      }
    },
    {
      method: 'GET',
      path: '/register',
      handler: (request, reply) => {
        let antispam

        if (request.state.antispam && request.state.antispam.roshambo && request.state.antispam.roshambo.fakes) {
          antispam = request.state.antispam
        } else {
          let picks = shuffle(['roche', 'papier', 'ciseaux'])
          antispam = {
            roshambo: {
              toBeat: picks[0],
              picks: shuffle(picks),
              fakes: shuffle(picks)
            }
          }
        }

        reply.view(request.auth && request.auth.isAuthenticated ? 'logged' : 'register', { antispam }).state('antispam', antispam)
      }
    },
    {
      method: 'POST',
      path: '/register',
      handler: function (request, reply) {
        // missing/empty fields
        if (!request.payload.name || !request.payload.pw) { return reply.redirect('/register') }
        console.log('ok1')
        // passwords don't match
        if (request.payload.pw !== request.payload.pw2) { return reply.redirect('/register') }
        console.log('ok2')

        // failed antispam
        if (!request.state.antispam || !request.state.antispam.roshambo.toBeat || !request.payload.roshambo || request.payload.roshambo2 || request.payload.roshambo === request.state.antispam.roshambo.toBeat) {
          return reply.redirect('/register')
        }
        console.log('ok3')

        switch (request.payload.roshambo) {
          case 'roche':
            console.log('ok5')
            if (request.state.antispam.roshambo.toBeat === 'papier') { return reply.redirect('/register') }
            console.log('ok5a')
            break

          case 'papier':
            console.log('ok6')
            if (request.state.antispam.roshambo.toBeat === 'ciseaux') { return reply.redirect('/register') }
            console.log('ok6a')
            break

          case 'ciseaux':
            console.log('ok7')
            if (request.state.antispam.roshambo.toBeat === 'roche') { return reply.redirect('/register') }
            console.log('ok7a')
            break
        }
        console.log('ok9')

        const Users = request.collections.users
        Users.findOneByName(request.payload.name)
          .then((z) => {
            // name already exists
            if (z) { return reply.redirect('/register') }

            Users.findOneByEmail(request.payload.email)
              .then((z) => {
                // email already exists
                if (z) { return reply.redirect('/register') }
                bcrypt.hash(request.payload.pw, saltRounds, function (err, hash) {
                  if (err) {
                    console.error('ERROR:', err)
                    return reply.redirect('register')
                  }

                  const obj = {
                    name: request.payload.name,
                    password: hash
                  }
                  if (request.payload.email) { obj.email = request.payload.email }

                  Users.create(obj)
                    .then((u) => {
                      console.log('UUU:', u)
                      request.cookieAuth.set({ id: u._id, name: u.name })
                      reply.redirect('/me').state('antispam', {})
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
        /*
        Users.find({ or: [
          { name: request.payload.name },
          { email: request.payload.name }
        ]})
        */
        Users.find({ name: request.payload.name })
          .then((x) => {
            if (x.length === 1 && request.payload.pw) {
              bcrypt.compare(request.payload.pw, x[0].password, function (err, valid) {
                if (err) { console.error('ERROR:', err) }
                if (valid) {
                  request.cookieAuth.set({ id: x[0]._id, name: x[0].name })
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
          omit: ['password', 'name', '_id', 'id', 'createdAt', 'updatedAt'],
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
          omit: ['password', 'email', '_id', 'id', 'createdAt', 'updatedAt'],
          prefix: '/api/by/name',
          pkAttr: 'name'
        }
      }
    }
  ]
)
