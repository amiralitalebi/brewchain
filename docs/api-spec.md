# API Specification

## Overview

The Brewchain API provides endpoints for:

- health checking
- batch creation and retrieval
- supply chain event creation
- batch trace viewing
- batch proof anchoring
- event proof anchoring
- blockchain status lookup
- live smart contract state lookup

The API is used by the gateway and frontend in the hybrid DApp architecture.

## Base purpose

The API is responsible for:

- storing batch metadata off-chain
- managing batch events
- preparing trace responses
- anchoring batch proof through Algorand integration
- anchoring event proof through Algorand integration
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
- view batch proof details
- view event-level proof details linked to the batch timeline

#### `POST /batches/:id/anchor`

Anchors batch proof on Algorand.

**Purpose:**

- create an on-chain proof record for a batch
- return transaction and app reference details

#### `POST /batches/:id/events/:eventId/anchor`

Anchors event proof on Algorand.

**Purpose:**

- create an on-chain proof record for a specific batch event
- return transaction and app reference details

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
- `globalState.event_anchor_count`
- `globalState.creator`

## Notes

- Detailed batch data is stored off-chain in `api/data/batches.json`
- Blockchain proof is anchored on Algorand
- The frontend accesses the API through the gateway
- The smart contract is intentionally small and supports the current version 1 proof flow
- Batch proof and event proof are both visible in the frontend trace experience
