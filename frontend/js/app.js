const API_BASE_URL = "http://localhost:3000/api";

const createBatchForm = document.getElementById("create-batch-form");
const addEventForm = document.getElementById("add-event-form");
const loadBatchesBtn = document.getElementById("load-batches-btn");
const traceBatchBtn = document.getElementById("trace-batch-btn");
const generateBatchIdBtn = document.getElementById("generate-batch-id-btn");

const createMessage = document.getElementById("create-message");
const eventMessage = document.getElementById("event-message");
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
      description: "Coffee cherries harvested and prepared for primary processing"
    },
    Processed: {
      location: "Processing Station",
      description: "Beans processed and prepared for the next supply chain stage"
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

  return presets[stage] || {
    location: "",
    description: ""
  };
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
    note: proof.note || "Proof not anchored yet"
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

function renderBatches(batches) {
  if (!batches.length) {
    batchesList.innerHTML = `<div class="empty-state">No batches found yet. Register a batch to start building the trace history.</div>`;
    return;
  }

  batchesList.innerHTML = batches
    .map((batch) => {
      const proof = getProofData(batch.proof);
      const proofText = getProofStatusLabel(proof.proofStatus);

      return `
        <article class="batch-card" data-batch-id="${batch.batchId}">
          <div class="batch-card-head">
            <h3>${batch.batchId}</h3>
            <span class="status-badge">${getStatusTone(batch.status)}</span>
          </div>

          <div class="card-tags">
            <span class="origin-badge">${batch.origin}</span>
            <span class="proof-badge">${proofText}</span>
          </div>

          <div class="meta-row"><strong>Coffee Type:</strong> ${batch.coffeeType}</div>
          <div class="meta-row"><strong>Created:</strong> ${formatDate(batch.createdAt)}</div>
          <div class="meta-row"><strong>Network:</strong> ${proof.network}</div>
          <div class="meta-row"><strong>Event Count:</strong> ${batch.events.length}</div>

          <div class="card-actions">
            <button type="button" class="card-action-btn trace-btn" data-batch-id="${batch.batchId}">
              Trace
            </button>
            <button type="button" class="card-action-btn use-btn" data-batch-id="${batch.batchId}">
              Use in Event Form
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".trace-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const batchId = button.dataset.batchId;
      traceBatchIdInput.value = batchId;
      traceBatch(batchId);
    });
  });

  document.querySelectorAll(".use-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const batchId = button.dataset.batchId;
      eventBatchIdInput.value = batchId;
    });
  });

  document.querySelectorAll(".batch-card").forEach((card) => {
    card.addEventListener("click", () => {
      const batchId = card.dataset.batchId;
      eventBatchIdInput.value = batchId;
      traceBatchIdInput.value = batchId;
      traceBatch(batchId);
    });
  });
}

function renderTrace(data) {
  traceEmpty.classList.add("hidden");
  traceResult.classList.remove("hidden");

  const proof = getProofData(data.proof);
  const proofTxId = proof.txId || "Not anchored yet";
  const proofAppId = proof.appId || "Not anchored yet";
  const proofStatus = getProofStatusLabel(proof.proofStatus);

  traceSummary.innerHTML = `
    <div class="trace-card">
      <span>Batch ID</span>
      <strong>${data.batchId}</strong>
    </div>
    <div class="trace-card">
      <span>Coffee Type</span>
      <strong>${data.coffeeType}</strong>
    </div>
    <div class="trace-card">
      <span>Origin</span>
      <strong>${data.origin}</strong>
    </div>
    <div class="trace-card">
      <span>Current Status</span>
      <strong>${data.currentStatus}</strong>
    </div>
    <div class="trace-card">
      <span>Network</span>
      <strong>${proof.network}</strong>
    </div>
    <div class="trace-card">
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
      <span>Proof Note</span>
      <strong>${proof.note}</strong>
    </div>
  `;

  if (!data.timeline.length) {
    timeline.innerHTML = `<div class="empty-state">No timeline events found for this batch yet.</div>`;
    return;
  }

  timeline.innerHTML = data.timeline
    .map(
      (event) => `
        <article class="timeline-item">
          <div class="timeline-item-inner">
            <div class="timeline-topline">
              <h4>${event.stage}</h4>
              <span class="timeline-stage-tag">${event.stage}</span>
            </div>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description}</p>
            <p><strong>Timestamp:</strong> ${formatDate(event.timestamp)}</p>
            <p><strong>Event ID:</strong> ${event.eventId}</p>
          </div>
        </article>
      `
    )
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

    renderTrace(data);
  } catch (error) {
    traceEmpty.classList.remove("hidden");
    traceResult.classList.add("hidden");
    traceEmpty.textContent = error.message;
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

    showMessage(createMessage, `Batch ${data.batchId} created successfully.`, "success");

    createBatchForm.reset();
    document.getElementById("coffeeType").value = "Arabica";
    document.getElementById("origin").value = "Colombia";
    document.getElementById("status").value = "Created";
    setDefaultBatchId();

    await loadBatches();

    traceBatchIdInput.value = data.batchId;
    eventBatchIdInput.value = data.batchId;
    await traceBatch(data.batchId);
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

    showMessage(eventMessage, `Event added to batch ${batchId} successfully.`, "success");

    await loadBatches();

    traceBatchIdInput.value = batchId;
    await traceBatch(batchId);
  } catch (error) {
    showMessage(eventMessage, error.message, "error");
  }
});

loadBatchesBtn.addEventListener("click", async () => {
  await loadBatches();
});

traceBatchBtn.addEventListener("click", async () => {
  const batchId = traceBatchIdInput.value.trim();
  await traceBatch(batchId);
});

setDefaultBatchId();
applyStagePreset();
loadBatches();