// SmartTimeTable App JavaScript - Complete Working Version

// Sample data and AI suggestion library
const SAMPLE_DATA = {
    tasks: [
        {
            id: "task_1",
            title: "Complete project proposal",
            description: "Finish writing the quarterly project proposal for the client meeting",
            priority: "High",
            category: "Work",
            estimatedTime: "2 hours",
            completed: false,
            date: "2025-09-10",
            createdAt: Date.now(),
            aiSuggestions: [
                "Break the proposal into sections: executive summary, objectives, timeline, and budget",
                "Use the 25-minute Pomodoro technique with 5-minute breaks",
                "Start with an outline to organize your thoughts before writing",
                "Schedule this during your most productive hours, typically morning",
                "Remove all distractions - close social media and unnecessary browser tabs"
            ]
        },
        {
            id: "task_2", 
            title: "Morning workout",
            description: "30-minute cardio and strength training session",
            priority: "Medium",
            category: "Health",
            estimatedTime: "30 minutes",
            completed: true,
            date: "2025-09-10",
            createdAt: Date.now() - 86400000,
            aiSuggestions: [
                "Prepare your workout clothes the night before",
                "Start with a 5-minute warm-up to prevent injuries",
                "Track your progress in a fitness app or journal",
                "Listen to energizing music or podcasts during cardio",
                "Stay hydrated - drink water before, during, and after"
            ]
        },
        {
            id: "task_3",
            title: "Learn JavaScript fundamentals",
            description: "Study JavaScript basics: variables, functions, and loops",
            priority: "Medium", 
            category: "Learning",
            estimatedTime: "1 hour",
            completed: false,
            date: "2025-09-11",
            createdAt: Date.now() - 43200000,
            aiSuggestions: [
                "Use active learning: code along with tutorials instead of just watching",
                "Practice with small projects immediately after learning concepts",
                "Join coding communities like Stack Overflow for help and discussion",
                "Set up a development environment to practice coding",
                "Use spaced repetition - review previous lessons regularly"
            ]
        }
    ],
    goals: [
        {
            id: "goal_1",
            title: "Launch Personal Website",
            description: "Create and deploy a personal portfolio website to showcase my projects and skills",
            progress: 35,
            targetDate: "2025-09-30",
            relatedTasks: ["task_3"]
        }
    ]
};

const AI_SUGGESTIONS = {
    Work: [
        "Time-block your calendar to focus on deep work",
        "Use the Eisenhower Matrix to prioritize urgent vs important tasks",
        "Batch similar tasks together to minimize context switching",
        "Set specific deadlines even for non-urgent tasks",
        "Take regular breaks every 50-90 minutes to maintain focus"
    ],
    Personal: [
        "Link the task to an existing habit (habit stacking)",
        "Use implementation intentions: 'When X happens, I will do Y'",
        "Set up environmental cues to remind you of the task",
        "Start with the smallest possible version of the task",
        "Reward yourself after completing the task"
    ],
    Health: [
        "Schedule health tasks at the same time each day",
        "Track your progress to stay motivated",
        "Start small and gradually increase intensity",
        "Find an accountability partner or join a group",
        "Prepare everything you need the day before"
    ],
    Learning: [
        "Use the Feynman Technique: explain concepts in simple terms",
        "Practice active recall instead of passive re-reading",
        "Space out your learning sessions over multiple days",
        "Connect new information to what you already know",
        "Test yourself regularly with quizzes or practice problems"
    ],
    Other: [
        "Break large tasks into smaller, manageable steps",
        "Set a specific time and place for the task",
        "Use a timer to create urgency and focus",
        "Remove barriers that might prevent you from starting",
        "Track your progress to maintain momentum"
    ]
};

const PRODUCTIVITY_TIPS = [
    {
        icon: "🧠",
        title: "The 2-Minute Rule",
        description: "If a task takes less than 2 minutes, do it immediately instead of adding it to your list."
    },
    {
        icon: "⚡",
        title: "Energy Management",
        description: "Schedule your most important tasks during your peak energy hours, not just available time slots."
    },
    {
        icon: "🎯",
        title: "Single-Tasking Focus",
        description: "Focus on one task at a time. Multitasking reduces both quality and speed of work completion."
    },
    {
        icon: "🏗️",
        title: "Environment Design",
        description: "Set up your physical and digital environment to support your goals and minimize friction."
    },
    {
        icon: "📈",
        title: "Progress Over Perfection",
        description: "Aim for consistent progress rather than perfect execution. Done is better than perfect."
    },
    {
        icon: "🔄",
        title: "Review and Adjust",
        description: "Regularly review your productivity system and adjust based on what's working and what isn't."
    }
];

// App State
let appState = {
    tasks: [],
    goals: [],
    currentView: 'today',
    currentWeekStart: new Date(),
    editingTask: null,
    editingGoal: null
};

// Utility Functions
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function isToday(dateString) {
    return dateString === getTodayString();
}

function getWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
    }
    return dates;
}

// Local Storage Functions
function saveToStorage() {
    try {
        localStorage.setItem('smartTimeTable', JSON.stringify({
            tasks: appState.tasks,
            goals: appState.goals
        }));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem('smartTimeTable');
        if (stored) {
            const data = JSON.parse(stored);
            appState.tasks = data.tasks || [];
            appState.goals = data.goals || [];
        } else {
            // Load sample data if no stored data
            appState.tasks = [...SAMPLE_DATA.tasks];
            appState.goals = [...SAMPLE_DATA.goals];
            saveToStorage();
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        // Fallback to sample data
        appState.tasks = [...SAMPLE_DATA.tasks];
        appState.goals = [...SAMPLE_DATA.goals];
    }
}

// Task Functions
function createTask(taskData) {
    const task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'Medium',
        category: taskData.category || 'Other',
        estimatedTime: taskData.estimatedTime || '',
        completed: false,
        date: taskData.date || getTodayString(),
        createdAt: Date.now(),
        aiSuggestions: generateAISuggestions(taskData.category, taskData.title)
    };
    
    appState.tasks.push(task);
    saveToStorage();
    return task;
}

function updateTask(taskId, updates) {
    const taskIndex = appState.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        appState.tasks[taskIndex] = { ...appState.tasks[taskIndex], ...updates };
        saveToStorage();
        return appState.tasks[taskIndex];
    }
    return null;
}

function deleteTask(taskId) {
    appState.tasks = appState.tasks.filter(t => t.id !== taskId);
    saveToStorage();
}

function toggleTaskCompletion(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveToStorage();
        updateAllViews();
    }
}

function generateAISuggestions(category, title) {
    const categoryPrimary = AI_SUGGESTIONS[category] || AI_SUGGESTIONS.Other;
    const generalSuggestions = AI_SUGGESTIONS.Other;
    
    // Mix category-specific and general suggestions
    const suggestions = [
        ...categoryPrimary.slice(0, 3),
        ...generalSuggestions.slice(0, 2)
    ];
    
    return suggestions.slice(0, 4); // Return top 4 suggestions
}

// Goal Functions
function createGoal(goalData) {
    const goal = {
        id: generateId(),
        title: goalData.title,
        description: goalData.description || '',
        progress: 0,
        targetDate: goalData.targetDate || '',
        createdAt: Date.now()
    };
    
    appState.goals.push(goal);
    saveToStorage();
    return goal;
}

function updateGoal(goalId, updates) {
    const goalIndex = appState.goals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
        appState.goals[goalIndex] = { ...appState.goals[goalIndex], ...updates };
        saveToStorage();
        return appState.goals[goalIndex];
    }
    return null;
}

function deleteGoal(goalId) {
    appState.goals = appState.goals.filter(g => g.id !== goalId);
    saveToStorage();
}

// View Rendering Functions
function renderTodayView() {
    const todayTasks = appState.tasks.filter(task => isToday(task.date));
    const todayTasksContainer = document.getElementById('today-tasks');
    
    if (todayTasks.length === 0) {
        todayTasksContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6B7280;">
                <p>No tasks for today. Click "Add New Task" to get started!</p>
            </div>
        `;
    } else {
        todayTasksContainer.innerHTML = todayTasks.map(task => renderTaskItem(task)).join('');
    }
    
    updateDailyProgress();
}

function renderWeeklyView() {
    const weekDates = getWeekDates(appState.currentWeekStart);
    const weeklyGrid = document.getElementById('weekly-grid');
    const weekDisplay = document.getElementById('week-display');
    
    // Update week display
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    weekDisplay.textContent = `Week of ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    // Render weekly grid
    weeklyGrid.innerHTML = weekDates.map(date => {
        const dateString = date.toISOString().split('T')[0];
        const dayTasks = appState.tasks.filter(task => task.date === dateString);
        const isCurrentDay = isToday(dateString);
        
        return `
            <div class="day-card ${isCurrentDay ? 'today' : ''}" data-date="${dateString}">
                <div class="day-header">
                    <div class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div class="day-date">${date.getDate()}</div>
                </div>
                <div class="day-tasks">
                    ${dayTasks.map(task => `
                        <div class="day-task priority-${task.priority.toLowerCase()}" title="${task.title}">
                            ${task.title}
                        </div>
                    `).join('')}
                    ${dayTasks.length === 0 ? '<div class="add-task-prompt">Click to add tasks</div>' : ''}
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers for day cards
    document.querySelectorAll('.day-card').forEach(card => {
        card.addEventListener('click', () => {
            const date = card.dataset.date;
            openTaskModal(null, date);
        });
    });
}

function renderGoalsView() {
    const goalsList = document.getElementById('goals-list');
    
    if (appState.goals.length === 0) {
        goalsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #6B7280;">
                <p>No goals set yet. Click "Add New Goal" to create your first goal!</p>
            </div>
        `;
    } else {
        goalsList.innerHTML = appState.goals.map(goal => renderGoalItem(goal)).join('');
    }
}

function renderAISuggestionsView() {
    const tipsContainer = document.getElementById('productivity-tips');
    
    tipsContainer.innerHTML = PRODUCTIVITY_TIPS.map(tip => `
        <div class="tip-card">
            <div class="tip-icon">${tip.icon}</div>
            <h3 class="tip-title">${tip.title}</h3>
            <p class="tip-description">${tip.description}</p>
        </div>
    `).join('');
}

function renderTaskItem(task) {
    return `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTaskCompletion('${task.id}')">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-tag priority-${task.priority.toLowerCase()}">${task.priority} Priority</span>
                        <span class="task-tag category">${task.category}</span>
                        ${task.estimatedTime ? `<span class="task-tag time">${task.estimatedTime}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn--small btn--secondary" onclick="editTask('${task.id}')">Edit</button>
                    <button class="btn btn--small btn--danger" onclick="deleteTaskById('${task.id}')">Delete</button>
                </div>
            </div>
            ${task.aiSuggestions && task.aiSuggestions.length > 0 ? `
                <div class="task-suggestions">
                    <h4>💡 AI Suggestions</h4>
                    ${task.aiSuggestions.map(suggestion => `
                        <div class="suggestion-item">${suggestion}</div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

function renderGoalItem(goal) {
    return `
        <div class="goal-item">
            <div class="goal-header">
                <div>
                    <h3 class="goal-title">${goal.title}</h3>
                    ${goal.targetDate ? `<div class="goal-target-date">Target: ${new Date(goal.targetDate).toLocaleDateString()}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn btn--small btn--secondary" onclick="editGoal('${goal.id}')">Edit</button>
                    <button class="btn btn--small btn--danger" onclick="deleteGoalById('${goal.id}')">Delete</button>
                </div>
            </div>
            ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
            <div class="goal-progress">
                <div class="goal-progress-label">
                    <span>Progress</span>
                    <span>${goal.progress}%</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${goal.progress}%"></div>
                </div>
            </div>
        </div>
    `;
}

// Modal Functions
function openTaskModal(taskId = null, defaultDate = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    
    appState.editingTask = taskId;
    
    if (taskId) {
        // Editing existing task
        const task = appState.tasks.find(t => t.id === taskId);
        if (task) {
            modalTitle.textContent = 'Edit Task';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-time').value = task.estimatedTime;
            document.getElementById('task-date').value = task.date;
            
            // Show AI suggestions
            showTaskAISuggestions(task.aiSuggestions);
        }
    } else {
        // Creating new task
        modalTitle.textContent = 'Add New Task';
        form.reset();
        if (defaultDate) {
            document.getElementById('task-date').value = defaultDate;
        } else {
            document.getElementById('task-date').value = getTodayString();
        }
        
        // Clear AI suggestions
        document.getElementById('ai-suggestions-section').style.display = 'none';
    }
    
    modal.classList.add('show');
}

function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    modal.classList.remove('show');
    appState.editingTask = null;
}

function openGoalModal(goalId = null) {
    const modal = document.getElementById('goal-modal');
    const form = document.getElementById('goal-form');
    
    appState.editingGoal = goalId;
    
    if (goalId) {
        const goal = appState.goals.find(g => g.id === goalId);
        if (goal) {
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-description').value = goal.description;
            document.getElementById('goal-target-date').value = goal.targetDate;
        }
    } else {
        form.reset();
    }
    
    modal.classList.add('show');
}

function closeGoalModal() {
    const modal = document.getElementById('goal-modal');
    modal.classList.remove('show');
    appState.editingGoal = null;
}

function showTaskAISuggestions(suggestions) {
    const section = document.getElementById('ai-suggestions-section');
    const container = document.getElementById('task-ai-suggestions');
    
    if (suggestions && suggestions.length > 0) {
        container.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item">${suggestion}</div>`
        ).join('');
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// Update Functions
function updateAllViews() {
    switch (appState.currentView) {
        case 'today':
            renderTodayView();
            break;
        case 'weekly':
            renderWeeklyView();
            break;
        case 'goals':
            renderGoalsView();
            break;
        case 'ai-suggestions':
            renderAISuggestionsView();
            break;
    }
}

function updateDailyProgress() {
    const todayTasks = appState.tasks.filter(task => isToday(task.date));
    const completedTasks = todayTasks.filter(task => task.completed);
    const progress = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;
    
    document.getElementById('daily-progress').textContent = `${progress}%`;
    document.getElementById('daily-progress-fill').style.width = `${progress}%`;
}

function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('current-date-time').textContent = dateTimeString;
}

// Navigation Functions
function switchView(viewName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.view === viewName) {
            tab.classList.add('active');
        }
    });
    
    // Update view sections
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}-view`).classList.add('active');
    
    appState.currentView = viewName;
    updateAllViews();
}

// Event Handlers
function editTask(taskId) {
    openTaskModal(taskId);
}

function deleteTaskById(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId);
        updateAllViews();
    }
}

function editGoal(goalId) {
    openGoalModal(goalId);
}

function deleteGoalById(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        deleteGoal(goalId);
        updateAllViews();
    }
}

function navigateWeek(direction) {
    const weekStart = new Date(appState.currentWeekStart);
    weekStart.setDate(weekStart.getDate() + (direction * 7));
    appState.currentWeekStart = weekStart;
    renderWeeklyView();
}

// Form Handlers
function handleTaskFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        category: formData.get('category'),
        estimatedTime: formData.get('estimatedTime'),
        date: formData.get('date')
    };
    
    if (appState.editingTask) {
        // Update existing task
        updateTask(appState.editingTask, taskData);
    } else {
        // Create new task
        const newTask = createTask(taskData);
        // Show AI suggestions for new task
        showTaskAISuggestions(newTask.aiSuggestions);
    }
    
    updateAllViews();
    
    if (!appState.editingTask) {
        // Keep modal open for new tasks to show AI suggestions
        event.target.reset();
        document.getElementById('task-date').value = formData.get('date');
    } else {
        closeTaskModal();
    }
}

function handleGoalFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const goalData = {
        title: formData.get('title'),
        description: formData.get('description'),
        targetDate: formData.get('targetDate')
    };
    
    if (appState.editingGoal) {
        updateGoal(appState.editingGoal, goalData);
    } else {
        createGoal(goalData);
    }
    
    updateAllViews();
    closeGoalModal();
}

// Initialization
function initializeApp() {
    loadFromStorage();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    // Set current week start to beginning of this week
    const now = new Date();
    appState.currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
}

function attachEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchView(tab.dataset.view);
        });
    });
    
    // Task modal controls
    document.getElementById('add-task-btn').addEventListener('click', () => openTaskModal());
    document.getElementById('close-modal').addEventListener('click', closeTaskModal);
    document.getElementById('cancel-task').addEventListener('click', closeTaskModal);
    document.getElementById('task-form').addEventListener('submit', handleTaskFormSubmit);
    
    // Goal modal controls
    document.getElementById('add-goal-btn').addEventListener('click', () => openGoalModal());
    document.getElementById('close-goal-modal').addEventListener('click', closeGoalModal);
    document.getElementById('cancel-goal').addEventListener('click', closeGoalModal);
    document.getElementById('goal-form').addEventListener('submit', handleGoalFormSubmit);
    
    // Weekly navigation
    document.getElementById('prev-week').addEventListener('click', () => navigateWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => navigateWeek(1));
    
    // Modal backdrop clicks
    document.getElementById('task-modal').addEventListener('click', (e) => {
        if (e.target.id === 'task-modal') closeTaskModal();
    });
    document.getElementById('goal-modal').addEventListener('click', (e) => {
        if (e.target.id === 'goal-modal') closeGoalModal();
    });
    
    // Task category change for AI suggestions preview
    document.getElementById('task-category').addEventListener('change', (e) => {
        const title = document.getElementById('task-title').value;
        if (title && !appState.editingTask) {
            const suggestions = generateAISuggestions(e.target.value, title);
            showTaskAISuggestions(suggestions);
        }
    });
    
    document.getElementById('task-title').addEventListener('input', (e) => {
        const category = document.getElementById('task-category').value;
        if (e.target.value && !appState.editingTask) {
            const suggestions = generateAISuggestions(category, e.target.value);
            showTaskAISuggestions(suggestions);
        }
    });
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    attachEventListeners();
    updateAllViews();
});

// Make functions available globally for onclick handlers
window.toggleTaskCompletion = toggleTaskCompletion;
window.editTask = editTask;
window.deleteTaskById = deleteTaskById;
window.editGoal = editGoal;
window.deleteGoalById = deleteGoalById;