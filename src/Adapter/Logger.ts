import log4js from 'log4js'

log4js.configure({
  appenders: { system: { type: 'file', filename: './logs/radio-base.log' } },
// appenders: { system: { type: 'console' } },
  categories: { default: { appenders: ['system'], level: 'trace' } }
});
 
const systemLogger = log4js.getLogger('system');
/*
systemLogger.trace('Entering cheese testing');
systemLogger.debug('Got cheese.');
systemLogger.info('Cheese is Comté.');
systemLogger.warn('Cheese is quite smelly.');
systemLogger.error('Cheese is too ripe!');
systemLogger.fatal('Cheese was breeding ground for listeria.');
*/
export default systemLogger