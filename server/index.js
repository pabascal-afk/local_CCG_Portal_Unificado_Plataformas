require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
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

 app.get(['/', '/index.html'], (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login.html');
  }
  next();
});

// Archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));





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
        if (!row) {
          // Usuario no registrado en la BD, se rechaza
          return cb(null, false, { message: 'Usuario no autorizado.' });
        }
        return cb(null, row); // Retorna el usuario de la BD
      });
    }
  ));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row) => {
    done(err, row);
  });
});

// Middleware de protección
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'No autenticado' });
}

// Rutas de Auth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    // Para modo desarrollo sin Google OAuth (solo si no hay client ID)
    if (!process.env.GOOGLE_CLIENT_ID) {
       res.json({ email: 'admin@colegio.edu', nombre: 'Admin (Dev)', rol: 'Administrador' });
    } else {
       res.status(401).json({ error: 'No autenticado' });
    }
  }
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
        if (err || !row) return res.status(404).send("El correo de Google es válido, pero el usuario no está registrado en la base de datos del colegio.");
        
        req.login(row, (err) => {
            if (err) return res.status(500).send("Error interno al crear la sesión");
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
  const { nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad } = req.body;
  const dispStr = disponibilidad ? JSON.stringify(disponibilidad) : '{}';
  db.run("INSERT INTO recursos_config (nombre, responsable, duracion_bloque, horario_inicio, horario_fin, disponibilidad) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, responsable, duracion_bloque || 45, horario_inicio || '08:00', horario_fin || '18:00', dispStr], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Recurso creado', id: this.lastID });
  });
});

app.put('/api/recursos/config/:id', (req, res) => {
  const { disponibilidad, bloques_agrupados, horarios_exactos, bloqueos_fechas } = req.body;
  db.run("UPDATE recursos_config SET disponibilidad = COALESCE(?, disponibilidad), bloques_agrupados = COALESCE(?, bloques_agrupados), horarios_exactos = ?, bloqueos_fechas = COALESCE(?, bloqueos_fechas) WHERE id = ?", 
      [disponibilidad ? JSON.stringify(disponibilidad) : null, bloques_agrupados ? JSON.stringify(bloques_agrupados) : null, horarios_exactos !== undefined ? horarios_exactos : null, bloqueos_fechas ? JSON.stringify(bloqueos_fechas) : null, req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Configuración actualizada' });
  });
});


app.delete('/api/recursos/config/:id', (req, res) => {
  db.run("DELETE FROM recursos_config WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ message: 'Recurso eliminado correctamente' });
  });
});

// --- Reservas ---
app.get('/api/reservas', (req, res) => {
  db.all("SELECT * FROM reservas WHERE estado != 'Cancelada'", (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.post('/api/reservas', (req, res) => {
    const { fecha, recurso, motivo } = req.body;
      let { bloques } = req.body;
      if (typeof bloques === 'string') bloques = bloques.split(',');
      if (!Array.isArray(bloques)) bloques = [bloques];
    const profesor_email = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
    
    db.all("SELECT * FROM reservas WHERE fecha = ? AND recurso = ? AND estado != 'Cancelada'", [fecha, recurso], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        
        for (let row of rows) {
            const dbBloques = row.bloques.split(',');
            for (let b of bloques) {
                if (dbBloques.includes(b.toString())) {
                    return res.status(400).json({error: `El bloque ${b} ya está reservado.`});
                }
            }
        }
        
        db.all("SELECT * FROM eventos WHERE fecha = ? AND (bloques = 'TODOS' OR bloques IS NOT NULL)", [fecha], (err, evRows) => {
            if (err) return res.status(500).json({error: err.message});
            
            for (let ev of evRows) {
                // Si el evento tiene recurso asignado y no es el que estamos pidiendo, no bloquea
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
            db.run("INSERT INTO reservas (id, fecha, bloques, recurso, motivo, profesor_email) VALUES (?, ?, ?, ?, ?, ?)", 
              [id, fecha, bloques.join(','), recurso, motivo, profesor_email], function(err) {
              if (err) return res.status(500).json({error: err.message});
              
                  // Chequear preferencias_mail
                  db.get("SELECT preferencias_mail FROM usuarios WHERE email = ?", [profesor_email], (err, row) => {
                      let mandarEmail = true;
                      if (row && row.preferencias_mail) {
                          try { mandarEmail = JSON.parse(row.preferencias_mail).nueva_reserva !== false; } catch(e){}
                      }
                      if (mandarEmail) {
                          // enviarCorreoConfirmacion({ recurso, fecha, bloques: bloques.join(','), motivo }, profesor_email);
                      }
                  });
                  res.json({ message: 'Reserva guardada', id });
            });
        });
    });
});

app.delete('/api/reservas/:id', (req, res) => {
  db.get("SELECT * FROM reservas WHERE id = ?", [req.params.id], (err, reserva) => {
    if (err || !reserva) return res.status(500).json({error: "No encontrada"});
    
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
    // Mapeo simple: tomamos todo antes del @ o un nombre genérico
    const baseName = userEmail.split('@')[0];

    const data = {
        evaluaciones: [],
        reservas: [],
        eventos: [],
        avisos: []
    };

    // 1. Avisos
    db.all("SELECT * FROM avisos_muro ORDER BY id DESC LIMIT 10", (err, avisos) => {
        if (!err) data.avisos = avisos;
        
        // 2. Reservas
        db.all("SELECT * FROM reservas WHERE estado != 'Cancelada' AND profesor_email = ? AND fecha >= date('now') ORDER BY fecha ASC", [userEmail], (err, reservas) => {
            if (!err) data.reservas = reservas;

            // 3. Evaluaciones (Buscamos coincidencias básicas por nombre)
            db.all("SELECT * FROM evaluaciones WHERE profesor_email = ? AND fecha >= date('now') ORDER BY fecha ASC LIMIT 10", [userEmail], (err, evals) => {
                  if (!err) {
                      data.evaluaciones = evals;
                  }
  
                  res.json(data);
              });
          });
    });
});

app.post('/api/avisos', (req, res) => {
    const { titulo, mensaje, importancia } = req.body;
    const autor = req.isAuthenticated() ? req.user.email : 'Admin';
    db.run("INSERT INTO avisos_muro (titulo, mensaje, autor, importancia) VALUES (?, ?, ?, ?)", [titulo, mensaje, autor, importancia || 'Normal'], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({ message: 'Aviso publicado', id: this.lastID });
    });
});

app.delete('/api/avisos/:id', (req, res) => {
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
    try { initTray(PORT); } catch(e) { console.error('Tray failed', e); }
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
                            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
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
