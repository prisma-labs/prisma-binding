import { FlowGenerator } from "graphql-binding";
export declare class PrismaFlowGenerator extends FlowGenerator {
    constructor(options: any);
    render(): string;
    renderImports(): string;
    renderExports(): string;
    renderTypedefs(): string;
    renderExists(): string;
}
