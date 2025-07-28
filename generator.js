// Function to convert string in any base to decimal (BigInt)
function baseToDecimal(str, base) {
    let res = 0n;
    for (let i = 0; i < str.length; ++i) {
        let digit;
        let ch = str[i];
        if (ch >= '0' && ch <= '9') digit = BigInt(ch.charCodeAt(0) - '0'.charCodeAt(0));
        else digit = BigInt(ch.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        res = res * BigInt(base) + digit;
    }
    return res;
}

// Lagrange interpolation at x = 0, returns BigInt
function lagrangeConstantTerm(points) {
    let k = points.length;
    let result = 0n;
    for (let j = 0; j < k; ++j) {
        let numerator = 1n, denominator = 1n;
        for (let m = 0; m < k; ++m) {
            if (m !== j) {
                numerator *= -BigInt(points[m][0]);
                denominator *= (BigInt(points[j][0]) - BigInt(points[m][0]));
            }
        }
        // Compute modular inverse for denominator if needed, else just divide
        let term = points[j][1] * numerator / denominator;
        result += term;
    }
    return result;
}

// Read JSON file and solve
const fs = require('fs');
// const filepath = "testcase1.json";

function solveFromFile(filepath) {
    const jsonString = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(jsonString);
    const n = data.keys.n;
    const k = data.keys.k;
    let points = [];
    for (let key in data) {
        if (key === 'keys') continue;
        let x = parseInt(key);
        let base = parseInt(data[key].base);
        let value = data[key].value;
        let y = baseToDecimal(value, base);
        points.push([x, y]);
    }
    // Use only first k points for interpolation
    points.sort((a, b) => a[0] - b[0]);
    let kPoints = points.slice(0, k);
    return lagrangeConstantTerm(kPoints).toString();
}


/////////////////////////



// MAIN
console.log("Secret for testcase 1:");
console.log(solveFromFile('testcase1.json'));
console.log("Secret for testcase 2:");
console.log(solveFromFile('testcase2.json'));







