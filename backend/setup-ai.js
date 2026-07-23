/**
 * setup-ai.js — Configura y prueba el API key de IA
 * Solo pide la API key; URL y modelo se auto-detectan.
 *
 * Reglas:
 *   - Primera vez: solo guarda si la prueba pasa.
 *   - Reemplazo: solo borra la config anterior si la nueva funciona.
 *   - Si la config existente falla, pide una nueva API key directamente.
 *
 * Exit codes:
 *   0 = Configurado y probado OK
 *   1 = Usar clasificador local (skip)
 *   2 = Error fatal / salida del usuario
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG_PATH = path.join(__dirname, 'ai-config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

function detectProvider(apiKey) {
  const key = apiKey.trim();

  // DeepSeek directo (sk-... en api.deepseek.com)
  if (key.startsWith('sk-') && key.length > 20) {
    // Heurística: si el usuario indica DeepSeek o usamos OpenRouter por defecto
    return {
      provider: 'DeepSeek (OpenRouter)',
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'poolside/laguna-s-2.1:free',
    };
  }

  if (key.startsWith('sk-or-v1-')) {
    return {
      provider: 'OpenRouter',
      apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'poolside/laguna-s-2.1:free',
    };
  }

  if (key.startsWith('gsk_')) {
    return {
      provider: 'Groq',
      apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'deepseek-r1-distill-llama-70b',
    };
  }

  if (key.startsWith('sk-') && !key.startsWith('sk-or-')) {
    return {
      provider: 'OpenAI',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
    };
  }

  return {
    provider: 'OpenRouter (auto-detected)',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'poolside/laguna-s-2.1:free',
  };
}

function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null;
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const cfg = JSON.parse(raw);
    if (cfg.apiKey && cfg.apiKey !== 'tu-api-key-aqui') return cfg;
    return null;
  } catch {
    return null;
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

function deleteConfig() {
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
}

async function testConnection(config) {
  console.log('\nProbando conexion...');
  console.log(`  Proveedor: ${config.provider || 'desconocido'}`);
  console.log(`  URL:       ${config.apiUrl}`);
  console.log(`  Modelo:    ${config.model}`);
  console.log(`  Key:       ${config.apiKey.substring(0, 8)}...${config.apiKey.slice(-4)}`);

  const body = {
    model: config.model,
    messages: [
      { role: 'system', content: 'Eres un asistente. Responde SOLO con "OK".' },
      { role: 'user', content: 'Responde unicamente con OK' },
    ],
    max_tokens: 10,
    temperature: 0,
  };

  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 30000);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    };
    if (config.apiUrl.includes('openrouter')) {
      headers['HTTP-Referer'] = 'https://github.com/DavCoder22/Desk-AI';
      headers['X-Title'] = 'DeskAI';
    }

    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(t);

    if (!res.ok) {
      const err = await res.text();
      console.error(`\nERROR ${res.status}: ${err.substring(0, 200)}`);
      return false;
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';
    console.log(`\nRespuesta: ${reply.substring(0, 60)}`);
    console.log('CONEXION EXITOSA!\n');
    return true;
  } catch (err) {
    console.error(`\nERROR: ${err.message}`);
    return false;
  }
}

// Pide API key, detecta, prueba y si funciona devuelve el config listo para guardar.
// Si no funciona, retorna null.
async function getValidConfig(showTitle) {
  if (showTitle) {
    console.log('');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│  CONFIGURACION DE IA                        │');
    console.log('│  Solo necesitas tu API key.                 │');
    console.log('│  URL y modelo se detectan automaticamente.  │');
    console.log('└─────────────────────────────────────────────┘');
    console.log('');
    console.log('Proveedores detectables:');
    console.log('  sk-or-v1-...  OpenRouter (poolside/laguna-s-2.1:free)');
    console.log('  gsk_......... Groq');
    console.log('  sk-.......... OpenAI');
    console.log('');
    console.log('Obtén tu API key:');
    console.log('  OpenRouter: https://openrouter.ai/keys');
    console.log('  Groq:       https://console.groq.com/keys');
    console.log('');
  }

  const apiKey = await ask('Ingresa tu API key (o Enter = clasificador local): ');

  if (!apiKey.trim()) {
    return 'SKIP';
  }

  const detected = detectProvider(apiKey);
  console.log(`\n[+] Proveedor detectado: ${detected.provider}`);

  const config = {
    apiKey: apiKey.trim(),
    model: detected.model,
    apiUrl: detected.apiUrl,
    provider: detected.provider,
  };

  const ok = await testConnection(config);
  if (ok) return config;

  // Fallo automatico — ofrecer config manual o reintentar
  console.log('\n[!] La conexion automatica fallo.');
  console.log('  [M] Configurar manualmente (URL y modelo)');
  console.log('  [N] Ingresar otra API key');
  console.log('  [S] Saltar a clasificador local');
  console.log('  [E] Salir');

  const opt = (await ask('\nSelecciona (M/N/S/E): ')).toUpperCase().trim();

  if (opt === 'M') {
    console.log('\n--- Configuracion manual ---\n');
    const manualUrl = await ask('URL de la API: ');
    const manualModel = await ask('Nombre del modelo: ');

    config.apiUrl = manualUrl.trim();
    config.model = manualModel.trim();
    config.provider = 'manual';

    const ok2 = await testConnection(config);
    if (ok2) return config;

    console.log('\n[!] La conexion manual tambien fallo.');
    console.log('  [R] Reintentar');
    console.log('  [S] Saltar a clasificador local');
    console.log('  [E] Salir');

    const opt2 = (await ask('\nSelecciona (R/S/E): ')).toUpperCase().trim();
    if (opt2 === 'R') return await getValidConfig(false);
    if (opt2 === 'S') return 'SKIP';
    return 'EXIT';
  }

  if (opt === 'N') return await getValidConfig(false);

  if (opt === 'S') return 'SKIP';

  return 'EXIT';
}

async function main() {
  const existing = loadConfig();

  if (!existing) {
    // PRIMERA VEZ: solo guarda si la prueba pasa
    const config = await getValidConfig(true);
    rl.close();

    if (config === 'SKIP') {
      console.log('\nUsando clasificador local (keywords).\n');
      return 1;
    }
    if (config === 'EXIT') {
      console.log('\nSaliendo.\n');
      return 2;
    }

    saveConfig(config);
    console.log('[+] Configuracion guardada en ai-config.json');
    return 0;
  }

  // YA HAY CONFIG — probar
  console.log('\nConfiguracion IA encontrada.');
  const ok = await testConnection(existing);
  if (ok) {
    rl.close();
    return 0;
  }

  // La config existente NO funciona → pedir una nueva directamente
  console.log('\n[!] La API key guardada NO funciona.');
  console.log('Ingresa una NUEVA API key para reemplazarla.');
  console.log('(La actual se borrara SOLO si la nueva funciona)');
  console.log('');

  const config = await getValidConfig(false);
  rl.close();

  if (config === 'SKIP') {
    console.log('\nUsando clasificador local. La config actual se conserva.\n');
    return 1;
  }

  if (config === 'EXIT') {
    console.log('\nSaliendo.\n');
    return 2;
  }

  // La NUEVA key funciona → recien aqui borramos la vieja y guardamos la nueva
  deleteConfig();
  saveConfig(config);
  console.log('[+] Configuracion actualizada en ai-config.json (la antigua fue borrada)');
  return 0;
}

// Capturar cualquier error no manejado que pueda cerrar la terminal
process.on('unhandledRejection', (err) => {
  console.error('\n[ERROR FATAL] Excepcion no manejada:', err.message || err);
  console.error('Esto puede deberse a una version antigua de Node.js (se requiere 18+).');
  process.exit(2);
});

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    if (err.code === 'ERR_SCRIPT_EXECUTION') {
      console.error('\nNo se pudo ejecutar el script. Verifica que Node.js este bien instalado.');
    } else if (err.message && err.message.includes('fetch')) {
      console.error('\n[ERROR] La funcion fetch no esta disponible.');
      console.error('Esto ocurre con Node.js menor a 18. Actualiza a Node.js 18 o superior.');
    } else {
      console.error('\n[ERROR FATAL]', err.message || err);
    }
    console.error('Si el problema persiste, elimina backend/ai-config.json y ejecuta de nuevo.');
    process.exit(2);
  });
