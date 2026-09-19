const STORAGE_KEY = "todos";
const THEME_KEY = "themePreference";
const DEFAULT_FILTER = "all";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = document.querySelector(".theme-toggle-icon");
const themeToggleText = document.querySelector(".theme-toggle-text");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = DEFAULT_FILTER;
let themePreference = loadThemePreference();

// 初始化主題與畫面
initializeApp();

// 處理新增待辦事項
todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (!text) {
    return;
  }

  todos.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  saveTodos();
  render();
  todoInput.value = "";
  todoInput.focus();
});

// 處理主題切換
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    themePreference = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}

// 處理篩選按鈕點擊
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

function initializeApp() {
  applyTheme(themePreference);
  bindSystemColorSchemeListener();
  render();
}

function bindSystemColorSchemeListener() {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", (event) => {
      if (themePreference === "system") {
        applyTheme("system");
      }
    });
  }
}

function loadTodos() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "system";
}

function getResolvedTheme(preference) {
  if (preference === "light" || preference === "dark") {
    return preference;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference) {
  const resolvedTheme = getResolvedTheme(preference);
  document.body.dataset.theme = resolvedTheme;

  const isDark = resolvedTheme === "dark";
  themeToggleIcon.textContent = isDark ? "☀️" : "🌙";
  themeToggleText.textContent = isDark ? "淺色模式" : "深色模式";
  themeToggle.setAttribute("aria-label", isDark ? "切換至淺色模式" : "切換至深色模式");
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function updateFooter() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `未完成:${remaining} 項`;
}

function updateEmptyState(filteredTodos) {
  if (filteredTodos.length > 0) {
    emptyState.style.display = "none";
    return;
  }

  const emptyMessages = {
    all: "還沒有任何待辦事項,新增一個吧!",
    active: "目前沒有未完成的事項。這不是刪除，請切換到「全部」查看所有待辦。",
    completed: "目前沒有已完成的事項。這不是刪除，請切換到「全部」或「未完成」查看其他待辦。",
  };

  emptyState.textContent = emptyMessages[currentFilter] || emptyMessages.all;
  emptyState.style.display = "block";
}

function renderFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function render() {
  const filteredTodos = getFilteredTodos();
  todoList.innerHTML = "";

  filteredTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.completed) {
      item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `完成 ${todo.text}`);
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "刪除";
    deleteBtn.setAttribute("aria-label", `刪除 ${todo.text}`);
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    item.appendChild(checkbox);
    item.appendChild(text);
    item.appendChild(deleteBtn);

    todoList.appendChild(item);
  });

  updateFooter();
  updateEmptyState(filteredTodos);
  renderFilterButtons();
}
