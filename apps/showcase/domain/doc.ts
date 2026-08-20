export interface Doc {
    id?: string;
    description?: string;
    label?: string;
    component?: any;
    doc?: Doc[];
    children?: Doc[];
}
