import { Injectable } from '@nestjs/common';
import fastRedact from 'fast-redact';

import { NODE_ENV } from '../../constants';
import { ILogLevel, IRequestContextStore } from '../../logger/logger.interface';
import { AppConfigService } from '../config.service';

@Injectable()
export class LoggerConfigHelper {
  private readonly pinoLevels: ILogLevel = {
    debug: 20,
    error: 50,
    fatal: 60,
    info: 30,
    trace: 10,
    warn: 40,
  };

  constructor(private configService: AppConfigService) {}

  public getLoggerLevelConfig(): ILogLevel {
    const enableLevels = this.configService.get('logger.levels');

    Object.keys(this.pinoLevels).forEach((pinoLevel) => {
      if (enableLevels.includes('silent')) {
        // 0 is enable log level milestone
        this.pinoLevels[pinoLevel as keyof ILogLevel] = -1;
        return;
      }

      if (!enableLevels.includes(pinoLevel)) {
        // 0 is milestone to enable log level
        this.pinoLevels[pinoLevel as keyof ILogLevel] = -1;
      }
    });

    return { ...this.pinoLevels, enable: 0 };
  }

  public getTransportConfig(): any {
    return this.configService.get('app.env') === NODE_ENV.DEV
      ? {
          options: {
            colorize: true,
            ignore: 'pid,hostname,service',
            levelFirst: true,
            translateTime: 'SYS:standard',
          },
          target: 'pino-pretty',
        }
      : undefined;
  }

  public getRedactConfig(): { censor: string; paths: string[] } {
    return {
      censor: '********',
      paths: ['req.body.password', 'req.headers.authorization'],
    };
  }

  public getCustomLogLevelFn() {
    return (_req: any, res: any) => {
      if (res.statusCode >= 500) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    };
  }

  public getCustomPropsFn() {
    return (req: any) => {
      return {
        stack: req.stack,
        user: req.user,
      };
    };
  }

  public getFormattersConfig() {
    return {
      level: (label: string): Record<string, any> => {
        return { level: label };
      },
    };
  }

  public getSerializersConfig() {
    return {
      req(req: any) {
        req.body = req.raw?.body;
        return req;
      },
    };
  }

  public getLogData(mergeObject: any): any {
    const res: IRequestContextStore['res'] = mergeObject?.res;
    const req = res?.req;
    const redact = fastRedact({
      paths: this.getRedactConfig().paths,
      remove: true,
    });
    const logData = {
      log: mergeObject.log,
      req: {
        body: req?.body,
        headers: req?.headers,
        id: req?.id,
        method: req?.method,
        params: req?.params,
        query: req?.query,
        remoteAddress:
          req?.headers['x-forwarded-for'] ?? req?.socket.remoteAddress,
        remotePort: req?.socket.remotePort,
        url: req?.url,
      },
      user: req?.user,
      res: {
        error: mergeObject.err,
        headers: res?.getHeaders(),
        statusCode: res?.statusCode,
      },
      stack: (req as any)?.stack,
    };

    return JSON.stringify(JSON.parse(redact(logData) as string), null, 2);
  }
}
