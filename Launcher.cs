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
            this.Size = new Size(350, 160);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;

            statusLabel = new Label() {
                Text = "Iniciando...",
                AutoSize = false,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Top,
                Height = 40,
                Font = new Font("Segoe UI", 9, FontStyle.Bold)
            };

            // Container for progress bar to give it margins
            Panel pnlProgress = new Panel() { Dock = DockStyle.Top, Height = 30, Padding = new Padding(20, 0, 20, 0) };
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
            string localUrl = "http://plataforma.local:9000";
            string fallbackUrl = "http://192.168.3.16:9000";
            string localhostUrl = "http://localhost:9000";
            string gasDbUrl = "https://script.google.com/macros/s/AKfycbwzszh_oyXrFY8S5tQhg5_JkyXL7q97jVzYHgLnMn_K0-qVowwwel0hxhdZIIMi-YWD/exec";

            HttpClientHandler handler = new HttpClientHandler();
            handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;

            using (HttpClient client = new HttpClient(handler)) {
                client.Timeout = TimeSpan.FromMilliseconds(2000);

                statusLabel.Text = "Buscando servidor en este equipo...";
                if (await TryConnect(client, localhostUrl + "/login.html")) {
                    OpenUrl(localhostUrl); return;
                }

                statusLabel.Text = "Buscando en la red local (mDNS)...";
                if (await TryConnect(client, localUrl + "/login.html")) {
                    OpenUrl(localUrl); return;
                }

                statusLabel.Text = "Intentando IP directa...";
                if (await TryConnect(client, fallbackUrl + "/login.html")) {
                    OpenUrl(fallbackUrl); return;
                }

                statusLabel.Text = "Consultando acceso remoto (Cloudflare)...";
                try {
                    client.Timeout = TimeSpan.FromSeconds(6);
                    HttpResponseMessage response = await client.GetAsync(gasDbUrl + "?action=get_url");
                    if (response.IsSuccessStatusCode) {
                        string cfUrl = (await response.Content.ReadAsStringAsync()).Trim();
                        if (cfUrl.StartsWith("http")) {
                            OpenUrl(cfUrl); return;
                        }
                    }
                } catch {}

                // All failed
                progressBar.Style = ProgressBarStyle.Blocks;
                progressBar.Value = 100;
                statusLabel.ForeColor = Color.DarkRed;
                statusLabel.Text = "Error: El servidor estA! apagado o es inaccesible.";
                closeButton.Visible = true;
            }
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
            statusLabel.Text = "A!Conectado! Abriendo navegador...";
            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            Task.Delay(1000).ContinueWith(_ => Application.Exit());
        }
    }
}
