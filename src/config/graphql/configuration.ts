export interface IGraphQLConfig {
  path: string;
}

export const graphQlConfigurationFn = (): IGraphQLConfig => ({
  path: process.env.GRAPHQL_ENDPOINT ?? '/graphql',
});
