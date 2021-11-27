/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const Graceful = require('node-graceful');

Graceful.captureExceptions = true;
Graceful.captureRejections = true;
Graceful.timeout = 10000;

const defaultLogger = () => ({
  name: 'defaultLogger',
  init: () => ({
    info: (msg) => console.log(msg),
    error: (msg) => console.error(msg),
    warn: (msg) => console.warn(msg),
    debug: (msg) => (process.env.LOG_LEVEL === 'debug' ? console.info(msg) : null),
  }),
});

const context = {};

async function init(modules = [], {
  logger = defaultLogger,
  onExit = () => Promise.resolve(),
} = {}) {
  context.logger = await logger().init();

  let isExiting = false;

  function exitProcess(signal) {
    const exitCode = (/^SIG/.exec(signal)) ? 0 : 1;
    process.nextTick(() => process.exit(exitCode));
  }

  const closeGracefully = async (signal) => {
    if (isExiting) return;
    context.logger.info(`Gracefully shutting down from ${signal}...`);
    isExiting = true;

    try {
      const contextNames = Object.keys(context);
      for (let i = 0; i < contextNames.length; i += 1) {
        if (context[contextNames[i]] && context[contextNames[i]].close) {
          const startTime = Date.now();
          context.logger.info(` Closing ${contextNames[i]}...`);
          await context[contextNames[i]].close();
          context.logger.info(`  ✔ ${contextNames[i]} closed in ${Date.now() - startTime}ms`);
        }
      }

      await onExit();
      context.logger.info(`🔴 App is gracefully closed (${signal})`);

      exitProcess(signal);
    } catch (e) {
      context.logger.error(`${e.message} ${e.stack}`);
    }
  };

  try {
    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      const startTime = Date.now();
      if (module && module.init) {
        context.logger.info(`Starting ${module.name}...`);
        context[module.name] = await module.init({ logger: context.logger });
        context.logger.info(` ✔ ${Date.now() - startTime}ms`);
      }
    }
    context.logger.info('🟢 App is ready');
  } catch (e) {
    context.logger.error(`${e.message} ${e.stack}`);
    await closeGracefully('START');
  }

  Graceful.on('exit', closeGracefully);
}

module.exports = {
  context,
  init,
};
