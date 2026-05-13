export declare const definition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            category: {
                type: string;
                description: string;
            };
            featured_only: {
                type: string;
                description: string;
            };
            new_only: {
                type: string;
                description: string;
            };
        };
    };
};
export declare function handler(args: Record<string, unknown>): Promise<string>;
//# sourceMappingURL=list-components.d.ts.map