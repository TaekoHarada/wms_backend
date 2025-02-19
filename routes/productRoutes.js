import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// 商品一覧取得
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

// 商品詳細取得
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

// 商品追加
router.post("/", async (req, res) => {
  const { name, sku, stock, category } = req.body;
  if (!name || !sku || stock === undefined || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, sku, stock, category) VALUES (?, ?, ?, ?)",
      [name, sku, stock, category]
    );
    res.status(201).json({ id: result.insertId, name, sku, stock, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

// 商品編集
router.put("/:id/edit", async (req, res) => {
  const { name, sku, stock, category } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE products SET name = ?, sku = ?, stock = ?, category = ? WHERE id = ?",
      [name, sku, stock, category, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ id: req.params.id, name, sku, stock, category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

// 商品削除
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
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
});

export default router;
