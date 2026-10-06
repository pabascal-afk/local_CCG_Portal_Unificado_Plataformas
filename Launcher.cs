using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static void Main() {
        string localUrl = "http://plataforma.local:9000";
        string remoteUrl = "https://enviably-flanking-train.ngrok-free.dev";
        
        using (HttpClient client = new HttpClient()) {
            client.Timeout = TimeSpan.FromMilliseconds(1500);
            try {
                HttpResponseMessage response = client.GetAsync(localUrl + "/login.html").Result;
                if (response.IsSuccessStatusCode) {
                    Process.Start(new ProcessStartInfo(localUrl) { UseShellExecute = true });
                    return;
                }
            } catch {
                // Ignore
            }
        }
        
        Process.Start(new ProcessStartInfo(remoteUrl) { UseShellExecute = true });
    }
}
