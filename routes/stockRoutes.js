import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// ✅ 在庫更新（入庫・出庫）
router.post("/update", async (req, res) => {
  const { product_id, type, quantity } = req.body;

  if (!product_id || !type || !quantity || !["IN", "OUT"].includes(type)) {
    return res.status(400).json({ message: "入力データが不正です" });
  }

  try {
    // 現在の在庫を取得
    const [rows] = await pool.query(
      "SELECT quantity FROM products WHERE id = ?",
      [product_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    let newQuantity = rows[0].quantity;
    if (type === "IN") {
      newQuantity += quantity;
    } else if (type === "OUT") {
      if (newQuantity < quantity) {
        return res.status(400).json({ message: "在庫不足です" });
      }
      newQuantity -= quantity;
    }

    // 在庫更新
    await pool.query("UPDATE products SET quantity = ? WHERE id = ?", [
      newQuantity,
      product_id,
    ]);

    // 在庫履歴を記録
    await pool.query(
      "INSERT INTO stock_transactions (product_id, type, quantity) VALUES (?, ?, ?)",
      [product_id, type, quantity]
    );

    res.status(200).json({ message: "在庫更新成功", newQuantity });
  } catch (error) {
    console.error("Database Error:", error);
    res
      .status(500)
      .json({ message: "データベースエラー", error: error.message });
  }
});

// ✅ 在庫履歴の取得
router.get("/history", async (req, res) => {
  try {
    const [rows] = await pool.query(`
        SELECT st.id, st.product_id, p.name AS product_name, p.sku, st.type, st.quantity, st.transaction_date
        FROM stock_transactions st
        JOIN products p ON st.product_id = p.id
        ORDER BY st.transaction_date DESC
      `);
    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

export default router;
