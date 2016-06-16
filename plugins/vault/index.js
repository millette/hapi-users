'use strict'

// npm
const utils = require('now-vault-client')

exports.register = (server, pluginOptions, next) => {
// server.settings.app.vault

  // console.log('server keys:', Object.keys(server))
  // console.log('server.collections keys:', Object.keys(server.collections))
  // console.log('server.collections:', server.collections)
  // console.log('server.settings.collections:', server.settings.collections)
  // console.log('server.settings.app:', server.settings.app)
  // console.log('server.waterline keys:', Object.keys(server.waterline))
  // console.log('server.waterline.collections keys:', Object.keys(server.waterline.collections))

  utils()
    .then((r) => {
      console.log('RRR:', r)
      if (!r || !r.dbSync) { return false }
      console.log('Go on...')
      server.settings.app.vault = r
      const Users = server.waterline.collections.users
      Users.syncSetup(r.dbSync)
      /*
      db.sync(r.dbSync, { live: true, retry: true })
      db.post({
        type: 'boot',
        created_at: new Date().toISOString(),
        host: process.env.NOW_URL
      })
      */
      return r
    })

  /*
  if (typeof pluginOptions !== 'object') {
    pluginOptions = {
      encoding: 'iron'
    }
  } else {
    pluginOptions.encoding = 'iron'
  }
  server.state('antispam', pluginOptions)
  */

  next()
}

exports.register.attributes = require('./package.json')
