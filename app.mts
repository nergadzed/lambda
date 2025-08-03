type ElementAttributes<E extends Element> = Writables<FilterPropertiesByValue<E, string | number | boolean | null>>
type ElementAttributesNonARIA<E extends Element> = FilterPropertiesByKey<ElementAttributes<E>, { pattern: FilterOption_PrefixedBy<"aria">, invert: true }>
type Equality<X, Y, A = X, B = never> = ( <T>() => T extends X ? 0 : 1 ) extends ( <T>() => T extends Y ? 0 : 1 ) ? A : B
type FilterOption_PrefixedBy<Prefix = string> = Prefix extends string ? `${ Prefix }${ string }` : never
type FilterOption<Pattern> = { pattern: Pattern, invert?: boolean }
type FilterPropertiesByKey<Type, Options extends FilterOption<unknown>> = { [ P in keyof Type as ( Options[ "invert" ] extends true ? false : true ) extends ( P extends Options[ "pattern" ] ? true : false ) ? P : never ]: Type[ P ] }
type FilterPropertiesByValue<Type, Value> = { [ P in keyof Type as Type[ P ] extends Value ? P : never ]: Type[ P ] }
type SpecifiableCSSProperties = FilterPropertiesByKey<FilterPropertiesByValue<CSSStyleDeclaration, string>, { pattern: FilterOption_PrefixedBy<"webkit">, invert: true } | { pattern: FilterOption_PrefixedBy }>
type Writables<T> = { [ K in keyof T as Equality<{ [ P in K ]: T[ P ] }, { -readonly [ P in K ]: T[ P ] }, K, never> ]: T[ K ] }

declare function constructElement<Tag extends keyof HTMLElementTagNameMap>(
    tagName: Tag,
    parentElement: Element,
    attributes: Partial<ElementAttributesNonARIA<HTMLElementTagNameMap[ Tag ]>>,
    css: Partial<SpecifiableCSSProperties>,
): void

declare function constructStyleSheet(): void
