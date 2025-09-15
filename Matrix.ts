type  Behavior      = 'constrain' | 'continue' | 'cycle' | 'throw'
type  Index         = [ y: number, x: number ]
type  Nullable  <T> = void | T | null | undefined
type  Factory   <T> = ( ..._:Index ) => Nullable<T>
type  Source    <T> = Factory<T> | Matrix<T> | Array<Array<Nullable<T>>> | Array<Nullable<T>> | Iterator<Nullable<T>, Nullable<T>, Nullable<Index>>
type  Predicate <T> = ( entry: Nullable<T>, index?: Index               ) => boolean
type  Transform <T> = ( entry: Nullable<T>, index?: Index               ) => Nullable<T>
type  Traversal <T> = ( entry: Nullable<T>, index: Index, shape: Index ) => Index
const Equality: <T>( target: unknown ) => Predicate<T> = ( target: unknown ) => ( value: unknown ) => Object.is( value, target )

class Matrix<T /* extends string | number | bigint | boolean | symbol | NonNullable<object> | Function */> {
    static traversal  = {
        abscissa: <S>( _: Nullable<S>, [ y, x ]: Index, [ _Y,  X ]: Index ): Index => X > x + 1 ? [ y, ++ x ] : [ ++ y, 0 ],
        ordinate: <S>( _: Nullable<S>, [ y, x ]: Index, [  Y, _X ]: Index ): Index => Y > y + 1 ? [ ++ y, x ] : [ 0, ++ x ],
        overflow: ( behavior: Behavior, [ Y, X ]: Index ) => {
            function handle( value: number, limit: number ): number {
                if ( value >= limit || value < 0 ) switch ( behavior ) {
                    case 'constrain': return value < 0 ? 0 : limit - 1
                    case 'continue' : return value
                    case 'cycle'    : return Math.abs( value % limit )
                    case 'throw'    : throw new RangeError
                    default: throw new TypeError
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

    static #coalesce <S> ( ...sources : Source<S>[] ): Factory<S> {
        return ( ...[ y, x ]: Index ) => {
            for ( const [ index, source ] of sources.entries() ) {
                const entry: Nullable<S> = ( sources[ index ] = Matrix.#factory<S>( source ) )( y, x )
                if ( entry != null ) return entry; else continue
            } return null
        }
    }
    static #factory  <S> (    source  : Source<S>   ): Factory<S> {
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

    static apply     <S> ( target: Matrix<S>, transform: Transform<S> )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => transform( entry, [ y, x ] ) )( factory( y, x ) ) )
    }
    static coalesce  <S> ( target: Matrix<S>, ...matrices: Matrix<S>[] )
    : Matrix<S> {
        return new Matrix<S>( target.y, target.x, ...matrices )
    }
    static deflate   <S> ( target: Matrix<S>, discard: S, predicate: Predicate<S> = Equality( discard ) )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target )
        let   [ Y,  X  ] = [ 0, 0 ]
        const [ Ys, Xs ] = [
            target.state     .map( ( row, y ) => row.every( ( entry, x ) => predicate( entry, [ y, x ] ) ) ? Y ++ : y ),
            target.transposed.map( ( col, x ) => col.every( ( entry, y ) => predicate( entry, [ y, x ] ) ) ? X ++ : x ),
        ]; return new Matrix<S>( target.y - Y, target.x - X, ( y, x ) => factory( Ys[ y ], Xs[ x ] ) )
    }
    static extract   <S> ( target: Matrix<S>, entry: S, predicate: Predicate<S> = Equality( entry ) )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? entry : null )( factory( y, x ) ) )
    }
    static fill      <S> ( target: Matrix<S>, ...sources: [ Source<S>, ...Source<S>[] ] )
    : Matrix<S> {
        return new Matrix<S>( target.y, target.x, target.rows, ...sources )
    }
    static reflect   <S> ( target: Matrix<S>, yAxis: boolean, xAxis: boolean )
    : Matrix<S> {
        // return new Matrix<S>( target.y, target.x, ( yAxis ? target.rows.reverse() : target.rows ).map( row => xAxis ? row.reverse() : row ) )
        const factory = Matrix.#factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => factory(
            yAxis ? target.y - 1 - y : y,
            xAxis ? target.x - 1 - x : x,
        ) )
    }
    static frame     <S> ( target: Matrix<S>, [ yStart, xStart ]: Index, [ yEnd, xEnd ]: Index )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target.rows )
        return new Matrix<S>( ...[ yEnd - yStart, xEnd - xStart ], ( y, x ) => factory( yStart + y, xStart + x ) )
    }
    static inflate   <S> ( target: Matrix<S>, ...sources: Source<S>[] )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target )
        return new Matrix<S>( target.y * 2 - 1, target.x * 2 - 1, ( y, x ) => factory( y % 2 ? -1 : y >> 1, x % 2 ? -1 : x >> 1 ), ...sources )
    }
    static omit      <S> ( target: Matrix<S>, discard: S, predicate: Predicate<S> = Equality( discard ) )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? null : entry )( factory( y, x ) ) )
    }
    static replace   <S> ( target: Matrix<S>, discard: S, by: S, predicate: Predicate<S> = Equality( discard ), transform: Transform<S> = () => by )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => ( entry => predicate( entry, [ y, x ] ) ? transform( entry, [ y, x ] ) : entry )( factory( y, x ) ) )
    }
    static rotate    <S> ( target: Matrix<S>, n: number )
    : Matrix<S> {
        switch ( (n % 4 + 4) % 4 ) {
        case 1: return new Matrix<S>( target.x, target.y, target.cols.map( row => row.reverse() ) )
        case 2: return new Matrix<S>( target.y, target.x, target.rows.reverse().map( col => col.reverse() ) )
        case 3: return new Matrix<S>( target.x, target.y, target.cols.reverse() )
        case 0: return new Matrix<S>( target.y, target.x, target.rows )
        default: throw new Error
        }
    }
    static scale     <S> ( target: Matrix<S>, [ yBy, xBy ]: Index, absolute: boolean = true, ...sources: Source<S>[] )
    : Matrix<S> {
        [ yBy, xBy ] = absolute ? [ yBy, xBy ] : [ target.y + yBy, target.x + xBy ]
        return new Matrix<S>( yBy, xBy, ...sources )
    }
    static shift     <S> ( target: Matrix<S>, [ yBy, xBy ]: Index, ...sources: Source<S>[] )
    : Matrix<S> {
        const factory = Matrix.#factory<S>( target )
        return new Matrix<S>( target.y, target.x, ( y, x ) => factory( y - yBy, x - xBy ), ...sources )
    }
    static transpose <S> ( target: Matrix<S> )
    : Matrix<S> {
        return new Matrix<S>( target.x, target.y, target.cols )
    }
    static traverse  <S> ( target: Matrix<S>, traverse: Traversal<S>, shape: Index, behavior: Behavior = 'continue', initial: Index = [ 0, 0 ] )
    : Matrix<S> {
        return new Matrix<S>( ...shape, target[ Symbol.iterator ]( initial, shape[ 0 ] * shape[ 1 ], behavior, traverse ).map( entry => entry[ 0 ] ) )
    }

    state      : ReadonlyArray<ReadonlyArray<Nullable<T>>>
    transposed : ReadonlyArray<ReadonlyArray<Nullable<T>>>

    constructor ( public readonly y: number, public readonly x: number, ...sources: Source<T>[] ) {
        const factory   = Matrix.#coalesce<T>( ...sources )
        this.state      = Array.from( Array( y ), ( _, y_index ) =>
                          Array.from( Array( x ), ( _, x_index ) => factory( y_index, x_index ) ) )
        this.transposed = Array.from( Array( x ), ( _, x_index ) =>
                          Array.from( Array( y ), ( _, y_index ) => this.state[ y_index ][ x_index ] ) )
    }

    get rows () {
        return this.state.map( identity => [ ...identity ] )
    }
    row ( index: number ) {
        return this.state.at( index )?.map( identity => identity )
    }
    get cols () {
        return this.transposed.map( identity => [ ...identity ] )
    }
    col ( index: number ) {
        return this.transposed.at( index )?.map( identity => identity )
    }

    * [ Symbol.iterator ] (
        initial  : Index        = [ 0, 0 ],
        limit    : number       = this.y * this.x - initial[ 0 ] * initial[ 1 ],
        behavior : Behavior     = 'cycle',
        traverse : Traversal<T> = Matrix.traversal.abscissa,
    ): Generator<[ entry: Nullable<T>, Index ], void, Nullable<Index>> {
        let [ y, x ] = initial, entry: Nullable<T>,
            overflow = Matrix.traversal.overflow( behavior, [ this.y, this.x ] )
        while ( entry = this.state[ y ]?.[ x ], limit --> 0 )
            [ y, x ] = overflow( ( yield [ entry, [ y, x ] ] ) ?? traverse( entry, [ y, x ], [ this.y, this.x ] ) )
    }
    * indexOf(
        entry     : Nullable<T>,
        initial   : Index        = [ 0, 0 ],
        predicate : Predicate<T> = Equality( entry ),
    ): Generator<[ entry: Nullable<T>, Index ], void, void> {
        yield * this[ Symbol.iterator ]( initial ).filter( entry => predicate( ...entry ) )
    }
    // * areaOf(
    //     entry      : Nullable<T>,
    //     initial    : Index        = [0, 0],
    //     predicate  : Predicate<T> = Equality( entry ),
    //     consistent : boolean      = false,
    // ): Generator<[ Index, Index ], void, void> {
    //     const indexes = [ ...this.indexOf( entry, initial, predicate ) ]
    // }
    * contiguous_greedy_dfs (
        initial   : Index,
        final     : Index,
        predicate : Predicate<T> = Equality( this.state[ initial[ 0 ] ][ initial[ 1 ] ] ),
        DoF       : [ Y⃮: boolean, X⃮: boolean, Y⃯: boolean, X⃯: boolean ]
                  = [      false,      false,       true,       true ],
    ) {
        let location = this[ Symbol.iterator ]( initial, Infinity, 'continue' ),
            bias = ( [ yᷧ, xᷧ ]: Index, [ yᷨ, xᷨ ]: Index ) =>
                ( final[ 0 ] - yᷧ + final[ 1 ] - xᷧ ) -
                ( final[ 0 ] - yᷨ + final[ 1 ] - xᷨ ),
            [ Y, X ] = [ this.y, this.x ],
            movement = [ ...DoF[ 0 ] ? [ [ -1,  0 ] ] : [],
                         ...DoF[ 1 ] ? [ [  0, -1 ] ] : [],
                         ...DoF[ 2 ] ? [ [  1,  0 ] ] : [],
                         ...DoF[ 3 ] ? [ [  0,  1 ] ] : [], ] as Index[],
            allowed = new Map<Index, Index[]>(
                movement.map( key => [ key, movement.filter( value => key[ 0 ] + value[ 0 ] !== 0 || key[ 1 ] + value[ 1 ] !== 0 ) ] )
            )
        function traversal ( YX: Index, [ y, x ]: Index ): Index[] | null {
            let result = location.next( [ y += YX[ 0 ], x += YX[ 1 ] ] )
            if ( -1 < y && y < Y && -1 < x && x < X )
                if ( ! result.done && predicate( result.value[ 0 ] ) )
                    if ( y === final[ 0 ] && x === final[ 1 ] ) 
                        return [ [ y, x ] ]
                    else for ( const move of allowed.get( YX )!.toSorted( bias ) ) {
                        let  success = traversal( move, [ y, x ] )
                        if ( success ) return [ [ y, x ], ...success ]
                        else continue
                    }
            return null
        }
        for ( const [ DoF, _ ] of allowed )
            yield traversal( DoF, initial )
    }
}

let m0 = new Matrix( 4, 4, ( y, x ) => `${ y }x${ x }` )
let m0gen = m0[ Symbol.iterator ]( [ 0, 0 ], Infinity, 'continue' )
debugger
let m0contiguous = m0.contiguous_greedy_dfs( [ 0, 0 ], [ 3, 3 ], ( entry ) => typeof entry === 'string' )
console.log(m0contiguous.next())
console.log(m0contiguous.next())
console.log(m0contiguous.next())
console.log(m0contiguous.next())