export declare const definition: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            slug: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handler(args: Record<string, unknown>): Promise<string>;
//# sourceMappingURL=get-component.d.ts.map