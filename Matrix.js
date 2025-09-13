"use strict";
const Equality = (target) => (value) => Object.is(value, target);
class Matrix {
    y;
    x;
    static traversal = {
        abscissa: function (_, [y, x]) {
            return this.x > x + 1 ? [y, ++x] : [++y, 0];
        },
        ordinate: function (_, [y, x]) {
            return this.y > y + 1 ? [++y, x] : [0, ++x];
        },
        overflow: (behavior, [Y, X]) => {
            function handle(value, limit) {
                if (value >= limit)
                    switch (behavior) {
                        case 'constrain': return limit - 1;
                        case 'continue': return value;
                        case 'cycle': return value % limit;
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
    static apply(target, transform) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => transform(entry, [y, x]))(factory(y, x)));
    }
    static deflate(target, discard, predicate = Equality(discard)) {
        const factory = Matrix.factory(target);
        let [Y, X] = [0, 0];
        const [Ys, Xs] = [
            target.state.map((row, y) => row.every((entry, x) => predicate(entry, [y, x])) ? Y++ : y),
            target.transposed.map((col, x) => col.every((entry, y) => predicate(entry, [y, x])) ? X++ : x),
        ];
        return new Matrix(target.y - Y, target.x - X, (y, x) => factory(Ys[y], Xs[x]));
    }
    static extract(target, entry, predicate = Equality(entry)) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, [y, x]) ? entry : null)(factory(y, x)));
    }
    static fill(target, ...sources) {
        return new Matrix(target.y, target.x, ...sources);
    }
    static frame(target, [yStart, xStart, yEnd, xEnd]) {
        const factory = Matrix.factory(target.rows);
        return new Matrix(...[yEnd - yStart, xEnd - xStart], (y, x) => factory(yStart + y, xStart + x));
    }
    static inflate(target, ...sources) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y * 2 - 1, target.x * 2 - 1, (y, x) => factory(y % 2 ? -1 : y >> 1, x % 2 ? -1 : x >> 1), ...sources);
    }
    static omit(target, discard, predicate = Equality(discard)) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, [y, x]) ? null : entry)(factory(y, x)));
    }
    static replace(target, discard, by, predicate = Equality(discard), transform = () => by) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, [y, x]) ? transform(entry, [y, x]) : entry)(factory(y, x)));
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
    static scale(target, yBy, xBy, ...sources) {
        return new Matrix(target.y + yBy, target.x + xBy, ...sources);
    }
    static shift(target, yBy, xBy, ...sources) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => factory(y - yBy, x - xBy), ...sources);
    }
    static transpose(target) {
        return new Matrix(target.x, target.y, target.cols);
    }
    static traverse(target, traversal, scale = [target.y, target.x], behavior = 'continue') {
        return new Matrix(...scale, target[Symbol.iterator]([0, 0], scale[0] * scale[1], behavior, traversal).map(entry => entry[0]));
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
    *[Symbol.iterator](initial = [0, 0], limit = this.y * this.x - initial[0] * initial[1], behavior = 'cycle', traverse = Matrix.traversal.abscissa) {
        let [y, x] = initial, entry, overflow = Matrix.traversal.overflow(behavior, [this.y, this.x]);
        while (entry = this.state[y]?.[x], limit-- > 0)
            [y, x] = overflow(traverse.call(this, entry, (yield [entry, [y, x]]) ?? [y, x]));
    }
    *indexOf(entry, predicate = Equality(entry), initial = [0, 0]) {
        yield* this[Symbol.iterator](initial).filter(entry => predicate(...entry));
    }
}
let m0 = new Matrix(2, 4, (y, x) => `${y}x${x}`);
let abscissa = m0[Symbol.iterator]([0, 0], Infinity, "cycle", Matrix.traversal.abscissa);
let ordinate = m0[Symbol.iterator]([0, 0], Infinity, "cycle", Matrix.traversal.ordinate);
