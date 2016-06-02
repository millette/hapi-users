'use strict'

module.exports = {
  identity: 'users',
  // connection: 'memoryDB',
  connection: 'diskDB',
  schema: false,
  attributes: {
    name: {
      type: 'string',
      unique: true
    },
    password: {
      type: 'string'
    },
    email: {
      type: 'string',
      unique: true
    }
  }
}
