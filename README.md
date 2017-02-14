
# r8pub

NodeJS HTTP server to publish content in Redis.

<img src="https://raw.githubusercontent.com/evanx/r8pub/master/docs/readme/r8pub.png"/>

Initial prototype based off https://github.com/evanx/bwk-publisher

## Use case

We publish JSON content in Redis, or archived to disk by https://github.com/evanx/r8

## Config

See `lib/config.js` https://github.com/evanx/r8pub/blob/master/lib/config.js

```javascript
module.exports = {
    description: 'Server to publish Redis JSON keys via HTTP.',
    required: {
        httpRoute: {
            description: 'the HTTP route',
            default: 'db'
        },
        httpPort: {
            description: 'the HTTP port',
            default: 8861
        },
        redisHost: {
            description: 'the Redis host',
            default: 'localhost'
        },
        redisPort: {
            description: 'the Redis port',
            default: 6379
        },
        redisPassword: {
            description: 'the Redis password',
            required: false
        },
        redisNamespace: {
            description: 'the Redis namespace for this service',
            default: 'db'
        }
    }
}
```

## Implementation

See `lib/index.js` https://github.com/evanx/r8pub/blob/master/lib/index.js

```javascript
api.get(`/${config.httpRoute}/json/get/*`, async ctx => {
    const key = ctx.params[0].replace(/\//g, ':');
    const jsonKey = [config.redisNamespace, key, 'json'].join(':');
    logger.debug({jsonKey});
    const jsonContent = await client.getAsync(jsonKey);
    if (!jsonContent) {
        ctx.statusCode = 404;
        return;
    }
    ctx.set('Content-Type', 'application/json');
    ctx.body = JSON.stringify(JSON.parse(jsonContent), null, 2) + '\n';
});
```

## Docker

You can build as follows:
```
docker build -t r8pub https://github.com/evanx/r8pub.git
```

See `test/demo.sh` https://github.com/evanx/r8pub/blob/master/test/demo.sh
- isolated network `test-r8-network`
- isolated Redis instance named `test-r8-redis`
- two `spiped` containers to test encrypt/decrypt tunnels
- the prebuilt image `evanxsummers/r8pub`


### Appication archetype

Incidently `lib/index.js` uses the `redis-koa-app-rpf` application archetype.
```
require('redis-koa-app-rpf')(require('./spec'), require('./main'));
```
where we extract the `config` from `process.env` according to the `spec` and invoke our `main` function.

See https://github.com/evanx/redis-koa-app-rpf.

This provides lifecycle boilerplate to reuse across similar applications.

<hr>
https://twitter.com/@evanxsummers

