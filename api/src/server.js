import algosdk from "algosdk";
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

async function sendAlgorandProofTransaction(batchId) {
  const algodServer = process.env.ALGOD_SERVER;
  const algodPort = process.env.ALGOD_PORT;
  const algodToken = process.env.ALGOD_TOKEN;
  const algodMnemonic = process.env.ALGOD_MNEMONIC;
  const algodAppId = process.env.ALGOD_APP_ID
    ? Number(process.env.ALGOD_APP_ID)
    : null;

  if (
    !algodServer ||
    !algodPort ||
    !algodToken ||
    !algodMnemonic ||
    !algodAppId
  ) {
    throw new Error("Algorand environment variables are missing");
  }

  const cleanMnemonic = algodMnemonic.trim().replace(/\s+/g, " ");
  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  const account = algosdk.mnemonicToSecretKey(cleanMnemonic);
  const suggestedParams = await algodClient.getTransactionParams().do();

  const noteObject = {
    batchId,
    anchoredAt: new Date().toISOString(),
    source: "brewchain-hybrid-dapp",
    action: "create_batch"
  };

  const note = new TextEncoder().encode(JSON.stringify(noteObject));
  const appArgs = [new TextEncoder().encode("create_batch")];

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    sender: account.addr,
    appIndex: algodAppId,
    appArgs,
    note,
    suggestedParams
  });

  const signedTxn = txn.signTxn(account.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  const confirmation = await algosdk.waitForConfirmation(
    algodClient,
    response.txid,
    4
  );
  const confirmedRound = Number(
    confirmation["confirmed-round"] ?? confirmation.confirmedRound ?? 0
  );

  if (confirmedRound <= 0) {
    console.error("Unexpected confirmation object:", confirmation);
    throw new Error("Algorand app call was not confirmed");
  }

  return {
    txId: response.txid,
    appId: algodAppId
  };
}

async function sendAlgorandEventAnchor(batchId, event) {
  const algodServer = process.env.ALGOD_SERVER;
  const algodPort = process.env.ALGOD_PORT;
  const algodToken = process.env.ALGOD_TOKEN;
  const algodMnemonic = process.env.ALGOD_MNEMONIC;
  const algodAppId = process.env.ALGOD_APP_ID
    ? Number(process.env.ALGOD_APP_ID)
    : null;

  if (
    !algodServer ||
    !algodPort ||
    !algodToken ||
    !algodMnemonic ||
    !algodAppId
  ) {
    throw new Error("Algorand environment variables are missing");
  }

  const cleanMnemonic = algodMnemonic.trim().replace(/\s+/g, " ");
  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  const account = algosdk.mnemonicToSecretKey(cleanMnemonic);
  const suggestedParams = await algodClient.getTransactionParams().do();

  const noteObject = {
    batchId,
    eventId: event.eventId,
    anchoredAt: new Date().toISOString(),
    source: "brewchain-hybrid-dapp",
    action: event.stage,
    location: event.location
  };

  const note = new TextEncoder().encode(JSON.stringify(noteObject));
  const appArgs = [new TextEncoder().encode("anchor_event")];

  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    sender: account.addr,
    appIndex: algodAppId,
    appArgs,
    note,
    suggestedParams
  });

  const signedTxn = txn.signTxn(account.sk);
  const response = await algodClient.sendRawTransaction(signedTxn).do();
  const confirmation = await algosdk.waitForConfirmation(
    algodClient,
    response.txid,
    4
  );
  const confirmedRound = Number(
    confirmation["confirmed-round"] ?? confirmation.confirmedRound ?? 0
  );

  if (confirmedRound <= 0) {
    console.error("Unexpected confirmation object:", confirmation);
    throw new Error("Algorand event anchor app call was not confirmed");
  }

  return {
    txId: response.txid,
    appId: algodAppId
  };
}

async function readAlgorandAppState() {
  const algodServer = process.env.ALGOD_SERVER;
  const algodPort = process.env.ALGOD_PORT;
  const algodToken = process.env.ALGOD_TOKEN;
  const algodAppId = process.env.ALGOD_APP_ID
    ? Number(process.env.ALGOD_APP_ID)
    : null;

  if (!algodServer || !algodPort || !algodToken || !algodAppId) {
    throw new Error("Algorand environment variables are missing");
  }

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  const appInfo = await algodClient.getApplicationByID(algodAppId).do();
  const globalState =
    appInfo?.params?.["global-state"] ||
    appInfo?.params?.globalState ||
    appInfo?.application?.params?.["global-state"] ||
    appInfo?.application?.params?.globalState ||
    [];

  const decodedState = {};

  for (const item of globalState) {
    const key = Buffer.from(item.key, "base64").toString("utf8");

    if (item.value.type === 1) {
      const rawBytes = Buffer.from(item.value.bytes, "base64");

      if (key === "creator") {
        decodedState[key] = algosdk.encodeAddress(new Uint8Array(rawBytes));
      } else {
        decodedState[key] = rawBytes.toString("utf8");
      }
    } else {
      decodedState[key] = Number(item.value.uint);
    }
  }

  return {
    appId: algodAppId,
    globalState: decodedState
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

app.post("/batches/:batchId/events", async (req, res) => {
  const { stage, location, description } = req.body;

  if (!stage || !location || !description) {
    return res.status(400).json({
      message: "stage, location, and description are required"
    });
  }

  const batches = readBatches();
  const batchIndex = batches.findIndex(
    (item) => item.batchId === req.params.batchId
  );

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

  try {
    const eventAnchor = await sendAlgorandEventAnchor(
      req.params.batchId,
      newEvent
    );

    newEvent.blockchainProof = {
      txId: eventAnchor.txId,
      appId: eventAnchor.appId,
      method: "anchor_event"
    };
  } catch (error) {
    console.error("Event anchor error:", error);
    newEvent.blockchainProof = {
      txId: null,
      appId: process.env.ALGOD_APP_ID ? Number(process.env.ALGOD_APP_ID) : null,
      method: "anchor_event",
      error: error.message
    };
  }

  writeBatches(batches);

  res.status(201).json({
    message: "Event added successfully",
    batch: batches[batchIndex]
  });
});

app.post("/batches/:batchId/anchor-proof", async (req, res) => {
  const batches = readBatches();
  const batchIndex = batches.findIndex(
    (item) => item.batchId === req.params.batchId
  );

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

  try {
    const txResult = await sendAlgorandProofTransaction(currentBatch.batchId);

    batches[batchIndex].proof = buildDefaultProof({
      ...currentProof,
      proofStatus: "anchored",
      txId: txResult.txId,
      appId: txResult.appId,
      anchoredAt: new Date().toISOString(),
      note: "Proof anchored on Algorand using app call create_batch"
    });

    writeBatches(batches);

    return res.status(200).json({
      message: "Proof anchored successfully",
      batch: batches[batchIndex]
    });
  } catch (error) {
    console.error("Anchor proof error:", error);
    return res.status(500).json({
      message: "Failed to anchor proof on Algorand",
      error: error.message
    });
  }
});

app.get("/batches/:batchId/trace", (req, res) => {
  const batches = readBatches();
  const batch = batches.find((item) => item.batchId === req.params.batchId);

  if (!batch) {
    return res.status(404).json({
      message: "Batch not found"
    });
  }

  const timeline = (Array.isArray(batch.events) ? batch.events : []).map(
    (event) => ({
      eventId: event.eventId,
      stage: event.stage,
      location: event.location,
      description: event.description,
      timestamp: event.timestamp,
      blockchainProof: event.blockchainProof || null
    })
  );

  res.json({
    batchId: batch.batchId,
    coffeeType: batch.coffeeType,
    origin: batch.origin,
    currentStatus: batch.status,
    createdAt: batch.createdAt,
    proof: buildDefaultProof(batch.proof),
    timeline
  });
});

app.get("/blockchain/app-state", async (req, res) => {
  try {
    const result = await readAlgorandAppState();

    return res.json({
      network: "Algorand",
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to read Algorand app state",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`brewchain api running on port ${PORT}`);
});
