export interface IClientConfiguration {
  activeAccountRedirectUrl: string;
  expireSessionRedirectUrl: string;
  resetPasswordUrl: string;
  clientHomePage: string;
}

export const clientConfigurationFn = (): IClientConfiguration => ({
  clientHomePage: process.env.CLIENT_HOME_PAGE ?? '',
  activeAccountRedirectUrl: process.env.ACTIVATED_ACCOUNT_RESULT_PAGE ?? '',
  expireSessionRedirectUrl: process.env.EXPIRE_SESSION_PAGE ?? '',
  resetPasswordUrl: process.env.RESET_PASSWORD_PAGE ?? '',
});
