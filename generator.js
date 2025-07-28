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
        let term = points[j][1] * numerator / denominator;
        result += term;
    }
    return result;
}

// Function to get all combinations of k elements from an array
function getCombinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];
    
    const combinations = [];
    for (let i = 0; i <= arr.length - k; i++) {
        const head = arr[i];
        const tailCombinations = getCombinations(arr.slice(i + 1), k - 1);
        for (const tailCombination of tailCombinations) {
            combinations.push([head, ...tailCombination]);
        }
    }
    return combinations;
}

// Function to detect wrong shares and find the correct secret
function findCorrectSecret(points, k) {
    if (points.length === k) {
        // If we have exactly k points, no redundancy to detect wrong shares
        return {
            secret: lagrangeConstantTerm(points),
            correctShares: points,
            wrongShares: []
        };
    }
    
    // Get all possible combinations of k points
    const combinations = getCombinations(points, k);
    const secretCounts = {};
    const combinationSecrets = [];
    
    // Calculate secret for each combination
    for (const combo of combinations) {
        const secret = lagrangeConstantTerm(combo);
        const secretStr = secret.toString();
        
        combinationSecrets.push({
            combination: combo,
            secret: secret
        });
        
        if (!secretCounts[secretStr]) {
            secretCounts[secretStr] = [];
        }
        secretCounts[secretStr].push(combo);
    }
    
    // Find the most frequent secret (this should be the correct one)
    let maxCount = 0;
    let correctSecret = null;
    let correctCombinations = [];
    
    for (const [secret, combinations] of Object.entries(secretCounts)) {
        if (combinations.length > maxCount) {
            maxCount = combinations.length;
            correctSecret = BigInt(secret);
            correctCombinations = combinations;
        }
    }
    
    // Identify correct and wrong shares
    const correctSharesSet = new Set();
    const wrongShares = [];
    
    // Add all shares that appear in correct combinations
    for (const combo of correctCombinations) {
        for (const point of combo) {
            // Convert BigInt to string for serialization
            const pointForSet = [point[0], point[1].toString()];
            correctSharesSet.add(JSON.stringify(pointForSet));
        }
    }
    
    // Find wrong shares (those that don't appear in any correct combination)
    for (const point of points) {
        const pointForSet = [point[0], point[1].toString()];
        const pointStr = JSON.stringify(pointForSet);
        if (!correctSharesSet.has(pointStr)) {
            wrongShares.push(point);
        }
    }
    
    const correctShares = [];
    for (const pointStr of correctSharesSet) {
        const parsed = JSON.parse(pointStr);
        correctShares.push([parsed[0], BigInt(parsed[1])]);
    }
    
    return {
        secret: correctSecret,
        correctShares: correctShares,
        wrongShares: wrongShares,
        analysis: {
            totalCombinations: combinations.length,
            uniqueSecrets: Object.keys(secretCounts).length,
            correctCombinationsCount: maxCount,
            secretFrequencies: Object.fromEntries(
                Object.entries(secretCounts).map(([secret, combos]) => [secret, combos.length])
            )
        }
    };
}

// Read JSON file and solve with wrong share detection
const fs = require('fs');

function solveFromFileWithDetection(filepath) {
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
    
    // Sort points by x coordinate
    points.sort((a, b) => a[0] - b[0]);
    
    console.log(`\nAnalyzing ${filepath}:`);
    console.log(`Total shares: ${points.length}, Required (k): ${k}`);
    
    if (points.length < k) {
        console.log("Error: Not enough shares to reconstruct the secret!");
        return null;
    }
    
    const result = findCorrectSecret(points, k);
    
    console.log(`Secret: ${result.secret}`);
    console.log(`Correct shares: ${result.correctShares.length}`);
    console.log(`Wrong shares: ${result.wrongShares.length}`);
    
    if (result.wrongShares.length > 0) {
        console.log("\nWrong shares detected:");
        result.wrongShares.forEach(share => {
            console.log(`  x=${share[0]}, y=${share[1]}`);
        });
    }
    
    if (result.analysis) {
        console.log("\nAnalysis:");
        console.log(`  Total combinations tested: ${result.analysis.totalCombinations}`);
        console.log(`  Unique secrets found: ${result.analysis.uniqueSecrets}`);
        console.log(`  Correct combinations: ${result.analysis.correctCombinationsCount}`);
        
        if (result.analysis.uniqueSecrets > 1) {
            console.log("  Secret frequencies:");
            for (const [secret, count] of Object.entries(result.analysis.secretFrequencies)) {
                console.log(`    ${secret}: ${count} combinations`);
            }
        }
    }
    
    return result.secret.toString();
}

// Original function for comparison
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
    points.sort((a, b) => a[0] - b[0]);
    let kPoints = points.slice(0, k);
    return lagrangeConstantTerm(kPoints).toString();
}

// MAIN
console.log("=== ORIGINAL METHOD (first k shares) ===");
console.log("Secret for testcase 1:");
console.log(solveFromFile('testcase1.json'));
console.log("Secret for testcase 2:");
console.log(solveFromFile('testcase2.json'));

console.log("\n=== ENHANCED METHOD (with wrong share detection) ===");
console.log("Secret for testcase 1:");
const secret1 = solveFromFileWithDetection('testcase1.json');

console.log("\n" + "=".repeat(60));
console.log("Secret for testcase 2:");
const secret2 = solveFromFileWithDetection('testcase2.json');

console.log("\n" + "=".repeat(80));
console.log("🔑 FINAL SECRET KEYS (using correct shares only):");
console.log("=".repeat(80));
console.log(`✓ TESTCASE 1 SECRET KEY: ${secret1}`);
console.log(`✓ TESTCASE 2 SECRET KEY: ${secret2}`);
console.log("=".repeat(80));