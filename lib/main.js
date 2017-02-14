
const assert = require('assert');
const crypto = require('crypto');
const zlib = require('zlib');
const lodash = require('lodash');
const Promise = require('bluebird');
const multiExecAsync = require('../components/multiExecAsync');

module.exports = async ({config, logger, client, api}) => {
    const blobStore = require(config.blobStoreType)(config.blobStore);
    api.get(`/${config.httpRoute}/json/get/*`, async ctx => {
        const key = ctx.params[0].replace(/\//g, ':');
        const filePath = `${ctx.params[0].replace(/\W/g, '/')}.json`;
        const jsonKey = [config.redisNamespace, key, 'json'].join(':');
        const jsonContent = await client.getAsync(jsonKey);
        if (!jsonContent) {
            ctx.statusCode = 404;
            return;
        }
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify(JSON.parse(jsonContent), null, 2) + '\n';
    });
}
