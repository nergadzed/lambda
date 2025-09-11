const ContainerGrid = class ContainerGrid extends HTMLElement {
    rows;
    columns;
    host;
    hostRule;
    root;
    rootRule;
    sheet;
    matrix = [[null]];
    static observedAttributes = ["rows", "columns"];
    constructor(rows = '1', columns = '1') {
        super();
        this.rows = rows;
        this.columns = columns;
        this.root = this.host = null;
        this.sheet = new CSSStyleSheet;
        this.rootRule = this.sheet.cssRules.item(this.sheet.insertRule(":host { }"));
        this.hostRule = this.sheet.cssRules.item(this.sheet.insertRule("div#root { }"));
    }
    adoptedCallback(previous, current) {
        // What does this even do?
    }
    attributeChangedCallback(attribute, previous, current, namespace) {
        switch (attribute) {
            case "rows":
            case "columns":
                this[attribute] = `${parseInt(current ?? previous ?? '1')}`;
                this.update(this.hostRule, [[`grid-template-${attribute}`, `repeat(${this[attribute]}, 1fr)`]]);
                break;
            default: throw new Error;
        }
    }
    update(rule, map) {
        for (let [property, value] of map) {
            try {
                CSSStyleValue.parse(property, value);
            }
            catch (error) {
                console.error(error);
                continue;
            }
            rule.styleMap.set(property, value);
        }
    }
    connectedCallback() {
        // Exsistence
        this.root ??= this.attachShadow({ mode: "open" });
        this.host ??= document.createElement("div");
        // Structure
        this.root.append(this.host);
        this.host.append(...this.children);
        // Style Sheet & Attribute
        this.root.adoptedStyleSheets = [this.sheet];
        this.host.hasAttribute("id") || this.host.setAttribute("id", "root");
        this.update(this.rootRule, [
            ["display", "block"],
            this.parentElement instanceof HTMLBodyElement ? ["height", "100%"] : ["", ""],
        ]);
        this.update(this.hostRule, [
            ["display", "grid"],
            ["grid-template-rows", `repeat(${this.rows}, 1fr)`],
            ["grid-template-columns", `repeat(${this.columns}, 1fr)`],
            ["height", "100%"],
        ]);
    }
    connectedMoveCallback() { console.warn("connectedMoveCallback was called!"); }
    disconnectedCallback() { }
};
customElements.define("container-grid", ContainerGrid);
export {};
