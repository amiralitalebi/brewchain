# Project Specification

## Project title

Coffee Supply Chain Traceability Hybrid DApp using Algorand

## Project summary

Brewchain is a simple hybrid DApp developed for CN6035 coursework.  
The project focuses on coffee batch traceability using a clear and coursework-friendly architecture.

The system stores detailed batch data off-chain and anchors proof records on Algorand.  
This allows the project to demonstrate real blockchain interaction without making the whole application unnecessarily complex.

## Chosen approach

The chosen approach was to rebuild the original project into a simpler Hybrid DApp aligned with CN6035 module expectations.

The project was designed to:
- use a simple frontend
- use a Node.js and Express backend
- include an API gateway
- use Algorand for blockchain proof anchoring
- keep the smart contract very small
- prioritise clarity, functionality, and ease of demonstration

## Version 1 scope

Version 1 supports:
- create batch
- view all batches
- view one batch
- add supply chain event
- trace a batch timeline
- anchor proof on Algorand
- show proof transaction ID
- show app reference
- view live blockchain app state

## Core functionality

The system allows a user to:
- create a coffee batch
- record supply chain events for the batch
- retrieve stored batch information
- view the timeline of a batch
- anchor proof from the frontend
- inspect stored proof information
- view current smart contract state from Algorand

## Out of scope

The following features are intentionally out of scope for version 1:
- complex authentication
- advanced role system
- NFT or token marketplace features
- QR code integration
- maps
- analytics extras
- full on-chain batch storage
- anything not needed for a simple version 1 coursework build

## Architecture

The project uses the following structure:
- `frontend/`
- `api/`
- `gateway/`
- `smart-contract/`
- `docs/`

## Architecture explanation

### Frontend
A simple multi-page web interface for:
- creating batches
- viewing batches
- adding supply chain events
- tracing a batch
- viewing proof and blockchain state

### API
A Node.js and Express backend that handles:
- batch creation
- batch retrieval
- event creation
- trace generation
- proof anchoring requests
- blockchain status and app state lookup

### Gateway
A lightweight Express gateway that forwards frontend requests to the API.

### Smart contract
A very small Algorand smart contract used for proof anchoring support.

Current contract behaviour:
- stores `creator`
- stores `batch_count`
- accepts `create_batch` as a NoOp app call argument
- increments `batch_count` when called

### Storage model
- off-chain batch metadata is stored locally
- on-chain proof is anchored on Algorand

## Design intention

The design intentionally keeps the system simple and suitable for coursework assessment.

The main goal is not to build a large production platform, but to demonstrate:
- hybrid DApp architecture
- frontend and backend integration
- blockchain interaction
- use of a smart contract
- a clear and testable supply chain traceability flow

## Version 1 limitations

Version 1 is intentionally limited to keep the project focused and manageable.  
It does not attempt to solve every real-world supply chain problem.  
Instead, it provides a small but working prototype that demonstrates the main ideas clearly.