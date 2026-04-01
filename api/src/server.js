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

app.post("/batches/:batchId/events", (req, res) => {
  const { stage, location, description } = req.body;

  if (!stage || !location || !description) {
    return res.status(400).json({
      message: "stage, location, and description are required"
    });
  }

  const batches = readBatches();
  const batchIndex = batches.findIndex((item) => item.batchId === req.params.batchId);

  if (batchIndex === -1) {
    return res.status(404).json({
      message: "Batch not found"
    });
  }

  const newEvent = {
    eventId: `EVT-${Date.now()}`,
    stage,
    location,
    description,
    timestamp: new Date().toISOString()
  };

  batches[batchIndex].events.push(newEvent);
  batches[batchIndex].status = stage;

  writeBatches(batches);

  res.status(201).json({
    message: "Event added successfully",
    batch: batches[batchIndex]
  });
});

app.get("/batches/:batchId/trace", (req, res) => {
  const batches = readBatches();
  const batch = batches.find((item) => item.batchId === req.params.batchId);

  if (!batch) {
    return res.status(404).json({
      message: "Batch not found"
    });
  }

  res.json({
    batchId: batch.batchId,
    coffeeType: batch.coffeeType,
    origin: batch.origin,
    currentStatus: batch.status,
    createdAt: batch.createdAt,
    proof: batch.proof,
    timeline: batch.events
  });
});

app.listen(PORT, () => {
  console.log(`brewchain api running on port ${PORT}`);
});