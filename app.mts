type ElementAttributes<E extends Element> = Writables<FilterPropertiesByValue<E, string | number | boolean | null>>
type ElementAttributesNonARIA<E extends Element> = FilterPropertiesByKey<ElementAttributes<E>, { pattern: FilterOption_PrefixedBy<'aria'>, invert: true }>
type Equality<X, Y, A = X, B = never> = ( <T>() => T extends X ? 0 : 1 ) extends ( <T>() => T extends Y ? 0 : 1 ) ? A : B
type FilterOption_PrefixedBy<Prefix = string> = Prefix extends string ? `${ Prefix }${ string }` : never
type FilterOption<Pattern> = { pattern: Pattern, invert?: boolean }
type FilterPropertiesByKey<Type, Options extends FilterOption<unknown>> = { [ P in keyof Type as ( Options[ 'invert' ] extends true ? false : true ) extends ( P extends Options[ 'pattern' ] ? true : false ) ? P : never ]: Type[ P ] }
type FilterPropertiesByValue<Type, Value> = { [ P in keyof Type as Type[ P ] extends Value ? P : never ]: Type[ P ] }
type SpecifiableCSSProperties = FilterPropertiesByKey<FilterPropertiesByValue<CSSStyleDeclaration, string>, { pattern: FilterOption_PrefixedBy<'webkit'>, invert: true } | { pattern: FilterOption_PrefixedBy }>
type Writables<T> = { [ K in keyof T as Equality<{ [ P in K ]: T[ P ] }, { -readonly [ P in K ]: T[ P ] }, K, never> ]: T[ K ] }

class GridContainer extends HTMLElement {
    styleSheet    : CSSStyleSheet
    selfStyleRule : CSSStyleRule
    root          : ShadowRoot | null = null
    rowVector     : Array<number>
    colVector     : Array<number>
    static readonly observedAttributes
        = [ 'rows', 'cols', 'rowTemplate', 'colTemplate' ] as const

    constructor (
        protected rows        : number                 = 1,
        protected cols        : number                 = 1,
        protected display     : 'grid' | 'inline-grid' = 'grid',
        protected rowTemplate : string                 = `repeat(${ rows }, 1fr)`,
        protected colTemplate : string                 = `repeat(${ cols }, 1fr)`,
    ) {
        super()

        this.styleSheet    = new CSSStyleSheet
        this.selfStyleRule = this.styleSheet.cssRules[ this.styleSheet.insertRule( ':host {}' ) ] as CSSStyleRule
        ( this.colVector   = Array( cols ).fill( [ 1, 0 ] ).flat() ).pop();
        ( this.rowVector   = Array( rows ).fill( [ 1, 0 ] ).flat() ).pop();

        const propertyValuePairs: Array<[ string, string ]> = [
            [ 'border'                , '1px solid #A0A0A0' ],
            [ 'box-sizing'            , 'border-box'        ],
            [ 'display'               , 'grid'              ],
            [ 'overflow'              , 'auto'              ],
            [ 'gap'                   , 'var(--spacing)'    ],
            [ 'grid-auto-columns'     , '0'                 ],
            [ 'grid-auto-rows'        , '0'                 ],
            [ 'grid-template-columns' , colTemplate         ],
            [ 'grid-template-rows'    , rowTemplate         ],
        ]
        for ( const [ property, value ] of propertyValuePairs )
            this.updateStyle( property, value )
    }

    protected updateStyle( property: string, value: string ) {
        try {
            CSSStyleValue.parse                 ( property, value )
            this.selfStyleRule.style.setProperty( property, value )
        } catch {
            console.error                       ( `Unable to parse ${ value } as valid value for ${ property }.` )
        }
    }

    attributeChangedCallback(
        name   : typeof GridContainer.observedAttributes[ number ],
        oldVal : string | null,
        newVal : string | null,
    ) {
        switch ( name ) {
        case 'rowTemplate': 
            this.updateStyle( 'grid-template-rows',    newVal ?? 'repeat(1, 1fr)'            )
            break
        case 'colTemplate': 
            this.updateStyle( 'grid-template-columns', newVal ?? 'repeat(1, 1fr)'            )
            break
        case 'rows': 
            this.rowVector.forEach(callbackfn)
            this.updateStyle( 'grid-template-rows',    `repeat(${ newVal ?? '1' },     1fr)` )
            break
        case 'cols': 
            this.updateStyle( 'grid-template-columns', `repeat(${ newVal ?? '1' },     1fr)` )
            break
        default:
            const _exhaustive: never = name
            throw new Error( `GridContainer's attributeChangedCallback's switch is non-exhaustive. Missed ${ _exhaustive }` )
        }
    }

    connectedCallback() {
        this.root                    = this.attachShadow( { mode: 'open' } )
        this.root.adoptedStyleSheets = [ this.styleSheet ]

        this.root.appendChild( document.createElement( 'slot' ) )
    }
}

class GridSlider extends HTMLElement {
    constructor ( private orientation: 'horizontal' | 'vertical' ) {
        super()
    }
    connectedCallback() {
        switch ( this.orientation ) {
        case 'horizontal':
            this.attributeStyleMap.set( 'height', 'var(--spacing)' )
            break
        case 'vertical':
            this.attributeStyleMap.set( 'width', 'var(--spacing)' )
            break
        default:
            const _exhaustive: never = this.orientation
        }
    }
}

customElements.define( 'grid-container', GridContainer )
