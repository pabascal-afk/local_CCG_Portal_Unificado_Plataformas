using System;
using System.Drawing;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Launcher {
    static class Program {
        [STAThread]
        static void Main() {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    public class MainForm : Form {
        private Label statusLabel;
        private ProgressBar progressBar;
        private Button closeButton;

        public MainForm() {
            this.Text = "Plataforma CCG";
            this.Size = new Size(360, 170);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;

            statusLabel = new Label() {
                Text = "Iniciando...",
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Top,
                Height = 44,
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };

            Panel pnlProgress = new Panel() { Dock = DockStyle.Top, Height = 28, Padding = new Padding(20, 0, 20, 0) };
            progressBar = new ProgressBar() {
                Style = ProgressBarStyle.Marquee,
                Dock = DockStyle.Fill
            };
            pnlProgress.Controls.Add(progressBar);

            closeButton = new Button() {
                Text = "Cerrar",
                Dock = DockStyle.Bottom,
                Height = 35,
                Visible = false,
                Cursor = Cursors.Hand
            };
            closeButton.Click += (s, e) => Application.Exit();

            this.Controls.Add(pnlProgress);
            this.Controls.Add(statusLabel);
            this.Controls.Add(closeButton);

            this.Load += async (s, e) => await CheckConnections();
        }

        private async Task CheckConnections() {
            string localhostUrl = "http://localhost:9000";
            string localMdnsUrl = "http://plataforma.local:9000";
            string fallbackIpUrl = "http://192.168.3.16:9000";
            string gasDbUrl = "https://script.google.com/macros/s/AKfycbwzszh_oyXrFY8S5tQhg5_JkyXL7q97jVzYHgLnMn_K0-qVowwwel0hxhdZIIMi-YWD/exec";

            HttpClientHandler handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;

            // 1. Probar conexiones locales con timeout ágil (1.5 segundos)
            using (HttpClient localClient = new HttpClient(handler)) {
                localClient.Timeout = TimeSpan.FromMilliseconds(1500);

                statusLabel.Text = "Buscando servidor en este equipo...";
                if (await TryConnect(localClient, localhostUrl + "/api/ping")) {
                    OpenUrl(localhostUrl);
                    return;
                }

                statusLabel.Text = "Buscando en la red local del colegio...";
                if (await TryConnect(localClient, localMdnsUrl + "/api/ping")) {
                    OpenUrl(localMdnsUrl);
                    return;
                }

                statusLabel.Text = "Verificando IP interna del colegio...";
                if (await TryConnect(localClient, fallbackIpUrl + "/api/ping")) {
                    OpenUrl(fallbackIpUrl);
                    return;
                }
            }

            // 2. Si no responde en la red local, consultar acceso remoto por Túnel (Internet)
            statusLabel.Text = "Consultando acceso remoto (Internet)...";
            using (HttpClient cloudClient = new HttpClient(handler)) {
                cloudClient.Timeout = TimeSpan.FromSeconds(8);
                try {
                    HttpResponseMessage response = await cloudClient.GetAsync(gasDbUrl + "?action=get_url");
                    if (response.IsSuccessStatusCode) {
                        string cfUrl = (await response.Content.ReadAsStringAsync()).Trim();
                        if (cfUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)) {
                            statusLabel.Text = "Conectando al túnel seguro...";
                            if (await TryConnect(cloudClient, cfUrl + "/api/ping") || await TryConnect(cloudClient, cfUrl + "/login.html")) {
                                OpenUrl(cfUrl);
                                return;
                            }
                            // Si el ping falló pero devolvió una URL válida de http, abrirla de todos modos
                            OpenUrl(cfUrl);
                            return;
                        }
                    }
                } catch (Exception ex) {
                    Debug.WriteLine("Error consultando acceso remoto: " + ex.Message);
                }
            }

            // Si todas las opciones fallaron
            progressBar.Style = ProgressBarStyle.Blocks;
            progressBar.Value = 100;
            statusLabel.ForeColor = Color.DarkRed;
            statusLabel.Text = "Error: El servidor está apagado o es inaccesible.";
            closeButton.Visible = true;
        }

        private async Task<bool> TryConnect(HttpClient client, string url) {
            try {
                HttpResponseMessage res = await client.GetAsync(url);
                return res.IsSuccessStatusCode;
            } catch {
                return false;
            }
        }

        private void OpenUrl(string url) {
            statusLabel.ForeColor = Color.DarkGreen;
            statusLabel.Text = "¡Conectado! Abriendo navegador...";
            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            Task.Delay(1200).ContinueWith(_ => Application.Exit());
        }
    }
}
