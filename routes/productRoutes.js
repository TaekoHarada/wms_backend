import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// ✅ 商品一覧取得（カテゴリ名を含める）
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.sku, p.name, p.quantity, p.location, c.name AS category, c.id AS category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// ✅ 商品詳細取得
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT p.id, p.sku, p.name, p.quantity, p.location, c.name AS category, c.id AS category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// ✅ 商品追加
router.post("/", async (req, res) => {
  const { name, sku, category_id, quantity, location } = req.body;

  if (!name || !sku || quantity === undefined || !category_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO products (name, sku, category_id, quantity, location) 
      VALUES (?, ?, ?, ?, ?)
    `,
      [name, sku, category_id, quantity, location]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      sku,
      category_id,
      quantity,
      location,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// ✅ 商品編集
router.put("/:id", async (req, res) => {
  const { name, sku, category_id, quantity, location } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE products 
      SET name = ?, sku = ?, category_id = ?, quantity = ?, location = ?
      WHERE id = ?
    `,
      [name, sku, category_id, quantity, location, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ id: req.params.id, name, sku, category_id, quantity, location });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// ✅ 商品削除
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

export default router;
