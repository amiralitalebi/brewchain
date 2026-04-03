# Setup Guide

## Overview

This guide explains how to run Brewchain locally for development and testing.

## Project Structure

Main folders:

- `frontend/`
- `api/`
- `gateway/`
- `smart-contract/`
- `docs/`

## Requirements

Make sure the following are installed:

- Git
- Node.js and npm
- Python 3
- Docker
- AlgoKit
- Algorand LocalNet tools used by the project

## Clone the Repository

```bash
git clone https://github.com/amiralitalebi/brewchain.git
cd brewchain
git checkout brewchain-algorand
Install Dependencies
API
cd api
npm install
cd ..
Gateway
cd gateway
npm install
cd ..
Environment Files

Create environment files where needed.

API

Create:

api/.env

Add your local configuration for:

API port
Algorand server or address
Algorand token
Algorand mnemonic
deployed app ID

Typical fields include:

PORT
ALGOD_SERVER
ALGOD_PORT
ALGOD_ADDRESS
ALGOD_TOKEN
ALGOD_MNEMONIC
ALGOD_APP_ID
Gateway

Create:

gateway/.env

Use the example file as a starting point.

Startup Scripts

The project includes two helper scripts in the root folder:

start-all.sh
stop-all.sh
start-all.sh

Starts:

Algorand LocalNet
API
Gateway
frontend static server

Run:

./start-all.sh
stop-all.sh

Stops the local services started for the project.

Run:

./stop-all.sh
Start the System

From the project root, run:

./start-all.sh
Stop the System

From the project root, run:

./stop-all.sh
Frontend

The frontend is served from frontend/ using:

python3 -m http.server 8080
Basic Local Test Flow
open the frontend
create a batch
view all batches
open one batch
add a supply chain event
open the trace view
anchor batch proof on Algorand
anchor event proof on Algorand
confirm proof details and app state
API Checks

Useful checks:

GET /health
GET /batches
GET /batches/:id
GET /batches/:id/trace
GET /blockchain/status
GET /blockchain/app-state
Notes
batch data is stored off-chain in api/data/batches.json
proof is anchored on Algorand
both batch proof and event proof are supported
the smart contract is intentionally small for version 1
the current deployed app ID in the latest project state is 1022
```
