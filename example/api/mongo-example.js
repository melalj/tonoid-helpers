const ctx = require('@tonoid/helpers').context;

module.exports = ({ getRouter, asyncHandler }) => {
  const router = getRouter();

  router.get('/', asyncHandler(async (req, res) => {
    const mongoDb = ctx.mongo.db();
    const items = await mongoDb.collection('items').find({}).toArray();
    res.send(items);
  }));

  router.get('/add', asyncHandler(async (req, res) => {
    const mongoDb = ctx.mongo.db();
    await mongoDb.collection('items').insertOne({ message: Date.now() });
    res.send({ success: true });
  }));

  router.get('/del', asyncHandler(async (req, res) => {
    const mongoDb = ctx.mongo.db();
    await mongoDb.collection('items').deleteMany({});
    res.send({ success: true });
  }));

  return router;
};
