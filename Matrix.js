"use strict";
const Equality = (target) => (value) => Object.is(value, target);
class Matrix {
    y;
    x;
    static traversal = {
        abscissa: ([Y, X], behavior) => (_, [y, x]) => {
            ++x < X || (y++, x = 0);
            if (Y <= y)
                switch (behavior) {
                    case 'constrain':
                        y--;
                        break;
                    case 'continue':
                        y;
                        break;
                    case 'cycle':
                        y = 0;
                        break;
                    case 'throw': throw new RangeError;
                }
            return [y, x];
        },
        ordinate: ([Y, X], behavior) => (abscissa => (_, [y, x]) => ([x, y] = abscissa(_, [x, y]), [y, x]))(this.traversal.abscissa([X, Y], behavior))
    };
    static validation = {
        isFunc: (target) => typeof target === 'function',
        isSelf: (target) => target instanceof Matrix,
        isDeep: (target) => Array.isArray(target) && target.every(member => Array.isArray(member)),
        isFlat: (target) => Array.isArray(target),
        isIter: (target) => target instanceof Iterator,
    };
    static factory(source) {
        switch (true) {
            case Matrix.validation.isFunc(source):
                return source;
            case Matrix.validation.isSelf(source):
                return (y, x) => source.state[y]?.[x];
            case Matrix.validation.isDeep(source):
                return (y, x) => source[y]?.[x];
            case Matrix.validation.isFlat(source):
                return (source => (y, x) => source.next([y, x]).value)(source.values());
            case Matrix.validation.isIter(source):
                return (y, x) => source.next([y, x]).value;
            default: throw new TypeError;
        }
    }
    static coalesce(...sources) {
        return (...[y, x]) => {
            for (const [index, source] of sources.entries()) {
                const entry = (sources[index] = Matrix.factory(source))(y, x);
                if (entry != null)
                    return entry;
                else
                    continue;
            }
            return null;
        };
    }
    // static traverse  <S> ( target: Matrix<S> ): Matrix<S> {
    // }
    static rotate(target, n) {
        switch ((n % 4 + 4) % 4) {
            case 1: return new Matrix(target.x, target.y, target.cols.map(row => row.reverse()));
            case 2: return new Matrix(target.y, target.x, target.rows.reverse().map(col => col.reverse()));
            case 3: return new Matrix(target.x, target.y, target.cols.reverse());
            case 0: return new Matrix(target.y, target.x, target.rows);
            default: throw new Error;
        }
    }
    static transpose(target) {
        return new Matrix(target.x, target.y, target.cols);
    }
    static frame(target, yStart, xStart, yEnd, xEnd) {
        const factory = Matrix.factory(target.rows);
        return new Matrix(...[yEnd - yStart, xEnd - xStart], (y, x) => factory(yStart + y, xStart + x));
    }
    static scale(target, yBy, xBy, ...sources) {
        return new Matrix(target.y + yBy, target.x + xBy, ...sources);
    }
    static shift(target, yBy, xBy, ...sources) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => factory(y - yBy, x - xBy), ...sources);
    }
    static inflate(target, ...sources) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y * 2 - 1, target.x * 2 - 1, (y, x) => factory(y % 2 ? -1 : y >> 1, x % 2 ? -1 : x >> 1), ...sources);
    }
    static fill(target, ...sources) {
        return new Matrix(target.y, target.x, ...sources);
    }
    static deflate(target, discard, predicate = Equality(discard)) {
        const factory = Matrix.factory(target);
        let [Y, X] = [0, 0];
        const [Ys, Xs] = [
            target.state.map((row, y) => row.every((entry, x) => predicate(entry, [y, x])) ? Y++ : y), // Performance gain by direct access of the state rather than target.rows use?
            target.transposed.map((col, x) => col.every((entry, y) => predicate(entry, [y, x])) ? X++ : x), // Performance gain by direct access of the state rather than target.transposed use?
        ];
        return new Matrix(target.y - Y, target.x - X, (y, x) => factory(Ys[y], Xs[x]));
    }
    static omit(target, discard, predicate = Equality(discard)) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, [y, x]) ? null : entry)(factory(y, x)));
    }
    static replace(target, discard, by, predicate = Equality(discard), transform = () => by) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, [y, x]) ? transform(entry, [y, x]) : entry)(factory(y, x)));
    }
    static apply(target, transform) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => transform(entry, [y, x]))(factory(y, x)));
    }
    static extract(target, entry, predicate = Equality(entry)) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, [y, x]) ? entry : null)(factory(y, x)));
    }
    state;
    transposed;
    constructor(y, x, ...sources) {
        this.y = y;
        this.x = x;
        const factory = Matrix.coalesce(...sources);
        this.state = Array.from(Array(y), (_, y_index) => Array.from(Array(x), (_, x_index) => factory(y_index, x_index)));
        this.transposed = Array.from(Array(x), (_, x_index) => Array.from(Array(y), (_, y_index) => this.state[y_index][x_index]));
    }
    get rows() { return this.state.map(identity => [...identity]); }
    row(index) { return this.state.at(index)?.map(identity => identity); }
    get cols() { return this.transposed.map(identity => [...identity]); }
    col(index) { return this.transposed.at(index)?.map(identity => identity); }
    *[Symbol.iterator](initial = [0, 0], limit = this.y * this.x - initial[0] * initial[1], behavior = 'continue', traverse = Matrix.traversal.abscissa([this.y, this.x], behavior)) {
        let [y, x] = initial, input;
        while (limit-- > 0)
            (input = yield [this.state[input?.[0] ?? y]?.[input?.[1] ?? x], input ?? [y, x]]) ??
                ([y, x] = traverse(this.state[y]?.[x], [y, x]));
    }
    *indexOf(entry, predicate = Equality(entry), initial = [0, 0]) {
        yield* this[Symbol.iterator](initial).filter(entry => predicate(...entry));
    }
}
let m0 = new Matrix(2, 4, (y, x) => `${y}x${x}`);
let abscissa = m0[Symbol.iterator]([0, 0], Infinity, "cycle", Matrix.traversal.abscissa([m0.y, m0.x], 'cycle'));
let ordinate = m0[Symbol.iterator]([0, 0], Infinity, "cycle", Matrix.traversal.ordinate([m0.y, m0.x], 'cycle'));
