require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_SECURE === 'true' || !process.env.SMTP_SECURE),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
});

async function enviarCorreoConfirmacion(reserva, profesorEmail) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('[MAIL MOCK] Correo de confirmación no enviado porque faltan SMTP_USER o SMTP_PASS en .env. Datos:', reserva);
        return;
    }
    const html = `
        <h2>Reserva de Recurso Confirmada</h2>
        <p>Hola, tu reserva se ha ingresado exitosamente en el sistema.</p>
        <ul>
            <li><b>Recurso:</b> ${reserva.recurso}</li>
            <li><b>Fecha:</b> ${reserva.fecha}</li>
            <li><b>Bloques:</b> ${reserva.bloques}</li>
            <li><b>Motivo:</b> ${reserva.motivo}</li>
        </ul>
        <p>Gracias por usar la plataforma unificada.</p>
    `;
    try {
        await transporter.sendMail({
            from: '"Sistema Colegio" <' + process.env.SMTP_USER + '>',
            to: profesorEmail,
            subject: 'Confirmación de Reserva - ' + reserva.recurso,
            html: html
        });
        console.log('Correo enviado a:', profesorEmail);
    } catch(e) {
        console.error('Error enviando correo:', e);
    }
}

const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 9000;

// Configurar DB
const dbPath = path.join(__dirname, 'db', 'colegio.db');
const db = new sqlite3.Database(dbPath);

// Auto-healing migraciones
db.serialize(() => {
  db.run("ALTER TABLE recursos_config ADD COLUMN reglas_reserva TEXT DEFAULT '{}'", () => {});
  db.run("ALTER TABLE reservas ADD COLUMN token_aprobacion TEXT", () => {});
  db.run("ALTER TABLE evaluaciones ADD COLUMN temario TEXT", () => {});
  db.run(`CREATE TABLE IF NOT EXISTS libro_registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    profesor TEXT NOT NULL,
    profesor_normalizado TEXT NOT NULL,
    creadas INTEGER DEFAULT 0,
    requeridas INTEGER DEFAULT 0,
    contenido INTEGER DEFAULT 0,
    asistencia INTEGER DEFAULT 0,
    firma INTEGER DEFAULT 0,
    critico INTEGER DEFAULT 0,
    archivo_origen TEXT,
    profesor_plataforma TEXT,
    profesor_email TEXT,
    usuario_id INTEGER,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fecha, profesor_normalizado) ON CONFLICT REPLACE
  )`, () => {});
  db.run("ALTER TABLE libro_registros ADD COLUMN profesor_plataforma TEXT", () => {});
  db.run("ALTER TABLE libro_registros ADD COLUMN profesor_email TEXT", () => {});
  db.run("ALTER TABLE libro_registros ADD COLUMN usuario_id INTEGER", () => {});
  db.run(`CREATE TABLE IF NOT EXISTS libro_alias_docentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_reporte TEXT UNIQUE NOT NULL,
    nombre_normalizado TEXT NOT NULL,
    usuario_id INTEGER,
    nombre_plataforma TEXT NOT NULL,
    email TEXT,
    origen TEXT DEFAULT 'auto',
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, () => {});
  db.run("CREATE INDEX IF NOT EXISTS idx_alias_reporte ON libro_alias_docentes(nombre_normalizado)", () => {});
  db.run(`CREATE TABLE IF NOT EXISTS libro_config (
    clave TEXT PRIMARY KEY,
    valor TEXT
  )`, () => {});
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos del frontend
// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'colegio_secreto_super_seguro_123',
  resave: false,
  saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

 

// Configurar Passport (Google OAuth)
app.use(passport.initialize());
app.use(passport.session());

// Middleware para gestionar rol activo en sesión (Modo Administrador vs Modo Profesor)
app.use((req, res, next) => {
  if (req.user && !req.user.esVisitanteInstitucional) {
    req.user.rolOriginal = req.user.rolOriginal || req.user.rol;
    const origNorm = (req.user.rolOriginal || '').toLowerCase().trim();
    const esAdminBase = origNorm.includes('admin') || origNorm.includes('directiv');
    req.user.esAdminBase = esAdminBase;
    req.user.puedeCambiarRol = esAdminBase;
    req.user.rolesDisponibles = esAdminBase ? ['Administrador', 'Profesor'] : [req.user.rolOriginal];

    if (esAdminBase && req.session && req.session.rolActivo) {
      req.user.rol = req.session.rolActivo;
    }
  }
  next();
});

 app.get(['/', '/index.html'], (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login.html');
  }
  if (req.user && req.user.esVisitanteInstitucional) {
    return res.redirect('/calendario-curso.html');
  }
  next();
});

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Ping para comprobación de estado del túnel
app.get('/api/ping', (req, res) => res.send('pong'));

function esDominioInstitucional(email) {
  if (!email || typeof email !== 'string') return false;
  const em = email.toLowerCase().trim();
  const allowedConfig = process.env.ALLOWED_GOOGLE_DOMAINS 
    ? process.env.ALLOWED_GOOGLE_DOMAINS.split(',').map(d => d.trim().toLowerCase().replace(/^@/, '')) 
    : ['colegiocerrogrande.cl', 'alumnos.colegiocerrogrande.cl'];
  
  const domain = em.split('@')[1];
  if (!domain) return false;
  return allowedConfig.some(allowed => domain === allowed || domain.endsWith('.' + allowed));
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/auth/google/callback`
    },
    function(accessToken, refreshToken, profile, cb) {
      const email = profile.emails[0].value.toLowerCase();
      db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (err) return cb(err);
        if (row) {
          return cb(null, row); // Usuario de la BD (profesor/administrador)
        }
        
        // Si no está en BD pero pertenece a un dominio Google institucional:
        if (esDominioInstitucional(email)) {
          const usuarioVisitante = {
            id: 'visitor_' + Buffer.from(email).toString('hex').slice(0, 12),
            email: email,
            nombre: profile.displayName || email.split('@')[0],
            rol: 'Lector',
            esVisitanteInstitucional: true
          };
          return cb(null, usuarioVisitante);
        }

        // Usuario no autorizado
        return cb(null, false, { message: 'Debes iniciar sesión con una cuenta de Google institucional del colegio (@colegiocerrogrande.cl).' });
      });
    }
  ));
}

passport.serializeUser((user, done) => {
  if (user && user.esVisitanteInstitucional) {
    done(null, user);
  } else {
    done(null, (user && user.id) ? user.id : user);
  }
});

passport.deserializeUser((idOrUser, done) => {
  if (idOrUser && typeof idOrUser === 'object' && idOrUser.esVisitanteInstitucional) {
    return done(null, idOrUser);
  }
  const id = (idOrUser && idOrUser.id) ? idOrUser.id : idOrUser;
  db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row) => {
    if (err) return done(err);
    if (row) return done(null, row);
    if (typeof idOrUser === 'object') return done(null, idOrUser);
    done(null, null);
  });
});

// Middleware de protección
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'No autenticado' });
}

// Rutas de Auth
app.get('/auth/google', (req, res, next) => {
  if (req.query.popup === '1' || req.query.popup === 'true') {
    req.session.oauthPopup = true;
  } else {
    req.session.oauthPopup = false;
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  const isPopup = req.session && req.session.oauthPopup;
  passport.authenticate('google', { 
    failureRedirect: isPopup ? '/auth/popup-callback?error=unauthorized' : '/login.html' 
  })(req, res, () => {
    if (isPopup) {
      delete req.session.oauthPopup;
      return res.redirect('/auth/popup-callback?status=success');
    }
    if (req.user && req.user.esVisitanteInstitucional) {
      return res.redirect('/calendario-curso.html');
    }
    res.redirect('/');
  });
});

app.get('/auth/popup-callback', (req, res) => {
  const { status, error } = req.query;
  const isOk = status === 'success';
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Autenticación Institucional</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 40px; background: #f8fafc; color: #1e293b;">
  <div style="max-width: 380px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
    <h3 style="margin-top:0; color: ${isOk ? '#16a34a' : '#dc2626'}; font-size: 1.3rem;">
      ${isOk ? '✓ Sesión iniciada con éxito' : '✕ Acceso no autorizado'}
    </h3>
    <p style="font-size: 0.95rem; color: #64748b; line-height: 1.5;">
      ${isOk 
        ? 'Autenticado con tu cuenta institucional. Cerrando ventana y cargando calendario...' 
        : 'Debes utilizar una cuenta de Google institucional del colegio (@colegiocerrogrande.cl).'
      }
    </p>
  </div>
  <script>
    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'AUTH_RESULT', success: ${isOk} }, '*');
      } catch(e){}
    }
    setTimeout(function() { window.close(); }, ${isOk ? 1000 : 3500});
  </script>
</body>
</html>`);
});

app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      email: req.user.email,
      nombre: req.user.nombre,
      rol: req.user.rol,
      rolOriginal: req.user.rolOriginal || req.user.rol,
      esAdminBase: !!req.user.esAdminBase,
      puedeCambiarRol: !!req.user.puedeCambiarRol,
      rolesDisponibles: req.user.rolesDisponibles || [req.user.rol],
      esVisitanteInstitucional: !!req.user.esVisitanteInstitucional
    });
  } else {
    // Para modo desarrollo sin Google OAuth (solo si no hay client ID)
    if (!process.env.GOOGLE_CLIENT_ID) {
       const rolActivo = (req.session && req.session.rolActivo) ? req.session.rolActivo : 'Administrador';
       res.json({ 
         email: 'admin@colegio.edu', 
         nombre: 'Admin (Dev)', 
         rol: rolActivo,
         rolOriginal: 'Administrador',
         esAdminBase: true,
         puedeCambiarRol: true,
         rolesDisponibles: ['Administrador', 'Profesor']
       });
    } else {
       res.status(401).json({ error: 'No autenticado' });
    }
  }
});

app.post('/api/auth/cambiar-rol', (req, res) => {
  const { rol } = req.body;
  if (!req.isAuthenticated()) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      const nuevo = (rol && rol.toLowerCase().includes('prof')) ? 'Profesor' : 'Administrador';
      if (!req.session) req.session = {};
      req.session.rolActivo = nuevo;
      return res.json({ success: true, rolActivo: nuevo });
    }
    return res.status(401).json({ error: 'No autenticado' });
  }

  const rolOrig = req.user.rolOriginal || req.user.rol;
  const origNorm = (rolOrig || '').toLowerCase().trim();
  const esAdmin = origNorm.includes('admin') || origNorm.includes('directiv');

  if (!esAdmin) {
    return res.status(403).json({ error: 'Solo los usuarios administradores pueden alternar de rol.' });
  }

  const nuevoRol = (rol && rol.toLowerCase().includes('prof')) ? 'Profesor' : (req.user.rolOriginal || 'Administrador');
  req.session.rolActivo = nuevoRol;
  req.user.rol = nuevoRol;

  res.json({ success: true, rolActivo: nuevoRol });
});

app.get('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login.html');
  });
});


app.post('/api/auth/local', (req, res) => {
    // 1. Verify Local Origin
    const ip = req.ip || req.connection.remoteAddress;
    const isLocal = ip === '::1' || ip === '127.0.0.1' || ip.includes('::ffff:127.0.0.1') || 
                    ip.includes('192.168.') || ip.includes('10.');
                    
    if (!isLocal) {
        return res.status(403).json({ error: 'Acceso denegado. Este método solo está permitido dentro de la red local física del colegio.' });
    }
    
    // 2. Validate and Authenticate User
    const { email, pin } = req.body;
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'No se encontró un usuario con ese correo en la base de datos local.' });
        
        if (!row.pin) {
            return res.status(401).json({ error: 'Este usuario no tiene un PIN configurado. Ingresa primero con Google para configurarlo.' });
        }
        
        if (row.pin !== pin) {
            return res.status(401).json({ error: 'PIN local incorrecto.' });
        }
        
        req.login(row, (err) => {
            if (err) return res.status(500).json({ error: 'Error interno de sesión.' });
            return res.json({ success: true, redirect: '/' });
        });
    });
});

const crypto = require('crypto');

app.get('/api/auth/gas-url', (req, res) => {
    res.json({ url: process.env.GAS_WEB_APP_URL || '' });
});

app.get('/api/auth/gas', (req, res) => {
    const { email, timestamp, sig } = req.query;
    if (!email || !timestamp || !sig) return res.status(400).send("Faltan parámetros de seguridad");
    
    const now = Date.now();
    if (now - parseInt(timestamp) > 5 * 60 * 1000) {
        return res.status(401).send("El link de autenticación ha expirado por seguridad.");
    }
    
    const data = email + "|" + timestamp;
    const GAS_SECRET = process.env.GAS_SECRET || 'tu_clave_super_secreta_123';
    const expectedSig = crypto.createHmac('sha256', GAS_SECRET).update(data).digest('hex');
                              
    if (sig !== expectedSig) {
        return res.status(401).send("Firma digital inválida (Posible falsificación detectada)");
    }
    
    db.get("SELECT * FROM usuarios WHERE email = ?", [email.toLowerCase()], (err, row) => {
        if (err) return res.status(500).send("Error de base de datos");
        
        if (!row) {
            if (esDominioInstitucional(email)) {
                const usuarioVisitante = {
                    id: 'visitor_' + Buffer.from(email).toString('hex').slice(0, 12),
                    email: email.toLowerCase(),
                    nombre: email.split('@')[0],
                    rol: 'Lector',
                    esVisitanteInstitucional: true
                };
                return req.login(usuarioVisitante, (errLog) => {
                    if (errLog) return res.status(500).send("Error interno al crear la sesión");
                    if (req.session && req.session.oauthPopup) {
                        delete req.session.oauthPopup;
                        return res.redirect('/auth/popup-callback?status=success');
                    }
                    res.redirect('/calendario-curso.html');
                });
            }
            return res.status(404).send("Debes utilizar una cuenta institucional del colegio (@colegiocerrogrande.cl).");
        }
        
        req.login(row, (err) => {
            if (err) return res.status(500).send("Error interno al crear la sesión");
            if (req.session && req.session.oauthPopup) {
                delete req.session.oauthPopup;
                return res.redirect('/auth/popup-callback?status=success');
            }
            res.redirect('/');
        });
    });
});



// ==========================================
// API REST - REEMPLAZO DE APPS SCRIPT
// ==========================================

// --- Usuarios ---
app.get('/api/usuarios', (req, res) => {
  db.all("SELECT * FROM usuarios", (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/usuarios', (req, res) => {
  const { email, nombre, rol } = req.body;
  db.run("INSERT INTO usuarios (email, nombre, rol) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET nombre=excluded.nombre, rol=excluded.rol", [email, nombre, rol], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Usuario guardado' });
  });
});

app.delete('/api/usuarios/:email', (req, res) => {
  db.run("DELETE FROM usuarios WHERE email = ?", [req.params.email], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Usuario eliminado' });
  });
});


// --- Recursos Config ---

app.get('/api/recursos/config', (req, res) => {
  db.all("SELECT * FROM recursos_config WHERE activo = 1", (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/recursos/config', (req, res) => {
  const userRole = (req.user && req.user.rol) ? req.user.rol.toLowerCase() : '';
  const esAdmin = userRole.includes('admin') || userRole.includes('directiv');
  if (!esAdmin) return res.status(403).json({ error: 'Solo los administradores pueden crear recursos.' });

  const { nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad } = req.body;
  const dispStr = disponibilidad ? JSON.stringify(disponibilidad) : '{}';
  db.run("INSERT INTO recursos_config (nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, responsable, duracion_bloque || 45, horario_inicio || '08:00', horario_fin || '18:00', dispStr], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Recurso creado', id: this.lastID });
  });
});

app.put('/api/recursos/config/:id', (req, res) => {
  const userRole = (req.user && req.user.rol) ? req.user.rol.toLowerCase() : '';
  const esAdmin = userRole.includes('admin') || userRole.includes('directiv');
  if (!esAdmin) return res.status(403).json({ error: 'Solo los administradores pueden modificar recursos.' });

  const { disponibilidad, bloques_agrupados, horarios_exactos, bloqueos_fechas, reglas_reserva } = req.body;
  db.run("UPDATE recursos_config SET disponibilidad = COALESCE(?, disponibilidad), bloques_agrupados = COALESCE(?, bloques_agrupados), horarios_exactos = ?, bloqueos_fechas = COALESCE(?, bloqueos_fechas), reglas_reserva = COALESCE(?, reglas_reserva) WHERE id = ?", 
      [disponibilidad ? JSON.stringify(disponibilidad) : null, bloques_agrupados ? JSON.stringify(bloques_agrupados) : null, horarios_exactos !== undefined ? horarios_exactos : null, bloqueos_fechas ? JSON.stringify(bloqueos_fechas) : null, reglas_reserva ? JSON.stringify(reglas_reserva) : null, req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Configuración actualizada' });
  });
});

app.delete('/api/recursos/config/:id', (req, res) => {
  const userRole = (req.user && req.user.rol) ? req.user.rol.toLowerCase() : '';
  const esAdmin = userRole.includes('admin') || userRole.includes('directiv');
  if (!esAdmin) return res.status(403).json({ error: 'Solo los administradores pueden eliminar recursos.' });

  db.run("DELETE FROM recursos_config WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Recurso eliminado correctamente' });
  });
});

// --- Motor de Reglas de Agendamiento ---
async function validarReglasReserva(fecha, recursoNombre, bloques, profesor_email, idExcluir = null, esAdmin = false) {
    const recurso = await new Promise((res, rej) => {
        db.get("SELECT * FROM recursos_config WHERE nombre = ?", [recursoNombre], (err, row) => {
            if (err) rej(err); else res(row);
        });
    });
    if (!recurso) return { error: "Recurso no encontrado" };

    let reglas = {};
    if (recurso.reglas_reserva) {
        try { reglas = JSON.parse(recurso.reglas_reserva); } catch(e){}
    }

    // 0. Contigüidad de Bloques (Una reserva no puede tener bloques separados/discontinuos)
    const numsContig = bloques.map(Number).sort((a,b)=>a-b);
    if (numsContig.length > 1) {
        for (let i = 0; i < numsContig.length - 1; i++) {
            if (numsContig[i + 1] !== numsContig[i] + 1) {
                return { error: 'Los bloques seleccionados deben ser contiguos en una misma reserva (sin espacios intermedios). Para horarios separados, agenda reservas independientes.' };
            }
        }
    }

    // A. Anticipación Mínima y Máxima (solo para no-admin)
    if (!esAdmin) {
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const [y, m, d] = fecha.split('-').map(Number);
        const fechaObj = new Date(y, m - 1, d);
        fechaObj.setHours(0,0,0,0);
        const diffDays = Math.round((fechaObj - hoy) / (1000 * 60 * 60 * 24));

        if (reglas.anticipacion_min_dias !== undefined && reglas.anticipacion_min_dias !== null && String(reglas.anticipacion_min_dias).trim() !== '' && parseInt(reglas.anticipacion_min_dias) > 0) {
            const minDias = parseInt(reglas.anticipacion_min_dias);
            if (diffDays < minDias) {
                return { error: `Este recurso requiere al menos ${minDias} día(s) de anticipación para reservar.` };
            }
        }

        if (reglas.anticipacion_max_dias !== undefined && reglas.anticipacion_max_dias !== null && String(reglas.anticipacion_max_dias).trim() !== '' && parseInt(reglas.anticipacion_max_dias) > 0) {
            const maxDias = parseInt(reglas.anticipacion_max_dias);
            if (diffDays > maxDias) {
                return { error: `No se puede reservar con más de ${maxDias} días de anticipación para este recurso.` };
            }
        }
    }

    // B. Bloques Consecutivos (ej. max 4)
    if (reglas.max_bloques_consecutivos && parseInt(reglas.max_bloques_consecutivos) > 0) {
        const maxConsec = parseInt(reglas.max_bloques_consecutivos);
        const nums = bloques.map(Number).sort((a,b)=>a-b);
        let maxStreak = 1;
        let currStreak = 1;
        for (let i = 1; i < nums.length; i++) {
            if (nums[i] === nums[i-1] + 1) {
                currStreak++;
                if (currStreak > maxStreak) maxStreak = currStreak;
            } else {
                currStreak = 1;
            }
        }
        if (nums.length > 0 && maxStreak > maxConsec) {
            return { error: `No puedes reservar más de ${maxConsec} bloques consecutivos en este recurso.` };
        }
    }

    // C. Límite de Bloques por Día (ej. max 2)
    if (reglas.max_bloques_dia && parseInt(reglas.max_bloques_dia) > 0 && !esAdmin) {
        const maxDia = parseInt(reglas.max_bloques_dia);
        const resDia = await new Promise((res, rej) => {
            let sql = "SELECT bloques FROM reservas WHERE fecha = ? AND recurso = ? AND profesor_email = ? AND estado != 'Cancelada' AND estado != 'Rechazada'";
            const params = [fecha, recursoNombre, profesor_email];
            if (idExcluir) { sql += " AND id != ?"; params.push(idExcluir); }
            db.all(sql, params, (err, rows) => { if(err) rej(err); else res(rows); });
        });
        let totalBloquesDia = bloques.length;
        resDia.forEach(r => {
            totalBloquesDia += (r.bloques ? r.bloques.split(',').length : 0);
        });
        if (totalBloquesDia > maxDia) {
            return { error: `Has superado el límite diario para este recurso (máximo ${maxDia} bloques por día). Ya tienes reservas agendadas este día.` };
        }
    }

    // D. Límite de Bloques por Semana y Petición Especial
    let esPeticionEspecial = false;
    let motivoExcepcion = null;
    if (reglas.max_bloques_semana && parseInt(reglas.max_bloques_semana) > 0 && !esAdmin) {
        const maxSemana = parseInt(reglas.max_bloques_semana);
        const [y, m, d] = fecha.split('-').map(Number);
        const fObj = new Date(y, m - 1, d);
        const diaSem = fObj.getDay();
        const diffLun = diaSem === 0 ? -6 : 1 - diaSem;
        const lunes = new Date(fObj);
        lunes.setDate(fObj.getDate() + diffLun);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);

        const fechaIni = lunes.toISOString().split('T')[0];
        const fechaFin = domingo.toISOString().split('T')[0];

        const resSem = await new Promise((res, rej) => {
            let sql = "SELECT bloques FROM reservas WHERE fecha >= ? AND fecha <= ? AND recurso = ? AND profesor_email = ? AND estado != 'Cancelada' AND estado != 'Rechazada'";
            const params = [fechaIni, fechaFin, recursoNombre, profesor_email];
            if (idExcluir) { sql += " AND id != ?"; params.push(idExcluir); }
            db.all(sql, params, (err, rows) => { if(err) rej(err); else res(rows); });
        });

        let totalBloquesSemana = bloques.length;
        resSem.forEach(r => {
            totalBloquesSemana += (r.bloques ? r.bloques.split(',').length : 0);
        });

        if (totalBloquesSemana > maxSemana) {
            if (reglas.permitir_excepcion_semanal !== false) {
                esPeticionEspecial = true;
                motivoExcepcion = `Supera el cupo semanal de ${maxSemana} bloques (solicitando ${totalBloquesSemana} bloques en la semana del ${fechaIni}).`;
            } else {
                return { error: `Has alcanzado el límite semanal de ${maxSemana} bloques para este recurso.` };
            }
        }
    }

    return { valido: true, esPeticionEspecial, motivoExcepcion, recurso };
}

function enviarCorreoPeticionEspecial(reserva, recurso, token) {
    if (!process.env.SMTP_USER || !recurso.responsable) return;
    let baseUrl = process.env.PUBLIC_URL || process.env.BASE_URL || 'http://localhost:9000';
    const approveUrl = `${baseUrl}/api/reservas/aprobar?token=${token}&action=approve`;
    const rejectUrl = `${baseUrl}/api/reservas/aprobar?token=${token}&action=reject`;

    transporter.sendMail({
        from: `"Sistema Colegio" <${process.env.SMTP_USER}>`,
        to: recurso.responsable,
        subject: `⚠️ Petición Especial de Reserva: ${recurso.nombre} (${reserva.fecha})`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 25px;">
                <h2 style="color: #d35400; margin-top: 0;">Petición Especial de Reserva</h2>
                <p>El docente <b>${reserva.profesor_email}</b> ha solicitado bloques que superan el cupo semanal configurado para este recurso.</p>
                <div style="background: #fdfbf7; border: 1px solid #f3e5ab; border-radius: 6px; padding: 15px; margin: 15px 0;">
                    <p style="margin: 4px 0;"><b>Recurso:</b> ${recurso.nombre}</p>
                    <p style="margin: 4px 0;"><b>Fecha:</b> ${reserva.fecha}</p>
                    <p style="margin: 4px 0;"><b>Bloques Solicitados:</b> ${reserva.bloques}</p>
                    <p style="margin: 4px 0;"><b>Motivo:</b> ${reserva.motivo}</p>
                </div>
                <p>Para autorizar o rechazar esta solicitud, utiliza los siguientes botones:</p>
                <div style="margin-top: 25px; text-align: center;">
                    <a href="${approveUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px; display: inline-block;">Aprobar Reserva</a>
                    <a href="${rejectUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Rechazar</a>
                </div>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
                <small style="color: #7f8c8d;">Plataforma Escolar Unificada - Notificación Automática</small>
            </div>
        `
    }).catch(err => console.error("Error enviando email de petición especial:", err));
}

// --- Reservas ---
app.get('/api/reservas', (req, res) => {
  db.all("SELECT * FROM reservas WHERE estado != 'Cancelada' AND estado != 'Rechazada'", (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.get('/api/reservas/aprobar', (req, res) => {
    try {
        const { token, action } = req.query; // approve | reject
        if (!token) return res.status(400).send("<h1>Token inválido</h1>");

        db.get("SELECT * FROM reservas WHERE token_aprobacion = ?", [token], (err, reserva) => {
            if (err || !reserva) return res.send("<div style='text-align:center;font-family:sans-serif;padding:50px;'><h1>Enlace inválido o expirado</h1><p>Esta solicitud ya no existe o ya fue procesada.</p></div>");

            if (reserva.estado !== 'Pendiente') {
                return res.send(`<div style='text-align:center;font-family:sans-serif;padding:50px;'><h1>Solicitud ya procesada</h1><p>Esta reserva ya se encuentra en estado: <b>${reserva.estado}</b>.</p></div>`);
            }

            const nuevoEstado = (action === 'approve') ? 'Aprobada' : 'Rechazada';
            db.run("UPDATE reservas SET estado = ? WHERE id = ?", [nuevoEstado, reserva.id], (errUpd) => {
                if (errUpd) return res.status(500).send("Error del servidor: " + errUpd.message);

                if (process.env.SMTP_USER && reserva.profesor_email) {
                    transporter.sendMail({
                        from: `"Sistema Colegio" <${process.env.SMTP_USER}>`,
                        to: reserva.profesor_email,
                        subject: `Resultado Petición Especial: ${nuevoEstado} - ${reserva.recurso}`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h3>Tu petición especial de reserva ha sido ${nuevoEstado.toUpperCase()}.</h3>
                                <p><b>Recurso:</b> ${reserva.recurso}</p>
                                <p><b>Fecha:</b> ${reserva.fecha}</p>
                                <p><b>Bloques:</b> ${reserva.bloques}</p>
                                <p><b>Motivo:</b> ${reserva.motivo}</p>
                            </div>
                        `
                    }).catch(()=>{});
                }

                res.send(`
                    <div style="text-align: center; font-family: sans-serif; padding: 60px;">
                        <h1 style="color: ${action === 'approve' ? '#28a745' : '#dc3545'};">${action === 'approve' ? '¡Reserva Aprobada!' : 'Reserva Rechazada'}</h1>
                        <p style="font-size: 1.1em; color: #555;">La reserva de <b>${reserva.profesor_email}</b> para el recurso <b>${reserva.recurso}</b> ha sido ${nuevoEstado.toLowerCase()} con éxito.</p>
                        <p style="color: #888; font-size: 0.9em; margin-top: 30px;">Ya puedes cerrar esta ventana.</p>
                    </div>
                `);
            });
        });
    } catch(e) {
        res.status(500).send("Error: " + e.message);
    }
});

app.post('/api/reservas', async (req, res) => {
    try {
        const { fecha, recurso, motivo } = req.body;
        let { bloques } = req.body;
        if (typeof bloques === 'string') bloques = bloques.split(',');
        if (!Array.isArray(bloques)) bloques = [bloques];
        const profesor_email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
        const userRole = (req.user && req.user.rol) ? req.user.rol.toLowerCase() : '';
        const esAdmin = userRole.includes('admin') || userRole.includes('directiv');

        // 1. Validar Reglas de Agendamiento
        const validacion = await validarReglasReserva(fecha, recurso, bloques, profesor_email, null, esAdmin);
        if (validacion.error) {
            return res.status(400).json({ error: validacion.error });
        }

        // 2. Validar colisiones con otras reservas activas
        db.all("SELECT * FROM reservas WHERE fecha = ? AND recurso = ? AND estado != 'Cancelada' AND estado != 'Rechazada'", [fecha, recurso], (err, rows) => {
            if (err) return res.status(500).json({error: err.message});
            
            for (let row of rows) {
                const dbBloques = row.bloques.split(',');
                for (let b of bloques) {
                    if (dbBloques.includes(b.toString())) {
                        return res.status(400).json({error: `El bloque ${b} ya está reservado por ${row.profesor_email}.`});
                    }
                }
            }
            
            // 3. Validar bloqueos institucionales
            db.all("SELECT * FROM eventos WHERE fecha = ? AND (bloques = 'TODOS' OR bloques IS NOT NULL)", [fecha], (err, evRows) => {
                if (err) return res.status(500).json({error: err.message});
                
                for (let ev of evRows) {
                    if (ev.recurso && ev.recurso !== recurso) continue;

                    if (ev.bloques === 'TODOS' || ev.bloques === '') {
                         return res.status(400).json({error: `Día bloqueado por evento institucional: ${ev.titulo}`});
                    }
                    const evB = ev.bloques.split(',');
                    for (let b of bloques) {
                        if (evB.includes(b.toString())) {
                            return res.status(400).json({error: `El bloque ${b} está bloqueado por el evento: ${ev.titulo}`});
                        }
                    }
                }
                
                const id = Math.random().toString(36).substr(2, 9);
                const estado = validacion.esPeticionEspecial ? 'Pendiente' : 'Aprobada';
                const token = validacion.esPeticionEspecial ? Math.random().toString(36).substr(2, 15) : null;

                db.run("INSERT INTO reservas (id, fecha, bloques, recurso, motivo, profesor_email, estado, token_aprobacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                  [id, fecha, bloques.join(','), recurso, motivo, profesor_email, estado, token], function(err) {
                  if (err) return res.status(500).json({error: err.message});
                  
                  if (validacion.esPeticionEspecial) {
                      enviarCorreoPeticionEspecial({ fecha, recurso, bloques: bloques.join(','), motivo, profesor_email }, validacion.recurso, token);
                  }

                  res.json({ 
                      message: validacion.esPeticionEspecial 
                          ? 'Reserva enviada como petición especial. Queda pendiente de confirmación por el encargado.' 
                          : 'Reserva guardada exitosamente.', 
                      id,
                      estado,
                      esPeticionEspecial: validacion.esPeticionEspecial
                  });
                });
            });
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/reservas/:id', async (req, res) => {
    try {
        const { fecha, recurso, motivo } = req.body;
        let { bloques } = req.body;
        if (typeof bloques === 'string') bloques = bloques.split(',');
        if (!Array.isArray(bloques)) bloques = [bloques];

        const userEmail = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
        const userRole = (req.user && req.user.rol) ? req.user.rol.toLowerCase() : '';
        const esAdmin = userRole.includes('admin') || userRole.includes('directiv');

        db.get("SELECT * FROM reservas WHERE id = ?", [req.params.id], async (err, currentRes) => {
            if (err || !currentRes) return res.status(404).json({ error: "Reserva no encontrada" });

            if (!esAdmin && currentRes.profesor_email.toLowerCase() !== userEmail.toLowerCase()) {
                return res.status(403).json({ error: "No tienes permiso para modificar esta reserva" });
            }

            const validacion = await validarReglasReserva(fecha, recurso, bloques, currentRes.profesor_email, req.params.id, esAdmin);
            if (validacion.error) {
                return res.status(400).json({ error: validacion.error });
            }

            db.all("SELECT * FROM reservas WHERE fecha = ? AND recurso = ? AND estado != 'Cancelada' AND estado != 'Rechazada' AND id != ?", 
                [fecha, recurso, req.params.id], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                
                for (let row of rows) {
                    const dbBloques = row.bloques.split(',');
                    for (let b of bloques) {
                        if (dbBloques.includes(b.toString())) {
                            return res.status(400).json({ error: `El bloque ${b} ya está reservado por ${row.profesor_email}.` });
                        }
                    }
                }

                db.all("SELECT * FROM eventos WHERE fecha = ? AND (bloques = 'TODOS' OR bloques IS NOT NULL)", [fecha], (err, evRows) => {
                    if (err) return res.status(500).json({ error: err.message });
                    for (let ev of evRows) {
                        if (ev.recurso && ev.recurso !== recurso) continue;
                        if (ev.bloques === 'TODOS' || ev.bloques === '') {
                            return res.status(400).json({ error: `Día bloqueado por evento institucional: ${ev.titulo}` });
                        }
                        const evB = ev.bloques.split(',');
                        for (let b of bloques) {
                            if (evB.includes(b.toString())) {
                                return res.status(400).json({ error: `El bloque ${b} está bloqueado por el evento: ${ev.titulo}` });
                            }
                        }
                    }

                    let nuevoEstado = currentRes.estado;
                    let token = currentRes.token_aprobacion;
                    if (validacion.esPeticionEspecial) {
                        nuevoEstado = 'Pendiente';
                        token = Math.random().toString(36).substr(2, 15);
                        enviarCorreoPeticionEspecial({ fecha, recurso, bloques: bloques.join(','), motivo, profesor_email: currentRes.profesor_email }, validacion.recurso, token);
                    } else if (currentRes.estado === 'Pendiente') {
                        nuevoEstado = 'Aprobada';
                    }

                    db.run("UPDATE reservas SET fecha = ?, bloques = ?, recurso = ?, motivo = ?, estado = ?, token_aprobacion = ? WHERE id = ?",
                        [fecha, bloques.join(','), recurso, motivo, nuevoEstado, token, req.params.id], function(errUpd) {
                        if (errUpd) return res.status(500).json({ error: errUpd.message });
                        res.json({ 
                            message: validacion.esPeticionEspecial 
                                ? 'Reserva actualizada como petición especial (sujeta a confirmación).' 
                                : 'Reserva actualizada con éxito.', 
                            id: req.params.id, 
                            estado: nuevoEstado, 
                            esPeticionEspecial: validacion.esPeticionEspecial 
                        });
                    });
                });
            });
        });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/reservas/:id', (req, res) => {
  const userRole = (req.user && req.user.rol) ? req.user.rol.toLowerCase() : '';
  const userEmail = (req.user && req.user.email) ? req.user.email.toLowerCase() : '';
  const esAdmin = userRole.includes('admin') || userRole.includes('directiv');

  db.get("SELECT * FROM reservas WHERE id = ?", [req.params.id], (err, reserva) => {
    if (err || !reserva) return res.status(500).json({error: "No encontrada"});
    if (!esAdmin && reserva.profesor_email && reserva.profesor_email.toLowerCase() !== userEmail) {
        return res.status(403).json({ error: "No tienes permiso para cancelar esta reserva." });
    }
    
    const hoy = new Date();
    const partes = reserva.fecha.split('-');
    const fechaRes = new Date(partes[0], partes[1]-1, partes[2]);
    const diffTime = fechaRes - hoy;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    db.run("UPDATE reservas SET estado = 'Cancelada' WHERE id = ?", [req.params.id], function(err2) {
      if (err2) return res.status(500).json({error: err2.message});
      
      if (diffDays <= 3) {
          db.get("SELECT responsable FROM recursos_config WHERE nombre = ?", [reserva.recurso], (err3, conf) => {
              const adminEmail = (conf && conf.responsable) ? conf.responsable : (process.env.SMTP_USER || 'admin@colegio.edu');
              const dests = [reserva.profesor_email, adminEmail].filter(Boolean).join(', ');
              
              if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                  transporter.sendMail({
                      from: '"Sistema Colegio" <' + process.env.SMTP_USER + '>',
                      to: dests,
                      subject: "Cancelacion de Reserva Tardia: " + reserva.recurso,
                      html: "<h3>Notificacion de Cancelacion Tardia</h3><p>Se ha cancelado una reserva faltando 3 dias o menos para la fecha.</p><ul><li><b>Recurso:</b> " + reserva.recurso + "</li><li><b>Fecha Original:</b> " + reserva.fecha + "</li><li><b>Bloques:</b> " + reserva.bloques + "</li><li><b>Docente:</b> " + reserva.profesor_email + "</li><li><b>Motivo/Uso:</b> " + reserva.motivo + "</li></ul><p><i>Este es un aviso automatico del sistema para registro administrativo.</i></p>"
                  }).catch(e => console.error("Error enviando email de cancelacion:", e));
              }
          });
      }
      
      res.json({ message: 'Reserva cancelada' });
    });
  });
});



// --- DASHBOARD API ---
app.get('/api/dashboard/me', (req, res) => {
    const userEmail = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    const userName = req.isAuthenticated() ? (req.user.nombre || '') : 'Administrador';
    const userRol = (req.user && req.user.rol) ? req.user.rol : 'Profesor';
    const rolNorm = userRol.toLowerCase().trim();
    const esAdmin = rolNorm.includes('admin') || rolNorm.includes('directiv');

    const data = {
        evaluaciones: [],
        reservas: [],
        eventos: [],
        avisos: [],
        stats: {
            misEvals: 0,
            misReservas: 0,
            totalAvisos: 0,
            evalsPendientesEnvio: 0,
            colegioEvalsMes: 0,
            colegioReservasSemana: 0
        },
        usuario: {
            nombre: userName,
            email: userEmail,
            rol: userRol,
            rolOriginal: req.user ? (req.user.rolOriginal || userRol) : userRol,
            esAdminBase: req.user ? !!req.user.esAdminBase : esAdmin,
            puedeCambiarRol: req.user ? !!req.user.puedeCambiarRol : esAdmin
        }
    };

    // 1. Avisos ordenados por Alta prioridad primero y luego más recientes
    db.all("SELECT * FROM avisos_muro ORDER BY CASE WHEN importancia = 'Alta' THEN 0 ELSE 1 END, id DESC LIMIT 15", (err, avisos) => {
        if (!err && avisos) {
            data.avisos = avisos;
            data.stats.totalAvisos = avisos.length;
        }
        
        // 2. Reservas del usuario
        db.all("SELECT * FROM reservas WHERE estado != 'Cancelada' AND LOWER(profesor_email) = LOWER(?) AND fecha >= date('now') ORDER BY fecha ASC", [userEmail], (errRes, reservas) => {
            if (!errRes && reservas) {
                data.reservas = reservas;
                data.stats.misReservas = reservas.length;
            }

            // 3. Evaluaciones (buscamos por email o nombre de profesor, excluyendo bloqueos administrativos)
            const queryEvals = `
                SELECT * FROM evaluaciones 
                WHERE (
                    LOWER(profesor_email) = LOWER(?) 
                    OR LOWER(profesor_nombre) = LOWER(?) 
                    OR (profesor_nombre IS NOT NULL AND LOWER(profesor_nombre) LIKE '%' || LOWER(?) || '%') 
                    OR (profesor_email IS NOT NULL AND LOWER(profesor_email) LIKE '%' || LOWER(?) || '%')
                ) 
                AND (tipo NOT LIKE '%BLOQUEO%' AND (asignatura IS NULL OR UPPER(asignatura) != 'ADMIN'))
                AND fecha >= date('now') 
                ORDER BY fecha ASC 
                LIMIT 10
            `;
            db.all(queryEvals, [userEmail, userEmail, userName, userName], (errEv, evals) => {
                if (!errEv && evals) {
                    data.evaluaciones = evals;
                    data.stats.misEvals = evals.length;
                    data.stats.evalsPendientesEnvio = evals.filter(e => e.estado_doc !== 'Enviada').length;
                }

                // 4. Si está en rol Administrador, cargar métricas globales del colegio
                if (esAdmin) {
                    const primerDiaMes = new Date().toISOString().slice(0, 7) + '-01';
                    db.get("SELECT COUNT(*) as total FROM evaluaciones WHERE fecha >= ?", [primerDiaMes], (errCountEv, rowEv) => {
                        if (!errCountEv && rowEv) data.stats.colegioEvalsMes = rowEv.total;
                        db.get("SELECT COUNT(*) as total FROM reservas WHERE fecha >= date('now') AND estado != 'Cancelada'", (errCountRes, rowRes) => {
                            if (!errCountRes && rowRes) data.stats.colegioReservasSemana = rowRes.total;
                            res.json(data);
                        });
                    });
                } else {
                    res.json(data);
                }
            });
        });
    });
});

app.post('/api/avisos', (req, res) => {
    const { titulo, mensaje, importancia } = req.body;
    const autor = req.isAuthenticated() ? (req.user.nombre || req.user.email) : 'Administración';
    db.run("INSERT INTO avisos_muro (titulo, mensaje, autor, importancia) VALUES (?, ?, ?, ?)", [titulo, mensaje, autor, importancia || 'Normal'], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Aviso publicado exitosamente', id: this.lastID });
    });
});

app.delete('/api/avisos/:id', (req, res) => {
    // Validar permisos de administrador antes de borrar
    const userRole = (req.user && req.user.rol) ? req.user.rol.toLowerCase() : '';
    const esAdmin = userRole.includes('admin') || userRole.includes('directiv');
    if (!esAdmin && req.isAuthenticated()) {
        return res.status(403).json({ error: 'Solo administradores pueden eliminar avisos.' });
    }
    db.run("DELETE FROM avisos_muro WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Aviso borrado' });
    });
});

app.put('/api/perfil/preferencias', (req, res) => {
    const email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    const { preferencias, pin } = req.body;
    
    db.run("UPDATE usuarios SET preferencias_mail = ? WHERE email = ?", [JSON.stringify(preferencias), email], function(err) {
        if (err) return res.status(500).json({error: err.message});
        
        if (pin !== undefined) {
            db.run("UPDATE usuarios SET pin = ? WHERE email = ?", [pin, email], function(err) {
                if (err) return res.status(500).json({error: err.message});
                res.json({ message: 'Preferencias guardadas' });
            });
        } else {
            res.json({ message: 'Preferencias guardadas' });
        }
    });
});

app.get('/api/perfil/preferencias', (req, res) => {
    const email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    db.get("SELECT preferencias_mail, pin FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (err || !row || !row.preferencias_mail) return res.json({ nueva_reserva: true, edicion_admin: true, nuevo_aviso: false, recordatorio_eval: true });
        try {
            
            const p = JSON.parse(row.preferencias_mail);
            p.pin_actual = row.pin || '';
            res.json(p);
        } catch(e) {
            res.json({ nueva_reserva: true, edicion_admin: true, nuevo_aviso: false, recordatorio_eval: true });
        }
    });
});


// Importar rutas de evaluaciones
const configRouter = require('./api/config');
app.use('/api/config', configRouter);

const enviosRouter = require('./api/envios');
app.use('/api/envios', enviosRouter);

const evaluacionesRouter = require('./api/evaluaciones');
app.use('/api/evaluaciones', evaluacionesRouter);


// Importar RPC router para polyfill de Google Apps Script
const rpcRouter = require('./api/rpc');
app.use('/api/rpc', rpcRouter);

const smtpRouter = require('./api/smtp');
app.use('/api/config/smtp', smtpRouter);
const actividadesRouter = require('./api/actividades');
app.use('/api/actividades', actividadesRouter);
const libroRouter = require('./api/libro');
app.use('/api/libro', libroRouter);


// --- Roles Config ---
app.get('/api/roles', (req, res) => {
    db.all("SELECT * FROM roles_config", (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});

app.post('/api/roles', (req, res) => {
    const { nombre, permisos } = req.body;
    db.run("INSERT INTO roles_config (nombre, permisos) VALUES (?, ?)", [nombre, JSON.stringify(permisos)], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Rol creado', id: this.lastID });
    });
});

app.put('/api/roles/:id', (req, res) => {
    const { nombre, permisos } = req.body;
    db.run("UPDATE roles_config SET nombre = ?, permisos = ? WHERE id = ?", [nombre, JSON.stringify(permisos), req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Rol actualizado' });
    });
});

app.delete('/api/roles/:id', (req, res) => {
    db.run("DELETE FROM roles_config WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Rol eliminado' });
    });
});

// Iniciar Servidor
const { initTray } = require('./tray');
const { initTunnel } = require('./tunnel');
  app.listen(PORT, async () => {
    if (process.env.NO_TRAY !== '1') {
      try { initTray(PORT); } catch(e) { console.error('Tray failed', e); }
    }
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
  try { await initTunnel(PORT); } catch(e) { console.error('Tunnel failed', e); }
});



// --- CRONJOB RECORDATORIOS DE ACTIVIDADES ---
const sqlite3_cron = require('sqlite3').verbose();
const dbCron = new sqlite3_cron.Database(path.join(__dirname, 'db/colegio.db'));
setInterval(() => {
    const ahora = new Date();
    // Ejecutar solo a las 08:00 AM (aprox, revisando cada 1 hora)
    if (ahora.getHours() === 8) {
        // MaAA+ana:
        const manana = new Date(ahora);
        manana.setDate(manana.getDate() + 1);
        const fechaStr = manana.toISOString().split('T')[0];
        
        dbCron.all("SELECT * FROM actividades WHERE fecha = ? AND estado = 'Aprobada'", [fechaStr], (err, acts) => {
            if (err || !acts) return;
            acts.forEach(act => {
                dbCron.all("SELECT * FROM actividades_req WHERE actividad_id = ? AND estado = 'Autorizado'", [act.id], (e2, reqs) => {
                    if (e2 || !reqs) return;
                    reqs.forEach(req => {
                        // Enviar correo recordatorio
                        const nodemailer_cron = require('nodemailer');
                        const transporter_cron = nodemailer_cron.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_SECURE === 'true' || !process.env.SMTP_SECURE),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
});
                        if(process.env.SMTP_USER) {
                            transporter_cron.sendMail({
                                from: `"Sistema Colegio" <${process.env.SMTP_USER}>`,
                                to: req.responsable_email,
                                subject: `Recordatorio: Actividad MAA'ANA (${act.titulo})`,
                                html: `<h3>Recordatorio Institucional</h3><p>MAA'ANA (${act.fecha}) se llevarA! a cabo la actividad "<b>${act.titulo}</b>" durante los bloques ${act.bloques}.</p><p>Recuerde tener listo el recurso solicitado que usted administra.</p>`
                            }).catch(()=>{});
                        }
                    });
                });
            });
        });
    }
}, 1000 * 60 * 60); // Chequear cada 1 hora
// ----------------------------------------------
