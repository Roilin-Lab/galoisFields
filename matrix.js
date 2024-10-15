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
    } else return x == y;
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
    add: function(A, B) {
        let m = A.length, n = A[0].length;
        let C = [];
        for (let i = 0; i < m; i++) {
            C[i] = [];
            for (let j = 0; j < n; j++) C[i][j] = A[i][j]+B[i][j];
        }
        return C;
    },
    pow: function(A, n, p) {
        if (n == 1) return A;
        else return this.mul( A, this.pow(A, n-1, p), p);
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

let p = 3n
let A = [
    [0n, 1n, 0n],
    [0n, 0n, 1n],
    [1n, 0n, 2n],
];
let B = [
    [0n, 1n, 0n, 0n],
    [0n, 0n, 1n, 0n],
    [0n, 0n, 0n, 1n],
    [1n, 0n, 0n, 1n],
];
A = matrix.pow(A, 26, p);
// for (let i=0; i < A.length; i++) {
//     for (let j=0; j < A[i].length; j++) {
//         A[i][j] = A[i][j] % p;
//     }
// }
         
// A.forEach(a => {
//     console.log(a);
// });

function generateRoots(p, n) {
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

function generateLinOp(n){
    let result = [];
    for (let i = 0; i < n - 1n; i++) {
        let linOp = Array(Number(n)).fill(0n);
        linOp[i+1] = 1n;
        result.push([...linOp]);
    }
    return result;
}

function calcLinOp(p, n) {
    let roots = generateRoots(p, n)
    let linOp = roots.map(root => {
        let lp = generateLinOp(n);
        lp.push(root);
        return lp;
    });

    let result = []
    for (let i = 0; i < linOp.length; i++) {
        let x = matrix.pow(linOp[i], Number(p**n)-1, p);
        let y = matrix.E(n);
        if (equal(x, y)) {
            result.push(linOp[i]);
        }
    }
    return result;
}

// Пример использования
console.log(calcLinOp(3n, 2n));
