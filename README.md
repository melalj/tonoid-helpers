# @tonoid/helpers

![npm](https://img.shields.io/npm/dt/@tonoid/helpers.svg) ![npm](https://img.shields.io/npm/v/@tonoid/helpers.svg) ![npm](https://img.shields.io/npm/l/@tonoid/helpers.svg)
[![GitHub stars](https://img.shields.io/github/stars/melalj/tonoid-helpers.svg?style=social&label=Star&maxAge=2592003)](https://github.com/melalj/tonoid-helpers)

Quickstart your backend project with helpers all abstract boilerplate code.

## Available helpers

- Express: [@tonoid/express](https://github.com/melalj/tonoid-express) • HTTP server
- Mongo: [@tonoid/mongo](https://github.com/melalj/tonoid-mongo) • MongoDb client
- Redis: [@tonoid/redis](https://github.com/melalj/tonoid-redis) • Redis client
- Bull: [@tonoid/bull](https://github.com/melalj/tonoid-bull) • Bull client to run tasks in the background
- Logger: [@tonoid/logger](https://github.com/melalj/tonoid-logger) • Better way to handle your logs with winston

## Full example

A full usage example is available on the folder `example` on this repo

## Example with express and mongo

### Index file

```js
const { init } = require('@tonoid/helpers');
const mongo = require('@tonoid/mongo');
const express = require('@tonoid/express');
const logger = require('@tonoid/logger');

const apiEndpoint = require('./api');

init([
  mongo(),
  express({
    port: 3000,
    jsonLog: false,
    endpoints: [
      { path: '/api', handler: apiEndpoint },
    ]
  }),
], {
  logger,
  loggerOptions: { colorize: true, json: false }
});

```

### Api file

```js
const ctx = require('@tonoid/helpers').context;

module.exports = ({ getRouter, asyncHandler }) => {
  const router = getRouter();
  // GET /api
  router.get('/', asyncHandler(async (req, res) => {
    const mongoDb = ctx.mongo.db();
    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    const products = await mongoDb.collection('products').find(filters).toArray();
    res.send(products);
  }));

  return router;
};

```

## Credits

This module is maintained by [Simo Elalj](https://twitter.com/simoelalj) @[tonoid](https://www.tonoid.com)
