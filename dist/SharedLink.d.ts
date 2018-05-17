import { ApolloLink, Operation, NextLink, Observable, FetchResult } from 'apollo-link';
export declare class SharedLink extends ApolloLink {
    private innerLink?;
    setInnerLink(innerLink: ApolloLink): void;
    request(operation: Operation, forward?: NextLink): Observable<FetchResult> | null;
}
