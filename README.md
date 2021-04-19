# @tonoid/helpers

[![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://github.com/melalj/tonoid-helpers)
[![GitHub stars](https://img.shields.io/github/stars/melalj/tonoid-helpers.svg?style=social&label=Star&maxAge=2592003)]()

[![npm](https://img.shields.io/npm/dt/@tonoid/helpers.svg)]() [![npm](https://img.shields.io/npm/v/@tonoid/helpers.svg)]() [![npm](https://img.shields.io/npm/l/@tonoid/helpers.svg)]() [![David](https://img.shields.io/david/melalj/tonoid-helpers.svg)]()

Quickstart your backend project with helpers that abstract boilerplate code.

## Available helpers

- Express: [@tonoid/express](https://github.com/melalj/tonoid-express) • HTTP server
- Mongo: [@tonoid/mongo](https://github.com/melalj/tonoid-mongo) • MongoDb client
- Redis: [@tonoid/redis](https://github.com/melalj/tonoid-redis) • Redis client
- Bull: [@tonoid/bull](https://github.com/melalj/tonoid-bull) • Bull client to run tasks in the background
- Logger: [@tonoid/logger](https://github.com/melalj/tonoid-logger) • Better way to handle your logs with winston

## Example with express and mongo

### Index file

```js
const { init, context } = require('@tonoid/helpers');
const mongo = require('@tonoid/mongo');
const express = require('@tonoid/express');
const logger = require('@tonoid/logger');

const apiEndpoint = require('./api');

init([
  mongo(),
  express({
    port: 3000,
    endpoints: {
      '/api': apiEndpoint,
    }
  }),
], { logger });

```

### Api file

```js
const { express, mongo } = require('@tonoid/helpers').context;

const router = express.Router();

// GET /api
router.get('/', express.asyncHandler(async (req, res) => {
  const mongoDb = mongo.db();
  const filters = {};
  if (req.query.category) filters.category = req.query.category;
  const products = await mongoDb.collection('products').find(filters).toArray();
  res.send(products);
}));

module.exports = router;

```

## Credits

This module is maintained by [Simo Elalj](https://twitter.com/simoelalj) @[tonoid](https://www.tonoid.com)
