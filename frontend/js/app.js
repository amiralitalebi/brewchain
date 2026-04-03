const API_BASE_URL =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:3001"
    : `${window.location.protocol}//${window.location.hostname.replace("-8080", "-3000")}/api`;

const createBatchForm = document.getElementById("create-batch-form");
const addEventForm = document.getElementById("add-event-form");
const loadBatchesBtn = document.getElementById("load-batches-btn");
const traceBatchBtn = document.getElementById("trace-batch-btn");
const generateBatchIdBtn = document.getElementById("generate-batch-id-btn");
const anchorProofBtn = document.getElementById("anchor-proof-btn");

const createMessage = document.getElementById("create-message");
const eventMessage = document.getElementById("event-message");
const proofMessage = document.getElementById("proof-message");
const batchesList = document.getElementById("batches-list");
const traceEmpty = document.getElementById("trace-empty");
const traceResult = document.getElementById("trace-result");
const traceSummary = document.getElementById("trace-summary");
const timeline = document.getElementById("timeline");

const batchIdInput = document.getElementById("batchId");
const eventBatchIdInput = document.getElementById("eventBatchId");
const traceBatchIdInput = document.getElementById("traceBatchId");
const stageInput = document.getElementById("stage");
const locationInput = document.getElementById("location");
const descriptionInput = document.getElementById("description");

const state = {
  selectedBatchId: null
};

function showMessage(element, message, type = "success") {
  element.textContent = message;
  element.className = `message-box message-${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "message-box hidden";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function generateBatchId() {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const timePart =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  return `BATCH-${datePart}-${timePart}`;
}

function setDefaultBatchId() {
  batchIdInput.value = generateBatchId();
}

function getStagePreset(stage) {
  const presets = {
    Created: {
      location: "Origin Facility",
      description: "Batch created and registered in the supply chain system"
    },
    Harvested: {
      location: "Coffee Farm",
      description:
        "Coffee cherries harvested and prepared for primary processing"
    },
    Processed: {
      location: "Processing Station",
      description:
        "Beans processed and prepared for the next supply chain stage"
    },
    Roasted: {
      location: "London Roastery",
      description: "Beans roasted and prepared for packaging"
    },
    Packaged: {
      location: "London Packaging Hub",
      description: "Batch packed and labelled for shipment"
    },
    Shipped: {
      location: "Distribution Centre",
      description: "Batch dispatched to the next destination"
    },
    Delivered: {
      location: "Retail Destination",
      description: "Batch delivered successfully to final destination"
    }
  };

  return (
    presets[stage] || {
      location: "",
      description: ""
    }
  );
}

function applyStagePreset() {
  const preset = getStagePreset(stageInput.value);
  locationInput.value = preset.location;
  descriptionInput.value = preset.description;
}

function getStatusTone(status) {
  const tones = {
    Created: "Created",
    Harvested: "Harvested",
    Processed: "Processed",
    Roasted: "Roasted",
    Packaged: "Packaged",
    Shipped: "Shipped",
    Delivered: "Delivered"
  };

  return tones[status] || status;
}

function getProofData(proof = {}) {
  return {
    network: proof.network || "Algorand",
    proofStatus: proof.proofStatus || "pending",
    txId: proof.txId || null,
    appId: proof.appId || null,
    note: proof.note || "Proof not anchored yet",
    anchoredAt: proof.anchoredAt || null
  };
}

function getProofStatusLabel(proofStatus) {
  const labels = {
    pending: "Proof Pending",
    anchored: "Proof Anchored",
    failed: "Proof Failed"
  };

  return labels[proofStatus] || "Proof Pending";
}

async function selectBatch(batchId) {
  state.selectedBatchId = batchId;
  eventBatchIdInput.value = batchId;
  traceBatchIdInput.value = batchId;
  clearMessage(proofMessage);
  await loadBatches();
  await traceBatch(batchId);
}

function renderBatches(batches) {
  if (!batches.length) {
    batchesList.innerHTML = `<div class="empty-state">No batches found yet. Register a batch to start building the trace history.</div>`;
    return;
  }

  batchesList.innerHTML = batches
    .map((batch) => {
      const proof = getProofData(batch.proof);
      const proofText = getProofStatusLabel(proof.proofStatus);
      const selectedClass =
        batch.batchId === state.selectedBatchId ? " is-selected" : "";

      return `
        <article class="batch-card${selectedClass}" data-batch-id="${batch.batchId}" data-status="${batch.status.toLowerCase()}">
          <div class="batch-card-head">
            <h3>${batch.batchId}</h3>
            <span class="status-badge" data-status="${batch.status.toLowerCase()}">${getStatusTone(batch.status)}</span>
          </div>

          <div class="card-tags">
            <span class="origin-badge" data-origin="${batch.origin.toLowerCase()}">${batch.origin}</span>
            <span class="type-badge" data-type="${batch.coffeeType.toLowerCase()}">${batch.coffeeType}</span>
            <span class="proof-badge" data-proof="${proof.proofStatus}">${proofText}</span>
          </div>

          <div class="meta-row"><strong>Coffee Type:</strong> ${batch.coffeeType}</div>
          <div class="meta-row"><strong>Created:</strong> ${formatDate(batch.createdAt)}</div>
          <div class="meta-row"><strong>Network:</strong> ${proof.network}</div>
          <div class="meta-row"><strong>Event Count:</strong> ${batch.events.length}</div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".batch-card").forEach((card) => {
    card.addEventListener("click", async () => {
      const batchId = card.dataset.batchId;
      await selectBatch(batchId);
    });
  });
}

async function renderTrace(data) {
  traceEmpty.classList.add("hidden");
  traceResult.classList.remove("hidden");

  const proof = getProofData(data.proof);
  const proofTxId = proof.txId || "Not anchored yet";
  const proofAppId = proof.appId || "Not anchored yet";
  const proofStatus = getProofStatusLabel(proof.proofStatus);
  const anchoredAt = proof.anchoredAt
    ? formatDate(proof.anchoredAt)
    : "Not anchored yet";

  let blockchainState = {
    appId: proof.appId || "Not available",
    batchCount: "Not available",
    eventAnchorCount: "Not available",
    creator: "Not available"
  };

  try {
    const response = await fetch(`${API_BASE_URL}/blockchain/app-state`);
    const appStateData = await response.json();

    if (response.ok) {
      blockchainState = {
        appId: appStateData.appId ?? proof.appId ?? "Not available",
        batchCount: appStateData.globalState?.batch_count ?? "Not available",
        eventAnchorCount:
          appStateData.globalState?.event_anchor_count ?? "Not available",
        creator: appStateData.globalState?.creator ?? "Not available"
      };
    }
  } catch (error) {
    console.error("Failed to load blockchain app state", error);
  }

  traceSummary.innerHTML = `
    <div class="trace-card">
      <span>Batch ID</span>
      <strong>${data.batchId}</strong>
    </div>
    <div class="trace-card trace-card-colored" data-type="${data.coffeeType.toLowerCase()}">
      <span>Coffee Type</span>
      <strong>${data.coffeeType}</strong>
    </div>
    <div class="trace-card trace-card-colored" data-origin="${data.origin.toLowerCase()}">
      <span>Origin</span>
      <strong>${data.origin}</strong>
    </div>
    <div class="trace-card trace-card-colored" data-status="${data.currentStatus.toLowerCase()}">
      <span>Current Status</span>
      <strong>${data.currentStatus}</strong>
    </div>
    <div class="trace-card">
      <span>Network</span>
      <strong>${proof.network}</strong>
    </div>
    <div class="trace-card trace-card-colored" data-proof="${proof.proofStatus}">
      <span>Proof Status</span>
      <strong>${proofStatus}</strong>
    </div>
    <div class="trace-card">
      <span>Transaction ID</span>
      <strong>${proofTxId}</strong>
    </div>
    <div class="trace-card">
      <span>App Reference</span>
      <strong>${proofAppId}</strong>
    </div>
    <div class="trace-card">
      <span>Anchored At</span>
      <strong>${anchoredAt}</strong>
    </div>
    <div class="trace-card">
      <span>Proof Note</span>
      <strong>${proof.note}</strong>
    </div>
    <div class="trace-card">
      <span>Contract App ID</span>
      <strong>${blockchainState.appId}</strong>
    </div>
    <div class="trace-card">
      <span>Contract Batch Count</span>
      <strong>${blockchainState.batchCount}</strong>
    </div>
    <div class="trace-card">
      <span>Contract Event Anchor Count</span>
      <strong>${blockchainState.eventAnchorCount}</strong>
    </div>
    <div class="trace-card">
      <span>Contract Creator</span>
      <strong>${blockchainState.creator}</strong>
    </div>
  `;

  if (!data.timeline.length) {
    timeline.innerHTML = `<div class="empty-state">No timeline events found for this batch yet.</div>`;
    return;
  }

  timeline.innerHTML = data.timeline
    .map((event) => {
      const eventProof = event.blockchainProof;
      const proofHtml = eventProof
        ? `
          <div class="event-proof">
            <p><strong>Blockchain Proof:</strong></p>
            <p><strong>Tx ID:</strong> ${eventProof.txId ?? "N/A"}</p>
            <p><strong>App ID:</strong> ${eventProof.appId ?? "N/A"}</p>
            <p><strong>Method:</strong> ${eventProof.method ?? "N/A"}</p>
          </div>
        `
        : "";

      return `
        <article class="timeline-item" data-status="${event.stage.toLowerCase()}">
          <div class="timeline-item-inner">
            <div class="timeline-topline">
              <h4>${event.stage}</h4>
              <span class="timeline-stage-tag" data-status="${event.stage.toLowerCase()}">${event.stage}</span>
            </div>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <p><strong>Timestamp:</strong> ${formatDate(event.timestamp)}</p>
            <p><strong>Event ID:</strong> ${event.eventId}</p>
            ${proofHtml}
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadBatches() {
  try {
    const response = await fetch(`${API_BASE_URL}/batches`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load batches");
    }

    renderBatches(data);
  } catch (error) {
    batchesList.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
}

async function traceBatch(batchId) {
  if (!batchId) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/batches/${batchId}/trace`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to trace batch");
    }

    await renderTrace(data);
  } catch (error) {
    traceEmpty.classList.remove("hidden");
    traceResult.classList.add("hidden");
    traceEmpty.innerHTML = `<div class="te-glyph">◎</div><p>${error.message}</p>`;
  }
}

async function anchorProof(batchId) {
  if (!batchId) {
    showMessage(proofMessage, "Select a batch first.", "error");
    return;
  }

  clearMessage(proofMessage);

  try {
    const response = await fetch(
      `${API_BASE_URL}/batches/${batchId}/anchor-proof`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to anchor proof");
    }

    showMessage(proofMessage, `Proof updated for batch ${batchId}.`, "success");

    await loadBatches();
    traceBatchIdInput.value = batchId;
    await traceBatch(batchId);
  } catch (error) {
    showMessage(proofMessage, error.message, "error");
  }
}

generateBatchIdBtn.addEventListener("click", () => {
  setDefaultBatchId();
});

stageInput.addEventListener("change", applyStagePreset);

createBatchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(createMessage);

  try {
    const payload = {
      batchId: batchIdInput.value.trim(),
      coffeeType: document.getElementById("coffeeType").value,
      origin: document.getElementById("origin").value,
      status: document.getElementById("status").value
    };

    const response = await fetch(`${API_BASE_URL}/batches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create batch");
    }

    showMessage(
      createMessage,
      `Batch ${data.batchId} created successfully.`,
      "success"
    );

    createBatchForm.reset();
    document.getElementById("coffeeType").value = "Arabica";
    document.getElementById("origin").value = "Colombia";
    document.getElementById("status").value = "Created";
    setDefaultBatchId();

    await selectBatch(data.batchId);
  } catch (error) {
    showMessage(createMessage, error.message, "error");
  }
});

addEventForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(eventMessage);

  try {
    const batchId = eventBatchIdInput.value.trim();

    const payload = {
      stage: stageInput.value,
      location: locationInput.value.trim(),
      description: descriptionInput.value.trim()
    };

    const response = await fetch(`${API_BASE_URL}/batches/${batchId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add event");
    }

    showMessage(
      eventMessage,
      `Event added to batch ${batchId} successfully.`,
      "success"
    );

    await selectBatch(batchId);
  } catch (error) {
    showMessage(eventMessage, error.message, "error");
  }
});

loadBatchesBtn.addEventListener("click", async () => {
  await loadBatches();
});

if (traceBatchBtn) {
  traceBatchBtn.addEventListener("click", async () => {
    const batchId = traceBatchIdInput.value.trim();
    if (!batchId) return;
    await selectBatch(batchId);
  });
}

anchorProofBtn.addEventListener("click", async () => {
  const batchId = traceBatchIdInput.value.trim();
  await anchorProof(batchId);
});

setDefaultBatchId();
applyStagePreset();
loadBatches();
