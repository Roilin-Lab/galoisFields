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
        this.pascalTriangle = buildTriangleMod(p, n);
        this.findRoots();
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