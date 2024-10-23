/**
 * Tests two data structures for equality
 * @param {object} x
 * @param {object} y
 * @returns {boolean}
 */
var equal = function(x, y) {
    if (typeof x !== typeof y) return false;
    if (x instanceof Array && y instanceof Array && x.length !== y.length) return false;
    if (typeof x === 'object') {
        for (var p in x) if (x.hasOwnProperty(p)) {
            if (typeof x[p] === 'function' && typeof y[p] === 'function') continue;
            if (x[p] instanceof Array && y[p] instanceof Array && x[p].length !== y[p].length) return false;
            if (typeof x[p] !== typeof y[p]) return false;
            if (typeof x[p] === 'object' && typeof y[p] === 'object') { if (!equal(x[p], y[p])) return false; } else
            if (x[p] !== y[p]) return false;
        }
    } else return x === y;
    return true;
};

const matrix = {
    mul: function(A, B, p) {
        let rowsA = A.length, colsA = A[0].length;
        let rowsB = B.length, colsB = B[0].length;
        let C = [];
        if (colsA != rowsB) return false;
        for (let i = 0; i < rowsA; i++) C[i] = [];
        for (let k = 0; k < colsB; k++) { 
            for (let i = 0; i < rowsA; i++) {
                    let t = 0n;
                    for (let j = 0; j < rowsB; j++) t += (A[i][j]*B[j][k]) % p;
                    C[i][k] = t % p;
                }
            }
        return C;
    },
    pow: function(A, n) {
        if (n == 1) return A;
        else return this.mul( A, this.pow(A, n-1) );
    },
    powFor: function(A, n, p) {
        let B = A;
        for (let i=1; i < n; i++) {
            B = this.mul(B, A, p);
        }
        return B;
    },
    add: function(A, B) {
        let m = A.length, n = A[0].length;
        let C = [];
        for (let i = 0; i < m; i++) {
            C[i] = [];
            for (let j = 0; j < n; j++) C[i][j] = A[i][j]+B[i][j];
        }
        return C;
    },
    E: function(n) {
        let result = [];
        for (let i = 0; i < n; i++) {
            let linOp = Array(Number(n)).fill(0n);
            linOp[i] = 1n;
            result.push([...linOp]);
        }
        return result;
    }
};

export const buildTriangleMod = function(p, n) {
    let triangle = [];
    let numRows = p**n-1n;
    if (numRows == 0) return [];
    if (numRows == 1) return [[1n]];
    for (let row = 1; row <= numRows; row++) {
        let arr = [];
        for (let col = 0; col < row; col++) {
            if (col == 0 || col == row - 1) {
                arr.push(1n);
            } else {
                arr.push((triangle[row-2][col-1] + triangle[row-2][col]) % p);
            }
        }
        triangle.push(arr);
    }
    return triangle;
}

export class GaloisField {

    constructor(p, n) {
        this.p = p;
        this.n = n;
        this.field = [];
        this.roots = [];
        this.linOps = [];
    }
    buildField(root) {
        this.field = [];
        for (let i = 1n; i < (this.p**this.n); i++) {
            let elem = {
                number: i,
                U: [], V: []
            };
            for (let term of this.getTerm(i, true)) {
                elem.U.push(term);
            }
            for (let term of this.getTerm(i-1n)) {
                elem.V.push(term);
            }
            this.field.push(elem);
        }

        this.field.forEach(elem => {
            let y = elem.U.map(term => {
                return ((root.alpha ** term.degAlpha) * (root.beta ** term.degBeta) * term.coef) % this.p;
            }).reduce((acc, cur) => acc + cur, 0n);
            let x = elem.V.map(term => {
                return ((root.alpha ** term.degAlpha) * (root.beta ** term.degBeta) * term.coef) % this.p;
            }).reduce((acc, cur) => acc + cur, 0n);
            elem.x = x % this.p;
            elem.y = y % this.p;
        });

        return this.field;
    }
    // deprecated
    buildFieldUsingMatrix(root) { 
        this.field = [];
        let A = [
            [0n, root.beta],
            [1n, root.alpha]
        ];
        let B = [
            [0n, root.beta],
            [1n, root.alpha]
        ];
        for (let i = 1; i < (this.p**this.n); i++) {
            let elem = { number: i };
            elem.x = B[0][0] % this.p;
            elem.y = B[1][0] % this.p;     
            B = matrix.mul(B, A, this.p);
            this.field.push(elem);
        }
        return this.field;
    }
    clearRoots() {
        let clearRoots = this.roots.filter(root => {
            let field = [];
            let A = [
                [0n, root.beta],
                [1n, root.alpha]
            ];
            let B = [
                [0n, root.beta],
                [1n, root.alpha]
            ];
            for (let i = 1; i < (this.p**this.n); i++) {
                let elem = { number: i };
                let x = B[0][0] % this.p;
                let y = B[1][0] % this.p;
                if (!field.find(el => el.x == x && el.y == y)) {
                    B = matrix.mul(B, A);
                    elem.x = x;
                    elem.y = y;
                    field.push(elem);
                }
                else {
                    return false;
                }
            }
            return true;
        });
        this.roots = clearRoots;
    }
    buildFromMatrix(A) {
        this.field = [];
        let B = A;
        for (let i = 1; i < (this.p**this.n) - 0n; i++) {
            let elem = { number: i };
            elem.coords = [];
            for (let k=B[0].length-1; k >= 0; k--) {
                elem.coords.push(B[0][k] % this.p);
            }    
            B = matrix.mul(B, A, this.p);
            this.field.push(elem);
        }
        return this.field;
    }
    getTerm = function* (k, u) { 
        for (let i = k - 1n; i >= 0n; i -= 2n) {
            let degAlpha = i;
            let degBeta = (u)
            ? 
                ((k - 1n) - i) / 2n
            :
                ((k + 1n) - i) / 2n;
            let coef = (u)
            ? 
                this.pascalTriangle[degAlpha + degBeta][degBeta]
            : 
                this.pascalTriangle[degAlpha + degBeta - 1n][degBeta - 1n];
                
            if (coef == 0n) continue;
            yield {degAlpha, degBeta, coef};
        }
    }
    findRoots() {
        this.linOps = this.calcLinOp(this.p, this.n);
        this.roots = [];
        this.linOps.forEach(linOp => {
            this.roots.push([...linOp.at(-1)]);
        })
    }
    generateRoots(p, n) {
        let result = [];
        let root = Array(Number(n)).fill(0n);
        
        for (let i = 0; i < p**n; i++) {
            result.push([...root]);
            for (let j = n - 1n; j >= 0n; j--) {
                root[j]++;                      
                if (root[j] < p) break;         
                root[j] = 0n;                    
            }
        }
        return result;
    }
    generateLinOp(n){
        let result = [];
        for (let i = 0; i < n - 1n; i++) {
            let linOp = Array(Number(n)).fill(0n);
            linOp[i+1] = 1n;
            result.push([...linOp]);
        }
        return result;
    }
    calcLinOp(p, n) {
        let E = matrix.E(Number(n));
        let roots = this.generateRoots(p, n)
        let linOp = roots.map(root => {
            let lp = this.generateLinOp(n);
            lp.push(root);
            return lp;
        });
    
        let result = []
        for (let i = 0; i < linOp.length; i++) {
            console.log(i);
            let isCorrect = true;
            let lastNumber = Number(p**n) - 1;
            if (equal(E, matrix.powFor(linOp[i], lastNumber, p))) {
                for (let j = 1; j < lastNumber; j++) {
                    let x = matrix.powFor(linOp[i], j, p);
                    if (equal(x, E)) {
                        isCorrect = false;
                        break;
                    }   
                }
                if (isCorrect) {
                    result.push([...linOp[i]]);
                    break;
                }
            }   
        }
        return result;
    }
}