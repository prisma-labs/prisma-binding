import { Binding } from 'graphql-binding';
import { Exists, PrismaOptions } from './types';
export declare class Prisma extends Binding {
    exists: Exists;
    constructor({typeDefs, endpoint, secret, fragmentReplacements, debug}: PrismaOptions);
    private buildExists();
}
