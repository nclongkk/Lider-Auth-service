export interface IServicesConfiguration {
  payment: {
    url: string;
  };
}

export const servicesConfigurationFn = (): IServicesConfiguration => ({
  payment: {
    url:
      process.env.PAYMENT_SERVICE_URL || 'http://localhost:4002/api/payments',
  },
});
