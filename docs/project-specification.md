# Project Specification

## Project Title

Coffee Supply Chain Traceability Hybrid DApp using Algorand

## Summary

Brewchain is a hybrid DApp for coffee batch traceability. It stores detailed batch data off-chain and anchors proof records on Algorand.

## Objective

The project is designed to provide a simple and clear implementation of a hybrid DApp for supply chain tracking. The focus is on batch creation, event recording, traceability, and blockchain proof anchoring.

## Scope

Version 1 includes:
- create batch
- view all batches
- view one batch
- add supply chain event
- trace batch timeline
- anchor proof on Algorand
- show proof transaction ID
- show app reference
- view live blockchain app state

## Out of Scope

The following are excluded from version 1:
- authentication
- advanced role management
- NFT or token marketplace features
- QR code integration
- maps
- analytics features
- full on-chain batch storage

## Architecture

The project structure is:
- `frontend/`
- `api/`
- `gateway/`
- `smart-contract/`
- `docs/`

### Frontend
A multi-page web interface for creating batches, viewing batches, adding events, tracing timelines, and viewing proof information.

### API
A Node.js and Express backend for batch handling, event handling, trace responses, proof anchoring, and blockchain state lookup.

### Gateway
An Express gateway that forwards frontend requests to the API.

### Smart Contract
A small Algorand smart contract used for proof anchoring support.

Current contract behaviour:
- stores `creator`
- stores `batch_count`
- accepts `create_batch` as a NoOp app call argument
- increments `batch_count` when called

### Storage Model
- off-chain batch metadata storage
- on-chain proof anchoring on Algorand

## Design Approach

The design keeps the system small and practical. It focuses on a clear hybrid DApp structure, straightforward traceability features, and simple blockchain integration.

## Limitations

Version 1 is intentionally minimal and does not aim to cover all real-world supply chain requirements. It provides a working prototype focused on the core functionality.