/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

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
  loggerOptions = {},
  onExit = () => Promise.resolve(),
} = {}) {
  context.logger = await logger(loggerOptions).init();

  let isExiting = false;

  function exitProcess(signal) {
    context.logger.info(`Process killed from signal: ${signal}`);
    const exitCode = (/^SIG/.exec(signal)) ? 0 : 1;
    process.nextTick(() => process.exit(exitCode));
  }

  const closeGracefully = async (signal) => {
    if (isExiting) return;
    context.logger.info(`Gracefully shutting down from ${signal}...`);

    try {
      const contextNames = Object.keys(context);
      for (let i = 0; i < contextNames.length; i += 1) {
        context.logger.info(` Closing ${contextNames[i]}...`);
        if (context[contextNames[i]].close) await context[contextNames[i]].close();
        context.logger.info(`  ✔ ${contextNames[i]} closed`);
      }

      await onExit();

      exitProcess(signal);
      isExiting = true;
    } catch (e) {
      context.logger.error(`${e.message} ${e.stack}`);
    }

    setTimeout(() => {
      context.logger.info('Exit timeout: Forcing it');
      exitProcess('FORCE');
      isExiting = true;
    }, 10000);
  };

  try {
    for (let i = 0; i < modules.length; i += 1) {
      const module = modules[i];
      const startTime = Date.now();
      context.logger.info(`Starting ${module.name}...`);
      context[module.name] = await module.init({ logger: context.logger });
      context.logger.info(` ✔ ${Date.now() - startTime}ms`);
    }
    context.logger.info('🟢 App is ready');
  } catch (e) {
    context.logger.error(`${e.message} ${e.stack}`);
    exitProcess('START');
    isExiting = true;
  }

  ['SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2', 'SIGQUIT', 'uncaughtException', 'unhandledRejection', 'exit']
    .forEach((signal) => {
      process.on(signal, (reason, p) => {
        if (reason) {
          if (signal === 'unhandledRejection') {
            context.logger.error(`unhandledRejection: Promise ${p}, reason: ${reason}`);
          } else if (signal === 'uncaughtException') {
            context.logger.error(`uncaughtException: ${reason.message} | stack: ${reason.stack}`);
          } else if (signal === 'uncaughtException') {
            context.logger.error(`${signal}: ${reason}`);
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
