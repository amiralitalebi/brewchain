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

function buildDefaultProof(proof = {}) {
  return {
    network: "Algorand",
    proofStatus: "pending",
    txId: null,
    appId: null,
    note: "Proof not anchored yet",
    anchoredAt: null,
    ...proof
  };
}

function normaliseBatch(batch) {
  return {
    ...batch,
    events: Array.isArray(batch.events) ? batch.events : [],
    proof: buildDefaultProof(batch.proof)
  };
}

function readBatches() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    const parsed = JSON.parse(data || "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normaliseBatch);
  } catch (error) {
    return [];
  }
}

function writeBatches(batches) {
  fs.writeFileSync(dataFilePath, JSON.stringify(batches, null, 2), "utf8");
}

function generateProofReference(batchId) {
  const cleanBatchId = String(batchId).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();

  return {
    txId: `ALGOTX-${cleanBatchId}-${timestampPart}-${randomPart}`,
    appId: `ALGAPP-${timestampPart}`,
    anchoredAt: new Date().toISOString()
  };
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
    proof: buildDefaultProof()
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
  batches[batchIndex].proof = buildDefaultProof(batches[batchIndex].proof);

  writeBatches(batches);

  res.status(201).json({
    message: "Event added successfully",
    batch: batches[batchIndex]
  });
});

app.post("/batches/:batchId/anchor-proof", (req, res) => {
  const batches = readBatches();
  const batchIndex = batches.findIndex((item) => item.batchId === req.params.batchId);

  if (batchIndex === -1) {
    return res.status(404).json({
      message: "Batch not found"
    });
  }

  const currentBatch = batches[batchIndex];
  const currentProof = buildDefaultProof(currentBatch.proof);

  if (currentProof.proofStatus === "anchored" && currentProof.txId) {
    return res.status(200).json({
      message: "Proof already anchored",
      batch: currentBatch
    });
  }

  const proofReference = generateProofReference(currentBatch.batchId);

  batches[batchIndex].proof = buildDefaultProof({
    ...currentProof,
    proofStatus: "anchored",
    txId: proofReference.txId,
    appId: proofReference.appId,
    anchoredAt: proofReference.anchoredAt,
    note: "Proof reference anchored through Hybrid DApp API stub"
  });

  writeBatches(batches);

  res.status(200).json({
    message: "Proof anchored successfully",
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
    proof: buildDefaultProof(batch.proof),
    timeline: batch.events
  });
});

app.listen(PORT, () => {
  console.log(`brewchain api running on port ${PORT}`);
});