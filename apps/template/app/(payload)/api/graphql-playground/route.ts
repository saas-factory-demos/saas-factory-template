import config from '@payload-config';
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes';

/**
 * GraphQL Playground UI（/api/graphql-playground）。
 */
export const GET = GRAPHQL_PLAYGROUND_GET(config);
