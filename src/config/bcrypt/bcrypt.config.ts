import * as _ from 'lodash';
export interface IBcryptConfiguration {
  saltOrRounds: number;
}

export const bcryptConfigurationFn = (): IBcryptConfiguration => ({
  saltOrRounds: _.isNumber(process.env.BCRYPT_SALT_OR_ROUNDS)
    ? +process.env.BCRYPT_SALT_OR_ROUNDS
    : 10,
});
