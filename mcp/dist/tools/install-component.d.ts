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
            method: {
                type: string;
                enum: string[];
                description: string;
            };
            target_dir: {
                type: string;
                description: string;
            };
            dry_run: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handler(args: Record<string, unknown>): Promise<string>;
//# sourceMappingURL=install-component.d.ts.map