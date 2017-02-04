
# r8pub

NodeJS HTTP server to publish content in Redis.

<img src="https://raw.githubusercontent.com/evanx/r8pub/master/docs/readme/Brian_Kernighan_json.png"/>

Initial prototype based off https://github.com/evanx/bwk-publisher

## Use case

We publish adhoc JSON content to the webserver via Redis:
```
cat test/Brian_Kernighan.json |
  redis-cli -p 6333 -x set db:people:Brian_Kernighan:json
```
where we have an `spiped` tunnel from `localhost:6333` to a cloud-based Redis instance.

This service connects to that Redis instance, and is exposed via Nginx:
```
server {
   listen 443 ssl;
   server_name evanx.webserva.com;
   ssl_certificate /etc/letsencrypt/live/evanx.webserva.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/evanx.webserva.com/privkey.pem;
   location /db {
     proxy_pass http://localhost:8841;
   }
}
```

Try: https://evanx.webserva.com/db/people/Brian_Kernighan

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
            default: 8841
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

### Thanks for reading

https://twitter.com/@evanxsummers
