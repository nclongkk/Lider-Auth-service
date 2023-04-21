import { loggerConfigurationFn } from './logger/configuration';
import { authConfigurationFn } from './auth/configuration';
import { appConfigurationFn } from './app/configuration';
import { swaggerConfigurationFn } from './swagger/configuration';
import { databaseConfigurationFn } from './database/configuration';
import { bcryptConfigurationFn } from './bcrypt/bcrypt.config';
import { googleAuthConfigurationFn } from './google-auth/google-auth.config';
import { clientConfigurationFn } from './client/client.configuration';
import { facebookAuthConfigurationFn } from './facebook-auth/facebook-auth.config';
import { servicesConfigurationFn } from './services/configuration';
import { mailConfigurationFn } from './mail/configuration';

export const configuration = () => ({
  app: appConfigurationFn(),
  auth: authConfigurationFn(),
  swagger: swaggerConfigurationFn(),
  logger: loggerConfigurationFn(),
  database: databaseConfigurationFn(),
  bcrypt: bcryptConfigurationFn(),
  google: googleAuthConfigurationFn(),
  facebook: facebookAuthConfigurationFn(),
  client: clientConfigurationFn(),
  services: servicesConfigurationFn(),
  mail: mailConfigurationFn(),
});
