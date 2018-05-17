import { FragmentReplacement } from 'graphql-binding';
import { GraphQLResolveInfo } from 'graphql';
export interface Filter {
    [key: string]: any;
}
export interface Exists {
    [rootField: string]: (filter: Filter) => Promise<boolean>;
}
export interface BasePrismaOptions {
    fragmentReplacements?: FragmentReplacement[];
    endpoint?: string;
    secret?: string;
    debug?: boolean;
}
export interface PrismaOptions extends BasePrismaOptions {
    typeDefs: string;
}
export interface QueryMap {
    [rootField: string]: (args?: {
        [key: string]: any;
    }, info?: GraphQLResolveInfo | string) => Promise<any>;
}
export interface SubscriptionMap {
    [rootField: string]: (args?: any, info?: GraphQLResolveInfo | string) => AsyncIterator<any> | Promise<AsyncIterator<any>>;
}
