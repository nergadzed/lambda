type Nullable<T> = T | null | undefined
type Attributes = { rows: `${ number }`, columns: `${ number }` }

interface ContainerGridConstructor {
    readonly observedAttributes: readonly ( keyof Attributes )[]
    new( rows: Attributes[ "rows" ], columns: Attributes[ "columns" ] ): ContainerGridInstance
}

interface ContainerGridInstance extends HTMLElement {
    sheet: CSSStyleSheet
    columns: Attributes[ "columns" ]
    rows: Attributes[ "rows" ]
    host: Nullable<HTMLDivElement>
    root: Nullable<ShadowRoot>
    hostRule: CSSStyleRule
    rootRule: CSSStyleRule
    adoptedCallback( this: ContainerGridInstance, previous: Document, current: Document ): void
    attributeChangedCallback( this: ContainerGridInstance,
        attribute: keyof Attributes,
        previous: Nullable<string>,
        current: Nullable<string>,
        namespace?: string
    ): void
    connectedCallback( this: ContainerGridInstance ): void
    connectedMoveCallback( this: ContainerGridInstance ): void
    disconnectedCallback( this: ContainerGridInstance ): void
    update( rule: CSSStyleRule, map: [ string, string ][] ): void
}

const ContainerGrid = class ContainerGrid extends HTMLElement implements ContainerGridInstance {
    public host: Nullable<HTMLDivElement>
    public hostRule: CSSStyleRule
    public root: Nullable<ShadowRoot>
    public rootRule: CSSStyleRule
    public sheet: CSSStyleSheet
    protected matrix: Array<Array<HTMLElement | null>> = [ [ null ] ]

    static readonly observedAttributes = [ "rows", "columns" ] as const
    constructor ( public rows: Attributes[ "rows" ] = '1', public columns: Attributes[ "columns" ] = '1' ) {
        super()
        this.root = this.host = null
        this.sheet = new CSSStyleSheet
        this.rootRule = this.sheet.cssRules.item( this.sheet.insertRule( ":host { }" ) ) as CSSStyleRule
        this.hostRule = this.sheet.cssRules.item( this.sheet.insertRule( "div#root { }" ) ) as CSSStyleRule
    }

    adoptedCallback( this: ContainerGridInstance, previous: Document, current: Document ): void {
        // What does this even do?
    }

    attributeChangedCallback(
        this: ContainerGridInstance,
        attribute: keyof Attributes,
        previous: Nullable<string>,
        current: Nullable<string>,
        namespace?: string
    ): void {
        switch ( attribute ) {
        case "rows":
        case "columns":
            this[ attribute ] = `${ parseInt( current ?? previous ?? '1' ) }`
            this.update( this.hostRule, [ [ `grid-template-${ attribute }`, `repeat(${ this[ attribute ] }, 1fr)` ] ] )
            break
        default: throw new Error
        }
    }

    update( rule: CSSStyleRule, map: [ string, string ][] ): void {
        for ( let [ property, value ] of map ) {
            try { CSSStyleValue.parse( property, value ) }
            catch ( error ) {
                console.error( error )
                continue
            }
            rule.styleMap.set( property, value )
        }
    }

    connectedCallback( this: ContainerGridInstance ): void {
        // Exsistence
        this.root ??= this.attachShadow( { mode: "open" } )
        this.host ??= document.createElement( "div" )
        // Structure
        this.root.append( this.host )
        this.host.append( ...this.children )
        // Style Sheet & Attribute
        this.root.adoptedStyleSheets = [ this.sheet ]
        this.host.hasAttribute( "id" ) || this.host.setAttribute( "id", "root" )

        this.update( this.rootRule, [
            [ "display", "block" ],
            this.parentElement instanceof HTMLBodyElement ? [ "height", "100%" ] : [ "", "" ],
        ] )

        this.update( this.hostRule, [
            [ "display", "grid" ],
            [ "grid-template-rows", `repeat(${ this.rows }, 1fr)` ],
            [ "grid-template-columns", `repeat(${ this.columns }, 1fr)` ],
            [ "height", "100%" ],
        ] )
    }

    connectedMoveCallback( this: ContainerGridInstance ): void { console.warn( "connectedMoveCallback was called!" ) }
    disconnectedCallback( this: ContainerGridInstance ): void { }
} satisfies ContainerGridConstructor

customElements.define( "container-grid", ContainerGrid )