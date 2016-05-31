# Apprendre Hapi

[![Dependency Status](https://gemnasium.com/badges/github.com/millette/hapi-users.svg)](https://gemnasium.com/github.com/millette/hapi-users)

## Fichier par fichier

### package.json
```js
"scripts": {
  "lint": "standard",
  "start": "standard && rejoice -c manifest.json -p $(pwd)",
}
```

On déclare deux scripts npm.

#### npm run lint
Vérifie le *code style* avec [StandardJS][].

#### npm start
Lance le serveur web hapi à partir de rejoice qui lira le fichier manifest.json.

### package.json (suite)
```js
"engines": {
  "node": ">=4"
}
```

Vous devez utiliser nodeJS v4 ou mieux.

```js
"devDependencies": {
  "standard": "^7.1.1"
}
```

On déclare standard comme dépendance de développement pour ```npm run lint```
mais standard ne sert pas à l'usage normal.


```js
"dependencies": {
  "dogwater": "^1.1.0",
  "good": "^7.0.1",
  "good-console": "^6.1.2",
  "good-squeeze": "^3.0.1",
  "hapi": "^13.4.1",
  "hapi-auth-cookie": "^6.1.1",
  "pug": "^2.0.0-alpha8",
  "rejoice": "^3.2.0",
  "sails-memory": "^0.10.6",
  "vision": "^4.1.0",
  "visionary": "^6.0.0"
}
```

Le serveur dépend de plusieurs modules, voici les plus importants.

#### hapi
La base du *framework*.

#### rejoice
Dépend lui-même du module glue pour lire le fichier manifest.json
et produire un serveur web.

#### vision
Sert à interpréter les *templates* des *views*.

#### visionary
Gestionnaire de vision, pour usage avec rejoice/glue.

#### hapi-auth-cookie

#### good
Avec good-console et good-squeeze, *log* les accès au serveur web.

### manifest.json

### lib/models.js

### lib/utils.js

### models/users.js

### plugins/login/index.js

### plugins/login/package.json

### routes/home.js

### views/user.pug


[StandardJS]: <http://standardjs.com/>