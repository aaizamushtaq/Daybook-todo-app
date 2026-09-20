// Aaiza's To-Do List — logic
// Tasks are persisted to localStorage so they survive a page refresh.

const STORAGE_KEY = "daybook.tasks";
const RING_CIRCUMFERENCE = 2 * Math.PI * 36; // matches the SVG circle r=36

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const descriptionInput = document.getElementById("task-description");
const priorityGroup = document.getElementById("priority-group");
const searchInput = document.getElementById("search-input");
const grid = document.getElementById("task-grid");
const emptyState = document.getElementById("empty-state");
const filtersEl = document.getElementById("filters");
const clearCompletedBtn = document.getElementById("clear-completed");
const taskCountEl = document.getElementById("task-count");
const formHeading = document.getElementById("form-heading");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");
const editingIdField = document.getElementById("editing-id");

const ringProgress = document.getElementById("ring-progress");
const ringDone = document.getElementById("ring-done");
const ringTotal = document.getElementById("ring-total");

const countLowEl = document.getElementById("count-low");
const countMediumEl = document.getElementById("count-medium");
const countHighEl = document.getElementById("count-high");

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";
let selectedPriority = "medium";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read saved tasks:", err);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Could not save tasks:", err);
  }
}

function addTask(text, description, priority) {
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text.trim(),
    description: description.trim(),
    priority,
    completed: false,
    createdAt: Date.now(),
  });
  saveTasks();
  render();
}

function updateTask(id, text, description, priority) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.text = text.trim();
  task.description = description.trim();
  task.priority = priority;
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  if (editingIdField.value === id) exitEditMode();
  render();
}

function clearCompleted() {
  const removingCurrentEdit = tasks.some(
    (t) => t.completed && t.id === editingIdField.value
  );
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  if (removingCurrentEdit) exitEditMode();
  render();
}

function getFilteredTasks() {
  let result = tasks;

  if (currentFilter === "active") result = result.filter((t) => !t.completed);
  if (currentFilter === "completed") result = result.filter((t) => t.completed);

  if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.text.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  return result;
}

function setSelectedPriority(priority) {
  selectedPriority = priority;
  document.querySelectorAll(".dot-option").forEach((b) => {
    b.classList.toggle("is-selected", b.dataset.priority === priority);
  });
}

function enterEditMode(task) {
  editingIdField.value = task.id;
  input.value = task.text;
  descriptionInput.value = task.description || "";
  setSelectedPriority(task.priority);
  formHeading.textContent = "Edit task";
  submitBtn.textContent = "Save changes";
  cancelEditBtn.hidden = false;
  input.focus();
}

function exitEditMode() {
  editingIdField.value = "";
  formHeading.textContent = "New task";
  submitBtn.textContent = "Add task";
  cancelEditBtn.hidden = true;
  form.reset();
  setSelectedPriority("medium");
}

function renderStats() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const ratio = total === 0 ? 0 : done / total;

  ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
  ringDone.textContent = done;
  ringTotal.textContent = total;

  countLowEl.textContent = tasks.filter((t) => t.priority === "low").length;
  countMediumEl.textContent = tasks.filter((t) => t.priority === "medium").length;
  countHighEl.textContent = tasks.filter((t) => t.priority === "high").length;
}

function priorityLabel(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function render() {
  const filtered = getFilteredTasks();
  grid.innerHTML = "";

  filtered.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card" + (task.completed ? " is-completed" : "");
    card.dataset.priority = task.priority;
    card.dataset.id = task.id;

    card.innerHTML = `
      <div class="task-card__top">
        <input type="checkbox" class="task-card__check" ${task.completed ? "checked" : ""} aria-label="Mark task complete" />
        <span class="priority-pill"></span>
      </div>
      <h3 class="task-card__title"></h3>
      ${task.description ? '<p class="task-card__desc"></p>' : ""}
      <div class="task-card__footer">
        <span class="task-card__date"></span>
        <div class="task-card__actions">
          <button type="button" class="chip-btn chip-btn--edit">Edit</button>
          <button type="button" class="chip-btn chip-btn--delete">Delete</button>
        </div>
      </div>
    `;

    // Set text via textContent to avoid HTML injection from user input.
    card.querySelector(".priority-pill").textContent = priorityLabel(task.priority);
    card.querySelector(".task-card__title").textContent = task.text;
    if (task.description) {
      card.querySelector(".task-card__desc").textContent = task.description;
    }
    card.querySelector(".task-card__date").textContent = dateFormatter.format(
      new Date(task.createdAt || Date.now())
    );

    grid.appendChild(card);
  });

  emptyState.hidden = filtered.length !== 0;

  const remaining = tasks.filter((t) => !t.completed).length;
  taskCountEl.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left · ${tasks.length} total`;

  renderStats();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  const editingId = editingIdField.value;
  if (editingId) {
    updateTask(editingId, text, descriptionInput.value, selectedPriority);
    exitEditMode();
  } else {
    addTask(text, descriptionInput.value, selectedPriority);
    input.value = "";
    descriptionInput.value = "";
    input.focus();
  }
});

// Ctrl+Enter (or Cmd+Enter) anywhere in the form submits quickly.
form.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    form.requestSubmit();
  }
});

cancelEditBtn.addEventListener("click", exitEditMode);

priorityGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".dot-option");
  if (!btn) return;
  setSelectedPriority(btn.dataset.priority);
});

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;
  const id = card.dataset.id;
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  if (e.target.classList.contains("task-card__check")) {
    toggleTask(id);
  } else if (e.target.closest(".chip-btn--delete")) {
    deleteTask(id);
  } else if (e.target.closest(".chip-btn--edit")) {
    enterEditMode(task);
  }
});

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filters__btn");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  document
    .querySelectorAll(".filters__btn")
    .forEach((b) => b.classList.toggle("is-active", b === btn));
  render();
});

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

render();
