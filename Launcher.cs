using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static void Main() {
        string localUrl = "http://plataforma.local:9000";
        string fallbackUrl = "http://192.168.3.16:9000"; // Optional direct IP fallback
        string gasDbUrl = "https://script.google.com/macros/s/AKfycbwzszh_oyXrFY8S5tQhg5_JkyXL7q97jVzYHgLnMn_K0-qVowwwel0hxhdZIIMi-YWD/exec";
        
        using (HttpClient client = new HttpClient()) {
            client.Timeout = TimeSpan.FromMilliseconds(1500);
            
            // 1. Try local MDNS
            try {
                HttpResponseMessage response = client.GetAsync(localUrl + "/login.html").Result;
                if (response.IsSuccessStatusCode) {
                    Process.Start(new ProcessStartInfo(localUrl) { UseShellExecute = true });
                    return;
                }
            } catch {}

            // 2. Try direct local IP
            try {
                HttpResponseMessage response = client.GetAsync(fallbackUrl + "/login.html").Result;
                if (response.IsSuccessStatusCode) {
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
        }
    }
}
