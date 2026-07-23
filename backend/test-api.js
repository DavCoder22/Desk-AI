const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai-config.json'), 'utf8'));

console.log('Modelo:', config.model);
console.log('URL:', config.apiUrl);
console.log('Key:', config.apiKey.substring(0, 12) + '...' + config.apiKey.slice(-4));

fetch(config.apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + config.apiKey,
    'HTTP-Referer': 'https://github.com/DavCoder22/Desk-AI',
    'X-Title': 'DeskAI'
  },
  body: JSON.stringify({
    model: config.model,
    messages: [{ role: 'user', content: 'Responde solo: OK' }],
    max_tokens: 10
  }),
  signal: AbortSignal.timeout(20000)
}).then(r => r.json()).then(d => {
  if (d.choices) {
    console.log('Respuesta:', d.choices[0].message.content);
    console.log('CONEXION OK');
  } else {
    console.log('Error:', JSON.stringify(d));
  }
}).catch(e => console.log('Error:', e.message));
