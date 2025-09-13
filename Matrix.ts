type Nullable  <T> = void | T | null | undefined
type Index         = [ y: number, x: number ]
type Factory   <T> = ( ..._:Index ) => Nullable<T>
type Source    <T> = Factory<T> | Matrix<T> | Array<Array<Nullable<T>>> | Array<Nullable<T>> | Iterator<Nullable<T>, Nullable<T>, Nullable<Index>>
type Traversal <T> = ( entry: Nullable<T>, index: Index ) => Index
type Predicate <T> = ( entry: Nullable<T>, index: Index ) => boolean
type Transform <T> = ( entry: Nullable<T>, index: Index ) => Nullable<T>
type Behavior      = 'constrain' | 'continue' | 'cycle' | 'throw'
const Equality     = ( target: unknown ) => ( value: unknown ) => Object.is( value, target )

class Matrix<T /* extends string | number | bigint | boolean | symbol | NonNullable<object> | Function */> {
    static traversal = {
        abscissa: function <S>( this: Matrix<S>, _: Nullable<S>, [ y, x ]: Index ): Index {
            return this.x > x + 1 ? [ y, ++ x ] : [ ++ y, 0 ]
        },
        ordinate: function <S>( this: Matrix<S>, _: Nullable<S>, [ y, x ]: Index ): Index {
            return this.y > y + 1 ? [ ++ y, x ] : [ 0, ++ x ]
        },
        overflow: ( behavior: Behavior, [ Y, X ]: Index ) => {
            function handle( value: number, limit: number ): number {
                if ( value >= limit ) switch ( behavior ) {
                    case 'constrain': return limit - 1
                    case 'continue' : return value
                    case 'cycle'    : return value % limit
                    case 'throw'    : throw new RangeError
                    default         : throw new TypeError
                } else return value }
            return ( [ y, x ]: Index ): Index => [ handle( y, Y ), handle( x, X ) ]
        }
    }
    static validation = {
        isFunc: <S>( target: unknown ): target is Factory<S> =>
            typeof target === 'function',
        isSelf: <S>( target: unknown ): target is Matrix<S> =>
            target instanceof Matrix,
        isDeep: <S>( target: unknown ): target is S[][] =>
            Array.isArray( target ) && target.every( member => Array.isArray( member ) ),
        isFlat: <S>( target: unknown ): target is S[] =>
            Array.isArray( target ),
        isIter: <S>( target: unknown ): target is Iterator<S, Nullable<S>, Nullable<Index>> =>
            target instanceof Iterator,
    }

    static coalesce  <S> ( ...sources : Source<S>[] ): Factory<S> {
        return ( ...[ y, x ]: Index ) => {
            for ( const [ index, source ] of sources.entries() ) {
                const entry: Nullable<S> = ( sources[ index ] = Matrix.factory<S>( source ) )( y, x )
                if ( entry != null ) return entry; else continue
            } return null
        }
    }
    static factory   <S> (    source  : Source<S>   ): Factory<S> {
        switch ( true ) {
            case Matrix.validation.isFunc<S>( source ):
                return source
            case Matrix.validation.isSelf<S>( source ):
                return ( y: number, x: number ) => source.state[ y ]?.[ x ]
            case Matrix.validation.isDeep<Nullable<S>>( source ):
                return ( y: number, x: number ) => source[ y ]?.[ x ]
            case Matrix.validation.isFlat<Nullable<S>>( source ):
                return ( source => ( y: number, x: number ) => source.next( [ y, x ] ).value )( source.values() )
            case Matrix.validation.isIter<Nullable<S>>( source ):
                return ( y: number, x: number ) => source.next( [ y, x ] ).value
            default: throw new TypeError
        }
    }

    static apply     <S> ( target: Matrix<S>, transform: Transform<S> ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => transform( entry, [ y, x ] ) )( factory( y, x ) ) )
    }
    static deflate   <S> ( target: Matrix<S>, discard: S, predicate: Predicate<S> = Equality( discard ) ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        let   [ Y,  X  ] = [ 0, 0 ]
        const [ Ys, Xs ] = [
            target.state     .map( ( row, y ) => row.every( ( entry, x ) => predicate( entry, [ y, x ] ) ) ? Y ++ : y ),
            target.transposed.map( ( col, x ) => col.every( ( entry, y ) => predicate( entry, [ y, x ] ) ) ? X ++ : x ),
        ]; return new Matrix<S>( target.y - Y, target.x - X, ( y, x ) => factory( Ys[ y ], Xs[ x ] ) )
    }
    static extract   <S> ( target: Matrix<S>, entry: S, predicate: Predicate<S> = Equality( entry ) ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? entry : null )( factory( y, x ) ) )
    }
    static fill      <S> ( target: Matrix<S>, ...sources: [ Source<S>, ...Source<S>[] ] ): Matrix<S> {
        return new Matrix<S>( target.y, target.x, ...sources )
    }
    static frame     <S> ( target: Matrix<S>, [ yStart, xStart, yEnd, xEnd ]: [ ...Index, ...Index ] ): Matrix<S> {
        const factory = Matrix.factory<S>( target.rows )
        return new Matrix<S>( ...[ yEnd - yStart, xEnd - xStart ], ( y, x ) => factory( yStart + y, xStart + x ) )
    }
    static inflate   <S> ( target: Matrix<S>, ...sources: Source<S>[] ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y * 2 - 1, target.x * 2 - 1, ( y, x ) => factory( y % 2 ? -1 : y >> 1, x % 2 ? -1 : x >> 1 ), ...sources )
    }
    static omit      <S> ( target: Matrix<S>, discard: S, predicate: Predicate<S> = Equality( discard ) ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? null : entry )( factory( y, x ) ) )
    }
    static replace   <S> ( target: Matrix<S>, discard: S, by: S, predicate: Predicate<S> = Equality( discard ), transform: Transform<S> = () => by ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? transform( entry, [ y, x ] ) : entry )( factory( y, x ) ) )
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
    static scale     <S> ( target: Matrix<S>, yBy: number, xBy: number, ...sources: Source<S>[] ): Matrix<S> {
        return new Matrix<S>( target.y + yBy, target.x + xBy, ...sources )
    }
    static shift     <S> ( target: Matrix<S>, yBy: number, xBy: number, ...sources: Source<S>[] ): Matrix<S> {
        const factory = Matrix.factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => factory( y - yBy, x - xBy ), ...sources )
    }
    static transpose <S> ( target: Matrix<S> ): Matrix<S> {
        return new Matrix<S>( target.x, target.y, target.cols )
    }
    static traverse  <S> ( target: Matrix<S>, traversal: Traversal<S>, scale: Index = [ target.y, target.x ], behavior: Behavior = 'continue' ): Matrix<S> {
        return new Matrix<S>( ...scale, target[ Symbol.iterator ]( [ 0, 0 ], scale[ 0 ] * scale[ 1 ], behavior, traversal ).map( entry => entry[ 0 ] ) )
    }

    state      : ReadonlyArray<ReadonlyArray<Nullable<T>>>
    transposed : ReadonlyArray<ReadonlyArray<Nullable<T>>>

    constructor ( public readonly y: number, public readonly x: number, ...sources: Source<T>[] ) {
        const factory   = Matrix.coalesce<T>( ...sources )
        this.state      = Array.from( Array( y ), ( _, y_index ) =>
                          Array.from( Array( x ), ( _, x_index ) => factory( y_index, x_index ) ) )
        this.transposed = Array.from( Array( x ), ( _, x_index ) =>
                          Array.from( Array( y ), ( _, y_index ) => this.state[ y_index ][ x_index ] ) )
    }
    get rows ()           { return this.     state             .map( identity => [ ...identity ] ) }
    row ( index: number ) { return this.     state.at( index )?.map( identity =>      identity   ) }
    get cols ()           { return this.transposed             .map( identity => [ ...identity ] ) }
    col ( index: number ) { return this.transposed.at( index )?.map( identity =>      identity   ) }

    * [ Symbol.iterator ] (
        initial  : Index        = [ 0, 0 ],
        limit    : number       = this.y * this.x - initial[ 0 ] * initial[ 1 ],
        behavior : Behavior     = 'cycle',
        traverse : Traversal<T> = Matrix.traversal.abscissa,
    ): Generator<[ entry: Nullable<T>, Index ], void, Nullable<Index>> {
        let [ y, x ] = initial, entry: Nullable<T>,
            overflow = Matrix.traversal.overflow( behavior, [ this.y, this.x ] )
        while ( entry = this.state[ y ]?.[ x ], limit --> 0 )
            [ y, x ] = overflow( traverse.call( this, entry, ( yield [ entry, [ y, x ] ] ) ?? [ y, x ] ) )
    }
    * indexOf (
        entry     : Nullable<T>,
        predicate : Predicate<T> = Equality( entry ),
        initial   : Index        = [ 0, 0 ]
    ): Generator<[ entry: Nullable<T>, Index ], void, void> {
        yield * this[ Symbol.iterator ]( initial ).filter( entry => predicate( ...entry ) )
    }
}

let m0 = new Matrix( 2, 4, ( y, x ) => `${ y }x${ x }` )
let abscissa = m0[ Symbol.iterator ]( [ 0, 0 ], Infinity, "cycle", Matrix.traversal.abscissa )
let ordinate = m0[ Symbol.iterator ]( [ 0, 0 ], Infinity, "cycle", Matrix.traversal.ordinate )