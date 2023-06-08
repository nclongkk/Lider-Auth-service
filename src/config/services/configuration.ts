export interface IServicesConfiguration {
  payment: {
    url: string;
  };
  app: {
    url: string;
  };
}

export const servicesConfigurationFn = (): IServicesConfiguration => ({
  payment: {
    url:
      process.env.PAYMENT_SERVICE_URL || 'http://localhost:4002/api/payments',
  },
  app: {
    url: process.env.APP_SERVICE_URL || 'http://localhost:4002/api/app',
  },
});
