const ExcelJS = require("exceljs");

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.static(__dirname));

// =====================
// BASE DE DONNÉES
// =====================
const db = new sqlite3.Database("database.db");

// création table
db.run(`
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    prenom TEXT,
    email TEXT,
    telephone TEXT
)
`);

// =====================
// PAGE D'ACCUEIL (IMPORTANT)
// =====================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// =====================
// AJOUT CLIENT
// =====================
app.post("/api/add", (req, res) => {

    const { nom, prenom, email, telephone } = req.body;

    console.log("AJOUT CLIENT :", req.body);

    db.run(
        "INSERT INTO clients (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)",
        [nom, prenom, email, telephone],
        function (err) {
            if (err) {
                console.error(err);
                return res.json({ success: false });
            }

            res.json({ success: true, id: this.lastID });
        }
    );
});

// =====================
// LIRE CLIENTS
// =====================
app.get("/api/clients", (req, res) => {
    db.all("SELECT * FROM clients ORDER BY id DESC", [], (err, rows) => {
        res.json(rows);
    });
});

// =====================
// SUPPRIMER CLIENT
// =====================
app.delete("/api/clients/:id", (req, res) => {

    const id = req.params.id;

    console.log("DELETE CLIENT ID :", id);

    db.run("DELETE FROM clients WHERE id = ?", [id], function (err) {
        if (err) {
            console.error(err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
});
app.get("/export-excel", (req, res) => {

    db.all("SELECT * FROM clients ORDER BY id DESC", [], async (err, rows) => {

        if (err) {
            return res.status(500).send("Erreur");
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Clients");

        worksheet.columns = [
            { header: "Nom", key: "nom", width: 20 },
            { header: "Prénom", key: "prenom", width: 20 },
            { header: "Email", key: "email", width: 35 },
            { header: "Téléphone", key: "telephone", width: 20 }
        ];

        rows.forEach(client => {
            worksheet.addRow(client);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=clients.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    });

});
// =====================
// LANCEMENT SERVEUR
// =====================
app.listen(PORT, () => {
    console.log("Serveur OK → http://localhost:" + PORT);
});