function gcd(a, b){
    if (b > a) [a, b] = [b, a];

    let r = a % b;
    if (r == 0){
        return b;
    } else {
        return gcd(b, r);
    } 
}

function C(n, k) {
    if (k == 0 || n == k) return 1;
    return C(n-1, k-1) + C(n-1, k);
}

const pascal = {
    triangle: [],
    buildTriangleMod: function(numRows, p) {
        this.triangle = [];
        if (numRows == 0n) return [];
        if (numRows == 1n) return [[1n]];
        for (let row = 1; row <= numRows; row++) {
            let arr = [];
            for (let col = 0; col < row; col++) {
                if (col == 0 || col == row - 1) {
                    arr.push(1n);
                } else {
                    arr.push((this.triangle[row-2][col-1] + this.triangle[row-2][col]) % p);
                }
            }
            this.triangle.push(arr);
        }
    }
}

const getTerm = function* (k, u) { 
    for (let i = k - 1n; i >= 0n; i -= 2n) {
        let degAlpha = i;
        let degBeta = (u)
        ? 
            ((k - 1n) - i) / 2n
        :
            ((k + 1n) - i) / 2n;
        let coef = (u)
        ? 
            pascal.triangle[degAlpha + degBeta][degBeta]
        : 
            pascal.triangle[degAlpha + degBeta - 1n][degBeta - 1n];
            
        if (coef == 0n) continue;
        yield {degAlpha, degBeta, coef};
    }
}

export function buildField(p, n) {
    p = BigInt(p);
    n = BigInt(n);
    let field = [];
    pascal.buildTriangleMod((p**n)-1n, p);
    for (let i = 1n; i < (p**n); i += 1n) {
        let elem = {};
        elem.number = i;
        elem.coord = {U: [], V: []}
        for (let term of getTerm(i, true)) {
            elem.coord.U.push(term);
        }
        for (let term of getTerm(i-1n)) {
            elem.coord.V.push(term);
        }
        field.push(elem);
    }
    return { galoisField: field, roots: calcRoots(field, p) };
}

function calcRoots(field, p) {
    let roots = [];
    let lastEq = field[field.length - 1];
    for (let i = 0n; i < p; i++) {
        for (let j = 0n; j < p; j++) {
            let u = lastEq.coord.U.map((term) => {
                return ((i ** term.degAlpha) * (j ** term.degBeta) * term.coef) % p;
            }).reduce((acc, cur) => acc + cur, 0n);
            let v = lastEq.coord.V.map((term) => {
                return ((i ** term.degAlpha) * (j ** term.degBeta) * term.coef) % p;
            }).reduce((acc, cur) => acc + cur, 0n);
            if (u % p == 0n && v % p == 1n) {
                roots.push({
                    alpha: i,
                    beta: j,
                });
            }
        }
    }
    return roots;
}

export function calcCoordUsingRoot(field, root, p) {
    p = BigInt(p);
    field.forEach(elem => {
        let y = elem.coord.U.map(term => {
            return ((root.alpha ** term.degAlpha) * (root.beta ** term.degBeta) * term.coef) % p;
        }).reduce((acc, cur) => acc + cur, 0n);
        let x = elem.coord.V.map(term => {
            return ((root.alpha ** term.degAlpha) * (root.beta ** term.degBeta) * term.coef) % p;
        }).reduce((acc, cur) => acc + cur, 0n);
        elem.x = x % p;
        elem.y = y % p;
    });
    
    return field;
}