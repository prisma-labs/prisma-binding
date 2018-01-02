// Missing declarations in @types/graphql
import { GraphQLList, GraphQLNonNull, GraphQLType } from "graphql";

declare module 'graphql' {
    export type GraphQLWrappingType = GraphQLList<any> | GraphQLNonNull<any>;

    export function isWrappingType(type: GraphQLType): type is GraphQLWrappingType
    export function isListType(type: GraphQLType): type is GraphQLList<any>
}