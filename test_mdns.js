const mdns = require('multicast-dns')();
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}
const ip = getLocalIp();

mdns.on('query', function(query) {
  if (query.questions[0] && query.questions[0].name === 'plataforma.local') {
    console.log('Received query for plataforma.local. Responding with', ip);
    mdns.respond({
      answers: [{
        name: 'plataforma.local',
        type: 'A',
        ttl: 300,
        data: ip
      }]
    });
  }
});
console.log('mDNS responder running...');
