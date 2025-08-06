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
    static readonly observedAttributes = [ "rows", "cols", "rowTemplate", "colTemplate" ] as const
    styleSheet: CSSStyleSheet
    selfStyleRule: CSSStyleRule
    root: ShadowRoot | null = null
    constructor (
        protected rows: number = 1,
        protected cols: number = 1,
        protected display: "grid" | "inline-grid" = "grid",
        protected rowTemplate: string = `repeat(${ rows }, 1fr)`,
        protected colTemplate: string = `repeat(${ cols }, 1fr)`,
    ) {
        super()

        this.styleSheet = new CSSStyleSheet
        this.selfStyleRule = this.styleSheet.cssRules[ this.styleSheet.insertRule( ":host {}" ) ] as CSSStyleRule
        const propertyValuePairs: Array<[ string, string ]> = [
            [ "display", "grid" ],
            [ "container-type", "size" ],
            // [ "width", "98cqw" ],
            [ "height", "98cqh" ],
            [ "box-sizing", "border-box" ],
            [ "margin-top", "1cqh" ],
            [ "margin-right", "1cqw" ],
            [ "margin-bottom", "1cqh" ],
            [ "margin-left", "1cqw" ],
            [ "grid-template-rows", rowTemplate ],
            [ "grid-template-columns", colTemplate ],
            [ "grid-auto-rows", "0" ],
            [ "grid-auto-columns", "0" ],
        ]; for ( const [ property, value ] of propertyValuePairs ) this.updateStyle( property, value )
    }
    protected updateStyle( property: string, value: string ) {
        try {
            if ( typeof value === "string" ) {
                CSSStyleValue.parse( property, value )
            }
            this.selfStyleRule.style.setProperty( property, value )
        } catch {
            console.error( `Unable to parse ${ value } as valid value for ${ property }.` )
        }
    }
    adoptedCallback( ...rest: unknown[] ) {
        console.log( "adoptedCallback", rest )
    }
    attributeChangedCallback( name: typeof GridContainer.observedAttributes[ number ], oldValue: string | null, newValue: string | null ) {
        console.log( `${ name } changed from ${ oldValue } to ${ newValue }` )
        switch ( name ) {
        case "rows":
            newValue = `repeat(${ newValue ?? "1" }, 1fr)`
        case "rowTemplate":
            this.updateStyle( "grid-template-rows", newValue ?? "repeat(1, 1fr)" )
            break
        case "cols":
            newValue = `repeat(${ newValue ?? "1" }, 1fr)`
        case "colTemplate":
            this.updateStyle( "grid-template-columns", newValue ?? "repeat(1, 1fr)" )
            break
        default:
            const _exhaustive: never = name
            throw new Error( `GridContainer's attributeChangedCallback's switch is non-exhaustive. Missed ${ _exhaustive }` )
        }
    }
    connectedCallback() {
        this.root = this.attachShadow( { mode: "open" } )
        this.root.adoptedStyleSheets = [ this.styleSheet ]
        this.root.appendChild( document.createElement( "slot" ) )
    }
    connectedMoveCallback( ...rest: unknown[] ) {
        console.log( "connectedMoveCallback", rest )
    }
    disconnectedCallback( ...rest: unknown[] ) {
        console.log( "disconnectedCallback", rest )
    }
}

customElements.define( "grid-container", GridContainer )
