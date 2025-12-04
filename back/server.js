const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('/var/www/html/TpProjet2/'));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error('Erreur de connexion MySQL :', err.message);
    } else {
        console.log('Connecté à la base de données MySQL');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join('/var/www/html/TpProjet2/front', 'index.html'));
});

// route de connexion 
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const query = 'SELECT * FROM User WHERE Login = ?';
    db.query(query, [login], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête MySQL :', err.message);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Nom d\'utilisateur inexistant' });
        }

        const user = results[0];
        bcrypt.compare(password, user.Password, (err, isMatch) => {
            if (err) {
                console.error('Erreur lors de la comparaison des mots de passe :', err.message);
                return res.status(500).json({ success: false, message: 'Erreur serveur' });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
            }

            return res.json({ success: true, message: 'Connexion réussie' });
        });
    });
});

// route d'inscription
app.post('/api/inscription', (req, res) => {
    const { prenom, nom, email, username, password } = req.body;

    const checkQuery = 'SELECT * FROM User WHERE Login = ? OR Mail = ?';
    db.query(checkQuery, [username, email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la requête MySQL :', err.message);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Nom d\'utilisateur ou email déjà utilisé' });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Erreur lors du hachage du mot de passe :', err.message);
                return res.status(500).json({ success: false, message: 'Erreur serveur' });
            }

            const insertQuery = 'INSERT INTO User (Nom, Prénom, Mail, Login, Password) VALUES (?, ?, ?, ?, ?)';
            db.query(insertQuery, [nom, prenom, email, username, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion dans la base de données :', err.message);
                    return res.status(500).json({ success: false, message: 'Erreur serveur' });
                }

                return res.json({ success: true, message: 'Inscription réussie' });
            });
        });
    });
});

app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});