import { TypescriptGenerator } from 'graphql-binding';
export declare class PrismaTypescriptGenerator extends TypescriptGenerator {
    constructor(options: any);
    render(): string;
    renderImports(): string;
    renderExports(): string;
    renderTypedefs(): string;
    renderExists(): string;
}
