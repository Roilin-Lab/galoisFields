// import { matrix } from "./matrix";

const matrix = {
    mul: function(A, B) {
        let rowsA = A.length, colsA = A[0].length;
        let rowsB = B.length, colsB = B[0].length;
        let C = [];
        if (colsA != rowsB) return false;
        for (let i = 0; i < rowsA; i++) C[i] = [];
        for (let k = 0; k < colsB; k++) { 
            for (let i = 0; i < rowsA; i++) {
                    let t = 0n;
                    for (let j = 0; j < rowsB; j++) t += A[i][j]*B[j][k];
                    C[i][k] = t;
                }
            }
        return C;
    },
    pow: function(A, n) {
        if (n == 1) return A;
        else return this.mul( A, this.pow(A, n-1) );
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
};

const buildTriangleMod = function(p, n) {
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
        // this.pascalTriangle = buildTriangleMod(p, n);
        // this.findRoots();
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
            B = matrix.mul(B, A);
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
        for (let i = 1; i < (this.p**this.n) - 0n; i++) {
            let B = matrix.pow(A, i);
            let elem = { number: i };
            elem.coords = [];
            for (let k=B[0].length-1; k >= 0; k--) {
                elem.coords.push(B[0][k] % this.p);
            }    
            this.field.push(elem);
        }
        return this.field;
    }
    findRoots() {
        let A = { U: [], V: []};
        for (let term of this.getTerm(this.p**this.n-1n, true)) {
            A.U.push(term);
        }
        for (let term of this.getTerm(this.p**this.n-2n)) {
            A.V.push(term);
        }
        for (let i = 0n; i < this.p; i++) {
            for (let j = 0n; j < this.p; j++) {
                let u = A.U.map((term) => {
                    return ((i ** term.degAlpha) * (j ** term.degBeta) * term.coef) % this.p;
                }).reduce((acc, cur) => acc + cur, 0n);
                let v = A.V.map((term) => {
                    return ((i ** term.degAlpha) * (j ** term.degBeta) * term.coef) % this.p;
                }).reduce((acc, cur) => acc + cur, 0n);

                if (u % this.p == 0n && v % this.p == 1n) {
                    this.roots.push({
                        alpha: i,
                        beta: j,
                    });
                }
            }
        }
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
}