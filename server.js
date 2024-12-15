const express = require('express');
const fs = require('fs');
const path = require('path');
const JsConfuser = require('js-confuser');  // pastikan menggunakan js-confuser versi 2.0.0

// Set up Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk membaca body JSON
app.use(express.json());

// Path ke file apikey
const apiKeysPath = path.resolve(__dirname, 'apikey.json');
let validApiKeys = [];

try {
  // Membaca daftar API key dari apikey.json
  validApiKeys = JSON.parse(fs.readFileSync(apiKeysPath, 'utf8'));
} catch (error) {
  console.error('Error reading API keys:', error);
  process.exit(1);
}

// Fungsi untuk validasi API key
function validateApiKey(req, res, next) {
  const userApiKey = req.headers['x-api-key'];
  if (!userApiKey || !validApiKeys.includes(userApiKey)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing API key',
    });
  }
  next();
}

// Fungsi untuk obfuscation menggunakan JsConfuser versi 2.0.0
async function obfuscateWithJsConfuser(sourceCode) {
  try {
    const obfuscatedCode = JsConfuser.obfuscate(sourceCode, {
      target: 'node',
      calculator: true,
      deadCode: 0.1,
      globalConcealing: true,
      movedDeclarations: true,
      objectExtraction: true,
      renameVariables: true,
      renameGlobals: true,
      shuffle: true,
      variableMasking: 0.5,
      stringConcealing: true,
      stringSplitting: 0.25,
      flatten: true,
      opaquePredicates: true,
      astScrambler: true,
      renameLabels: true,
      preserveFunctionLength: true,
      stringCompression: true,
      compact: true,
      lock: {
        antiDebug: true,
      },
      identifierGenerator: function () {
        const timestamp = Date.now().toString(36);
        return "比的Appolo气Advance气" + timestamp.substring(timestamp.length - 7);
      },
    });

    const obfuscatedCodeString = typeof obfuscatedCode === 'string' ? obfuscatedCode : obfuscatedCode.code;
    return obfuscatedCodeString;
  } catch (error) {
    throw new Error('Failed to obfuscate code: ' + error.message);
  }
}

// Endpoint untuk obfuscate kode
app.post('/obfuscate', validateApiKey, async (req, res) => {
  const { sourceCode } = req.body;

  if (!sourceCode) {
    return res.status(400).json({
      success: false,
      message: 'Please provide the source code to obfuscate',
    });
  }

  try {
    const obfuscatedCodeString = await obfuscateWithJsConfuser(sourceCode);
    res.status(200).json({
      success: true,
      message: 'Obfuscation successful',
      obfuscatedCode: obfuscatedCodeString,  // Menyertakan hasil obfuscated dalam response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Jalankan server Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});