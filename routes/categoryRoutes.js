import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// ✅ カテゴリ一覧取得
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// ✅ 新しいカテゴリを追加
router.post("/", async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "カテゴリ名が必要です" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || ""]
    );

    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

export default router;
