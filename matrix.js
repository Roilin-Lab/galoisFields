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
    add: function(A, B) {
        let m = A.length, n = A[0].length;
        let C = [];
        for (let i = 0; i < m; i++) {
            C[i] = [];
            for (let j = 0; j < n; j++) C[i][j] = A[i][j]+B[i][j];
        }
        return C;
    },
    pow: function(A, n) {
        if (n == 1) return A;
        else return this.mul( A, this.pow(A, n-1) );
    }
};

let A = [
    [0n, 1n],
    [1n, 1n],
];
         
console.log(matrix.pow(A, 1010));