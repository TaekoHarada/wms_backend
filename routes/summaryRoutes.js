import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// ✅ 在庫サマリー取得 API
router.get("/", async (req, res) => {
  try {
    const [[{ totalProducts }]] = await pool.query(
      "SELECT SUM(quantity) AS totalProducts FROM products"
    );
    const [[{ lowStockCount }]] = await pool.query(
      "SELECT COUNT(*) AS lowStockCount FROM products WHERE quantity <= 5"
    );
    const [[{ recentTransactions }]] = await pool.query(
      "SELECT COUNT(*) AS recentTransactions FROM stock_transactions WHERE transaction_date >= NOW() - INTERVAL 5 DAY"
    );

    res.json({ totalProducts, lowStockCount, recentTransactions });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error });
  }
});

// ✅ 在庫切れ商品の取得 API
router.get("/low-stock", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC"
    );

    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error });
  }
});

// ✅ 最近の入庫・出庫履歴取得 API
router.get("/recent-stock", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT st.id, p.name AS product_name, st.type, st.quantity, st.transaction_date
      FROM stock_transactions st
      JOIN products p ON st.product_id = p.id
      ORDER BY st.transaction_date DESC
      LIMIT 5;
    `
    );

    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error });
  }
});

// ✅ 月ごとの在庫推移取得 API
router.get("/stock-trends", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) AS stock_in,
        SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) AS stock_out
      FROM stock_transactions
      WHERE transaction_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC
    `
    );

    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error", error });
  }
});

export default router;
