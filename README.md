# Brewchain

Coffee Supply Chain Traceability Hybrid DApp using Algorand.

## Project overview

Brewchain is a simple hybrid DApp for tracking coffee batches through a supply chain.  
It was developed as a CN6035 coursework project and is intentionally kept small, clear, and coursework-friendly.

The project uses a hybrid design:
- detailed batch data is stored off-chain
- proof records are anchored on Algorand
- the frontend communicates through an API gateway
- the backend manages batch data, trace data, and blockchain requests

This approach keeps version 1 practical and easy to demonstrate while still showing real blockchain interaction.

## Aim of the project

The aim of Brewchain is to demonstrate how a hybrid DApp can support traceability in a coffee supply chain.

The system allows a user to:
- create a coffee batch
- store and update its supply chain events
- view batch details
- trace the batch timeline
- anchor proof on Algorand
- view blockchain-related proof information from the app

## Version 1 scope

The current version supports:
- create batch
- view all batches
- view one batch
- add supply chain event
- trace a batch timeline
- anchor proof on Algorand
- show on-chain proof reference
- view live blockchain app state

The current version does not try to include unnecessary advanced features.  
It is focused on delivering the core hybrid DApp flow clearly and reliably.

## Technology stack

The project uses:
- simple multi-page web frontend
- Node.js + Express API
- Express API gateway
- Algorand LocalNet
- very small Algorand smart contract
- off-chain metadata + on-chain proof

## Architecture

### Frontend

The frontend is a simple multi-page web interface.  
It allows the user to:
- create a batch
- browse all batches
- open one batch
- add events
- view trace data
- trigger proof anchoring
- view blockchain proof and contract state information

The frontend is served from the `frontend/` folder.

### API

The backend API is built with Node.js and Express.  
It handles the main application logic, including:
- batch creation
- batch retrieval
- event creation
- timeline trace generation
- proof anchoring requests
- blockchain application state lookup

### Gateway

The gateway is a small Express service placed between the frontend and the API.  
It forwards requests from the frontend to the backend API.

This keeps the structure closer to a realistic hybrid DApp setup and aligns better with the coursework focus on distributed web architecture.

### Storage model

The project uses a hybrid storage model.

#### Off-chain storage

Detailed batch metadata is stored locally in:

`api/data/batches.json`

This includes the batch details, supply chain events, and stored proof metadata.

#### On-chain proof

Proof is anchored on Algorand using an application call.  
This allows the project to demonstrate blockchain interaction without moving all application data fully on-chain.

## Smart contract

The smart contract is intentionally very small and simple.

File:

`smart-contract/contract/coffee_trace_contract.py`

Current contract behaviour:
- stores `creator` in global state on app creation
- stores `batch_count` in global state
- accepts a NoOp application call with argument `create_batch`
- increments `batch_count` when `create_batch` is called

This design was chosen to keep the blockchain part small, understandable, and suitable for a coursework demo.

## Current blockchain configuration

Current deployed application ID:

`1011`

The API uses the app ID through its environment configuration.

## Proof anchoring design

Proof anchoring uses:
- Algorand application call
- NoOp call
- app argument: `create_batch`
- JSON note with batch metadata

The JSON note includes:
- `batchId`
- `anchoredAt`
- `source`
- `action`

This means the system keeps detailed operational data off-chain while still recording an immutable blockchain proof reference.

## Main functionality

### 1. Create batch

The user can create a new coffee batch from the frontend.

### 2. View all batches

The user can view the stored list of all tracked batches.

### 3. View one batch

The user can open a specific batch and inspect its details.

### 4. Add supply chain event

The user can attach a new event to a batch, such as processing or movement through the chain.

### 5. Trace batch timeline

The user can view the timeline of a batch and follow its recorded journey.

### 6. Anchor proof on Algorand

The user can trigger blockchain proof anchoring from the frontend.

### 7. Show proof reference

The trace view shows stored proof information linked to the batch.

### 8. View live blockchain app state

The application also retrieves live contract state using:

`GET /blockchain/app-state`

This allows the frontend to display:
- contract app ID
- contract batch count
- contract creator

## API routes

The API currently supports routes such as:
- `GET /health`
- `GET /batches`
- `GET /batches/:id`
- `POST /batches`
- `POST /batches/:id/events`
- `GET /batches/:id/trace`
- `GET /blockchain/status`
- `GET /blockchain/app-state`

## Project structure

```text
api/
docs/
frontend/
gateway/
smart-contract/
README.md
start-all.sh
stop-all.sh
Running the project locally
1. Clone the repository
git clone https://github.com/amiralitalebi/brewchain.git
cd brewchain
git checkout brewchain-algorand
2. Install dependencies

For the API:

cd api
npm install
cd ..

For the gateway:

cd gateway
npm install
cd ..
3. Configure environment files

Create .env files inside:

api/
gateway/

Use the .env.example files as a starting point where available.

4. Start the system

From the project root:

./start-all.sh

This starts:

Algorand LocalNet
API
Gateway
Frontend static server
5. Stop the system

From the project root:

./stop-all.sh
Frontend run mode

The frontend is served from:

frontend/

using:

python3 -m http.server 8080
Example demo flow

A simple demo flow for the coursework presentation is:

Start the services
Open the frontend
Create a new batch
View the batch list
Open the batch details
Add a supply chain event
Open the trace view
Anchor proof on Algorand
Show the proof details
Show the live blockchain app state
Design choices

This project intentionally avoids unnecessary complexity.

Key design decisions:

use a simple frontend rather than a heavy framework
use Express for both API and gateway
keep detailed data off-chain
use Algorand only for proof anchoring
keep the smart contract very small
prioritise a clear demo and coursework-friendly structure
Limitations of version 1

This version does not include:

authentication
user roles
advanced search and filtering
QR code integration
map visualisation
analytics dashboard
production deployment
full on-chain batch storage

These were left out to keep the project focused on the main learning outcomes.

Coursework relevance

This project demonstrates:

frontend and backend integration
API gateway usage
hybrid DApp design
blockchain interaction
simple smart contract use
local development and testing
version-controlled coursework implementation