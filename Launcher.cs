using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static void Main() {
        string localUrl = "http://plataforma.local:9000";
        string fallbackUrl = "http://192.168.3.16:9000"; // Optional direct IP fallback
        string localhostUrl = "http://localhost:9000";
        string gasDbUrl = "https://script.google.com/macros/s/AKfycbwzszh_oyXrFY8S5tQhg5_JkyXL7q97jVzYHgLnMn_K0-qVowwwel0hxhdZIIMi-YWD/exec";
        
        // Bypass SSL validation (important for corporate networks/proxies)
        HttpClientHandler handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;

        using (HttpClient client = new HttpClient(handler)) {
            client.Timeout = TimeSpan.FromMilliseconds(1500);
            
            // 0. Try localhost (if running on the server machine itself)
            try {
                if (client.GetAsync(localhostUrl + "/login.html").Result.IsSuccessStatusCode) {
                    Process.Start(new ProcessStartInfo(localhostUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}

            // 1. Try local MDNS
            try {
                if (client.GetAsync(localUrl + "/login.html").Result.IsSuccessStatusCode) {
                    Process.Start(new ProcessStartInfo(localUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}

            // 2. Try direct local IP
            try {
                if (client.GetAsync(fallbackUrl + "/login.html").Result.IsSuccessStatusCode) {
                    Process.Start(new ProcessStartInfo(fallbackUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}
            
            // 3. Fetch Cloudflare URL from Google Apps Script Tunnel DB
            try {
                client.Timeout = TimeSpan.FromSeconds(5);
                string cfUrl = client.GetStringAsync(gasDbUrl + "?action=get_url").Result.Trim();
                if (cfUrl.StartsWith("http")) {
                    Process.Start(new ProcessStartInfo(cfUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}
            
            // If everything fails, show error
            System.Windows.Forms.MessageBox.Show("No se pudo conectar a la plataforma. Verifica que el servidor estA(c) encendido.", "Error de Conexion", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
        }
    }
}
