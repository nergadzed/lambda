type Nullable<T> = T | null | undefined
type Index = [ y: number, x: number ]
type Factory<T> = ( ..._:Index ) => Nullable<T>
type Source<T> = Factory<T> | Matrix<T> | Array<Array<Nullable<T>>> | Array<Nullable<T>>
type Predicate<T> = ( value: T, ..._:Index ) => boolean
type Transform<T> = ( value: T, ..._:Index ) => T
type MGen<T, E extends [ entry: Nullable<T> ] | [] = [ entry: Nullable<T> ]> = Generator<[ ...E, ...Index ], void, Nullable<Index>>
type Traversal = [ initial: Index, move: Index, ...Index[] ]
const Equality = ( target: unknown ) => ( value: unknown ) => Object.is( value, target )

class Matrix<T /* extends string | number | bigint | boolean | symbol | NonNullable<object> | Function */> {
    static factory   <T> ( source: Source<T> ): Factory<T> {
        switch ( true ) {
        case Matrix.isFunc<T>( source ): return                                         source
        case Matrix.isSelf<T>( source ): return             ( y: number, x: number ) => source.state[ y ]?.[ x ]
        case Matrix.isDeep<T>( source ): return             ( y: number, x: number ) => source      [ y ]?.[ x ]
        case Matrix.isFlat<T>( source ): return ( source => ( y: number, x: number ) => source.next( [ y, x ] ).value )( source.values() )
        default: throw new TypeError
        }
    }
    static isFunc    <T> ( target: unknown ): target is Factory<T> {
        return typeof target === 'function'
    }
    static isSelf    <T> ( target: unknown ): target is Matrix<T> {
        return target instanceof Matrix
    }
    static isDeep    <T> ( target: unknown ): target is T[][] {
        return Array.isArray( target ) && target.every( member => Array.isArray( member ) )
    }
    static isFlat    <T> ( target: unknown ): target is T[] {
        return Array.isArray( target )
    }
    static rotate    <T> ( target: Matrix<T>, n: number ): Matrix<T> {
        switch ( (n % 4 + 4) % 4 ) {
        case 1: return new Matrix<T>( target.x, target.y, target.cols.map( row => row.reverse() ) )
        case 2: return new Matrix<T>( target.y, target.x, target.rows.reverse().map( col => col.reverse() ) )
        case 3: return new Matrix<T>( target.x, target.y, target.cols.reverse() )
        case 0: return new Matrix<T>( target.y, target.x, target.rows )
        default: throw new Error
        }
    }
    static transpose <T> ( target: Matrix<T> ): Matrix<T> {
        return new Matrix<T>( target.x, target.y, target.cols )
    }
    static traverse  <T> ( target: Matrix<T>, ...walk: [ Traversal, ...Traversal[] ] ): Matrix<T> {
        const init     = walk.map( traversal => traversal.shift() as Index )
        const move     = walk.map( traversal => Array.from( Array( target.x ), ( _, index ) => traversal[ index % traversal.length ] ) )
        const source   = init.map( ( initial, index ) => {
            const mGen = target[ Symbol.iterator ]( initial, false )
            return move[ index ].map( m => mGen.next( m ).value?.[ 0 ] )
        } )
        return new Matrix<T>( walk.length, target.x, source )
    }
    static frame     <T> ( target: Matrix<T>, yStart: number, xStart: number, yEnd: number, xEnd: number ): Matrix<T> {
        const factory = Matrix.factory<T>( target.rows )
        return new Matrix<T>( ...[ yEnd - yStart, xEnd - xStart ], ( y, x ) => factory( yStart + y, xStart + x ) )
    }
    static scale     <T> ( target: Matrix<T>, yBy: number, xBy: number, ...sources: Source<T>[] ): Matrix<T> {
        return new Matrix<T>( target.y + yBy, target.x + xBy, ...sources )
    }
    static shift     <T> ( target: Matrix<T>, yBy: number, xBy: number, ...sources: Source<T>[] ): Matrix<T> {
        const factory = Matrix.factory<T>( target )
        return new Matrix<T>( target.y, target.x, ( y, x ) => factory( y - yBy, x - xBy ), ...sources )
    }
    static inflate   <T> ( target: Matrix<T>, ...sources: Source<T>[] ): Matrix<T> {
        const factory = Matrix.factory<T>( target )
        return new Matrix<T>( target.y * 2 - 1, target.x * 2 - 1, ( y, x ) => factory( y % 2 ? -1 : y >> 1, x % 2 ? -1 : x >> 1 ), ...sources )
    }
    static fill      <T> ( target: Matrix<T>, ...sources: [ Source<T>, ...Source<T>[] ] ): Matrix<T> {
        return new Matrix<T>( target.y, target.x, ...sources )
    }
    static deflate   <T> ( target: Matrix<T>, discard: T, predicate: Predicate<Nullable<T>> = Equality( discard ) ): Matrix<T> {
        const factory = Matrix.factory<T>( target )
        let   [ Y,  X  ] = [ 0, 0 ]
        const [ Ys, Xs ] = [
            target.state     .map( ( row, y ) => row.every( ( entry, x ) => predicate( entry, y, x ) ) ? Y++ : y ), // Performance gain by direct access of the state rather than target.rows use?
            target.transposed.map( ( col, x ) => col.every( ( entry, y ) => predicate( entry, y, x ) ) ? X++ : x ), // Performance gain by direct access of the state rather than target.transposed use?
        ]; return new Matrix<T>( target.y - Y, target.x - X, ( y, x ) => factory( Ys[ y ], Xs[ x ] ) )
    }
    static omit      <T> ( target: Matrix<T>, discard: T, predicate: Predicate<Nullable<T>> = Equality( discard ) ): Matrix<T> {
        const factory = Matrix.factory<T>( target )
        return new Matrix<T>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, y, x ) ? null : entry )( factory( y, x ) ) )
    }
    static replace   <T> ( target: Matrix<T>, discard: T, by: T, predicate: Predicate<Nullable<T>> = Equality( discard ), transform: Transform<Nullable<T>> = () => by ): Matrix<T> {
        const factory = Matrix.factory<T>( target )
        return new Matrix<T>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, y, x ) ? transform( entry, y, x ) : entry )( factory( y, x ) ) )
    }
    static apply     <T> ( target: Matrix<T>, transform: Transform<Nullable<T>> ): Matrix<T> {
        const factory = Matrix.factory<T>( target )
        return new Matrix<T>( target.y, target.x, ( y, x ) => ( entry => transform( entry, y, x ) )( factory( y, x ) ) )
    }
    static extract   <T> ( target: Matrix<T>, entry: T, predicate: Predicate<Nullable<T>> = Equality( entry ) ): Matrix<T> {
        const factory = Matrix.factory<T>( target )
        return new Matrix<T>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, y, x ) ? entry : null )( factory( y, x ) ) )
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

    * [ Symbol.iterator ] (
        initial   : Index                 = [ 0, 0 ],
        limit     : number                = this.y * this.x - initial[ 0 ] * initial[ 1 ],
        traversal : [ Index, ...Index[] ] = Array.of(
            ...Array( this.x - initial[ 1 ] ).fill( [ 0, 1 ] ), [ 1, 1 - this.x ],
            ...Array( this.x                ).fill( [ 0, 1 ] ), [ 1, 1 - this.x ],
        ) as [ Index, ...Index[] ],
        relative  : boolean               = true,
    ): MGen<T> {
        let [ λ, y, x ] = [ 0, ...initial ],
            input: Nullable<Index>,
            increment = relative
                ? ( index: Index, shift: Index ): Index => [ index[ 0 ] + shift[ 0 ], index[ 1 ] + shift[ 1 ] ]
                : (     _: Index, shift: Index ): Index => [              shift[ 0 ],              shift[ 1 ] ]
        while ( limit > λ ++ ) {
            input = yield [ this.state[ input?.[ 0 ] ?? y ]?.[ input?.[ 1 ] ?? x ], ...input ?? [ y, x ] ];
            [ y, x ] = increment( [ y, x ], traversal[ λ % traversal.length ] )
        }
    }

    // *[ Symbol.iterator ] ( [ y, x ]: Index = [ 0, 0 ], absolute: boolean = true, traverse ): MGen<T> {
    //     let input: Nullable<Index>
    //     const move = absolute
    //         ? ( index: number, axis: 0 | 1 ) => ( input?.[ axis ] ?? index + axis ) - axis
    //         : ( index: number, axis: 0 | 1 ) => index += ( input?.[ axis ] ?? 0 + axis ) - axis
    //     for ( let row = y; row < this.y; row++ ) {
    //     for ( let col = x; col < this.x; col++ ) {
    //         input = yield [ this.state[ row ]?.[ col ], row, col ]
    //         row   = move( row, 0 )
    //         col   = move( col, 1 )
    //     } x = 0 }
    // }
    // * indexOf ( entry: Nullable<T>, initial: Index = [ 0, 0 ], predicate: Predicate<Nullable<T>> = Equality( entry ) ): MGen<T,[]> {
    //     let entries = this[ Symbol.iterator ]( initial ),
    //         result  = entries.next()
    //     while ( ! result.done ) {
    //         let input: Nullable<Index>
    //         if ( predicate( ...result.value ) )
    //             input = yield [ result.value[ 1 ], result.value[ 2 ] ]
    //         result = entries.next( input )
    //     } entries.return()
    // }
}

let m0 = new Matrix( 4, 8, ( y, x ) => `${ y }x${ x }` )
// let m0gen = m0[ Symbol.iterator ]( [ 0, 0 ], false )
// let t0 = Matrix.traverse( m0, [ [ 0, 0 ], [ 0, 1 ] ], [ [ 1, 0 ], [ 0, 1 ] ], [ [ 2, 7 ], [ 0, -1 ] ], [ [ 0, 0 ], [ 1, 1 ] ] )
// let m0 = new Matrix( 4, 8, ( y, x ) => y * x )