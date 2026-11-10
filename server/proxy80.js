const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DEFAULT_HOSTS = {
  PRUEBAS: ['pruebasccg', 'pruebas-ccg', 'pruebas', 'prueba', 'puebasccg', 'evaluaciones', 'certamen', 'certamenes'],
  SIMCE: ['simce', 'simceccg', 'simce-ccg', 'ensayos', 'ensayo', 'ensayossimce', 'ensayos-simce'],
  LABDESK: ['labdesk', 'labdeskccg', 'labdesk-ccg', 'aula', 'botonera', 'laboratorio'],
  UNIFIED: ['portal', 'portalccg', 'portal-ccg', 'unificado', 'unified', 'ccg', 'inicio', 'plataforma'],
};

const SERVICE_META = {
  SIMCE: { id: 'SIMCE', title: 'Plataforma Ensayos SIMCE', defaultPort: 3300 },
  PRUEBAS: { id: 'PRUEBAS', title: 'Plataforma Pruebas CCG', defaultPort: 3600 },
  UNIFIED: { id: 'UNIFIED', title: 'Portal Unificado CCG', defaultPort: 9000 },
  LABDESK: { id: 'LABDESK', title: 'LabDesk (Control de Aula)', defaultPort: 3000 },
};

function parseHostList(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].split(':')[0].replace(/\.$/, ''))
    .filter(Boolean);
}

function loadIniFile(iniPath) {
  const values = {};
  if (!iniPath || !fs.existsSync(iniPath)) return values;
  try {
    const content = fs.readFileSync(iniPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim().toUpperCase();
      const val = trimmed.slice(eq + 1).trim();
      values[key] = val;
    }
  } catch (err) {
    console.warn('[PROXY :80] No se pudo leer archivo de configuración:', err.message);
  }
  return values;
}

function loadProxyConfig(configPathOverride) {
  const configPath = configPathOverride || process.env.CCG_CONFIG_PATH || path.join(__dirname, '..', 'ccg_servers_config.ini');
  const ini = loadIniFile(configPath);

  const port = parseInt(process.env.PROXY_PORT || ini.PROXY_PORT || '80', 10) || 80;
  const host = process.env.PROXY_HOST || ini.PROXY_HOST || '0.0.0.0';
  const defaultServiceId = String(process.env.PROXY_DEFAULT_SERVICE || ini.PROXY_DEFAULT_SERVICE || 'UNIFIED').trim().toUpperCase();

  const services = {
    SIMCE: {
      ...SERVICE_META.SIMCE,
      port: parseInt(process.env.PROXY_SIMCE_PORT || ini.PROXY_SIMCE_PORT || '3300', 10) || 3300,
      customHosts: parseHostList(process.env.PROXY_SIMCE_HOSTS || ini.PROXY_SIMCE_HOSTS),
      defaultHosts: DEFAULT_HOSTS.SIMCE,
    },
    PRUEBAS: {
      ...SERVICE_META.PRUEBAS,
      port: parseInt(process.env.PROXY_PRUEBAS_PORT || ini.PROXY_PRUEBAS_PORT || '3600', 10) || 3600,
      customHosts: parseHostList(process.env.PROXY_PRUEBAS_HOSTS || ini.PROXY_PRUEBAS_HOSTS),
      defaultHosts: DEFAULT_HOSTS.PRUEBAS,
    },
    UNIFIED: {
      ...SERVICE_META.UNIFIED,
      port: parseInt(process.env.PROXY_UNIFIED_PORT || ini.PROXY_UNIFIED_PORT || '9000', 10) || 9000,
      customHosts: parseHostList(process.env.PROXY_UNIFIED_HOSTS || ini.PROXY_UNIFIED_HOSTS),
      defaultHosts: DEFAULT_HOSTS.UNIFIED,
    },
    LABDESK: {
      ...SERVICE_META.LABDESK,
      port: parseInt(process.env.PROXY_LABDESK_PORT || ini.PROXY_LABDESK_PORT || '3000', 10) || 3000,
      customHosts: parseHostList(process.env.PROXY_LABDESK_HOSTS || ini.PROXY_LABDESK_HOSTS),
      defaultHosts: DEFAULT_HOSTS.LABDESK,
    },
  };

  return {
    configPath,
    port,
    host,
    defaultServiceId: services[defaultServiceId] ? defaultServiceId : 'UNIFIED',
    services,
  };
}

function isIpOrLocalhost(hostname) {
  if (!hostname) return true;
  if (hostname === 'localhost' || hostname === '::1') return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  if (hostname.startsWith('[') && hostname.endsWith(']')) return true;
  return false;
}

function normalizeIncomingHost(hostHeader) {
  const raw = String(hostHeader || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.startsWith('[')) {
    const endBracket = raw.indexOf(']');
    return endBracket >= 0 ? raw.slice(0, endBracket + 1) : raw;
  }
  return raw.split(':')[0].replace(/\.$/, '').trim();
}

function resolveRoute(hostHeader, config) {
  const cleanHost = normalizeIncomingHost(hostHeader);
  const serviceList = Object.values(config.services);

  // 1. Coincidencia exacta con nombres personalizados (ej. pruebasccg.ccg.cl o pruebasccg)
  if (cleanHost) {
    for (const srv of serviceList) {
      if (srv.customHosts.includes(cleanHost)) {
        return { ...srv, matchedBy: 'custom-exact', host: cleanHost };
      }
    }
  }

  // Si viene IP directa o localhost sin subdominio, enviar al Portal por defecto
  if (!cleanHost || isIpOrLocalhost(cleanHost)) {
    const def = config.services[config.defaultServiceId] || config.services.UNIFIED;
    return { ...def, matchedBy: 'default-ip', host: cleanHost || 'localhost' };
  }

  const firstLabel = cleanHost.split('.')[0];

  // 2. Coincidencia por primera etiqueta con nombres personalizados (permite pruebasccg.ccg o pruebasccg.lan)
  for (const srv of serviceList) {
    if (srv.customHosts.includes(firstLabel)) {
      return { ...srv, matchedBy: 'custom-label', host: cleanHost };
    }
  }

  // 3. Coincidencia con alias estándar / prefijos
  for (const srv of serviceList) {
    if (srv.defaultHosts.includes(cleanHost) || srv.defaultHosts.includes(firstLabel)) {
      return { ...srv, matchedBy: 'alias', host: cleanHost };
    }
  }

  if (firstLabel.startsWith('pruebas') || firstLabel.startsWith('puebas')) {
    return { ...config.services.PRUEBAS, matchedBy: 'prefix', host: cleanHost };
  }
  if (firstLabel.startsWith('simce') || firstLabel.startsWith('ensayo')) {
    return { ...config.services.SIMCE, matchedBy: 'prefix', host: cleanHost };
  }
  if (firstLabel.startsWith('labdesk')) {
    return { ...config.services.LABDESK, matchedBy: 'prefix', host: cleanHost };
  }
  if (firstLabel.startsWith('portal')) {
    return { ...config.services.UNIFIED, matchedBy: 'prefix', host: cleanHost };
  }

  // 4. Fallback al servicio principal (Portal Unificado)
  const fallback = config.services[config.defaultServiceId] || config.services.UNIFIED;
  return { ...fallback, matchedBy: 'default', host: cleanHost };
}

function isLoopbackAddress(addr) {
  if (!addr) return false;
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function ensureFirewallRule(port) {
  if (process.platform !== 'win32') return;
  const ruleName = `Proxy Web CCG (Puerto ${port})`;
  const cmd = `netsh advfirewall firewall show rule name="${ruleName}" >nul 2>&1 || netsh advfirewall firewall add rule name="${ruleName}" dir=in action=allow protocol=TCP localport=${port}`;
  try {
    exec(cmd, { windowsHide: true, timeout: 5000 }, () => {});
  } catch {}
}

function renderOfflinePage(route, reqHost) {
  const displayHost = reqHost || `Puerto ${route.port}`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${route.title} — Servicio detenido</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, sans-serif; background: #f1f5f9; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #fff; border: 1px solid #cbd5e1; border-radius: 14px; max-width: 500px; width: 100%; padding: 26px; box-shadow: 0 10px 25px rgba(15, 23, 42, .08); }
    .badge { display: inline-block; font-size: 12px; font-weight: 700; color: #991b1b; background: #fee2e2; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 999px; margin-bottom: 12px; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    p { margin: 0 0 14px; color: #475569; font-size: 14px; line-height: 1.5; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 5px; font-size: 13px; color: #1e293b; }
    .btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; border: none; border-radius: 8px; padding: 9px 16px; font-weight: 600; font-size: 13px; cursor: pointer; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Servicio temporalmente detenido</span>
    <h1>${route.title}</h1>
    <p>El proxy redirigió correctamente <code>${displayHost}</code> hacia el puerto local <code>:${route.port}</code>, pero esa plataforma aún no está encendida en el servidor.</p>
    <p>Abre el <strong>Gestor de Servidores CCG</strong> e inicia <strong>${route.title}</strong>, luego vuelve a intentar.</p>
    <button class="btn" onclick="location.reload()">Reintentar ahora</button>
  </div>
</body>
</html>`;
}

function startProxy(options = {}) {
  let config = loadProxyConfig(options.configPath);
  let lastMtimeMs = 0;
  try {
    if (fs.existsSync(config.configPath)) {
      lastMtimeMs = fs.statSync(config.configPath).mtimeMs;
    }
  } catch {}
  let lastCheckedAt = Date.now();

  const getActiveConfig = () => {
    const now = Date.now();
    if (now - lastCheckedAt < 5000) return config;
    lastCheckedAt = now;
    try {
      if (fs.existsSync(config.configPath)) {
        const mtime = fs.statSync(config.configPath).mtimeMs;
        if (mtime !== lastMtimeMs) {
          lastMtimeMs = mtime;
          config = loadProxyConfig(config.configPath);
          console.log('[PROXY :80] Configuración recargada desde ccg_servers_config.ini');
        }
      }
    } catch {}
    return config;
  };

  const server = http.createServer((req, res) => {
    const activeCfg = getActiveConfig();
    const clientAddr = req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '';

    if (req.url === '/__ccg_proxy_health' && isLoopbackAddress(clientAddr)) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, service: 'ccg-proxy', port: activeCfg.port, pid: process.pid }));
      return;
    }

    const route = resolveRoute(req.headers.host, activeCfg);
    const originalHost = req.headers.host || `${route.host}`;
    const cleanClientIp = clientAddr.replace(/^::ffff:/, '');

    const forwardHeaders = { ...req.headers };
    forwardHeaders.host = originalHost;
    forwardHeaders['x-forwarded-host'] = originalHost;
    forwardHeaders['x-forwarded-proto'] = 'http';
    forwardHeaders['x-forwarded-port'] = String(activeCfg.port);
    forwardHeaders['x-forwarded-for'] = forwardHeaders['x-forwarded-for']
      ? `${forwardHeaders['x-forwarded-for']}, ${cleanClientIp}`
      : cleanClientIp;

    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: route.port,
        path: req.url,
        method: req.method,
        headers: forwardHeaders,
        timeout: 0,
      },
      (proxyRes) => {
        const outHeaders = { ...proxyRes.headers };

        // Reescribir redirecciones absolutas hacia 127.0.0.1/localhost:<port> para mantener el dominio amigable
        if (typeof outHeaders.location === 'string') {
          const localOriginRegex = new RegExp(`^https?://(127\\.0\\.0\\.1|localhost):${route.port}(/|$)`, 'i');
          if (localOriginRegex.test(outHeaders.location)) {
            outHeaders.location = outHeaders.location.replace(localOriginRegex, `http://${originalHost}$2`);
          }
        }

        res.writeHead(proxyRes.statusCode || 502, outHeaders);
        proxyRes.pipe(res);
      }
    );

    proxyReq.setTimeout(0);

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(renderOfflinePage(route, req.headers.host));
      } else {
        res.destroy(err);
      }
    });

    req.on('aborted', () => {
      proxyReq.destroy();
    });

    req.on('error', () => {
      proxyReq.destroy();
    });

    res.on('close', () => {
      if (!res.writableEnded) {
        proxyReq.destroy();
      }
    });

    req.pipe(proxyReq);
  });

  server.requestTimeout = 0;
  server.headersTimeout = 60000;

  // Soporte WebSocket (Socket.IO / LabDesk / dev HMR)
  server.on('upgrade', (req, clientSocket, head) => {
    const activeCfg = getActiveConfig();
    const route = resolveRoute(req.headers.host, activeCfg);
    const upstream = net.connect(route.port, '127.0.0.1', () => {
      const clientAddr = (req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '').replace(/^::ffff:/, '');
      let headerBlock = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const name = req.rawHeaders[i];
        const value = req.rawHeaders[i + 1];
        if (!/^x-forwarded-(host|proto|port|for)$/i.test(name)) {
          headerBlock += `${name}: ${value}\r\n`;
        }
      }
      if (req.headers.host) headerBlock += `X-Forwarded-Host: ${req.headers.host}\r\n`;
      headerBlock += `X-Forwarded-Proto: http\r\n`;
      headerBlock += `X-Forwarded-Port: ${activeCfg.port}\r\n`;
      if (clientAddr) headerBlock += `X-Forwarded-For: ${clientAddr}\r\n`;
      headerBlock += '\r\n';

      upstream.write(headerBlock);
      if (head && head.length > 0) upstream.write(head);

      clientSocket.pipe(upstream);
      upstream.pipe(clientSocket);
    });

    upstream.on('error', () => {
      try {
        clientSocket.write('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n');
      } catch {}
      clientSocket.destroy();
    });

    clientSocket.on('error', () => {
      upstream.destroy();
    });
  });

  server.on('clientError', (err, socket) => {
    if (err && err.code === 'ECONNRESET') return;
    if (socket && socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });

  const listenPort = options.port !== undefined ? options.port : config.port;
  const listenHost = options.host || config.host;

  server.listen(listenPort, listenHost, () => {
    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : listenPort;
    if (actualPort === 80) {
      ensureFirewallRule(actualPort);
    }
    console.log(`[PROXY :${actualPort}] Proxy inverso CCG escuchando en http://${listenHost}:${actualPort}`);
    console.log(
      `[PROXY :${actualPort}] Rutas -> PRUEBAS (:${config.services.PRUEBAS.port}) | SIMCE (:${config.services.SIMCE.port}) | PORTAL (:${config.services.UNIFIED.port}) | LABDESK (:${config.services.LABDESK.port})`
    );
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[PROXY ERROR] El puerto ${listenPort} ya está ocupado por otro servicio.`);
    } else if (err.code === 'EACCES') {
      console.error(`[PROXY ERROR] Permisos insuficientes para abrir el puerto ${listenPort}.`);
    } else {
      console.error(`[PROXY ERROR] ${err.message}`);
    }
    if (require.main === module) {
      process.exit(1);
    }
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  };

  if (require.main === module) {
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  return server;
}

if (require.main === module) {
  startProxy();
}

module.exports = {
  loadProxyConfig,
  resolveRoute,
  normalizeIncomingHost,
  startProxy,
};
