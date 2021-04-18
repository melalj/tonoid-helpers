/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const defaultLogger = {
  info: (msg) => console.log(msg),
  error: (msg) => console.error(msg),
  warn: (msg) => console.warn(msg),
  debug: (msg) => (process.env.LOG_LEVEL === 'debug' ? console.info(msg) : null),
};

const context = {};

async function init(modules = [], {
  logger = defaultLogger,
  onExit = Promise.resolve(),
}) {
  if (logger.init) {
    logger.info('Starting logger');
    const startTime = Date.now();
    await logger.init();
    logger.info(` > logger started in ${Date.now() - startTime}ms`);
  }

  context.logger = logger;

  let isExiting = false;

  function exitProcess(signal) {
    logger.info(`Process killed from signal: ${signal}`);
    const exitCode = (/^SIG/.exec(signal)) ? 0 : 1;
    process.nextTick(() => process.exit(exitCode));
  }

  const closeGracefully = async (signal) => {
    if (isExiting) return;
    logger.info(`Gracefully shutting down from ${signal}...`);

    try {
      const contextNames = Object.keys(context);
      for (let i = 0; i < contextNames.length; i += 1) {
        logger.info(` Closing ${context[contextNames[i]].name}...`);
        if (context[contextNames[i]].close) await context[contextNames[i]].close();
        logger.info(`  > ${context[contextNames[i]]} closed`);
      }

      await onExit();

      exitProcess(signal);
      isExiting = true;
    } catch (e) {
      logger.error(`${e.message} ${e.stack}`);
    }

    setTimeout(() => {
      logger.info('Exit timeout: Forcing it');
      exitProcess('FORCE');
      isExiting = true;
    }, 10000);
  };

  try {
    logger.info(`Starting services: ${modules.map((d) => d.name).join(', ')}`);
    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      const startTime = Date.now();
      logger.info(` Starting ${module.name}...`);
      context[module.name] = await module({ logger });
      logger.info(`  > ${module.name} started in ${Date.now() - startTime}ms`);
    }
    logger.info('✅ Ready');
  } catch (e) {
    logger.error(`${e.message} ${e.stack}`);
    exitProcess('START');
    isExiting = true;
  }

  ['SIGINT', 'SIGTERM', 'SIGQUIT', 'uncaughtException', 'unhandledRejection']
    .forEach((signal) => {
      process.on(signal, (reason, p) => {
        if (reason) {
          if (signal === 'unhandledRejection') {
            logger.error(`unhandledRejection: Promise ${p}, reason: ${reason}`);
          } else if (signal === 'uncaughtException') {
            logger.error(`uncaughtException: ${reason.message} | stack: ${reason.stack}`);
          } else if (signal === 'uncaughtException') {
            logger.error(`${signal}: ${reason}`);
          }
        }
        closeGracefully(signal);
        isExiting = true;
      });
    });
}

module.exports = {
  context,
  init,
};
