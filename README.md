# Brewchain

Coffee Supply Chain Traceability Hybrid DApp using Algorand.

## Overview

Brewchain is a hybrid decentralised application (DApp) for tracking coffee batches through a supply chain. It stores detailed batch metadata off-chain and anchors tamper-evident proof records on the Algorand blockchain. Each batch creation and each supply chain event produces an on-chain transaction that permanently records the action.

## Features

- Register a new coffee batch with ID, type, origin, and status
- Auto-generate timestamped batch IDs
- View all batches in the registry
- View a single batch by ID
- Add supply chain events to a batch (stage, location, description)
- Automatically anchor event proof on Algorand when an event is added
- Manually anchor batch-level proof on Algorand
- Trace the full timeline of a batch including all events
- View batch-level on-chain proof reference (transaction ID, app ID)
- View event-level on-chain proof reference per timeline entry
- View live smart contract global state (batch count, event anchor count, creator)

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript — single page, no framework |
| API | Node.js, Express 5, algosdk v3, ESM modules |
| Gateway | Node.js, Express 5, http-proxy-middleware |
| Smart contract | PyTeal (Python), TEAL v8 |
| Blockchain | Algorand LocalNet (via AlgoKit) |

## Architecture

```
Browser (port 8080)
      │
      ▼
Gateway (port 4000)   ←── proxies /api/* → API
      │
      ▼
API (port 3001)   ←── reads/writes batches.json, calls Algorand
      │
      ▼
Algorand LocalNet (algod port 4001)
      │
      ▼
Smart Contract (App ID 1022)
```

> **Local development note:** In a local environment the frontend talks directly to the API on port `3001`. When running in GitHub Codespaces the frontend routes all requests through the gateway on port `3000` using the `/api` prefix.

### Frontend (`frontend/`)

A single-page web app (`index.html`, `css/styles.css`, `js/app.js`) with the following sections:

- **Register Batch** — form to create a new batch
- **Add Event** — form to append a supply chain event to an existing batch
- **Batch Registry** — live grid of all stored batches, clickable to select a batch
- **Timeline Explorer** — trace view showing batch summary, event timeline with per-event blockchain proof, batch proof anchor button, and live smart contract state panel

### API (`api/`)

A Node.js and Express backend responsible for:

- Storing batch metadata off-chain in `api/data/batches.json`
- Managing batch creation, retrieval, and event recording
- Sending Algorand application call transactions for batch proof and event proof anchoring
- Reading live smart contract global state from Algorand
- Returning trace responses combining off-chain data with on-chain proof references

### Gateway (`gateway/`)

A lightweight Express proxy that forwards all `/api/*` requests from the frontend to the API, stripping the `/api` prefix. It is primarily used when running in GitHub Codespaces to handle public port routing.

### Smart Contract (`smart-contract/`)

A small Algorand smart contract written in PyTeal and compiled to TEAL v8.

**Contract file:** `smart-contract/contract/coffee_trace_contract.py`

**Global state:**

| Key | Type | Description |
|---|---|---|
| `creator` | bytes | Address of the account that deployed the contract |
| `batch_count` | uint | Total number of `create_batch` calls received |
| `event_anchor_count` | uint | Total number of `anchor_event` calls received |

**Accepted NoOp application call arguments:**

| Argument | Effect |
|---|---|
| `create_batch` | Increments `batch_count` by 1 |
| `anchor_event` | Increments `event_anchor_count` by 1 |

**Compiled artifacts:**

- `smart-contract/artifacts/approval.teal`
- `smart-contract/artifacts/clear.teal`

**Deployment script:** `smart-contract/scripts/deploy.py` (uses algosdk Python, reads `ALGOD_MNEMONIC` from environment)

### Off-chain Storage

Batch data is persisted in:

```
api/data/batches.json
```

Each batch record includes `batchId`, `coffeeType`, `origin`, `status`, `createdAt`, an `events` array, and a `proof` object.

## Blockchain Configuration

**Currently deployed App ID:** `1022` (Algorand LocalNet)

## Proof Anchoring

### Batch proof

Triggered by: `POST /batches/:batchId/anchor-proof`

- Algorand NoOp application call
- App argument: `create_batch`
- Transaction note (JSON): `batchId`, `anchoredAt`, `source`, `action`

### Event proof

Triggered automatically when: `POST /batches/:batchId/events`

- Algorand NoOp application call
- App argument: `anchor_event`
- Transaction note (JSON): `batchId`, `eventId`, `anchoredAt`, `source`, `action`, `location`

Both proof types store the resulting `txId` and `appId` back into the batch record in `batches.json` and surface them in the frontend trace view.

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns service name and timestamp |
| `GET` | `/batches` | Return all batches |
| `GET` | `/batches/:batchId` | Return a single batch by ID |
| `POST` | `/batches` | Create a new batch |
| `POST` | `/batches/:batchId/events` | Add an event to a batch and auto-anchor event proof |
| `POST` | `/batches/:batchId/anchor-proof` | Anchor batch-level proof on Algorand |
| `GET` | `/batches/:batchId/trace` | Return full trace timeline and proof details |
| `GET` | `/blockchain/app-state` | Return live smart contract global state |

## Project Structure

```
brewchain/
├── api/
│   ├── data/
│   │   └── batches.json          # Off-chain batch storage
│   ├── src/
│   │   └── server.js             # Express API server
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── api-spec.md
│   ├── project-specification.md
│   └── setup-guide.md
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── gateway/
│   ├── src/
│   │   └── server.js             # Express proxy gateway
│   ├── .env.example
│   └── package.json
├── smart-contract/
│   ├── artifacts/
│   │   ├── approval.teal
│   │   └── clear.teal
│   ├── contract/
│   │   └── coffee_trace_contract.py
│   └── scripts/
│       └── deploy.py
├── CN6035-Presentation/
│   ├── architecture.html
│   ├── demo.html
│   └── implementation.html
├── package.json
├── start-all.sh
└── stop-all.sh
```

## Requirements

- Git
- Node.js and npm
- Python 3
- Docker
- AlgoKit (for Algorand LocalNet)

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/amiralitalebi/brewchain.git
cd brewchain
git checkout brewchain-algorand
```

### 2. Install dependencies

```bash
# API
cd api && npm install && cd ..

# Gateway
cd gateway && npm install && cd ..
```

### 3. Configure environment files

**`api/.env`** — use `api/.env.example` as a starting point:

```env
PORT=3001
ALGOD_SERVER=http://localhost
ALGOD_PORT=4001
ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
ALGOD_MNEMONIC=<your localnet account mnemonic>
ALGOD_APP_ID=1022
```

**`gateway/.env`** — use `gateway/.env.example` as a starting point:

```env
PORT=4000
API_BASE_URL=http://127.0.0.1:3001
```

### 4. Start all services

```bash
./start-all.sh
```

This script starts:
1. Algorand LocalNet (via AlgoKit)
2. API on port `3001`
3. Gateway on port `4000`
4. Frontend static server on port `8080`

When running in GitHub Codespaces it also sets ports `3000`, `3001`, and `8080` to public visibility automatically.

Logs are written to:
- `api/api.log`
- `gateway/gateway.log`
- `frontend/frontend.log`

### 5. Open the frontend

```
http://localhost:8080
```

### 6. Stop all services

```bash
./stop-all.sh
```

This stops the Node.js watchers, the Python HTTP server, and the Algorand LocalNet Docker containers.

## Basic Test Flow

1. Open the frontend at `http://localhost:8080`
2. Register a new batch using the Register Batch form
3. Load the Batch Registry to confirm it appears
4. Select the batch and add a supply chain event — event proof is automatically anchored on Algorand
5. Open the Timeline Explorer to view the trace and per-event blockchain proof
6. Click **Anchor Proof** to anchor the batch-level proof on Algorand
7. View the returned transaction ID and app ID in the trace panel
8. Scroll down to the live contract state panel to confirm `batch_count` and `event_anchor_count` have incremented

## Notes

Version 1 is intentionally minimal. It focuses on a clear hybrid DApp structure, straightforward coffee batch traceability, and visible Algorand integration. The following are out of scope for this version: authentication, role management, QR codes, maps, analytics, NFT or token features, and full on-chain batch storage.