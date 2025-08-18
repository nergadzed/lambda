interface ContainerGridConstructor {
    readonly observedAttributes: readonly [ rows: "rows", columns: "columns" ]
    new( ..._: ContainerGridConstructor[ "observedAttributes" ] ): HTMLElement
}

const ContainerGrid = class ContainerGrid extends HTMLElement {
    sheet: CSSStyleSheet
    rule: CSSRule
    static readonly observedAttributes = [ "rows", "columns" ] as const
    constructor ( public rows: string, public columns: string, shadowHost: boolean ) {
        super()
        this.sheet = new CSSStyleSheet
        this.rule = this.sheet.cssRules.item( this.sheet.insertRule( ":host { display: grid }" ) )!
    }
    adoptedCallback( previous: Document, current: Document ): void { }

    attributeChangedCallback( attribute: string, previous: string | null, current: string | null ): void { }

    connectedCallback(): void { }
    connectedMoveCallback(): void { }
    disconnectedCallback(): void { }
} satisfies ContainerGridConstructor

customElements.define( "container-grid", ContainerGrid )
