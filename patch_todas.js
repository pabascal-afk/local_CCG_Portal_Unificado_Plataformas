const fs = require('fs');
let code = fs.readFileSync('server/api/evaluaciones.js', 'utf8');

const newRoute = `
// GET Todas mis evaluaciones (sin limite)
router.get('/mis-evaluaciones-todas', async (req, res) => {
    try {
        const userEmail = req.isAuthenticated() ? req.user.email : 'dev@colegio.edu';
        const evals = await queryAll("SELECT * FROM evaluaciones WHERE profesor_email = ? ORDER BY fecha DESC", [userEmail]);
        res.json(evals);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
`;

if (!code.includes("/mis-evaluaciones-todas")) {
    code = code.replace("router.get('/', async", newRoute + "\nrouter.get('/', async");
    fs.writeFileSync('server/api/evaluaciones.js', code, 'utf8');
    console.log("Ruta añadida");
}
