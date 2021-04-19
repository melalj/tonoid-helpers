const { mongo } = require('@tonoid/helpers').context;

module.exports = ({ getRouter, asyncHandler }) => {
  const router = getRouter();

  router.get('/', asyncHandler(async (req, res) => {
    const mongoDb = mongo.db();
    const items = await mongoDb.collection('items').find({}).toArray();
    res.json(items);
  }));

  router.get('/add', asyncHandler(async (req, res) => {
    const mongoDb = mongo.db();
    await mongoDb.collection('items').insertOne({ message: Date.now() });
    res.json({ success: true });
  }));

  router.get('/del', asyncHandler(async (req, res) => {
    const mongoDb = mongo.db();
    await mongoDb.collection('items').deleteMany({});
    res.json({ success: true });
  }));

  return router;
};
