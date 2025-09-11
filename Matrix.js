"use strict";
const Equality = (target) => (value) => Object.is(value, target);
class Matrix {
    y;
    x;
    static factory(source) {
        switch (true) {
            case Matrix.isFunc(source): return source;
            case Matrix.isSelf(source): return (y, x) => source.state[y]?.[x];
            case Matrix.isDeep(source): return (y, x) => source[y]?.[x];
            case Matrix.isFlat(source): return (source => (y, x) => source.next([y, x]).value)(source.values());
            default: throw new TypeError;
        }
    }
    static isFunc(target) {
        return typeof target === 'function';
    }
    static isSelf(target) {
        return target instanceof Matrix;
    }
    static isDeep(target) {
        return Array.isArray(target) && target.every(member => Array.isArray(member));
    }
    static isFlat(target) {
        return Array.isArray(target);
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
    static transpose(target) {
        return new Matrix(target.x, target.y, target.cols);
    }
    static traverse(target, ...walk) {
        const init = walk.map(traversal => traversal.shift());
        const move = walk.map(traversal => Array.from(Array(target.x), (_, index) => traversal[index % traversal.length]));
        const source = init.map((initial, index) => {
            const mGen = target[Symbol.iterator](initial, false);
            return move[index].map(m => mGen.next(m).value?.[0]);
        });
        return new Matrix(walk.length, target.x, source);
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
            target.state.map((row, y) => row.every((entry, x) => predicate(entry, y, x)) ? Y++ : y), // Performance gain by direct access of the state rather than target.rows use?
            target.transposed.map((col, x) => col.every((entry, y) => predicate(entry, y, x)) ? X++ : x), // Performance gain by direct access of the state rather than target.transposed use?
        ];
        return new Matrix(target.y - Y, target.x - X, (y, x) => factory(Ys[y], Xs[x]));
    }
    static omit(target, discard, predicate = Equality(discard)) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, y, x) ? null : entry)(factory(y, x)));
    }
    static replace(target, discard, by, predicate = Equality(discard), transform = () => by) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, y, x) ? transform(entry, y, x) : entry)(factory(y, x)));
    }
    static apply(target, transform) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => transform(entry, y, x))(factory(y, x)));
    }
    static extract(target, entry, predicate = Equality(entry)) {
        const factory = Matrix.factory(target);
        return new Matrix(target.y, target.x, (y, x) => (entry => predicate(entry, y, x) ? entry : null)(factory(y, x)));
    }
    state;
    transposed;
    constructor(y, x, ...sources) {
        this.y = y;
        this.x = x;
        function coalesce(y, x) {
            const entries = sources.entries();
            return function recurse({ done, value }) {
                if (done)
                    return null;
                else
                    return (sources[value[0]] = Matrix.factory(value[1]))(y, x) ?? recurse(entries.next());
            }(entries.next());
        }
        this.state = Array.from(Array(y), (_, y_index) => Array.from(Array(x), (_, x_index) => coalesce(y_index, x_index)));
        this.transposed = Array.from(Array(x), (_, x_index) => Array.from(Array(y), (_, y_index) => this.state[y_index][x_index]));
    }
    get rows() { return this.state.map(identity => [...identity]); }
    row(index) { return this.state.at(index)?.map(identity => identity); }
    get cols() { return this.transposed.map(identity => [...identity]); }
    col(index) { return this.transposed.at(index)?.map(identity => identity); }
    *[Symbol.iterator](initial = [0, 0], limit = this.y * this.x, traverse = Array.of(...Array(this.x).fill([0, 1]), [1, 1 - this.x]), relative = true) {
        let [λ, y, x] = [0, ...initial], input, shift, modular = (index, axis) => index % this[axis];
        while (limit-- > 0) {
            shift = traverse[λ++ % traverse.length];
        }
    }
}
let m0 = new Matrix(4, 8, (y, x) => `${y}x${x}`);
let m0gen = m0[Symbol.iterator]([0, 0], false);
// let t0 = Matrix.traverse( m0, [ [ 0, 0 ], [ 0, 1 ] ], [ [ 1, 0 ], [ 0, 1 ] ], [ [ 2, 7 ], [ 0, -1 ] ], [ [ 0, 0 ], [ 1, 1 ] ] )
// let m0 = new Matrix( 4, 8, ( y, x ) => y * x )
