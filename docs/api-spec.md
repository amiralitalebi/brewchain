# API Specification

## Overview

The Brewchain API provides endpoints for:
- health checking
- batch creation and retrieval
- supply chain event creation
- batch trace viewing
- blockchain status lookup
- live smart contract state lookup

The API is used by the gateway and frontend in the hybrid DApp architecture.

## Base purpose

The API is responsible for:
- storing batch metadata off-chain
- managing batch events
- preparing trace responses
- anchoring proof through Algorand integration
- returning blockchain-related status and app state data

## Routes

### Health

#### `GET /health`
Returns a simple response to confirm that the API is running.

**Purpose:**
- check whether the backend service is available

---

### Batch routes

#### `GET /batches`
Returns all stored batches.

**Purpose:**
- view the full batch list

#### `GET /batches/:id`
Returns one batch by ID.

**Purpose:**
- view details for a specific batch

#### `POST /batches`
Creates a new batch.

**Purpose:**
- add a new coffee batch into the system

#### `POST /batches/:id/events`
Adds a new supply chain event to an existing batch.

**Purpose:**
- record movement or processing activity for a batch

#### `GET /batches/:id/trace`
Returns the trace timeline and proof-related information for a batch.

**Purpose:**
- follow the batch journey
- view proof details linked to the batch

---

### Blockchain routes

#### `GET /blockchain/status`
Returns general blockchain connection or status information.

**Purpose:**
- confirm the API can access Algorand services

#### `GET /blockchain/app-state`
Returns live smart contract application state from Algorand.

**Purpose:**
- show current blockchain app data in the frontend

**Expected live fields include:**
- `appId`
- `globalState.batch_count`
- `globalState.creator`

## Notes

- Detailed batch data is stored off-chain in `api/data/batches.json`
- Blockchain proof is anchored on Algorand
- The frontend accesses the API through the gateway
- The smart contract is intentionally small and only supports the current version 1 proof flow