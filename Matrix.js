"use strict";
const Equality = value => entry => Object.is(entry[0], value);
const Consistency = (array, predicate, local = false) => {
    let consistent = true, failure = [];
    if (array.length < 2)
        return { consistent }; // Vacuous truth?!
    else {
        let entries = array.entries(), a = entries.next().value;
        for (let b of entries)
            if (predicate(a[1], b[1]))
                a = b;
            else {
                failure.push(b[0]);
                consistent = false;
                a = local ? b : a;
            }
    }
    return consistent ? { consistent } : { consistent, failure };
};
class Matrix {
    y;
    x;
    static traversal = {
        abscissa: ([_, [y, x]], [_Y, X]) => X > ++x ? [y, x] : [++y, 0],
        ordinate: ([_, [y, x]], [Y, _X]) => Y > ++y ? [y, x] : [0, ++x],
        overflow: (behavior, [Y, X]) => {
            function handle(value, limit) {
                if (value >= limit || value < 0)
                    switch (behavior) {
                        case 'constrain': return value < 0 ? 0 : limit - 1;
                        case 'continue': return value;
                        case 'cycle': return Math.abs(value % limit);
                        case 'throw': throw new RangeError;
                        default: throw new TypeError;
                    }
                else
                    return value;
            }
            return ([y, x]) => [handle(y, Y), handle(x, X)];
        }
    };
    static validation = {
        isFunc: (target) => typeof target === 'function',
        isSelf: (target) => target instanceof Matrix,
        isDeep: (target) => Array.isArray(target) && target.every(member => Array.isArray(member)),
        isFlat: (target) => Array.isArray(target),
        isIter: (target) => target instanceof Iterator,
    };
    static #coalesce(...sources) {
        return ([y, x]) => {
            for (const [index, source] of sources.entries()) {
                const value = (sources[index] = Matrix.#factory(source))([y, x]);
                if (value != null)
                    return value;
                else
                    continue;
            }
            return null;
        };
    }
    static #factory(source) {
        switch (true) {
            case Matrix.validation.isFunc(source):
                return source;
            case Matrix.validation.isSelf(source):
                return ([y, x]) => source.state[y]?.[x];
            case Matrix.validation.isDeep(source):
                return ([y, x]) => source[y]?.[x];
            case Matrix.validation.isFlat(source):
                return (source => ([y, x]) => source.next([y, x]).value)(source.values());
            case Matrix.validation.isIter(source):
                return ([y, x]) => source.next([y, x]).value;
            default: throw new TypeError;
        }
    }
    static apply(target, transform) {
        const factory = Matrix.#factory(target);
        return new Matrix(target.y, target.x, ([y, x]) => (value => transform([value, [y, x]]))(factory([y, x])));
    }
    static coalesce(target, ...matrices) {
        return new Matrix(target.y, target.x, ...matrices);
    }
    static deflate(target, discard, predicate = Equality(discard)) {
        const factory = Matrix.#factory(target);
        let [Y, X] = [0, 0];
        const [Ys, Xs] = [
            target.state.map((row, y) => row.every((value, x) => predicate([value, [y, x]])) ? (Y++, null) : y).filter(value => value != null),
            target.transposed.map((col, x) => col.every((value, y) => predicate([value, [y, x]])) ? (X++, null) : x).filter(value => value != null),
        ];
        return new Matrix(target.y - Y, target.x - X, ([y, x]) => factory([Ys[y], Xs[x]]));
    }
    static extract(target, value, predicate = Equality(value)) {
        const factory = Matrix.#factory(target);
        return new Matrix(target.y, target.x, ([y, x]) => (value => predicate([value, [y, x]]) ? value : null)(factory([y, x])));
    }
    static fill(target, ...sources) {
        return new Matrix(target.y, target.x, target.rows, ...sources);
    }
    static reflect(target, yAxis, xAxis) {
        // return new Matrix<S>( target.y, target.x, ( yAxis ? target.rows.reverse() : target.rows ).map( row => xAxis ? row.reverse() : row ) )
        const factory = Matrix.#factory(target);
        return new Matrix(target.y, target.x, ([y, x]) => factory([
            yAxis ? target.y - 1 - y : y,
            xAxis ? target.x - 1 - x : x,
        ]));
    }
    static frame(target, [yStart, xStart], [yEnd, xEnd]) {
        const factory = Matrix.#factory(target.rows);
        return new Matrix(...[yEnd - yStart, xEnd - xStart], ([y, x]) => factory([yStart + y, xStart + x]));
    }
    static inflate(target, ...sources) {
        const factory = Matrix.#factory(target);
        return new Matrix(target.y * 2 - 1, target.x * 2 - 1, ([y, x]) => factory([y % 2 ? -1 : y >> 1, x % 2 ? -1 : x >> 1]), ...sources);
    }
    static omit(target, discard, predicate = Equality(discard)) {
        const factory = Matrix.#factory(target);
        return new Matrix(target.y, target.x, ([y, x]) => (value => predicate([value, [y, x]]) ? null : value)(factory([y, x])));
    }
    static replace(target, discard, by, predicate = Equality(discard), transform = () => by) {
        const factory = Matrix.#factory(target);
        return new Matrix(target.y, target.x, ([y, x]) => (value => predicate([value, [y, x]]) ? transform([value, [y, x]]) : value)(factory([y, x])));
    }
    static rotate(target, n) {
        switch ((n % 4 + 4) % 4) {
            case 1: return new Matrix(target.x, target.y, target.cols.map(row => row.reverse()));
            case 2: return new Matrix(target.y, target.x, target.rows.reverse().map(col => col.reverse()));
            case 3: return new Matrix(target.x, target.y, target.cols.reverse());
            case 0: return new Matrix(target.y, target.x, target.rows);
            default: throw new Error;
        }
    }
    static scale(target, [yBy, xBy], absolute = true, ...sources) {
        [yBy, xBy] = absolute ? [yBy, xBy] : [target.y + yBy, target.x + xBy];
        return new Matrix(yBy, xBy, ...sources);
    }
    static shift(target, [yBy, xBy], ...sources) {
        const factory = Matrix.#factory(target);
        return new Matrix(target.y, target.x, ([y, x]) => factory([y - yBy, x - xBy]), ...sources);
    }
    static transpose(target) {
        return new Matrix(target.x, target.y, target.cols);
    }
    static traverse(target, traverse, shape, behavior = 'continue', initial = [0, 0]) {
        return new Matrix(...shape, target[Symbol.iterator](initial, shape[0] * shape[1], behavior, traverse).map(entry => entry[0]));
    }
    state;
    transposed;
    constructor(y, x, ...sources) {
        this.y = y;
        this.x = x;
        const factory = Matrix.#coalesce(...sources);
        this.state = Array.from(Array(y), (_, y_index) => Array.from(Array(x), (_, x_index) => factory([y_index, x_index])));
        this.transposed = Array.from(Array(x), (_, x_index) => Array.from(Array(y), (_, y_index) => this.state[y_index][x_index]));
    }
    get rows() {
        return this.state.map(identity => [...identity]);
    }
    row(index) {
        return this.state.at(index)?.map(identity => identity);
    }
    get cols() {
        return this.transposed.map(identity => [...identity]);
    }
    col(index) {
        return this.transposed.at(index)?.map(identity => identity);
    }
    *[Symbol.iterator](initial = [0, 0], limit = this.y * this.x - initial[0] * initial[1], behavior = 'throw', traverse = Matrix.traversal.abscissa) {
        let [y, x] = initial, value, overflow = Matrix.traversal.overflow(behavior, [this.y, this.x]);
        while (value = this.state[y]?.[x], 0 < --limit)
            [y, x] = overflow((yield [value, [y, x]]) ?? traverse([value, [y, x]], [this.y, this.x]));
        yield [value, [y, x]];
    }
    *indexOf(value, initial = [0, 0], predicate = Equality(value)) {
        yield* this[Symbol.iterator](initial).filter(entry => predicate(entry));
    }
    *areaOf(value, predicate = Equality(value)) {
        let ySorted = [...this[Symbol.iterator]([0, 0], undefined, 'throw', Matrix.traversal.abscissa)
                .filter(predicate)
                .map(([_, index]) => index)], xSorted = [...this[Symbol.iterator]([0, 0], undefined, 'throw', Matrix.traversal.ordinate)
                .filter(predicate)
                .map(([_, index]) => index)], yConsistency, xVariance, xConsistency, yVariance, area, filter = (index) => index[0] < area[0][0]
            || index[0] > area[1][0]
            || index[1] < area[0][1]
            || index[1] > area[1][1], range = (yArray, xArray) => [[yArray.reduce((min, index) => Math.min(min, index[0]), Infinity),
                xArray.reduce((min, index) => Math.min(min, index[1]), Infinity),],
            [yArray.reduce((max, index) => Math.max(max, index[0]), 0),
                xArray.reduce((max, index) => Math.max(max, index[1]), 0),]];
        while (ySorted.length && xSorted.length) {
            debugger;
            yConsistency = Consistency(ySorted, (a, b) => a[0] === b[0] && a[1] === b[1] - 1, true);
            xConsistency = Consistency(xSorted, (a, b) => a[0] === b[0] - 1 && a[1] === b[1], true);
            yVariance = xSorted.splice(0, xConsistency.consistent ? xSorted.length : xConsistency.failure[0]);
            xVariance = ySorted.splice(0, yConsistency.consistent ? ySorted.length : yConsistency.failure[0]);
            yield area = range(yVariance, xVariance);
            ySorted = ySorted.filter(filter);
            xSorted = xSorted.filter(filter);
        }
    }
    *path(initial, final, predicate = Equality(this.state[initial[0]][initial[1]]), DoF = [false, false, true, true], heuristic = ([yᷧ, xᷧ], [yᷨ, xᷨ]) => (final[0] - yᷧ + final[1] - xᷧ) -
        (final[0] - yᷨ + final[1] - xᷨ)) {
        let location = this[Symbol.iterator](initial, Infinity, 'continue'), [Y, X] = [this.y, this.x], movement = [...DoF[0] ? [[-1, 0]] : [],
            ...DoF[1] ? [[0, -1]] : [],
            ...DoF[2] ? [[1, 0]] : [],
            ...DoF[3] ? [[0, 1]] : [],], allowed = new Map(movement.map(key => [key, movement.filter(value => key[0] + value[0] !== 0 || key[1] + value[1] !== 0)]));
        function traversal(YX, [y, x]) {
            if (-1 < y && y < Y && -1 < x && x < X) {
                let result = location.next([y += YX[0], x += YX[1]]);
                if (!result.done && predicate(result.value))
                    if (y === final[0] && x === final[1])
                        return [[y, x]];
                    else
                        for (const move of allowed.get(YX).toSorted(heuristic)) {
                            let success = traversal(move, [y, x]);
                            if (success)
                                return [[y, x], ...success];
                            else
                                continue;
                        }
            }
            return null;
        }
        for (const [DoF, _] of allowed)
            yield [initial, ...traversal(DoF, initial) ?? []];
    }
    // * path (
    //     [ ẏ, ẋ ]       : Index,
    //     [ y, x ]       : Index,
    //     [ Y⃮, X⃮, Y⃯, X⃯ ] : [ Y⃮: boolean, X⃮: boolean, Y⃯: boolean, X⃯: boolean ]
    //                    = [       true,       true,       true,       true ],
    //     equality       : Predicate<T> = Equality( this.state[ y ][ x ] ),
    // ) {
    //     const DoF = [
    //         ...Y⃮ ? [ [ -1,  0 ] ] : [],
    //         ...X⃮ ? [ [  0, -1 ] ] : [],
    //         ...Y⃯ ? [ [  1,  0 ] ] : [],
    //         ...X⃯ ? [ [  0,  1 ] ] : [],
    //     ] as [ -1 | 0 | 1, -1 | 0 | 1 ][],
    //         allowed = new Map( DoF.map( change => [ change, DoF.filter( pair => change[0] + pair[0] !== 0 || change[1] + pair[1] !== 0 ) ] ) ),
    //         success = ( [ y, x ]: Index ) => y < this.y && x < this.x && equality( [ this.state[y][x], [ y, x ] ] ) ? true : false
    // }
    *attempt_0([yˢ, xˢ], [yᵉ, xᵉ], [Y⃖, X⃖, Y⃗, X⃗] = [true, true, true, true], predicate = Equality(this.state[yˢ][xˢ])) {
        class Cell {
            origin;
            extremity;
            constructor(origin) {
                this.origin = origin;
                this.extremity = new Map([[this, [this.origin]]]);
            }
            grow(space, opposite = false) {
                // debugger
                const shift = opposite ? DoFR : DoF;
                for (const [cell, path] of [...this.extremity]) {
                    for (const adjacent of shift.map(shift => space.state[cell.origin[0] + shift[0]]?.[cell.origin[1] + shift[1]]))
                        if (adjacent)
                            if (this.extremity.has(adjacent) || path.includes(adjacent.origin))
                                continue;
                            else
                                this.extremity.set(adjacent, [...path, adjacent.origin]);
                    this.extremity.delete(cell);
                }
            }
        }
        const DoF = [
            ...Y⃖ ? [[-1, 0]] : [],
            ...X⃖ ? [[0, -1]] : [],
            ...Y⃗ ? [[1, 0]] : [],
            ...X⃗ ? [[0, 1]] : [],
        ], DoFR = DoF.map(entry => [entry[0] * -1, entry[1] * -1]), space = new Matrix(this.y, this.x, ([y, x]) => predicate([this.state[y][x], [y, x]]) ? new Cell([y, x]) : null);
        space.state[yˢ][xˢ]?.grow(space);
        space.state[yˢ][xˢ]?.grow(space);
        space.state[yˢ][xˢ]?.grow(space);
        for (const [cell, extremity] of space.state[yˢ][xˢ]?.extremity)
            console.log(cell.origin, "\t", extremity);
        // target     : Matrix<T>,
        // [ yᵖ, xᵖ ] : Index,
        // [ y⃡ , x⃡  ] : typeof DoF[ number ],
        // [ yᶜ, xᶜ ] : Index = [ yᵖ + y⃡, xᵖ + x⃡ ]
    }
}
// let m0 = new Matrix( 4, 4, ( [ y, x ] ) => `${ y }x${ x }` )
// let m0 = new Matrix( 8, 8, [
//     [ ' ', ' ', ' ', ' ', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', ' ', ' ', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', '$', '$', '$', '$' ],
//     [ ' ', ' ', '$', '$', '$', '$', '$', '$' ],
//     [ '$', '$', '$', '$', '$', '$', ' ', ' ' ],
//     [ '$', '$', '$', '$', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', ' ', ' ', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', ' ', ' ', ' ', ' ' ],
// ] )
// let m0 = new Matrix( 8, 8, [
//     [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
//     [ ' ', '$', '$', '$', '$', '$', ' ', ' ' ],
//     [ ' ', '$', '$', '$', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', '$', '$', ' ', ' ' ],
//     [ ' ', ' ', '$', '$', '$', '$', ' ', ' ' ],
// ] )
let m0 = new Matrix(7, 7, [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
]);
// let m0areaOf_1 = m0.areaOf( '$' )
// console.log( m0areaOf_1.next() )
let attempt_0 = m0.attempt_0([0, 0], [7, 7]);
let attempt_0_value = attempt_0.next();
debugger;
//# sourceMappingURL=Matrix.js.map