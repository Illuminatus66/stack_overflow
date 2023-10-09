const crypto = require('crypto');

// Generate a secure random secret with 64 bytes (512 bits)
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);
