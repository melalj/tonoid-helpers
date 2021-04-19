const { init } = require('@tonoid/helpers');
const mongo = require('@tonoid/mongo');
const redis = require('@tonoid/redis');
const express = require('@tonoid/express');
const logger = require('@tonoid/logger');

const rootHandler = require('./api/root');
const redisExampleHandler = require('./api/redis-example');
const mongoExampleHandler = require('./api/mongo-example');

init([
  mongo(),
  redis(),
  express({
    endpoints: [
      { path: '/redis-example', handler: redisExampleHandler },
      { path: '/mongo-example', handler: mongoExampleHandler },
      { path: '/', handler: rootHandler },
    ],
  }),
], { logger });
