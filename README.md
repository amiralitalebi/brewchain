# Brewchain

Coffee Supply Chain Traceability Hybrid DApp using Algorand.

## Overview

Brewchain is a hybrid DApp for tracking coffee batches through a supply chain. It combines off-chain batch data storage with on-chain proof anchoring on Algorand.

## Features

- create batch
- view all batches
- view one batch
- add supply chain event
- trace batch timeline
- anchor batch proof on Algorand
- anchor event proof on Algorand
- show batch-level on-chain proof reference
- show event-level on-chain proof reference
- view live blockchain app state
- show contract batch count
- show contract event anchor count

## Technology Stack

- multi-page web frontend
- Node.js + Express API
- Express API gateway
- Algorand LocalNet
- small Algorand smart contract
- off-chain metadata with on-chain proof

## Architecture

### Frontend
The frontend provides pages for creating batches, viewing batches, adding events, tracing timelines, and viewing batch proof and event proof details.

### API
The API manages batch creation, retrieval, event handling, trace responses, batch proof anchoring, event proof anchoring, and blockchain state lookup.

### Gateway
The gateway forwards frontend requests to the API.

### Storage
Batch metadata is stored off-chain in:

`api/data/batches.json`

Proof is anchored on Algorand using application calls.

## Smart Contract

Contract file:

`smart-contract/contract/coffee_trace_contract.py`

Current behaviour:
- stores `creator` in global state
- stores `batch_count` in global state
- stores `event_anchor_count` in global state
- accepts NoOp application call with argument `create_batch`
- accepts NoOp application call with argument `anchor_event`
- increments `batch_count` when `create_batch` is called
- increments `event_anchor_count` when `anchor_event` is called

## Blockchain Configuration

Current deployed application ID:

`1022`

## Proof Anchoring

### Batch proof anchoring
Batch proof anchoring uses:
- Algorand application call
- NoOp call
- app argument: `create_batch`
- JSON note containing batch metadata

The batch proof JSON note includes:
- `batchId`
- `anchoredAt`
- `source`
- `action`

### Event proof anchoring
Event proof anchoring uses:
- Algorand application call
- NoOp call
- app argument: `anchor_event`
- JSON note containing event metadata

The event proof JSON note includes:
- `batchId`
- `eventId`
- `anchoredAt`
- `action`
- `source`

## API Routes

- `GET /health`
- `GET /batches`
- `GET /batches/:id`
- `POST /batches`
- `POST /batches/:id/events`
- `GET /batches/:id/trace`
- `GET /blockchain/status`
- `GET /blockchain/app-state`

## Project Structure

```text
api/
docs/
frontend/
gateway/
smart-contract/
README.md
start-all.sh
stop-all.sh
Running Locally
Clone the repository
git clone https://github.com/amiralitalebi/brewchain.git
cd brewchain
git checkout brewchain-algorand
Install dependencies
API
cd api
npm install
cd ..
Gateway
cd gateway
npm install
cd ..
Configure environment files

Create .env files in:

api/
gateway/

Use the example files where available.

Start the system
./start-all.sh
Stop the system
./stop-all.sh
Frontend

The frontend can be served from frontend/ using:

python3 -m http.server 8080
Notes

Version 1 is intentionally kept simple. It focuses on a clear hybrid DApp structure, batch traceability, batch proof anchoring, event proof anchoring, and visible smart contract state without unnecessary extra features.