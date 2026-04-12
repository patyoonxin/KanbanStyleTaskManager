let tasks = [];
let currentEditId = null;
let currentColumn = "todo";

/* =========================
   CREATE TASK CARD
========================= */
function createTaskCard(taskObj) {
    const li = document.createElement("li");
    li.classList.add("task-card");
    li.dataset.id = taskObj.id;

    li.innerHTML = `
        <h3 class="task-title">${taskObj.title}</h3>
        <p>${taskObj.description}</p>
        <span class="badge ${taskObj.priority}">${taskObj.priority}</span>
        <small>Due: ${taskObj.dueDate}</small>
        <div class="actions">
            <button data-action="edit" data-id="${taskObj.id}">Edit</button>
            <button data-action="delete" data-id="${taskObj.id}">Delete</button>
        </div>
    `;

    return li;
}

/* =========================
   ADD TASK
========================= */
function addTask(columnId, taskObj) {
    const column = document.querySelector(`#${columnId} ul`);
    if (!column) return;

    const card = createTaskCard(taskObj);
    column.appendChild(card);

    tasks.push(taskObj);
    updateCounter();
}

/* =========================
   DELETE TASK
========================= */
function deleteTask(taskId) {
    const card = document.querySelector(`[data-id='${taskId}']`);
    if (!card) return;

    card.classList.add("fade-out");

    card.addEventListener("animationend", () => {
        card.remove();
        tasks = tasks.filter(task => task.id !== taskId);
        updateCounter();
    }, { once: true });
}

/* =========================
   EDIT TASK (OPEN MODAL)
========================= */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    currentEditId = taskId;

    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description;
    document.getElementById("priority").value = task.priority;
    document.getElementById("duedate").value = task.dueDate;

    document.getElementById("taskModal").style.display = "block";
}

/* =========================
   UPDATE TASK
========================= */
function updateTask(taskId, updatedData) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    tasks[index] = { ...tasks[index], ...updatedData };

    const card = document.querySelector(`[data-id='${taskId}']`);
    if (!card) return;

    card.replaceWith(createTaskCard(tasks[index]));
    updateCounter();
}

/* =========================
   TASK COUNTER
========================= */
function updateCounter() {
    const counter = document.getElementById("noteCounter");
    counter.textContent = `${tasks.length} tasks`;
}

/* =========================
   SAVE BUTTON
========================= */
document.getElementById("saveBtn").addEventListener("click", () => {
    const taskData = {
        id: currentEditId || Date.now().toString(),
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        dueDate: document.getElementById("duedate").value
    };

    if (currentEditId) {
        updateTask(currentEditId, taskData);
        currentEditId = null;
    } else {
        addTask(currentColumn, taskData);
    }

    document.getElementById("taskModal").style.display = "none";
});

/* =========================
   CANCEL BUTTON
========================= */
document.getElementById("cancelBtn").addEventListener("click", () => {
    document.getElementById("taskModal").style.display = "none";
});