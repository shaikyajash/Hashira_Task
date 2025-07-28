# Hashira_Task

# Shamir's Secret Sharing with Wrong Share Detection

A robust implementation of Shamir's Secret Sharing scheme with advanced wrong share detection capabilities. This tool can reconstruct secrets from distributed shares and automatically identify corrupted or tampered shares using majority consensus.

## 🔥 Features

- **Standard Shamir's Secret Sharing**: Reconstruct secrets from k-out-of-n shares
- **Wrong Share Detection**: Automatically identifies corrupted or invalid shares
- **Multi-base Support**: Handles shares encoded in different number bases (binary, decimal, hex, etc.)
- **Majority Consensus**: Uses statistical analysis to determine the correct secret
- **Detailed Analysis**: Provides comprehensive reports on share validation
- **BigInt Support**: Handles large numbers without precision loss

## 🚀 How It Works

### Shamir's Secret Sharing Basics
Shamir's Secret Sharing is a cryptographic algorithm that divides a secret into multiple shares, where:
- **n**: Total number of shares created
- **k**: Minimum number of shares needed to reconstruct the secret
- Any k shares can reconstruct the original secret
- Fewer than k shares reveal no information about the secret

### Wrong Share Detection Algorithm
When more than k shares are available, the algorithm:

1. **Generates all combinations** of k shares from available shares
2. **Calculates secrets** for each combination using Lagrange interpolation
3. **Performs frequency analysis** to find the most common secret
4. **Identifies wrong shares** that don't contribute to the correct secret
5. **Uses majority voting** to determine the authentic secret

## 📁 Project Structure

```
├── generator.js          # Main implementation file
├── testcase1.json       # Sample test data
├── testcase2.json       # Sample test data
└── README.md           # This file
```

## 💻 Installation & Usage

### Prerequisites
- Node.js (v12 or higher)
- JSON test files with share data

### Running the Tool

```bash
node generator.js
```

### Input Format
The tool expects JSON files with the following structure:

```json
{
    "keys": {
        "n": 4,           // Total number of shares
        "k": 3            // Minimum shares needed
    },
    "1": {                // Share ID (x-coordinate)
        "base": "10",     // Number base of the value
        "value": "4"      // Share value in specified base
    },
    "2": {
        "base": "2",
        "value": "111"    // Binary: 111₂ = 7₁₀
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"    // Base-4: 213₄ = 39₁₀
    }
}
```

## 📊 Sample Output

```
=== ORIGINAL METHOD (first k shares) ===
Secret for testcase 1: 3
Secret for testcase 2: 79836264049851

=== ENHANCED METHOD (with wrong share detection) ===
Secret for testcase 1:

Analyzing testcase1.json:
Total shares: 4, Required (k): 3
Secret: 1
Correct shares: 3
Wrong shares: 1

Wrong shares detected:
  x=3, y=12

Analysis:
  Total combinations tested: 4
  Unique secrets found: 2
  Correct combinations: 3
  Secret frequencies:
    1: 3 combinations
    3: 1 combinations

================================================================================
🔑 FINAL SECRET KEYS (using correct shares only):
================================================================================
✓ TESTCASE 1 SECRET KEY: ###
✓ TESTCASE 2 SECRET KEY:############
================================================================================
```

## 🔧 Key Functions

### `baseToDecimal(str, base)`
Converts a string representation of a number in any base to decimal (BigInt).

### `lagrangeConstantTerm(points)`
Performs Lagrange interpolation at x=0 to find the secret (constant term).

### `findCorrectSecret(points, k)`
Main algorithm that detects wrong shares and finds the correct secret using majority consensus.

### `getCombinations(arr, k)`
Utility function to generate all possible combinations of k elements from an array.

## 🛡️ Security Features

- **Tamper Detection**: Identifies shares that have been modified or corrupted
- **Redundancy Validation**: Uses multiple share combinations to verify authenticity
- **Statistical Analysis**: Employs frequency analysis to distinguish correct from incorrect shares
- **Precision Handling**: Uses BigInt to prevent integer overflow attacks

## 🎯 Use Cases

- **Secure Key Storage**: Distribute cryptographic keys across multiple parties
- **Backup Systems**: Create redundant backups with tamper detection
- **Multi-party Authentication**: Require consensus from multiple parties
- **Data Integrity**: Verify the authenticity of distributed data shares

## 📝 Algorithm Complexity

- **Time Complexity**: O(C(n,k) × k²) where C(n,k) is the binomial coefficient
- **Space Complexity**: O(C(n,k) × k) for storing combinations
- **Practical Limit**: Efficient for reasonable values of n and k (n ≤ 20, k ≤ 10)

## 🚨 Important Notes

1. **Minimum Shares**: At least k shares are required to reconstruct any secret
2. **Wrong Share Threshold**: Detection works best when wrong shares are in minority
3. **Base Validation**: Ensure share values are valid in their specified number base
4. **BigInt Precision**: All calculations use BigInt to maintain precision for large numbers

## 🔬 Testing

The tool includes comprehensive testing with:
- Multiple test cases with known secrets
- Various number bases (binary, decimal, base-4, etc.)
- Scenarios with and without wrong shares
- Edge cases and boundary conditions

