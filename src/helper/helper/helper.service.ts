import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import geoip from 'geoip-lite';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from '../../config/config.service';
import { NODE_ENV } from '../../constants';

import { COUNTRIES_MAPPING } from '../../constants/country.constants';
import { SIGN_UP_TRACKING_PROVIDER } from '../../constants/signup-tracking-provider.constant';
import { AsyncService } from '../async/async.service';

@Injectable()
export class HelperService {
  private readonly geolocationDBServiceURI: string;
  private readonly ipLocation: string;
  constructor(
    private asyncService: AsyncService,
    private httpService: HttpService,
    private configService: AppConfigService,
  ) {}

  formatUsernameWhenSendEmail(user) {
    const name = user?.fullName || user?.email?.split('@')[0];
    return name
      ?.split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async getCountryFromIp(
    req,
    ip: string,
  ): Promise<{ country: string; provider: string; countryName: string }> {
    const tracking = geoip.lookup(ip);
    if (tracking?.country) {
      return {
        country: tracking.country,
        countryName: COUNTRIES_MAPPING[tracking.country],
        provider: SIGN_UP_TRACKING_PROVIDER.GEO_LITE,
      };
    }

    const retryOptions = {
      times: 5,
      interval: 3000,
    };

    if (this.configService.get('app.env') === NODE_ENV.DEV) {
      retryOptions.times = 1;
    }

    const ipLocationUrl = `${this.ipLocation}&ip=${ip}`;
    const ipLocation = await this.asyncService.asyncRetry(
      async () => lastValueFrom(this.httpService.get(ipLocationUrl)),
      retryOptions,
    );

    if (ipLocation?.data?.country_code2) {
      return {
        country: ipLocation.data.country_code2,
        countryName: COUNTRIES_MAPPING[ipLocation.data.country_code2],
        provider: SIGN_UP_TRACKING_PROVIDER.IP_LOCATION,
      };
    }

    const geoUrl = `${this.geolocationDBServiceURI}/${ip}`;
    const geolocation = await this.asyncService.asyncRetry(
      async () => lastValueFrom(this.httpService.get(geoUrl)),
      retryOptions,
    );

    if (
      !geolocation?.data?.country_code ||
      geolocation?.data?.country_code !== 'Not found'
    ) {
      return {
        country: geolocation.data.country_code,
        countryName: COUNTRIES_MAPPING[geolocation.data.country_code],
        provider: SIGN_UP_TRACKING_PROVIDER.GEOLOCATION_DB,
      };
    }

    return {
      country: '',
      countryName: '',
      provider: '',
    };
  }

  generatePassword = (length = 8) => {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  };
}
