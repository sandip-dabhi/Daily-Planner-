
 document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const dateInput = document.getElementById('date-input');
            const todayBtn = document.getElementById('today-btn');
            const themeToggle = document.getElementById('theme-toggle');
            const downloadBtn = document.getElementById('download-btn');
            const todoList = document.getElementById('todo-list');
            const newTodoInput = document.getElementById('new-todo');
            const addTodoBtn = document.getElementById('add-todo-btn');
            const schedule = document.getElementById('schedule');
            const notes = document.getElementById('notes');
            const planner = document.getElementById('planner');

            // Initialize the app
            init();

            function init() {
                // Set today's date
                setTodayDate();
                
                // Initialize time blocks
                createTimeBlocks();
                
                // Load saved data
                loadData();
                
                // Set up event listeners
                setupEventListeners();
            }

            function setTodayDate() {
                const today = new Date();
                const formattedDate = formatDate(today);
                dateInput.value = formattedDate;
            }

            function formatDate(date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            function createTimeBlocks() {
                const hours = [];
                // Create time blocks from 6 AM to 9 PM
                for (let hour = 6; hour <= 21; hour++) {
                    const timeLabel = formatHour(hour);
                    
                    const timeBlock = document.createElement('div');
                    timeBlock.className = 'time-block';
                    
                    const labelElement = document.createElement('div');
                    labelElement.className = 'time-label';
                    labelElement.textContent = timeLabel;
                    
                    const inputElement = document.createElement('input');
                    inputElement.className = 'time-input';
                    inputElement.type = 'text';
                    inputElement.placeholder = `Plan for ${timeLabel}`;
                    inputElement.dataset.hour = hour;
                    
                    timeBlock.appendChild(labelElement);
                    timeBlock.appendChild(inputElement);
                    
                    schedule.appendChild(timeBlock);
                }
            }

            function formatHour(hour) {
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour;
                return `${displayHour}:00 ${period}`;
            }

            function setupEventListeners() {
                // Date picker
                dateInput.addEventListener('change', saveData);
                
                // Today button
                todayBtn.addEventListener('click', function() {
                    setTodayDate();
                    saveData();
                });
                
                // Theme toggle
                themeToggle.addEventListener('click', toggleTheme);
                
                // Download PDF
                downloadBtn.addEventListener('click', downloadPDF);
                
                // Add new todo
                addTodoBtn.addEventListener('click', addTodo);
                newTodoInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        addTodo();
                    }
                });
                
                // Save data on input changes
                notes.addEventListener('input', saveData);
                
                // Auto-save when leaving the page
                window.addEventListener('beforeunload', saveData);
            }

            function addTodo() {
                const text = newTodoInput.value.trim();
                if (text) {
                    const todoItem = createTodoItem(text);
                    todoList.appendChild(todoItem);
                    newTodoInput.value = '';
                    saveData();
                }
            }

            function createTodoItem(text, isCompleted = false) {
                const li = document.createElement('li');
                li.className = 'todo-item' + (isCompleted ? ' completed' : '');
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'todo-checkbox';
                checkbox.checked = isCompleted;
                checkbox.addEventListener('change', function() {
                    li.classList.toggle('completed', this.checked);
                    saveData();
                });
                
                const span = document.createElement('input');
                span.type = 'text';
                span.className = 'todo-text';
                span.value = text;
                span.addEventListener('input', saveData);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'todo-delete';
                deleteBtn.innerHTML = '×';
                deleteBtn.addEventListener('click', function() {
                    li.remove();
                    saveData();
                });
                
                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(deleteBtn);
                
                return li;
            }

            function toggleTheme() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme === 'dark') {
                    document.documentElement.removeAttribute('data-theme');
                    themeToggle.textContent = 'Dark Mode';
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    themeToggle.textContent = 'Light Mode';
                }
                saveData();
            }

            function downloadPDF() {
                // Temporarily hide the download button to avoid it appearing in the PDF
                downloadBtn.style.visibility = 'hidden';
                
                const opt = {
                    margin: 10,
                    filename: `daily-planner-${dateInput.value}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                html2pdf().set(opt).from(planner).save().then(() => {
                    downloadBtn.style.visibility = 'visible';
                });
            }

            function saveData() {
                const data = {
                    date: dateInput.value,
                    theme: document.documentElement.getAttribute('data-theme') || 'light',
                    todos: [],
                    schedule: {},
                    notes: notes.value
                };
                
                // Save todos
                document.querySelectorAll('.todo-item').forEach(item => {
                    data.todos.push({
                        text: item.querySelector('.todo-text').value,
                        completed: item.querySelector('.todo-checkbox').checked
                    });
                });
                
                // Save schedule
                document.querySelectorAll('.time-input').forEach(input => {
                    data.schedule[input.dataset.hour] = input.value;
                });
                
                localStorage.setItem('dailyPlannerData', JSON.stringify(data));
            }

            function loadData() {
                const savedData = localStorage.getItem('dailyPlannerData');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    
                    // Set date
                    if (data.date) {
                        dateInput.value = data.date;
                    }
                    
                    // Set theme
                    if (data.theme === 'dark') {
                        document.documentElement.setAttribute('data-theme', 'dark');
                        themeToggle.textContent = 'Light Mode';
                    }
                    
                    // Load todos
                    if (data.todos && data.todos.length > 0) {
                        todoList.innerHTML = '';
                        data.todos.forEach(todo => {
                            const todoItem = createTodoItem(todo.text, todo.completed);
                            todoList.appendChild(todoItem);
                        });
                    }
                    
                    // Load schedule
                    if (data.schedule) {
                        document.querySelectorAll('.time-input').forEach(input => {
                            const hour = input.dataset.hour;
                            if (data.schedule[hour]) {
                                input.value = data.schedule[hour];
                            }
                        });
                    }
                    
                    // Load notes
                    if (data.notes) {
                        notes.value = data.notes;
                    }
                }
            }
        });


