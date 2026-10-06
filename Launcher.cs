using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static void Main() {
        string localUrl = "http://plataforma.local:9000";
        string fallbackUrl = "http://192.168.3.16:9000"; // Optional direct IP fallback
        string gasUrl = "https://script.google.com/a/macros/colegiocerrogrande.cl/s/AKfycbwFolfSg6281xItCB32BotanKXRPe5jaRNHToQe6qiWVbQDLgQEYgpANkS5B0F7IGfMUA/exec";
        
        using (HttpClient client = new HttpClient()) {
            client.Timeout = TimeSpan.FromMilliseconds(1500);
            
            // 1. Try mdns
            try {
                HttpResponseMessage response = client.GetAsync(localUrl + "/login.html").Result;
                if (response.IsSuccessStatusCode) {
                    Process.Start(new ProcessStartInfo(localUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}

            // 2. Try direct IP
            try {
                HttpResponseMessage response = client.GetAsync(fallbackUrl + "/login.html").Result;
                if (response.IsSuccessStatusCode) {
                    Process.Start(new ProcessStartInfo(fallbackUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}
            
            // 3. Fetch Cloudflare URL from Google Apps Script
            try {
                client.Timeout = TimeSpan.FromSeconds(5);
                string cfUrl = client.GetStringAsync(gasUrl + "?action=get_url").Result.Trim();
                if (cfUrl.StartsWith("http")) {
                    Process.Start(new ProcessStartInfo(cfUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}
        }
    }
}
