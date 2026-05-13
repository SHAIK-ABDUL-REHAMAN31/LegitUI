export declare const definition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handler(args: Record<string, unknown>): Promise<string>;
//# sourceMappingURL=search-components.d.ts.map