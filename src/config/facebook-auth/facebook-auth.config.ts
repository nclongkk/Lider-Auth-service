export interface IFacebookAuthConfiguration {
  clientId: string;
  secret: string;
}

export const facebookAuthConfigurationFn = (): IFacebookAuthConfiguration => ({
  clientId: process.env.FACEBOOK_APP_ID ?? '',
  secret: process.env.FACEBOOK_APP_SECRET ?? '',
});
