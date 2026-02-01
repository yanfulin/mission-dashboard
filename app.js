// Dashboard App
let dashboardData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadData();
});

// Load data from JSON
async function loadData() {
  try {
    const response = await fetch('data.json?' + Date.now());
    dashboardData = await response.json();
    renderDashboard();
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

// Refresh data
function refreshData() {
  loadData();
}

// Render entire dashboard
function renderDashboard() {
  if (!dashboardData) return;
  
  updateStats();
  renderPendingTasks();
  renderAwaitingInput();
  renderActiveProjects();
  renderScheduledJobs();
  renderCompletedTasks();
  renderNotes();
  updateLastUpdated();
}

// Update stats
function updateStats() {
  document.getElementById('statPending').textContent = dashboardData.pendingTasks.length;
  document.getElementById('statQuestions').textContent = dashboardData.awaitingInput.length;
  document.getElementById('statProjects').textContent = dashboardData.activeProjects.filter(p => p.status === 'active').length;
  document.getElementById('statCompleted').textContent = dashboardData.completedTasks.length;
}

// Render pending tasks
function renderPendingTasks() {
  const container = document.getElementById('pendingTasks');
  
  if (dashboardData.pendingTasks.length === 0) {
    container.innerHTML = '<p class="empty-state">No pending tasks 🎉</p>';
    return;
  }
  
  container.innerHTML = dashboardData.pendingTasks.map(task => `
    <div class="task-item" data-id="${task.id}">
      <div class="task-checkbox" onclick="completeTask(${task.id})" title="Mark as complete"></div>
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.task)}</div>
        <div class="task-meta">
          <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
          <span>${task.created}</span>
          <span class="status-badge status-${task.status}">${task.status}</span>
        </div>
        ${task.notes ? `<div class="task-notes">📝 ${escapeHtml(task.notes)}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// Render awaiting input
function renderAwaitingInput() {
  const container = document.getElementById('awaitingInput');
  
  if (dashboardData.awaitingInput.length === 0) {
    container.innerHTML = '<p class="empty-state">No pending questions</p>';
    return;
  }
  
  container.innerHTML = dashboardData.awaitingInput.map(q => `
    <div class="question-item">
      <div class="question-text">${escapeHtml(q.question)}</div>
      <div class="question-context">${escapeHtml(q.context)}</div>
      <div class="question-meta">Asked: ${q.asked}</div>
    </div>
  `).join('');
}

// Render active projects
function renderActiveProjects() {
  const container = document.getElementById('activeProjects');
  
  if (dashboardData.activeProjects.length === 0) {
    container.innerHTML = '<p class="empty-state">No active projects</p>';
    return;
  }
  
  container.innerHTML = dashboardData.activeProjects.map(project => `
    <div class="project-item">
      <div class="project-header">
        <span class="project-name">${escapeHtml(project.name)}</span>
        <span class="status-badge status-${project.status}">${project.status}</span>
      </div>
      <div class="project-description">${escapeHtml(project.description)}</div>
      <div class="project-meta">
        Started: ${project.started} • Next: ${project.nextMilestone}
      </div>
    </div>
  `).join('');
}

// Render scheduled jobs
function renderScheduledJobs() {
  const container = document.getElementById('scheduledJobs');
  
  if (dashboardData.scheduledJobs.length === 0) {
    container.innerHTML = '<p class="empty-state">No scheduled jobs</p>';
    return;
  }
  
  container.innerHTML = dashboardData.scheduledJobs.map(job => `
    <div class="job-item">
      <div class="job-info">
        <div class="job-name">${escapeHtml(job.job)}</div>
        <div class="job-schedule">📅 ${job.schedule} • ${escapeHtml(job.description)}</div>
      </div>
      <div class="job-next">
        <div class="job-next-label">Next Run</div>
        <div class="job-next-date">${job.nextRun}</div>
      </div>
    </div>
  `).join('');
}

// Render completed tasks
function renderCompletedTasks() {
  const container = document.getElementById('completedTasks');
  
  if (dashboardData.completedTasks.length === 0) {
    container.innerHTML = '<p class="empty-state">No completed tasks</p>';
    return;
  }
  
  container.innerHTML = dashboardData.completedTasks.map(task => `
    <div class="completed-item">
      <span class="completed-check">✓</span>
      <span class="completed-title">${escapeHtml(task.task)}</span>
      <span class="completed-date">${task.completed}</span>
    </div>
  `).join('');
}

// Render notes
function renderNotes() {
  const container = document.getElementById('notes');
  
  if (dashboardData.notes.length === 0) {
    container.innerHTML = '<p class="empty-state">No notes</p>';
    return;
  }
  
  container.innerHTML = dashboardData.notes.map(note => `
    <div class="note-item">
      <div class="note-date">${note.date}</div>
      <div class="note-content">${escapeHtml(note.content)}</div>
    </div>
  `).join('');
}

// Update last updated timestamp
function updateLastUpdated() {
  const lastUpdated = new Date(dashboardData.lastUpdated);
  document.getElementById('lastUpdated').textContent = 
    `Last updated: ${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;
}

// Toggle completed section
function toggleCompleted() {
  const content = document.getElementById('completedTasks');
  const toggle = document.getElementById('completedToggle');
  
  content.classList.toggle('collapsed');
  toggle.style.transform = content.classList.contains('collapsed') ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Show add task modal
function showAddTask() {
  document.getElementById('addTaskModal').classList.add('active');
  document.getElementById('taskDescription').focus();
}

// Show add question modal
function showAddQuestion() {
  document.getElementById('addQuestionModal').classList.add('active');
  document.getElementById('questionText').focus();
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Add task
async function addTask(event) {
  event.preventDefault();
  
  const task = {
    id: Date.now(),
    task: document.getElementById('taskDescription').value,
    priority: document.getElementById('taskPriority').value,
    created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'pending',
    notes: document.getElementById('taskNotes').value
  };
  
  dashboardData.pendingTasks.push(task);
  dashboardData.lastUpdated = new Date().toISOString();
  
  await saveData();
  renderDashboard();
  closeModal('addTaskModal');
  document.getElementById('addTaskForm').reset();
}

// Add question
async function addQuestion(event) {
  event.preventDefault();
  
  const question = {
    id: Date.now(),
    question: document.getElementById('questionText').value,
    context: document.getElementById('questionContext').value,
    asked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'pending'
  };
  
  dashboardData.awaitingInput.push(question);
  dashboardData.lastUpdated = new Date().toISOString();
  
  await saveData();
  renderDashboard();
  closeModal('addQuestionModal');
  document.getElementById('addQuestionForm').reset();
}

// Complete task
async function completeTask(taskId) {
  const taskIndex = dashboardData.pendingTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return;
  
  const task = dashboardData.pendingTasks[taskIndex];
  
  // Move to completed
  dashboardData.completedTasks.unshift({
    id: task.id,
    task: task.task,
    completed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    notes: task.notes
  });
  
  // Remove from pending
  dashboardData.pendingTasks.splice(taskIndex, 1);
  dashboardData.lastUpdated = new Date().toISOString();
  
  await saveData();
  renderDashboard();
}

// Save data (sends to server or localStorage)
async function saveData() {
  // Save to localStorage as backup
  localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
  
  // Try to save to server
  try {
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dashboardData)
    });
  } catch (error) {
    console.log('Server save not available, using localStorage');
  }
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  }
});
