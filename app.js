class Task {
  constructor(text, urgent, important) {
    this.id = Date.now();
    this.text = text;
    this.urgent = urgent;
    this.important = important;
    this.createdAt = new Date();
  }
}

let tasks = [];
let installPrompt = null;

// LocalStorage operations
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem('tasks');
  tasks = stored ? JSON.parse(stored) : [];
  renderTasks();
}

// DOM manipulation
function renderTasks() {
  document.querySelectorAll('.tasks').forEach(container => {
    container.innerHTML = '';
    const quadrantId = container.parentElement.id;
    
    tasks.filter(task => {
      if (quadrantId === 'urgent-important') return task.urgent && task.important;
      if (quadrantId === 'not-urgent-important') return !task.urgent && task.important;
      if (quadrantId === 'urgent-not-important') return task.urgent && !task.important;
      return !task.urgent && !task.important;
    }).forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'task';
      taskEl.draggable = true;
      taskEl.innerHTML = `
        <span>${task.text}</span>
        <button onclick="deleteTask(${task.id})">×</button>
      `;
      taskEl.dataset.taskId = task.id;
      taskEl.dataset.quadrant = quadrantId;
      taskEl.addEventListener('dragstart', onDragStart);
      container.appendChild(taskEl);
    });
  });
}

// Drag and Drop handlers
function onDragStart(event) {
  event.dataTransfer.setData('text/plain', JSON.stringify({
    taskId: event.target.dataset.taskId,
    fromQuadrant: event.target.dataset.quadrant
  }));
}

function onDragOver(event) {
  event.preventDefault();
}

function onDrop(event) {
  event.preventDefault();
  const data = JSON.parse(event.dataTransfer.getData('text/plain'));
  const task = tasks.find(t => t.id == data.taskId);
  
  const toQuadrant = event.target.closest('.quadrant').id;
  task.urgent = toQuadrant.includes('urgent');
  task.important = toQuadrant.includes('important');
  
  saveTasks();
  renderTasks();
}

// Task management
function showTaskForm() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>New Task</h3>
      <textarea id="taskText" placeholder="Task description"></textarea>
      <div class="priority">
        <label>
          <input type="checkbox" id="urgent"> Urgent
        </label>
        <label>
          <input type="checkbox" id="important"> Important
        </label>
      </div>
      <button onclick="addTask()">Add Task</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function addTask() {
  const text = document.getElementById('taskText').value;
  const urgent = document.getElementById('urgent').checked;
  const important = document.getElementById('important').checked;
  
  if (text) {
    tasks.push(new Task(text, urgent, important));
    saveTasks();
    renderTasks();
    document.querySelector('.modal').remove();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// PWA installation
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
});

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  
  window.addEventListener('beforeunload', () => {
    saveTasks();
  });
});