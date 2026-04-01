import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "brewchain-api",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`brewchain api running on port ${PORT}`);
});