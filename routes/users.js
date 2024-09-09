const express = require('express');
const router = express.Router();
const users = require('../data/users');
const { generarToken, verificarToken } = require('../middlewares/authMiddleware');


router.get('/', (req, res) => {
    if (req.session.token) {
        res.send(`
            <a href="/dashboard">Ir al Dashboard</a>
            <form action="/logout" method="post">
                <button type="submit">Cerrar sesión</button>
            </form>
        `);
    } else {
        const loginForm = `
            <form action="/login" method="post">
                <label for="username">Usuario: </label>
                <input type="text" id="username" name="username" required><br>
                <label for="password">Contraseña: </label>
                <input type="password" id="password" name="password" required><br>
                <button type="submit">Iniciar sesión</button>
            </form>
        `;
        res.send(loginForm);
    }
});


router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = generarToken(user);
        req.session.token = token;
        res.redirect('/dashboard');
    } else {
        res.status(401).json({ mensaje: 'Datos incorrectos' });
    }
});


router.get('/dashboard', verificarToken, (req, res) => {
    const userId = req.user;
    const user = users.find(u => u.id === userId);

    if (user) {
        res.send(`
            <h1>Bienvenido, ${user.name}</h1>
            <p>ID: ${user.id}</p>
            <p>Username: ${user.username}</p>
            <a href="/">Home</a>
            <form action="/logout" method="post">
                <button type="submit">Cerrar sesión</button>
            </form>
        `);
    } else {
        res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }
});


router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;