# Setup Guide

## Overview

This guide explains how to run the Brewchain project locally for development and testing.

The project includes:
- frontend
- API
- gateway
- Algorand LocalNet
- smart contract support

## Project structure

Main folders:
- `frontend/`
- `api/`
- `gateway/`
- `smart-contract/`
- `docs/`

## Requirements

Before starting, make sure the following are installed:
- Git
- Node.js and npm
- Python 3
- Algorand LocalNet tools used by the project

## Clone the repository

```bash
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
Environment files

Create environment files where needed.

API

Create:

api/.env

Use your local working configuration for:

API port
Algorand node address
Algorand token
Algorand mnemonic
deployed app ID
Gateway

Create:

gateway/.env

Use the example file as a starting point.

Startup scripts

The project includes two helper scripts in the root folder:

start-all.sh
stop-all.sh
start-all.sh

This script starts the main local services for the project, including:

Algorand LocalNet
API
Gateway
frontend static server

It is the easiest way to launch the full system for testing.

Run:

./start-all.sh
stop-all.sh

This script stops the local services started for the project.

Run:

./stop-all.sh
Start the system

From the project root, run:

./start-all.sh

This starts:

Algorand LocalNet
API
Gateway
frontend static server
Stop the system

From the project root, run:

./stop-all.sh
Frontend run mode

The frontend is served from the frontend/ folder using:

python3 -m http.server 8080
Main local flow

After starting the system, test the project in this order:

open the frontend
create a batch
view all batches
open one batch
add a supply chain event
open the trace view
anchor proof on Algorand
confirm proof details and app state
API checks

Useful checks include:

GET /health
GET /batches
GET /blockchain/status
GET /blockchain/app-state
Notes
detailed batch data is stored off-chain in api/data/batches.json
proof is anchored on Algorand
the smart contract is intentionally very small for version 1
the project is designed to stay simple and coursework-friendly