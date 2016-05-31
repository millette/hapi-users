'use strict'

module.exports = {
  identity: 'users',
  connection: 'memoryDB',
  schema: false,
  attributes: {
    name: {
      type: 'string',
      unique: true
    }
  }
}
