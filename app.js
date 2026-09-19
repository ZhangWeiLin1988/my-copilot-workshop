const STORAGE_KEY = "todos";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const emptyState = document.getElementById("emptyState");

let todos = loadTodos();

// 初始化畫面
render();

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

function updateFooter() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `未完成:${remaining} 項`;
}

function updateEmptyState() {
  emptyState.style.display = todos.length === 0 ? "block" : "none";
}

function render() {
  todoList.innerHTML = "";

  todos.forEach((todo) => {
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
  updateEmptyState();
}
