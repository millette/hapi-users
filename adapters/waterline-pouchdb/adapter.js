/**
 * Module Dependencies
 */

const PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-memory'))
  .plugin(require('pouchdb-adapter-http'))
  .plugin(require('pouchdb-replication'))
  .plugin(require('pouchdb-find'))

/**
 * waterline-pouchdb
 *
 * Most of the methods below are optional.
 *
 * If you don't need / can't get to every method, just implement
 * what you have time for.  The other methods will only fail if
 * you try to call them!
 *
 * For many adapters, this file is all you need.  For very complex adapters, you may need more flexiblity.
 * In any case, it's probably a good idea to start with one file and refactor only if necessary.
 * If you do go that route, it's conventional in Node to create a `./lib` directory for your private submodules
 * and load them at the top of the file with other dependencies.  e.g. var update = `require('./lib/update')`;
 */
module.exports = (function () {


  // You'll want to maintain a reference to each connection
  // that gets registered with this adapter.
  var connections = {};



  // You may also want to store additional, private data
  // per-connection (esp. if your data store uses persistent
  // connections).
  //
  // Keep in mind that models can be configured to use different databases
  // within the same app, at the same time.
  //
  // i.e. if you're writing a MariaDB adapter, you should be aware that one
  // model might be configured as `host="localhost"` and another might be using
  // `host="foo.com"` at the same time.  Same thing goes for user, database,
  // password, or any other config.
  //
  // You don't have to support this feature right off the bat in your
  // adapter, but it ought to get done eventually.
  //

  var adapter = {
    // identity: 'waterline-pouchdb',
    // Set to true if this adapter supports (or requires) things like data types, validations, keys, etc.
    // If true, the schema for models using this adapter will be automatically synced when the server starts.
    // Not terribly relevant if your data store is not SQL/schemaful.
    //
    // If setting syncable, you should consider the migrate option,
    // which allows you to set how the sync will be performed.
    // It can be overridden globally in an app (config/adapters.js)
    // and on a per-model basis.
    //
    // IMPORTANT:
    // `migrate` is not a production data migration solution!
    // In production, always use `migrate: safe`
    //
    // drop   => Drop schema and data, then recreate it
    // alter  => Drop/add columns as necessary.
    // safe   => Don't change anything (good for production DBs)
    //
    syncable: false,
    pkFormat: 'string',

    // Default configuration for connections
    defaults: {
      // For example, MySQLAdapter might set its default port and host.
      // port: 3306,
      // host: 'localhost',
      // schema: true,
      // ssl: false,
      // customThings: ['eh']
    },



    /**
     *
     * This method runs when a model is initially registered
     * at server-start-time.  This is the only required method.
     *
     * @param  {[type]}   connection [description]
     * @param  {[type]}   collection [description]
     * @param  {Function} cb         [description]
     * @return {[type]}              [description]
     */
    registerConnection: function(connection, collections, cb) {

      if(!connection.identity) return cb(new Error('Connection is missing an identity.'));
      if(connections[connection.identity]) return cb(new Error('Connection is already registered.'));

      // console.log('CONNECTION111:', connection, connection.identity)

      const db = new PouchDB(connection.identity)
      db.sync('http://localhost:5984/hap', {
        live: true,
        retry: true
      })
      connections[connection.identity] = db
      cb();
    },


    /**
     * Fired when a model is unregistered, typically when the server
     * is killed. Useful for tearing-down remaining open connections,
     * etc.
     *
     * @param  {Function} cb [description]
     * @return {[type]}      [description]
     */
    // Teardown a Connection
    teardown: function (conn, cb) {
      // console.log('CONNECTION666-conn-A:', conn)
      // console.log('CONNECTION666-cb:', cb)

      if (typeof conn == 'function') {
        cb = conn;
        conn = null;
      }
      // console.log('CONNECTION666-conn-B:', conn)
      if (!conn) {
        connections = {};
        return cb();
      }
      // console.log('CONNECTION666-conn-C:', conn)
      if(!connections[conn.identity]) return cb();
      const db = connections[conn]
      db.destroy()
        .then(() => {
          delete connections[conn]
          cb()
        })
        .catch((err) => {
          console.error('EEERRRRROOORRR:', err)
          cb()
        })
    },

    /*
    // Return attributes
    describe: function (connection, collection, cb) {
      // Add in logic here to describe a collection (e.g. DESCRIBE TABLE logic)
      return cb();
    },
    */

    /**
     *
     * REQUIRED method if integrating with a schemaful
     * (SQL-ish) database.
     *
     */
    /*
    define: function (connection, collection, definition, cb) {
      // Add in logic here to create a collection (e.g. CREATE TABLE logic)
      return cb();
    },
    */

    /**
     *
     * REQUIRED method if integrating with a schemaful
     * (SQL-ish) database.
     *
     */
    /*
    drop: function (connection, collection, relations, cb) {
      // Add in logic here to delete a collection (e.g. DROP TABLE logic)
      return cb();
    },
    */

    /**
     *
     * REQUIRED method if users expect to call Model.find(), Model.findOne(),
     * or related.
     *
     * You should implement this method to respond with an array of instances.
     * Waterline core will take care of supporting all the other different
     * find methods/usages.
     *
     */
    find: function (connection, collection, options, cb) {
      console.log('FINDING', options)
      // console.log('CONNECTION222:', connection, options)
      // return connections[connection].get(options.where.id)
      const q = {
        selector: options.where
      }

      if (q.selector.id) {
        q.selector._id = q.selector.id
        delete q.selector.id
      }
      // q.selector[options.where]
      /*{
        selector: {
          _id: options.where.id
        }
      }*/
      return connections[connection].find(q)
        .then((x) => x.docs)
        .then((x) => {
          console.log('FOUND:', x)
          if (x.length) {
            if (x.length === 1) {
              cb(null, x[0])
            } else {
              cb(null, x)
            }
          } else {
            cb(true)
          }
        })
        .catch((err) => {
          console.log('ERROR', err)
          cb(err)
        })
    },

    create: function (connection, collection, values, cb) {
      // console.log('CONNECTION333-cb:', cb)
      // console.log('CONNECTION333-conn:', connection)
      // console.log('CONNECTION333-coll:', collection)

      // console.log('CONNECTION333-values:', values)
      // console.log('CONNECTION333-values-keys:', Object.keys(values))
      // console.log('CONNECTION333-values-len:', values.length)
      // values.forEach((v) => {
        // console.log('CONNECTION333-value:', v)
      // })
      console.log('CREATING')
      return connections[connection].post(values)
        .then((x) => {
          // console.log('MADE', x)
          values.id = x.id
          values._rev = x.rev
          cb(null, values)
        })
        .catch((err) => {
          // console.log('ERROR', err)
          cb(err)
        })
    },

    update: function (connection, collection, options, values, cb) {
      console.log('UPDATING')
      return connections[connection].put(values)
        .then((x) => cb(null, x))
        .catch((err) => cb(err))
    },

    destroy: function (connection, collection, options, cb) {
      console.log('DESTROYING')
      return connections[connection].remove(options.id, options._rev)
        .then((x) => cb(null, x))
        .catch((err) => cb(err))
    }

    /*

    // Custom methods defined here will be available on all models
    // which are hooked up to this adapter:
    //
    // e.g.:
    //
    foo: function (connection, collection, options, cb) {
      return cb(null,"ok");
    },
    bar: function (connection, collection, options, cb) {
      if (!options.jello) return cb("Failure!");
      else return cb();
      destroy: function (connection, collection, options, values, cb) {
       return cb();
     }

    // So if you have three models:
    // Tiger, Sparrow, and User
    // 2 of which (Tiger and Sparrow) implement this custom adapter,
    // then you'll be able to access:
    //
    // Tiger.foo(...)
    // Tiger.bar(...)
    // Sparrow.foo(...)
    // Sparrow.bar(...)


    // Example success usage:
    //
    // (notice how the first argument goes away:)
    Tiger.foo({}, function (err, result) {
      if (err) return console.error(err);
      else console.log(result);

      // outputs: ok
    });

    // Example error usage:
    //
    // (notice how the first argument goes away:)
    Sparrow.bar({test: 'yes'}, function (err, result){
      if (err) console.error(err);
      else console.log(result);

      // outputs: Failure!
    })




    */




  };


  // Expose adapter definition
  return adapter;

})();

