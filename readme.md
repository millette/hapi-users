# Apprendre Hapi

[![Dependency Status](https://gemnasium.com/badges/github.com/millette/hapi-users.svg)](https://gemnasium.com/github.com/millette/hapi-users)

## Fichier par fichier

### package.json
Fichier standard des modules npm pour node.
Déclare les dépendances, les scripts, etc.

Voici les extraits importants:

```js
"scripts": {
  "lint": "standard",
  "start": "standard && rejoice -c manifest.json -p $(pwd)"
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

#### pug
Anciennement Jade, pug est l'engin de template qu'on va utiliser avec vision.

#### hapi-auth-cookie
Gestionnaire du cookie d'authentification.

#### good
Avec good-console et good-squeeze, *log* les accès au serveur web.

### manifest.json
Fichier standard pour hapi. Rejoice lit un fichier manifest.json
avec glue et démarre le serveur web tel que spécifié. Tous les détails
se trouvent dans le document [Glue API][] (en anglais).

On utilise deux sections, connections et registrations.

On déclare un seul serveur web, répondant au port 3030:

```js
"connections": [{ "port": 3030 }]
```

La plus grosse partie du fichier manifest est constituée de plugins
sous formes d'objets ({} dans l'exemple) dans le tableau registrations:

```js
"registrations": [ {}, {} ]
```

Voici la liste de chacun des plugins.

#### vision
```js
{ "plugin": "vision" }
```

Au plus simple, un plugin déclare un nom de module. Ici, vision,
qu'on avait pris soin d'ajouter aux dépendances dans package.json.

On aurait pu aussi écrire dans une forme plus longue:

```js
{
  "plugin": {
    "register": "vision"
  }
}
```

On verra ce format avec les autres plugins.

#### visionary
```js
{
  "plugin": {
    "register": "visionary",
    "options": {
      "engines": { "pug": "pug" },
      "path": "views",
      "isCached": false
    }
  }
}
```

Avec rejoice/glue, il faut le gestionnaire visionary pour passer
les options à vision. C'est ici qu'on déclare l'engin de templates,
pug avec l'extension de fichiers .pug et où trouver les templates,
dans le répertoire views.

Par défaut, isCached est true et les templates ne sont lu qu'une seule
fois à partir du disque. Pour le développement, c'est plus pratique de
désactiver ce cache puisque ça permet l'édition des templates et leur
rafraichissement au niveau du serveur web sans devoir redémarrer ce dernier.

#### hapi-auth-cookie
```js
{ "plugin": "hapi-auth-cookie" }
```

Gestion du cookie de session. On verra son usage dans plugins/login/index.js
un peu plus loin.

#### plugins/login
```js
{
  "plugin": {
    "register": "./plugins/login",
    "options": {
      "auth": {
        "mode": "try"
      }
    }
  }
}
```

Tel que déclaré dans plugins/login/package.json ce plugin dépend de hapi-auth-cookie.

On notera que le chemin du plugin (register) commence par ./
pour indiquer qu'il s'agit d'un plugin local et non d'un module npm.

L'option auth.mode est optionnelle et déclare le mode par défaut d'authentification.
Avec "try" ou "optional", le cookie est vérifié à chaque route.
Sans cette vérification, l'information du cookie n'est pas disponible à la route.
Enfin avec "required", l'authentification doit être validée avant d'avoir accès
à la route. Sans authentification, le serveur web retourne un 401.

On verra plus tard comment configurer auth route par route, au besoin.

#### routes/home
```js
{ "plugin": "./routes/home" }
```

Enfin, on déclare des routes, ici avec un plugin local.

### routes/home.js
Plugin qui déclare nos routes. Il faut nommer le plugin, lui donner
une version, énumérer ses dépendances (hapi-auth-cookie ici) et enfin
lui passer un tableau d'objets routes:

```js
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
```

Ceci déclare trois chemins qui répondent à la méthode http get:

* <http://localhost:3030/>
* <http://localhost:3030/login>
* <http://localhost:3030/logout>

#### GET /
La méthode ```reply.view()``` vient du plugin vision et retourne le
template en premier argument ('user') avec le contexte (les valeurs)
du second argument (request.auth). Pour nos premiers tests, on se
contente d'afficher l'information d'authentification.

#### GET /login
Au login, on set le cookie d'authentification. Comme pour tous les cookies,
on doit absolument rediriger (charger une autre page) pour qu'il prenne effet.

#### GET /logout
Au logout, on clear le cookie d'authentification. Comme pour tous les cookies,
on doit absolument rediriger (charger une autre page) pour qu'il prenne effet.

### lib/utils.js
Le fichier utils.js déclare quelques fonctions.

```js
exports.routePlugin = function (attributes, routes) {
  // ...
}
```

La fonction routePlugin est utilisée dans ./routes/home.js et permet
de facilement créer des plugins pour les routes.

Événtuellement, il faudra explorer [hapi-routify][].

### lib/models.js
*À venir*

### models/users.js
*À venir*

### plugins/login/index.js
Définit notre stratégie d'authentification. Le mode défini dans
manifest.json est passée à ce plugin, ainsi que quelques autres
options pour configurer la stratégie.

### plugins/login/package.json
Déclare les dépendances du plugin (du même répertoire)
ainsi que son nom et sa version.

### views/user.pug
Les views sont des templates. Dans notre configuration,
les templates sont interprétés par [pug][] (anciennement jade).
**Notez que l'indentation est importante dans un fichier pug.**

Dans ./routes/home.js on passe request.auth au view, ce qui nous donne
accès à plusieurs variables dans le template.

Pour déterminer si l'utilisateur est connecté:

```
if isAuthenticated
  p: a(href='/logout') Logout
else
  p: a(href='/login') Login
```

On affichera un lien login ou logout, selon l'état actuel.

On peut aussi tester une variable et afficher son contenu:

```
if credentials
  h3 credentials
  pre= JSON.stringify(credentials, null, ' ')
```


[StandardJS]: <http://standardjs.com/>
[Glue API]: <https://github.com/hapijs/glue/blob/master/API.md>
[hapi-routify]: <https://github.com/g-div/hapi-routify>
[pug]: <http://jade-lang.com/>
