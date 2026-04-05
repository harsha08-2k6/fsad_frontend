const fs = require('fs');
const file = 'next.config.mjs';
let content = fs.readFileSync(file, 'utf8');

// Replace all instances of localhost:8081 with process.env.NEXT_PUBLIC_API_URL or localhost fallback
content = content.replace(/"http:\/\/localhost:8081/g, '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8081\'}`');

fs.writeFileSync(file, content);
console.log('Successfully updated next.config.mjs');
