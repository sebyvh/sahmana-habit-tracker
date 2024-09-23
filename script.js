document.addEventListener("DOMContentLoaded", () => {
    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const today = new Date().getDay(); // current day (0 = Sunday, 6 = Saturday)
    const dayIndex = today === 0 ? 6 : today - 1; // Adjust Sunday to be last
    let streak = parseInt(localStorage.getItem('streak')) || 0;
    updateStreak(streak);

    // Reset streak functionality
    document.getElementById('reset-streak').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset your streak? This action cannot be undone.")) {
            streak = 0; // Reset the streak variable
            localStorage.setItem('streak', streak); // Update localStorage
            updateStreak(streak); // Update the UI
        }
    });

    // Load and display tasks from localStorage
    daysOfWeek.forEach((day, index) => {
        const dayColumn = document.getElementById(day);
        const addButton = dayColumn.querySelector(".add-button");
        const buttonList = dayColumn.querySelector(".button-list");

        // Highlight the current day and dim others
        if (index === dayIndex) {
            dayColumn.classList.add("current-day");
        } else {
            addButton.classList.add("inactive");
            addButton.disabled = false; // Allow task addition on any day
        }

        // Load saved tasks from localStorage for this day
        const savedTasks = JSON.parse(localStorage.getItem(day)) || [];
        savedTasks.forEach(task => {
            const taskButton = createTaskButton(task.name, task.completed, day, index);
            buttonList.appendChild(taskButton);
        });

        // Add new task button functionality
        addButton.addEventListener("click", () => {
            const newTaskButton = createTaskButton("Type Text...", false, day, index);
            buttonList.appendChild(newTaskButton);
            saveTasks(day, buttonList);
        });
    });

    // Create a new task button
    function createTaskButton(name, completed, day, index) {
        const newTaskButton = document.createElement("button");
        newTaskButton.classList.add("task-button", completed ? "completed" : "incomplete");
        newTaskButton.textContent = name;

        // Allow toggling only for the current day
        if (index === dayIndex) {
            newTaskButton.addEventListener("click", () => {
                toggleTaskCompletion(newTaskButton);
                if (allTasksCompleted(document.getElementById(day))) {
                    updateStreak(++streak);
                }
                saveTasks(day, document.getElementById(day).querySelector(".button-list"));
            });
        }

        // Task rename (double-click) and delete (right-click)
        newTaskButton.addEventListener("dblclick", () => {
            const newTaskName = prompt("Enter a new name for this task:", newTaskButton.textContent);
            if (newTaskName) {
                newTaskButton.textContent = newTaskName;
                saveTasks(day, document.getElementById(day).querySelector(".button-list"));
            }
        });

        newTaskButton.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            if (confirm("Are you sure you want to delete this task?")) {
                newTaskButton.remove();
                saveTasks(day, document.getElementById(day).querySelector(".button-list"));
            }
        });

        return newTaskButton;
    }

    // Toggle task completion for the current day
    function toggleTaskCompletion(button) {
        if (button.classList.contains("incomplete")) {
            button.classList.remove("incomplete");
            button.classList.add("completed");
        } else {
            button.classList.remove("completed");
            button.classList.add("incomplete");
        }
    }

    // Check if all tasks in the current day are completed
    function allTasksCompleted(dayColumn) {
        const tasks = dayColumn.querySelectorAll(".task-button");
        return Array.from(tasks).every(task => task.classList.contains("completed"));
    }

    // Update streak in the footer
    function updateStreak(count) {
        const streakNumber = document.getElementById('streak-number');
        streakNumber.textContent = Math.min(count, 999); // Cap at 999
        localStorage.setItem('streak', streak);
    }

    // Countdown timer logic
    function startCountdown() {
        const now = new Date();
        const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Next midnight
        const timeLeft = nextDay - now; // Milliseconds left

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById('countdown-timer').textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        setTimeout(startCountdown, 1000); // Update every second
    }

    // Save tasks to localStorage for a specific day
    function saveTasks(day, buttonList) {
        const tasks = [];
        buttonList.querySelectorAll(".task-button").forEach(button => {
            tasks.push({
                name: button.textContent,
                completed: button.classList.contains("completed")
            });
        });
        localStorage.setItem(day, JSON.stringify(tasks));
    }

    startCountdown();
});


