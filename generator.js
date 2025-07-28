const fs = require('fs');

function decodeBase(value, base) {
  let result = 0n;
  const lower = value.toLowerCase();
  for (const ch of lower) {
    let digit;
    if (ch >= '0' && ch <= '9') {
      digit = BigInt(ch.charCodeAt(0) - '0'.charCodeAt(0));
    } else {
      digit = BigInt(ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
    }
    result = result * BigInt(base) + digit;
  }
  return result;
}

function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function constantFromCombination(comb) {
  let cNum = 0n;
  let cDen = 1n;
  for (const { x: xi, y: yi } of comb) {
    let num = 1n;
    let den = 1n;
    for (const { x: xj } of comb) {
      if (xj === xi) continue;
      num *= -xj;
      den *= (xi - xj);
    }
    cNum = cNum * den + yi * num * cDen;
    cDen = cDen * den;
    const g = gcd(cNum, cDen);
    cNum /= g;
    cDen /= g;
  }
  if (cDen < 0n) {
    cNum = -cNum;
    cDen = -cDen;
  }
  return { num: cNum, den: cDen };
}

function evaluateAt(x, comb) {
  let sumNum = 0n;
  let sumDen = 1n;
  for (const { x: xi, y: yi } of comb) {
    let num = 1n;
    let den = 1n;
    for (const { x: xj } of comb) {
      if (xj === xi) continue;
      num *= (x - xj);
      den *= (xi - xj);
    }
    sumNum = sumNum * den + yi * num * sumDen;
    sumDen = sumDen * den;
    const g = gcd(sumNum, sumDen);
    sumNum /= g;
    sumDen /= g;
  }
  if (sumDen < 0n) {
    sumNum = -sumNum;
    sumDen = -sumDen;
  }
  return { num: sumNum, den: sumDen };
}

function generateCombinations(arr, k) {
  const result = [];
  const n = arr.length;
  const indices = Array.from({ length: k }, (_, i) => i);
  result.push(indices.map(i => arr[i]));
  while (true) {
    let i = k - 1;
    while (i >= 0 && indices[i] === i + n - k) i--;
    if (i < 0) break;
    indices[i]++;
    for (let j = i + 1; j < k; j++) {
      indices[j] = indices[j - 1] + 1;
    }
    result.push(indices.map(i => arr[i]));
  }
  return result;
}

function processTestCase(data) {
  const n = data.keys.n;
  const k = data.keys.k;
  const shares = [];

  for (const key of Object.keys(data)) {
    if (key === 'keys') continue;
    const xi = BigInt(key);
    const base = parseInt(data[key].base, 10);
    const yi = decodeBase(data[key].value, base);
    shares.push({ x: xi, y: yi, id: key });
  }

  shares.sort((a, b) => (a.x < b.x ? -1 : 1));
  const combos = generateCombinations(shares, k);

  const constantMap = new Map();
  combos.forEach((comb, idx) => {
    const frac = constantFromCombination(comb);
    if (frac.den === 1n) {
      const key = frac.num.toString();
      if (!constantMap.has(key)) {
        constantMap.set(key, { count: 0, comboIndices: [] });
      }
      const obj = constantMap.get(key);
      obj.count++;
      obj.comboIndices.push(idx);
    }
  });

  if (constantMap.size === 0) {
    let best = { mismatches: n + 1, constStr: null, combIndex: null };
    combos.forEach((comb, idx) => {
      const fracConst = constantFromCombination(comb);
      let mismatches = 0;
      for (const sh of shares) {
        const val = evaluateAt(sh.x, comb);
        if (val.num !== sh.y * val.den) mismatches++;
      }
      if (mismatches < best.mismatches) {
        best.mismatches = mismatches;
        best.constStr =
          fracConst.den === 1n
            ? fracConst.num.toString()
            : `${fracConst.num}/${fracConst.den}`;
        best.combIndex = idx;
      }
    });
    const wrong = [];
    if (best.combIndex !== null) {
      const comb = combos[best.combIndex];
      for (const sh of shares) {
        const val = evaluateAt(sh.x, comb);
        if (val.num !== sh.y * val.den) {
          wrong.push(sh.id);
        }
      }
    }
    return { secret: best.constStr, wrongShares: wrong };
  }

  let maxCount = 0;
  constantMap.forEach(obj => {
    if (obj.count > maxCount) maxCount = obj.count;
  });

  const candidates = [];
  constantMap.forEach((obj, constStr) => {
    if (obj.count === maxCount)
      candidates.push({ constStr, comboIndices: obj.comboIndices });
  });

  let chosen = { constStr: null, mismatches: n + 1, comboIndex: null };
  candidates.forEach(cand => {
    const combIdx = cand.comboIndices[0];
    const comb = combos[combIdx];
    let mismatches = 0;
    for (const sh of shares) {
      const val = evaluateAt(sh.x, comb);
      if (val.num !== sh.y * val.den) mismatches++;
    }
    if (mismatches < chosen.mismatches) {
      chosen = { constStr: cand.constStr, mismatches, comboIndex: combIdx };
    } else if (mismatches === chosen.mismatches) {
      const currentVal = BigInt(cand.constStr);
      const chosenVal = BigInt(chosen.constStr);
      if (currentVal < chosenVal) {
        chosen = { constStr: cand.constStr, mismatches, comboIndex: combIdx };
      }
    }
  });

  const wrongShares = [];
  const chosenComb = combos[chosen.comboIndex];
  for (const sh of shares) {
    const val = evaluateAt(sh.x, chosenComb);
    if (val.num !== sh.y * val.den) {
      wrongShares.push(sh.id);
    }
  }

  return { secret: chosen.constStr, wrongShares };
}

// Direct usage: Specify test files here
const testFiles = [
  'testcase1.json',
  'testcase2.json', 
];

// Run each test case
testFiles.forEach((file, idx) => {
  const content = fs.readFileSync(file, 'utf-8');
  const data = JSON.parse(content);
  const result = processTestCase(data);
  console.log(`\n🧪 Test case ${idx + 1} (${file})`);
  console.log(`🔐 Secret: ${result.secret}`);
  if (result.wrongShares.length > 0) {
    console.log(`❌ Wrong share(s): ${result.wrongShares.join(', ')}`);
  } else {
    console.log(`✅ All shares are valid.`);
  }
});
