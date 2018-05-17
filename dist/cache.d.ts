import { GraphQLSchema } from 'graphql';
import { SharedLink } from './SharedLink';
export declare function getCachedTypeDefs(schemaPath: string): string;
export declare function getCachedRemoteSchema(typeDefs: string, link: SharedLink): GraphQLSchema;
