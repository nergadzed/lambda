type ElementAttributes<E extends Element> = Writables<FilterPropertiesByValue<E, string | number | boolean | null>>
type ElementAttributesNonARIA<E extends Element> = FilterPropertiesByKey<ElementAttributes<E>, { pattern: FilterOption_PrefixedBy<"aria">, invert: true }>
type Equality<X, Y, A = X, B = never> = ( <T>() => T extends X ? 0 : 1 ) extends ( <T>() => T extends Y ? 0 : 1 ) ? A : B
type FilterOption_PrefixedBy<Prefix = string> = Prefix extends string ? `${ Prefix }${ string }` : never
type FilterOption<Pattern> = { pattern: Pattern, invert?: boolean }
type FilterPropertiesByKey<Type, Options extends FilterOption<unknown>> = { [ P in keyof Type as ( Options[ "invert" ] extends true ? false : true ) extends ( P extends Options[ "pattern" ] ? true : false ) ? P : never ]: Type[ P ] }
type FilterPropertiesByValue<Type, Value> = { [ P in keyof Type as Type[ P ] extends Value ? P : never ]: Type[ P ] }
type SpecifiableCSSProperties = FilterPropertiesByKey<FilterPropertiesByValue<CSSStyleDeclaration, string>, { pattern: FilterOption_PrefixedBy<"webkit">, invert: true } | { pattern: FilterOption_PrefixedBy }>
type Writables<T> = { [ K in keyof T as Equality<{ [ P in K ]: T[ P ] }, { -readonly [ P in K ]: T[ P ] }, K, never> ]: T[ K ] }

class GridContainer extends HTMLElement {
    static observedAttributes = [ "rows", "columns", "rowTemplate", "colTemplate" ]
    styleSheet: CSSStyleSheet
    selfStyleRule: CSSStyleRule
    parent: HTMLElement | null = null
    constructor (
        protected rows: number = 1,
        protected cols: number = 1,
        protected display: "grid" | "inline-grid" = "grid",
        protected rowTemplate: string = `repeat(${ rows }, 1fr)`,
        protected colTemplate: string = `repeat(${ cols }, 1fr)`,
    ) {
        super()
        try {
            CSSStyleValue.parse( "grid-template-rows", rowTemplate )
            CSSStyleValue.parse( "grid-template-columns", rowTemplate )
        } catch {
            console.error( "Unable to parse supplied grid-template-rows/grid-template-columns" )
            rowTemplate = `repeat(${ rows }, 1fr)`
            colTemplate = `repeat(${ cols }, 1fr)`
        }
        this.styleSheet = new CSSStyleSheet
        this.selfStyleRule = this.styleSheet.cssRules.item( this.styleSheet.insertRule( "grid-container {}" ) ) as CSSStyleRule
        const propertyValuePairs: Array<[ string, CSSStyleValue ]> = [
            [ "display", new CSSKeywordValue( "grid" ) ],
            [ "width", CSS.percent( 100 ) ],
            [ "height", CSS.percent( 100 ) ],
            [ "grid-template-rows", new CSSUnparsedValue( [ rowTemplate ] ) ],
            [ "grid-template-columns", new CSSUnparsedValue( [ colTemplate ] ) ],
        ]
        for ( const [ property, value ] of propertyValuePairs )
            this.selfStyleRule.styleMap.set( property, value )
    }
    adoptedCallback( ...rest: unknown[] ) {
        console.log( "adoptedCallback", rest )
    }
    attributeChangedCallback( ...rest: unknown[] ) {
        console.log( "attributeChangedCallback", rest )
    }
    connectedCallback( ...rest: unknown[] ) {
        this.parent = this.parentElement
        this.parent?.shadowRoot ?? this.parentElement?.attachShadow( { mode: "open" } )
        this.parent?.shadowRoot?.adoptedStyleSheets.push( this.styleSheet )
        this.parent?.shadowRoot?.appendChild( this )
    }
    connectedMoveCallback( ...rest: unknown[] ) {
        console.log( "connectedMoveCallback", rest )
    }
    disconnectedCallback( ...rest: unknown[] ) {
        console.log( "disconnectedCallback", rest )
    }
}

customElements.define( "grid-container", GridContainer )
