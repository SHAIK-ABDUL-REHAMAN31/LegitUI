const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', 'src', 'lib', 'component-registry.ts');
let content = fs.readFileSync(registryPath, 'utf8');

// Replace all instances of isNew: true, (handling indentation and trailing commas)
content = content.replace(/\n\s*isNew:\s*true,?/g, '');

fs.writeFileSync(registryPath, content);
console.log('Successfully removed all isNew: true tags from registry!');
