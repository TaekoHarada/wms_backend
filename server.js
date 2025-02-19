import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/stock", stockRoutes);
app.use("/summary", summaryRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
