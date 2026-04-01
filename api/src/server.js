import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, "..", "data", "batches.json");

app.use(cors());
app.use(express.json());

function readBatches() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    return [];
  }
}

function writeBatches(batches) {
  fs.writeFileSync(dataFilePath, JSON.stringify(batches, null, 2), "utf8");
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "brewchain-api",
    timestamp: new Date().toISOString()
  });
});

app.get("/batches", (req, res) => {
  const batches = readBatches();
  res.json(batches);
});

app.get("/batches/:batchId", (req, res) => {
  const batches = readBatches();
  const batch = batches.find((item) => item.batchId === req.params.batchId);

  if (!batch) {
    return res.status(404).json({
      message: "Batch not found"
    });
  }

  res.json(batch);
});

app.post("/batches", (req, res) => {
  const { batchId, coffeeType, origin, status } = req.body;

  if (!batchId || !coffeeType || !origin || !status) {
    return res.status(400).json({
      message: "batchId, coffeeType, origin, and status are required"
    });
  }

  const batches = readBatches();

  const existingBatch = batches.find((item) => item.batchId === batchId);

  if (existingBatch) {
    return res.status(409).json({
      message: "Batch already exists"
    });
  }

  const newBatch = {
    batchId,
    coffeeType,
    origin,
    status,
    createdAt: new Date().toISOString(),
    events: [],
    proof: {
      txId: null,
      appId: null,
      note: "Algorand proof not added yet"
    }
  };

  batches.push(newBatch);
  writeBatches(batches);

  res.status(201).json(newBatch);
});

app.listen(PORT, () => {
  console.log(`brewchain api running on port ${PORT}`);
});