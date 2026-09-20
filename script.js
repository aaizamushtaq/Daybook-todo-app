// Aaiza's To-Do List — logic
// Tasks are persisted to localStorage so they survive a page refresh.

const STORAGE_KEY = "daybook.tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const descriptionInput = document.getElementById("task-description");
const priorityGroup = document.getElementById("priority-group");
const searchInput = document.getElementById("search-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const filtersEl = document.getElementById("filters");
const clearCompletedBtn = document.getElementById("clear-completed");
const taskCountEl = document.getElementById("task-count");

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";
let selectedPriority = "medium";

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
  });
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
  render();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
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

function render() {
  const filtered = getFilteredTasks();
  list.innerHTML = "";

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " is-completed" : "");
    li.dataset.priority = task.priority;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="task__checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task complete" />
      <div class="task__body">
        <span class="task__text"></span>
        ${task.description ? '<span class="task__description"></span>' : ""}
      </div>
      <button type="button" class="task__delete" aria-label="Delete task">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    `;

    // Set text via textContent to avoid HTML injection from user input.
    li.querySelector(".task__text").textContent = task.text;
    if (task.description) {
      li.querySelector(".task__description").textContent = task.description;
    }

    list.appendChild(li);
  });

  emptyState.hidden = filtered.length !== 0;

  const remaining = tasks.filter((t) => !t.completed).length;
  taskCountEl.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left · ${tasks.length} total`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text, descriptionInput.value, selectedPriority);
  input.value = "";
  descriptionInput.value = "";
  input.focus();
});

// Ctrl+Enter (or Cmd+Enter) anywhere in the form submits quickly.
form.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    form.requestSubmit();
  }
});

priorityGroup.addEventListener("click", (e) => {
  const btn = e.target.closest(".dot-option");
  if (!btn) return;
  selectedPriority = btn.dataset.priority;
  document
    .querySelectorAll(".dot-option")
    .forEach((b) => b.classList.toggle("is-selected", b === btn));
});

list.addEventListener("click", (e) => {
  const item = e.target.closest(".task");
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains("task__checkbox")) {
    toggleTask(id);
  } else if (e.target.closest(".task__delete")) {
    deleteTask(id);
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
