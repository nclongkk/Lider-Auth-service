export interface IGoogleAuthConfiguration {
  clientId: string;
  secret: string;
}

export const googleAuthConfigurationFn = (): IGoogleAuthConfiguration => ({
  clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  secret: process.env.GOOGLE_SECRET ?? '',
});
