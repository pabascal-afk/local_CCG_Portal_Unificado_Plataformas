using System;
using System.Drawing;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Launcher {
    static class Program {
        [STAThread]
        static void Main() {
            // Habilitar protocolos TLS modernos (TLS 1.2) para GitHub y Google Apps Script
            try {
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls;
            } catch {}

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    public class MainForm : Form {
        public const string CURRENT_VERSION = "1.2.0";
        private const string GITHUB_VERSION_URL = "https://raw.githubusercontent.com/pabascal-afk/local_CCG_Portal_Unificado_Plataformas/main/launcher_version.json";
        private const string GAS_DB_URL = "https://script.google.com/macros/s/AKfycbwzszh_oyXrFY8S5tQhg5_JkyXL7q97jVzYHgLnMn_K0-qVowwwel0hxhdZIIMi-YWD/exec";

        private Label titleLabel;
        private Label statusLabel;
        private ProgressBar progressBar;
        private Panel pnlGitActions;
        private Panel pnlErrorActions;
        private Button btnActualizarPlataforma;
        private Button btnOmitirGit;
        private Button btnReintentar;
        private Button btnCerrar;

        public MainForm() {
            this.Text = "Plataforma Unificada CCG";
            this.Size = new Size(390, 215);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.FromArgb(248, 250, 252);

            // Cargar icono institucional si existe
            try {
                string icoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.ico");
                if (File.Exists(icoPath)) {
                    this.Icon = new Icon(icoPath);
                }
            } catch {}

            titleLabel = new Label() {
                Text = "Plataforma Unificada  •  v" + CURRENT_VERSION,
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Top,
                Height = 32,
                ForeColor = Color.FromArgb(71, 85, 105),
                Font = new Font("Segoe UI", 8.5f, FontStyle.Regular)
            };

            statusLabel = new Label() {
                Text = "Iniciando verificaciones...",
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Top,
                Height = 44,
                ForeColor = Color.FromArgb(15, 23, 42),
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
            };

            Panel pnlProgress = new Panel() { 
                Dock = DockStyle.Top, 
                Height = 26, 
                Padding = new Padding(25, 0, 25, 0),
                BackColor = Color.Transparent
            };
            progressBar = new ProgressBar() {
                Style = ProgressBarStyle.Marquee,
                Dock = DockStyle.Fill
            };
            pnlProgress.Controls.Add(progressBar);

            // Panel de Acciones Git (cuando hay cambios en el servidor)
            pnlGitActions = new Panel() {
                Dock = DockStyle.Bottom,
                Height = 44,
                Padding = new Padding(12, 4, 12, 6),
                Visible = false,
                BackColor = Color.Transparent
            };

            btnActualizarPlataforma = new Button() {
                Text = "Actualizar Plataforma",
                Dock = DockStyle.Left,
                Width = 180,
                BackColor = Color.FromArgb(16, 185, 129),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnActualizarPlataforma.FlatAppearance.BorderSize = 0;
            btnActualizarPlataforma.Click += (s, e) => EjecutarActualizacionPlataforma();

            btnOmitirGit = new Button() {
                Text = "Continuar al Portal",
                Dock = DockStyle.Right,
                Width = 160,
                BackColor = Color.FromArgb(226, 232, 240),
                ForeColor = Color.FromArgb(51, 65, 85),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Regular),
                Cursor = Cursors.Hand
            };
            btnOmitirGit.FlatAppearance.BorderSize = 0;
            btnOmitirGit.Click += async (s, e) => {
                pnlGitActions.Visible = false;
                progressBar.Style = ProgressBarStyle.Marquee;
                await ContinuarConexiones();
            };

            pnlGitActions.Controls.Add(btnActualizarPlataforma);
            pnlGitActions.Controls.Add(btnOmitirGit);

            // Panel de Acciones de Error / Fallo
            pnlErrorActions = new Panel() {
                Dock = DockStyle.Bottom,
                Height = 44,
                Padding = new Padding(25, 4, 25, 6),
                Visible = false,
                BackColor = Color.Transparent
            };

            btnReintentar = new Button() {
                Text = "Reintentar",
                Dock = DockStyle.Left,
                Width = 155,
                BackColor = Color.FromArgb(59, 130, 246),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold),
                Cursor = Cursors.Hand
            };
            btnReintentar.FlatAppearance.BorderSize = 0;
            btnReintentar.Click += async (s, e) => {
                pnlErrorActions.Visible = false;
                statusLabel.ForeColor = Color.FromArgb(15, 23, 42);
                progressBar.Style = ProgressBarStyle.Marquee;
                await CheckConnections();
            };

            btnCerrar = new Button() {
                Text = "Cerrar",
                Dock = DockStyle.Right,
                Width = 155,
                BackColor = Color.FromArgb(226, 232, 240),
                ForeColor = Color.FromArgb(51, 65, 85),
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 9f, FontStyle.Regular),
                Cursor = Cursors.Hand
            };
            btnCerrar.FlatAppearance.BorderSize = 0;
            btnCerrar.Click += (s, e) => Application.Exit();

            pnlErrorActions.Controls.Add(btnReintentar);
            pnlErrorActions.Controls.Add(btnCerrar);

            this.Controls.Add(pnlProgress);
            this.Controls.Add(statusLabel);
            this.Controls.Add(titleLabel);
            this.Controls.Add(pnlGitActions);
            this.Controls.Add(pnlErrorActions);

            this.Load += async (s, e) => await CheckConnections();
        }

        private static HttpClientHandler CreateHandler() {
            var handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;
            return handler;
        }

        private async Task CheckConnections() {
            pnlGitActions.Visible = false;
            pnlErrorActions.Visible = false;
            progressBar.Style = ProgressBarStyle.Marquee;

            // 1. Si estamos en la carpeta del repositorio Git (ej. servidor o equipo de desarrollo),
            // verificar si hay actualizaciones del código de la plataforma en GitHub.
            string gitDetails;
            if (CheckPlatformGitUpdates(out gitDetails)) {
                progressBar.Style = ProgressBarStyle.Blocks;
                progressBar.Value = 100;
                statusLabel.ForeColor = Color.FromArgb(14, 116, 144);
                statusLabel.Text = "¡Hay " + gitDetails + " en GitHub!";
                pnlGitActions.Visible = true;
                return; // Esperar a que el usuario elija actualizar o continuar
            }

            // 2. Verificar si el propio ejecutable Lanzador_Plataforma.exe tiene una actualización disponible
            statusLabel.Text = "Comprobando versión del lanzador...";
            await CheckLauncherSelfUpdate();

            // 3. Proceder a conectar y validar que el destino apunta a la plataforma correcta
            await ContinuarConexiones();
        }

        private async Task ContinuarConexiones() {
            string localhostUrl = "http://localhost:9000";
            string localMdnsUrl = "http://plataforma.local:9000";
            string fallbackIpUrl = "http://192.168.3.16:9000";

            using (HttpClient localClient = new HttpClient(CreateHandler())) {
                localClient.Timeout = TimeSpan.FromMilliseconds(1800);

                // Paso 1: Localhost (servidor en este mismo equipo)
                statusLabel.Text = "Buscando servidor en este equipo (Localhost)...";
                if (await ValidateTarget(localClient, localhostUrl)) {
                    OpenUrl(localhostUrl);
                    return;
                }

                // Paso 2: Red local institucional vía mDNS
                statusLabel.Text = "Buscando en la red local del colegio (mDNS)...";
                if (await ValidateTarget(localClient, localMdnsUrl)) {
                    OpenUrl(localMdnsUrl);
                    return;
                }

                // Paso 3: Red local institucional vía IP directa
                statusLabel.Text = "Verificando IP interna del colegio (192.168.3.16)...";
                if (await ValidateTarget(localClient, fallbackIpUrl)) {
                    OpenUrl(fallbackIpUrl);
                    return;
                }
            }

            // Paso 4: Acceso Remoto por Túnel Cloudflare (Internet)
            statusLabel.Text = "Consultando acceso remoto (Internet)...";
            using (HttpClient cloudClient = new HttpClient(CreateHandler())) {
                cloudClient.Timeout = TimeSpan.FromSeconds(8);
                try {
                    HttpResponseMessage response = await cloudClient.GetAsync(GAS_DB_URL + "?action=get_url");
                    if (response.IsSuccessStatusCode) {
                        string cfUrl = (await response.Content.ReadAsStringAsync()).Trim();
                        if (cfUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)) {
                            statusLabel.Text = "Validando túnel seguro de la plataforma...";
                            
                            // VALIDAR ESTRICTAMENTE que apunte a la Plataforma Unificada
                            if (await ValidateTarget(cloudClient, cfUrl)) {
                                OpenUrl(cfUrl);
                                return;
                            } else {
                                // El túnel remoto existe en el DNS pero no responde a la plataforma o caducó
                                MostrarError("El túnel remoto no responde o la plataforma está apagada.", cfUrl);
                                return;
                            }
                        }
                    }
                } catch (Exception ex) {
                    Debug.WriteLine("Error consultando acceso remoto: " + ex.Message);
                }
            }

            // Si todas las opciones fallaron
            MostrarError("El servidor está apagado o es inaccesible.", null);
        }

        // Valida que la URL responda HTTP 200 y que contenga la firma oficial de la Plataforma Unificada
        private async Task<bool> ValidateTarget(HttpClient client, string baseUrl) {
            try {
                string pingUrl = baseUrl.TrimEnd('/') + "/api/ping";
                HttpResponseMessage res = await client.GetAsync(pingUrl);
                if (!res.IsSuccessStatusCode) return false;

                string content = await res.Content.ReadAsStringAsync();
                if (string.IsNullOrEmpty(content)) return false;

                // Debe contener la firma de la plataforma o responder pong
                bool esPlataformaApropiada = 
                    content.IndexOf("plataforma_unificada", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    content.IndexOf("Portal Unificado", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    content.Trim().Equals("pong", StringComparison.OrdinalIgnoreCase);

                return esPlataformaApropiada;
            } catch {
                return false;
            }
        }

        // Comprueba si el repositorio Git local tiene commits pendientes de origen/main
        private bool CheckPlatformGitUpdates(out string details) {
            details = "";
            try {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string gitDir = Path.Combine(baseDir, ".git");
                if (!Directory.Exists(gitDir)) return false;

                // Ejecutar git fetch origin main silencioso con timeout de 3.5 segundos
                ProcessStartInfo psiFetch = new ProcessStartInfo("git", "fetch origin main --quiet") {
                    WorkingDirectory = baseDir,
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };
                using (Process p = Process.Start(psiFetch)) {
                    if (!p.WaitForExit(3500)) {
                        try { p.Kill(); } catch {}
                        return false;
                    }
                }

                // Contar commits pendientes de origin/main
                ProcessStartInfo psiRev = new ProcessStartInfo("git", "rev-list HEAD..origin/main --count") {
                    WorkingDirectory = baseDir,
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };
                using (Process p = Process.Start(psiRev)) {
                    string output = p.StandardOutput.ReadToEnd().Trim();
                    p.WaitForExit(2000);
                    int count;
                    if (int.TryParse(output, out count) && count > 0) {
                        details = count + (count == 1 ? " nueva actualización" : " nuevas actualizaciones");
                        return true;
                    }
                }
            } catch (Exception ex) {
                Debug.WriteLine("Git check error: " + ex.Message);
            }
            return false;
        }

        // Auto-actualización del ejecutable Lanzador_Plataforma.exe desde GitHub
        private async Task CheckLauncherSelfUpdate() {
            try {
                using (HttpClient client = new HttpClient(CreateHandler())) {
                    client.Timeout = TimeSpan.FromSeconds(3);
                    string json = await client.GetStringAsync(GITHUB_VERSION_URL);
                    string remoteVerStr = ExtractJsonValue(json, "version");
                    string downloadUrl = ExtractJsonValue(json, "downloadUrl");

                    if (!string.IsNullOrEmpty(remoteVerStr)) {
                        Version currentVer = new Version(CURRENT_VERSION);
                        Version remoteVer = new Version(remoteVerStr);

                        if (remoteVer > currentVer && !string.IsNullOrEmpty(downloadUrl)) {
                            statusLabel.ForeColor = Color.FromArgb(37, 99, 235);
                            statusLabel.Text = "Descargando Lanzador v" + remoteVerStr + "...";

                            byte[] newBytes = await client.GetByteArrayAsync(downloadUrl);
                            string currentExe = Process.GetCurrentProcess().MainModule.FileName;
                            string newExe = currentExe + ".new";

                            File.WriteAllBytes(newExe, newBytes);

                            // Lanzar comando de reemplazo y reinicio automático
                            string cmd = "/c timeout /t 1 /nobreak >nul & move /y \"" + newExe + "\" \"" + currentExe + "\" & start \"\" \"" + currentExe + "\"";
                            ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", cmd) {
                                CreateNoWindow = true,
                                UseShellExecute = false
                            };
                            Process.Start(psi);
                            Application.Exit();
                        }
                    }
                }
            } catch (Exception ex) {
                Debug.WriteLine("Launcher self update error: " + ex.Message);
            }
        }

        private void EjecutarActualizacionPlataforma() {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string actualizadorBat = Path.Combine(baseDir, "Actualizar_Servidor.bat");
            string instaladorBat = Path.Combine(baseDir, "Instalador_Servidor.bat");

            if (File.Exists(actualizadorBat)) {
                Process.Start(new ProcessStartInfo(actualizadorBat) { WorkingDirectory = baseDir });
                Application.Exit();
            } else if (File.Exists(instaladorBat)) {
                Process.Start(new ProcessStartInfo(instaladorBat) { WorkingDirectory = baseDir });
                Application.Exit();
            } else {
                Process.Start(new ProcessStartInfo("cmd.exe", "/c git pull origin main & pause") { WorkingDirectory = baseDir });
                Application.Exit();
            }
        }

        private static string ExtractJsonValue(string json, string key) {
            if (string.IsNullOrEmpty(json)) return null;
            var match = Regex.Match(json, "\"" + Regex.Escape(key) + "\"\\s*:\\s*\"([^\"]+)\"");
            if (match.Success) return match.Groups[1].Value;
            return null;
        }

        private void MostrarError(string mensaje, string urlFallida) {
            progressBar.Style = ProgressBarStyle.Blocks;
            progressBar.Value = 100;
            statusLabel.ForeColor = Color.FromArgb(220, 38, 38);
            statusLabel.Text = mensaje;
            if (!string.IsNullOrEmpty(urlFallida)) {
                titleLabel.Text = "Destino fallido: " + urlFallida;
                titleLabel.ForeColor = Color.FromArgb(185, 28, 28);
            }
            pnlErrorActions.Visible = true;
        }

        private void OpenUrl(string url) {
            progressBar.Style = ProgressBarStyle.Blocks;
            progressBar.Value = 100;
            statusLabel.ForeColor = Color.FromArgb(16, 185, 129);
            statusLabel.Text = "¡Conectado! Abriendo navegador...";
            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            Task.Delay(1300).ContinueWith(_ => Application.Exit());
        }
    }
}
