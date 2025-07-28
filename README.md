# Hashira Task - Shamir's Secret Sharing with Wrong Share Detection

A robust implementation of Shamir's Secret Sharing scheme with advanced wrong share detection capabilities. This tool can reconstruct secrets from distributed shares and automatically identify corrupted or tampered shares using majority consensus and Lagrange interpolation.

## 🔥 Features

- **Shamir's Secret Sharing**: Reconstruct secrets from k-out-of-n shares using Lagrange interpolation
- **Wrong Share Detection**: Automatically identifies corrupted, invalid, or tampered shares
- **Multi-base Support**: Handles shares encoded in different number bases (2-36)
- **Majority Consensus**: Uses statistical analysis and frequency counting to determine correct secrets
- **BigInt Precision**: Handles arbitrarily large numbers without precision loss
- **Rational Arithmetic**: Performs exact fraction calculations to avoid floating-point errors
- **Comprehensive Analysis**: Provides detailed reports on share validation and mismatch detection

## 🚀 Quick Start

### Prerequisites
- Node.js (v12 or higher)
- Test case JSON files with share data

### Installation & Usage

1. Clone or download the project files
2. Navigate to the project directory
3. Run the tool:

```bash
node generator.js
```

The tool will automatically process all test cases defined in the `testFiles` array.

## 📊 Input Format

Create JSON files with the following structure:

```json
{
    "keys": {
        "n": 4,           // Total number of shares distributed
        "k": 3            // Minimum shares needed to reconstruct secret
    },
    "1": {                // Share identifier (x-coordinate)
        "base": "10",     // Number base (2-36)
        "value": "4"      // Share value in specified base
    },
    "2": {
        "base": "2",      // Binary base
        "value": "111"    // 111₂ = 7₁₀
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {                // Non-sequential IDs are supported
        "base": "4",
        "value": "213"    // 213₄ = 39₁₀
    }
}
```

### Supported Number Bases
- **Base 2-10**: Standard digits (0-9)
- **Base 11-36**: Uses letters a-z for digits 10-35
- **Case insensitive**: Both 'A' and 'a' represent digit 10

## 🧮 Algorithm Overview

### Shamir's Secret Sharing
The algorithm uses polynomial interpolation where:
- A secret is encoded as the constant term of a polynomial of degree k-1
- Each share represents a point (x, y) on this polynomial
- Any k points can uniquely determine the polynomial and recover the secret
- Fewer than k points reveal no information about the secret

### Wrong Share Detection Process

1. **Combination Generation**: Creates all possible combinations of k shares from available n shares
2. **Secret Calculation**: For each combination, calculates the secret using Lagrange interpolation
3. **Frequency Analysis**: Counts how often each secret appears across combinations
4. **Majority Voting**: Selects the most frequent secret as the correct one
5. **Mismatch Detection**: Identifies shares that don't fit the correct polynomial
6. **Validation**: Returns the secret and list of corrupted shares

### Mathematical Foundation

The tool uses **exact rational arithmetic** to avoid floating-point precision errors:
- All calculations performed using BigInt numerators and denominators
- GCD reduction maintains fractions in lowest terms
- Rational evaluation ensures mathematically precise results

## 📈 Sample Output

```bash
🧪 Test case 1 (testcase1.json)
🔐 Secret: 1
❌ Wrong share(s): 3

🧪 Test case 2 (testcase2.json)
🔐 Secret: 79836264049851
✅ All shares are valid.
```

## 🔧 Core Functions

### `decodeBase(value, base)`
Converts string representations from any base (2-36) to BigInt decimal values.

### `constantFromCombination(comb)`
Performs Lagrange interpolation to find the polynomial's constant term (secret) from k points.

### `evaluateAt(x, comb)`
Evaluates the interpolated polynomial at point x using rational arithmetic.

### `generateCombinations(arr, k)`
Generates all possible combinations of k elements from an array of n elements.

### `processTestCase(data)`
Main processing function that orchestrates the entire wrong share detection algorithm.

## 🛡️ Security & Reliability

### Tamper Detection
- **Statistical Validation**: Multiple combinations provide redundancy
- **Consistency Checking**: Shares must fit the same polynomial
- **Outlier Identification**: Minority results indicate corruption

### Precision Guarantees
- **BigInt Arithmetic**: No integer overflow for large numbers
- **Rational Math**: Exact fractions prevent floating-point errors
- **GCD Reduction**: Maintains numerical stability

### Error Handling
- **Invalid Bases**: Graceful handling of malformed input
- **Insufficient Shares**: Clear error reporting for k > n scenarios
- **Fractional Secrets**: Detection and reporting of non-integer results

## 📁 Project Structure

```
Hashira_Task/
├── generator.js          # Main implementation
├── testcase1.json       # Sample test with wrong share
├── testcase2.json       # Sample test with valid shares
└── README.md           # Documentation (this file)
```

## 🎯 Use Cases

- **Cryptographic Key Distribution**: Secure storage of encryption keys
- **Multi-signature Systems**: Requiring consensus from multiple parties
- **Backup and Recovery**: Fault-tolerant data storage systems
- **Threshold Authentication**: Access control requiring k-of-n approval
- **Data Integrity Verification**: Detecting tampering in distributed systems

## 🔬 Algorithm Complexity

- **Time Complexity**: O(C(n,k) × k²) where C(n,k) = n!/(k!(n-k)!) 
- **Space Complexity**: O(C(n,k) × k) for storing combinations
- **Practical Limits**: Efficient for moderate values (n ≤ 20, k ≤ 10)

## 📝 Implementation Details

### Lagrange Interpolation Formula
For points (x₁,y₁), (x₂,y₂), ..., (xₖ,yₖ), the polynomial is:

```
P(x) = Σᵢ yᵢ × Πⱼ≠ᵢ (x - xⱼ)/(xᵢ - xⱼ)
```

The secret is P(0), the constant term.

### Rational Arithmetic
All calculations use the form `num/den` where both numerator and denominator are BigInt values, ensuring exact precision for all intermediate and final results.

## 🚨 Important Considerations

1. **Minimum Shares**: Requires at least k valid shares for reconstruction
2. **Wrong Share Ratio**: Detection works best when wrong shares are minority
3. **Performance**: Exponential complexity limits practical use to moderate n values
4. **Memory Usage**: Large combinations may require significant memory
5. **Base Validation**: Ensure share values contain only valid digits for their base
 
## 📚 References

- Shamir, A. (1979). "How to share a secret". Communications of the ACM
- Lagrange Interpolation in Cryptography
- Threshold Cryptography and Secret Sharing Schemes

