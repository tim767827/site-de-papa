const express = require("express");
const ExcelJS = require("exceljs");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 IMPORTANT : ton front est dans /public
app.use(express.static(path.join(__dirname, "public")));

// ======================
// DATABASE POSTGRES (RENDER)
// ======================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});

// ======================
// INIT TABLE
// ======================
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clients (
                id SERIAL PRIMARY KEY,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                email TEXT NOT NULL,
                telephone TEXT NOT NULL
            );
        `);

        console.log("✅ Database OK");
    } catch (err) {
        console.error("❌ DB error:", err);
    }
}

// ======================
// ROUTE HOME
// ======================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// ADD CLIENT
// ======================
app.post("/api/add", async (req, res) => {
    const { nom, prenom, email, telephone } = req.body;

    if (!nom || !prenom || !email || !telephone) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO clients (nom, prenom, email, telephone)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [nom, prenom, email, telephone]
        );

        res.json({
            success: true,
            id: result.rows[0].id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// ======================
// GET CLIENTS
// ======================
app.get("/api/clients", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM clients ORDER BY id DESC"
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json([]);
    }
});

// ======================
// DELETE CLIENT
// ======================
app.delete("/api/clients/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM clients WHERE id = $1",
            [req.params.id]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// ======================
// EXPORT EXCEL
// ======================
app.get("/export-excel", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM clients ORDER BY id DESC"
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Clients");

        worksheet.columns = [
            { header: "Nom", key: "nom", width: 20 },
            { header: "Prénom", key: "prenom", width: 20 },
            { header: "Email", key: "email", width: 35 },
            { header: "Téléphone", key: "telephone", width: 20 }
        ];

        result.rows.forEach(row => worksheet.addRow(row));

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

    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur export");
    }
});

// ======================
// START SERVER
// ======================
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await initDB();
});