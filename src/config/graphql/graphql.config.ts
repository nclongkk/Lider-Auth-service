import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { NODE_ENV } from '../../constants';
import { AppI18nService } from '../../i18n/i18n.service';
import { AppConfigService } from '../config.service';

@Injectable()
export class GraphQLConfigService
  implements GqlOptionsFactory<ApolloDriverConfig>
{
  constructor(private readonly configService: AppConfigService) {}

  createGqlOptions():
    | Omit<ApolloDriverConfig, 'driver'>
    | Promise<Omit<ApolloDriverConfig, 'driver'>> {
    const isProduction = this.configService.get('app.env') === NODE_ENV.PROD;
    return {
      typePaths: ['./**/*.graphql'],
      autoSchemaFile: 'schema.graphql',
      debug: !isProduction,
      playground: {
        settings: {
          'schema.polling.enable': false,
        },
      },
      path: this.configService.get('gql.path'),
      formatError: this.formatError,
    };
  }

  formatError(error: GraphQLError) {
    const extensions: any = error?.extensions;
    const graphQLFormattedError: GraphQLFormattedError = {
      message: error?.message,
      locations: error?.locations,
      path: error?.path,
      extensions: {
        statusCode: extensions?.response?.statusCode,
        exception: {
          stacktrace: extensions?.exception?.stacktrace,
        },
      },
    };
    return graphQLFormattedError;
  }
}
