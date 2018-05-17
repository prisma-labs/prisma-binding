import { GraphQLObjectType } from 'graphql';
export declare function getExistsTypes(queryType: GraphQLObjectType): string;
export declare function getExistsFlowTypes(queryType: GraphQLObjectType): string;
export declare function getTypesAndWhere(queryType: GraphQLObjectType): {
    type: any;
    pluralFieldName: any;
    where: string;
}[];
export declare function getWhere(field: any): string;
export declare function getDeepListType(field: any): any;
