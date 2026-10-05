const fs = require('fs');
let code = fs.readFileSync('server/api/rpc.js', 'utf8');
code = code.replace("} catch (e) {", "} catch (e) {\n          console.error('[RPC ERROR]', e);");
fs.writeFileSync('server/api/rpc.js', code, 'utf8');
