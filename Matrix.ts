type Nullable<T> = void | T | null | undefined
type Index = [ y: number, x: number ]
type Factory<T> = ( ..._:Index ) => Nullable<T>
type Source<T> = Factory<T> | Matrix<T> | Array<Array<Nullable<T>>> | Array<Nullable<T>> | Iterator<Nullable<T>, Nullable<T>, Nullable<Index>>
type Predicate<T> = ( value: T, index:Index ) => boolean
type Transform<T> = ( value: T, index:Index ) => T
const Equality = ( target: unknown ) => ( value: unknown ) => Object.is( value, target )

class Matrix<T /* extends string | number | bigint | boolean | symbol | NonNullable<object> | Function */> {
    static traversal = {
        abscissa: <S> ( magnitude: Index, offset: Index ) => ( entry: S, index: Index ) =>
            Array.of( ...Array( magnitude[ 1 ] - 1 ).fill( [ 0, 1 ] ), [ 1, 1 - magnitude[ 1 ] ] ) as [ Index, ...Index[] ],
        ordinate: <S> ( magnitude: Index, offset: Index ) => ( entry: S, index: Index ) =>
            Array.of( ...Array( magnitude[ 0 ] - 1 ).fill( [ 1, 0 ] ), [ 1 - magnitude[ 0 ], 1 ] ) as [ Index, ...Index[] ],
    }
    static factory   <S> ( source: Source<S> ): Factory<S> {
        switch ( true ) {
        case Matrix.isFunc<S>( source ):           return                                         source
        case Matrix.isSelf<S>( source ):           return             ( y: number, x: number ) => source.state[ y ]?.[ x ]
        case Matrix.isDeep<Nullable<S>>( source ): return             ( y: number, x: number ) => source[ y ]?.[ x ]
        case Matrix.isFlat<Nullable<S>>( source ): return ( source => ( y: number, x: number ) => source.next( [ y, x ] ).value )( source.values() )
        case Matrix.isIter<Nullable<S>>( source ): return             ( y: number, x: number ) => source.next( [ y, x ] ).value
        default: throw new TypeError
        }
    }
    static isFunc    <S> ( target: unknown ): target is Factory<S> {
        return typeof target === 'function'
    }
    static isSelf    <S> ( target: unknown ): target is Matrix<S> {
        return target instanceof Matrix
    }
    static isDeep    <S> ( target: unknown ): target is S[][] {
        return Array.isArray( target ) && target.every( member => Array.isArray( member ) )
    }
    static isFlat    <S> ( target: unknown ): target is S[] {
        return Array.isArray( target )
    }
    static isIter    <S> ( target: unknown ): target is Iterator<S, Nullable<S>, Nullable<Index>> {
        return target instanceof Iterator
    }
    static rotate    <S> ( target: Matrix<S>, n: number ): Matrix<S> {
        switch ( (n % 4 + 4) % 4 ) {
        case 1: return new Matrix<S>( target.x, target.y, target.cols.map( row => row.reverse() ) )
        case 2: return new Matrix<S>( target.y, target.x, target.rows.reverse().map( col => col.reverse() ) )
        case 3: return new Matrix<S>( target.x, target.y, target.cols.reverse() )
        case 0: return new Matrix<S>( target.y, target.x, target.rows )
        default: throw new Error
        }
    }
    static transpose <S> ( target: Matrix<S> ): Matrix<S> {
        return new Matrix<S>( target.x, target.y, target.cols )
    }
    static traverse  <S> ( target: Matrix<S> ) {
    }
    static frame     <S> ( target: Matrix<S>, yStart: number, xStart: number, yEnd: number, xEnd: number ): Matrix<S> {
        const factory = Matrix.factory<S>( target.rows )
        return new Matrix<S>( ...[ yEnd - yStart, xEnd - xStart ], ( y, x ) => factory( yStart + y, xStart + x ) )
    }
    static scale     <S> ( target: Matrix<S>, yBy: number, xBy: number, ...sources: Source<S>[] ): Matrix<S> {
        return new Matrix<S>( target.y + yBy, target.x + xBy, ...sources )
    }
    static shift     <S> ( target: Matrix<S>, yBy: number, xBy: number, ...sources: Source<S>[] ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => factory( y - yBy, x - xBy ), ...sources )
    }
    static inflate   <S> ( target: Matrix<S>, ...sources: Source<S>[] ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y * 2 - 1, target.x * 2 - 1, ( y, x ) => factory( y % 2 ? -1 : y >> 1, x % 2 ? -1 : x >> 1 ), ...sources )
    }
    static fill      <S> ( target: Matrix<S>, ...sources: [ Source<S>, ...Source<S>[] ] ): Matrix<S> {
        return new Matrix<S>( target.y, target.x, ...sources )
    }
    static deflate   <S> ( target: Matrix<S>, discard: S, predicate: Predicate<Nullable<S>> = Equality( discard ) ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        let   [ Y,  X  ] = [ 0, 0 ]
        const [ Ys, Xs ] = [
            target.state     .map( ( row, y ) => row.every( ( entry, x ) => predicate( entry, [ y, x ] ) ) ? Y++ : y ), // Performance gain by direct access of the state rather than target.rows use?
            target.transposed.map( ( col, x ) => col.every( ( entry, y ) => predicate( entry, [ y, x ] ) ) ? X++ : x ), // Performance gain by direct access of the state rather than target.transposed use?
        ]; return new Matrix<S>( target.y - Y, target.x - X, ( y, x ) => factory( Ys[ y ], Xs[ x ] ) )
    }
    static omit      <S> ( target: Matrix<S>, discard: S, predicate: Predicate<Nullable<S>> = Equality( discard ) ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? null : entry )( factory( y, x ) ) )
    }
    static replace   <S> ( target: Matrix<S>, discard: S, by: S, predicate: Predicate<Nullable<S>> = Equality( discard ), transform: Transform<Nullable<S>> = () => by ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? transform( entry, [ y, x ] ) : entry )( factory( y, x ) ) )
    }
    static apply     <S> ( target: Matrix<S>, transform: Transform<Nullable<S>> ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => transform( entry, [ y, x ] ) )( factory( y, x ) ) )
    }
    static extract   <S> ( target: Matrix<S>, entry: S, predicate: Predicate<Nullable<S>> = Equality( entry ) ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? entry : null )( factory( y, x ) ) )
    }
    state      : ReadonlyArray<ReadonlyArray<Nullable<T>>>
    transposed : ReadonlyArray<ReadonlyArray<Nullable<T>>>
    constructor ( public readonly y: number, public readonly x: number, ...sources: Source<T>[] ) {
        function coalesce ( y: number, x: number ) {
            const entries = sources.entries()
            return function recurse ( { done, value }: IteratorResult<[ index: number, source: Source<T> ], undefined> ): Nullable<T> {
                if ( done ) return null
                else return ( sources[ value[ 0 ] ] = Matrix.factory<T>( value[ 1 ] ) )( y, x ) ?? recurse( entries.next() )
            }( entries.next() )
        }
        this.state      = Array.from( Array( y ), ( _, y_index ) =>
                          Array.from( Array( x ), ( _, x_index ) => coalesce( y_index, x_index ) ) )
        this.transposed = Array.from( Array( x ), ( _, x_index ) =>
                          Array.from( Array( y ), ( _, y_index ) => this.state[ y_index ][ x_index ] ) )
    }
    get rows ()           { return this.     state             .map( identity => [ ...identity ] ) }
    row ( index: number ) { return this.     state.at( index )?.map( identity =>      identity   ) }
    get cols ()           { return this.transposed             .map( identity => [ ...identity ] ) }
    col ( index: number ) { return this.transposed.at( index )?.map( identity =>      identity   ) }

    // * [ Symbol.iterator ] (
    //     initial   : Index                 = [ 0, 0 ],
    //     limit     : number                = this.y * this.x - initial[ 0 ] * initial[ 1 ],
    //     traversal : [ Index, ...Index[] ] = Matrix.traversal.abscissa( [ this.y, this.x ], initial ),
    //     relative  : boolean               = true,
    // ): Generator<[ entry: Nullable<T>, Index ], void, Nullable<Index>> {
    //     let [ λ, y, x ] = [ 0, ...initial ], input: Nullable<Index>, increment = relative ?
    //         ( index: Index, shift: Index ) => [ index[ 0 ] + shift[ 0 ], index[ 1 ] + shift[ 1 ] ] :
    //         (     _: Index, shift: Index ) => [              shift[ 0 ],              shift[ 1 ] ]
    //     while ( limit > λ )
    //         ( input = yield [ this.state[ input?.[ 0 ] ?? y ]?.[ input?.[ 1 ] ?? x ], ...input ?? [ y, x ] ] ) ??
    //         ( [ y, x ] = increment( [ y, x ], traversal[ λ ++ % traversal.length ] ) )
    // }
    // * indexOf (
    //     entry     : Nullable<T>,
    //     initial   : Index = [ 0, 0 ],
    //     predicate : Predicate<Nullable<T>> = Equality( entry )
    // ): Generator<[ entry: Nullable<T>, Index ], void, void> {
    //     yield * this[ Symbol.iterator ]( initial ).filter( entry => predicate( ...entry ) )
    // }
}

let m0 = new Matrix( 4, 8, ( y, x ) => `${ y }x${ x }` )
// let m0gen = m0[ Symbol.iterator ]( [ 0, 0 ], false )
// let t0 = Matrix.traverse( m0, [ [ 0, 0 ], [ 0, 1 ] ], [ [ 1, 0 ], [ 0, 1 ] ], [ [ 2, 7 ], [ 0, -1 ] ], [ [ 0, 0 ], [ 1, 1 ] ] )
// let m0 = new Matrix( 4, 8, ( y, x ) => y * x )