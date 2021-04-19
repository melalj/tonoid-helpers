const { redis } = require('@tonoid/helpers').context;

module.exports = ({ getRouter, asyncHandler }) => {
  const router = getRouter();

  router.get('/', asyncHandler(async (req, res) => {
    const message = await redis.getValue('myKey');
    res.json({ message });
  }));

  router.get('/set', asyncHandler(async (req, res) => {
    await redis.setValue('myKey', Date.now());
    res.json({ success: true });
  }));

  router.get('/del', asyncHandler(async (req, res) => {
    await redis.delValue('myKey');
    res.json({ success: true });
  }));

  return router;
};
