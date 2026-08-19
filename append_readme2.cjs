const fs = require('fs');

let content = fs.readFileSync('README.md', 'utf8');

// Replace the malicious note wording with a dual-sided explanation
const target = "It clearly warns users that exposing the URL means malicious actors could drop files into your local file system";
// Let's just find the section and replace it

content = content.replace(
  "drop malicious files into your vault.",
  "drop malicious files into your vault. (Conversely, you could intentionally share a specific URL with your Significant Other so they can drop sweet love notes directly into your dashboard!)"
);

content = content.replace(
  "malicious payloads.",
  "malicious payloads (or overly enthusiastic love note spam!)."
);

fs.writeFileSync('README.md', content);
console.log('Appended love notes use case to README!');
