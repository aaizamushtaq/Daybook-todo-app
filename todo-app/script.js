// Daybook — To-Do List logic
// Tasks are persisted to localStorage so they survive a page refresh.

const STORAGE_KEY = "daybook.tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const prioritySelect = document.getElementById("task-priority");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const filtersEl = document.getElementById("filters");
const clearCompletedBtn = document.getElementById("clear-completed");
const taskCountEl = document.getElementById("task-count");

let tasks = loadTasks();
let currentFilter = "all";

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

function addTask(text, priority) {
  tasks.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: text.trim(),
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
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
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
      <span class="task__text"></span>
      <button type="button" class="task__delete" aria-label="Delete task">&times;</button>
    `;

    // Set text via textContent to avoid HTML injection from user input.
    li.querySelector(".task__text").textContent = task.text;

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
  addTask(text, prioritySelect.value);
  input.value = "";
  input.focus();
});

list.addEventListener("click", (e) => {
  const item = e.target.closest(".task");
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains("task__checkbox")) {
    toggleTask(id);
  } else if (e.target.classList.contains("task__delete")) {
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

clearCompletedBtn.addEventListener("click", clearCompleted);

render();
