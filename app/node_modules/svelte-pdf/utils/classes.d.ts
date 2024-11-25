export default function utils(color: any, defaultDepth?: number): {
    bg: (depth: any) => string;
    border: (depth: any) => string;
    txt: (depth: any) => string;
    caret: (depth: any) => string;
};
export function filterProps(reserved: any, props: any): {};
export class ClassBuilder {
    constructor(classes: any, defaultClasses: any);
    defaults: any;
    classes: any;
    flush(): ClassBuilder;
    extend(...fns: any[]): ClassBuilder;
    get(): any;
    replace(classes: any, cond?: boolean): ClassBuilder;
    remove(classes: any, cond?: boolean): ClassBuilder;
    add(className: any, cond: boolean | undefined, defaultValue: any): ClassBuilder;
}
