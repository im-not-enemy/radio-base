import log4js from 'log4js'
import settings from '../conf/setting'

log4js.configure({
  appenders: { system: { type: 'file', filename: settings.logger.logfile } },
  categories: { default: { appenders: ['system'], level: settings.logger.loglevel } }
});
 
const systemLogger = log4js.getLogger('system');

export default systemLogger