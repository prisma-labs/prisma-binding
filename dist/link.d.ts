import { ApolloLink } from 'apollo-link';
export declare function makePrismaLink({endpoint, token, debug}: {
    endpoint: string;
    token?: string;
    debug?: boolean;
}): ApolloLink;
