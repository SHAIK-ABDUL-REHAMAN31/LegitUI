export interface ComponentProp {
    name: string;
    type: string;
    default?: string;
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{
        label: string;
        value: string;
    }>;
    label?: string;
    description: string;
    required?: boolean;
}
export interface LegitUIComponent {
    slug: string;
    name: string;
    folder?: string;
    fileName?: string;
    category: string;
    description: string;
    tags: string[];
    dependencies: string[];
    devDependencies?: string[];
    props?: ComponentProp[];
    usageExample?: string;
    featured?: boolean;
    isNew?: boolean;
    isUpdated?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface ComponentRegistry {
    components: LegitUIComponent[];
    version: string;
    updatedAt: string;
}
declare const PROJECT_ROOT: string;
export declare function getRegistry(): Promise<ComponentRegistry>;
export declare function getComponent(slug: string): Promise<LegitUIComponent | null>;
export declare function searchComponents(query: string): Promise<LegitUIComponent[]>;
export declare function listByCategory(category?: string): Promise<LegitUIComponent[]>;
export declare function getCategories(): Promise<string[]>;
export declare function getComponentSource(slug: string, variant?: "tsx" | "jsx" | "css"): Promise<string | null>;
export { PROJECT_ROOT };
//# sourceMappingURL=registry-loader.d.ts.map