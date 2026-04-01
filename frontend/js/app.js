const API_BASE_URL = "http://localhost:3000/api";

const createBatchForm = document.getElementById("create-batch-form");
const addEventForm = document.getElementById("add-event-form");
const loadBatchesBtn = document.getElementById("load-batches-btn");
const traceBatchBtn = document.getElementById("trace-batch-btn");

const batchesOutput = document.getElementById("batches-output");
const traceOutput = document.getElementById("trace-output");

createBatchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    batchId: document.getElementById("batchId").value,
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
  batchesOutput.textContent = JSON.stringify(data, null, 2);
});

addEventForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const batchId = document.getElementById("eventBatchId").value;

  const payload = {
    stage: document.getElementById("stage").value,
    location: document.getElementById("location").value,
    description: document.getElementById("description").value
  };

  const response = await fetch(`${API_BASE_URL}/batches/${batchId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  traceOutput.textContent = JSON.stringify(data, null, 2);
});

loadBatchesBtn.addEventListener("click", async () => {
  const response = await fetch(`${API_BASE_URL}/batches`);
  const data = await response.json();
  batchesOutput.textContent = JSON.stringify(data, null, 2);
});

traceBatchBtn.addEventListener("click", async () => {
  const batchId = document.getElementById("traceBatchId").value;

  const response = await fetch(`${API_BASE_URL}/batches/${batchId}/trace`);
  const data = await response.json();
  traceOutput.textContent = JSON.stringify(data, null, 2);
});