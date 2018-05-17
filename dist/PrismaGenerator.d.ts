import { Generator } from 'graphql-binding';
export declare class PrismaGenerator extends Generator {
    constructor(options: any);
    render(): string;
    renderImports(): string;
    renderExports(): string;
    renderTypedefs(): string;
}
