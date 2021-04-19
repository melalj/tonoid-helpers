const ctx = require('@tonoid/helpers').context;

module.exports = ({ getRouter, asyncHandler }) => {
  const router = getRouter();

  router.get('/', asyncHandler(async (req, res) => {
    const message = await ctx.redis.getValue('myKey');
    res.send({ message });
  }));

  router.get('/set', asyncHandler(async (req, res) => {
    await ctx.redis.setValue('myKey', Date.now());
    res.send({ success: true });
  }));

  router.get('/del', asyncHandler(async (req, res) => {
    await ctx.redis.delValue('myKey');
    res.send({ success: true });
  }));

  return router;
};
