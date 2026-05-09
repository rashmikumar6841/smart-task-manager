/**
 * Main JavaScript for Smart Task Manager
 * Handles UI interactions, API calls, and WebSocket real-time updates
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Handling ---
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    function setTheme(theme) {
        htmlElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'bi bi-sun-fill';
                themeToggle.title = 'Switch to light mode';
            } else {
                themeIcon.className = 'bi bi-moon-fill';
                themeToggle.title = 'Switch to dark mode';
            }
        }
    }

    // --- Dashboard Logic (Only runs if on dashboard) ---
    const taskTableBody = document.getElementById('taskTableBody');
    if (!taskTableBody) return; // Exit if not on dashboard

    // State
    let tasks = [];
    let socket = null;
    let priorityChart = null;
    let trendChart = null;
    
    // Elements
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const taskForm = document.getElementById('taskForm');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const filterPriority = document.getElementById('filterPriority');
    const emptyState = document.getElementById('emptyState');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Initialize
    initDashboard();

    function initDashboard() {
        loadTasks();
        loadAnalytics();
        setupWebSockets();
        setupEventListeners();
    }

    // --- API Calls ---
    async function loadTasks() {
        showLoading(true);
        try {
            // Build query params based on filters
            const params = new URLSearchParams();
            if (filterStatus.value) params.append('status', filterStatus.value);
            if (filterPriority.value) params.append('priority', filterPriority.value);
            
            const response = await fetch(`/api/tasks?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            
            const data = await response.json();
            tasks = data.tasks;
            renderTasks();
        } catch (error) {
            showToast('Error', 'Failed to load tasks', 'danger');
            console.error(error);
        } finally {
            showLoading(false);
        }
    }

    async function loadAnalytics() {
        try {
            const response = await fetch('/api/analytics');
            if (!response.ok) throw new Error('Failed to fetch analytics');
            
            const data = await response.json();
            updateAnalyticsUI(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    async function saveTask() {
        const id = document.getElementById('taskId').value;
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            due_date: document.getElementById('taskDueDate').value
        };

        if (!taskData.title) {
            showToast('Error', 'Title is required', 'warning');
            return;
        }

        const url = id ? `/api/tasks/${id}` : '/api/tasks';
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) throw new Error('Failed to save task');
            
            taskModal.hide();
            // Note: UI updates are handled by WebSocket events
            if (method === 'POST') {
                showToast('Success', 'Task created successfully', 'success');
            }
        } catch (error) {
            showToast('Error', 'Failed to save task', 'danger');
            console.error(error);
        }
    }

    async function deleteTask() {
        const id = document.getElementById('deleteTaskId').value;
        
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete task');
            
            deleteModal.hide();
            // UI updates handled by WebSocket
            showToast('Success', 'Task deleted', 'info');
        } catch (error) {
            showToast('Error', 'Failed to delete task', 'danger');
            console.error(error);
        }
    }

    // --- UI Rendering ---
    function renderTasks() {
        const searchTerm = searchInput.value.toLowerCase();
        
        // Apply frontend search filter
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) || 
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );

        if (filteredTasks.length === 0) {
            taskTableBody.innerHTML = '';
            taskTableBody.parentElement.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        taskTableBody.parentElement.style.display = 'table';
        taskTableBody.innerHTML = '';

        filteredTasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-bold">${escapeHtml(task.title)}</div>
                    <div class="text-muted small text-truncate" style="max-width: 250px;">
                        ${escapeHtml(task.description || '')}
                    </div>
                </td>
                <td><span class="badge ${getStatusBadgeClass(task.status)}">${task.status}</span></td>
                <td><span class="badge ${getPriorityBadgeClass(task.priority)}">${task.priority}</span></td>
                <td class="${isOverdue(task.due_date, task.status) ? 'text-danger fw-bold' : 'text-muted small'}">
                    ${formatDate(task.due_date) || 'No date'}
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-info btn-action edit-btn" data-id="${task.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action delete-btn" data-id="${task.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            taskTableBody.appendChild(tr);
        });

        // Attach event listeners to new buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openDeleteModal(e.currentTarget.dataset.id));
        });
    }

    function updateAnalyticsUI(data) {
        document.getElementById('statTotal').textContent = data.total_tasks;
        document.getElementById('statCompleted').textContent = data.completed_tasks;
        document.getElementById('statPending').textContent = data.pending_tasks;
        
        const progSpan = document.getElementById('statProgress');
        const progBar = document.getElementById('progressBar');
        
        progSpan.textContent = data.completion_percentage;
        progBar.style.width = `${data.completion_percentage}%`;
        progBar.setAttribute('aria-valuenow', data.completion_percentage);
        
        // Change color based on progress
        progBar.className = 'progress-bar';
        if (data.completion_percentage >= 100) {
            progBar.classList.add('bg-success');
            progSpan.className = 'text-success';
        } else if (data.completion_percentage >= 50) {
            progBar.classList.add('bg-info');
            progSpan.className = 'text-info';
        } else {
            progBar.classList.add('bg-warning');
            progSpan.className = 'text-warning';
        }

        updateCharts(data);
    }

    function updateCharts(data) {
        // Priority Chart (Pie)
        const priorityCtx = document.getElementById('priorityChart').getContext('2d');
        const priorityLabels = Object.keys(data.priority_distribution);
        const priorityValues = Object.values(data.priority_distribution);

        if (priorityChart) priorityChart.destroy();
        priorityChart = new Chart(priorityCtx, {
            type: 'doughnut',
            data: {
                labels: priorityLabels,
                datasets: [{
                    data: priorityValues,
                    backgroundColor: ['#dc3545', '#0dcaf0', '#6c757d'],
                    borderWidth: 0
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom', labels: { color: '#adb5bd' } } }
            }
        });

        // Trend Chart (Line)
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        if (trendChart) trendChart.destroy();
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: data.trend_data.labels,
                datasets: [{
                    label: 'Tasks Created',
                    data: data.trend_data.values,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, grid: { color: '#343a40' }, ticks: { color: '#adb5bd', stepSize: 1 } },
                    x: { grid: { color: '#343a40' }, ticks: { color: '#adb5bd' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // --- WebSockets ---
    function setupWebSockets() {
        socket = io();

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socket.on('task_added', (task) => {
            // Only add if it matches current filters
            if (matchesFilters(task)) {
                tasks.unshift(task); // Add to beginning
                renderTasks();
            }
            loadAnalytics(); // Refresh analytics
        });

        socket.on('task_updated', (updatedTask) => {
            const index = tasks.findIndex(t => t.id === updatedTask.id);
            
            if (matchesFilters(updatedTask)) {
                if (index !== -1) {
                    tasks[index] = updatedTask;
                } else {
                    // Task now matches filters, add it
                    tasks.unshift(updatedTask);
                }
            } else if (index !== -1) {
                // Task no longer matches filters, remove it
                tasks.splice(index, 1);
            }
            
            renderTasks();
            loadAnalytics();
        });

        socket.on('task_deleted', (data) => {
            tasks = tasks.filter(t => t.id !== data.id);
            renderTasks();
            loadAnalytics();
        });

        socket.on('notification', (data) => {
            showToast('Notification', data.message, data.type || 'info');
        });
    }

    // --- Event Listeners & Helpers ---
    function setupEventListeners() {
        saveTaskBtn.addEventListener('click', saveTask);
        confirmDeleteBtn.addEventListener('click', deleteTask);
        
        // Debounce search input
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(renderTasks, 300);
        });

        // Filter changes trigger API reload
        filterStatus.addEventListener('change', loadTasks);
        filterPriority.addEventListener('change', loadTasks);

        // Reset modal on hide
        document.getElementById('taskModal').addEventListener('hidden.bs.modal', () => {
            taskForm.reset();
            document.getElementById('taskId').value = '';
            document.getElementById('taskModalLabel').textContent = 'Add Task';
        });
    }

    function openEditModal(taskId) {
        const task = tasks.find(t => t.id == taskId);
        if (!task) return;

        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskDueDate').value = task.due_date ? task.due_date.split('T')[0] : '';
        
        document.getElementById('taskModalLabel').textContent = 'Edit Task';
        taskModal.show();
    }

    function openDeleteModal(taskId) {
        document.getElementById('deleteTaskId').value = taskId;
        deleteModal.show();
    }

    function matchesFilters(task) {
        if (filterStatus.value && task.status !== filterStatus.value) return false;
        if (filterPriority.value && task.priority !== filterPriority.value) return false;
        return true;
    }

    function showLoading(show) {
        loadingSpinner.style.display = show ? 'inline-block' : 'none';
    }

    // --- Utilities ---
    function getStatusBadgeClass(status) {
        switch(status) {
            case 'Completed': return 'badge-status-completed';
            case 'In Progress': return 'badge-status-progress';
            default: return 'badge-status-pending';
        }
    }

    function getPriorityBadgeClass(priority) {
        switch(priority) {
            case 'High': return 'badge-priority-high';
            case 'Low': return 'badge-priority-low';
            default: return 'badge-priority-medium';
        }
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function isOverdue(dueDateString, status) {
        if (!dueDateString || status === 'Completed') return false;
        const dueDate = new Date(dueDateString);
        dueDate.setHours(23, 59, 59, 999);
        return dueDate < new Date();
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function showToast(title, message, type = 'primary') {
        const toastContainer = document.getElementById('toastContainer');
        const toastId = 'toast-' + Date.now();
        
        let icon = 'bi-info-circle';
        if (type === 'success') icon = 'bi-check-circle';
        if (type === 'warning') icon = 'bi-exclamation-triangle';
        if (type === 'danger') icon = 'bi-x-circle';

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-${type} text-white border-0">
                    <i class="bi ${icon} me-2"></i>
                    <strong class="me-auto">${title}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
        toast.show();
        
        // Clean up DOM after hide
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
});
