const fs = require('fs');
let code = fs.readFileSync('server/api/config.js', 'utf8');

const newRoute = `
router.get('/gas', async (req, res) => {
    res.json({ url: process.env.GAS_WEB_APP_URL });
});
`;

if (!code.includes("'/gas'")) {
    code = code.replace("module.exports = router;", newRoute + "\nmodule.exports = router;");
    fs.writeFileSync('server/api/config.js', code, 'utf8');
    console.log("Ruta /gas añadida");
}
