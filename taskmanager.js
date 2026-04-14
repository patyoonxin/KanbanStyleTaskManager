let tasks = [];
let currentEditId = null;
let currentColumn = "todo";

/* =========================
   EVENT DELEGATION (EDIT/DELETE)
========================= */
document.querySelectorAll("section ul").forEach(ul => {
    ul.addEventListener("click", (e) => {
        const action = e.target.getAttribute("data-action");
        const id = e.target.getAttribute("data-id");

        if (!action || !id) return;

        if (action === "edit") {
            editTask(id);
        } else if (action === "delete") {
            deleteTask(id);
        }
    });
});

/* =========================
   ADD BUTTON (ALL COLUMNS)
========================= */
document.querySelectorAll(".addBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        currentColumn = btn.dataset.column || "todo";
        currentEditId = null;

        // clear form
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("priority").value = "Medium";
        document.getElementById("duedate").value = "";

        document.getElementById("taskModal").style.display = "block";
    });
});

/* =========================
   CREATE TASK CARD
========================= */
function createTaskCard(taskObj) {
    const li = document.createElement("li");
    li.classList.add("task-card");
    li.setAttribute("data-id", taskObj.id);

    const containerCard = document.createElement("div");
    containerCard.classList.add("containerCard");

    // Title
    const title = document.createElement("h3");
    title.classList.add("task-title");
    title.textContent = taskObj.title;

    // Description
    const desc = document.createElement("p");
    desc.textContent = taskObj.description;

    // Priority badge
    const badge = document.createElement("span");
    badge.classList.add("badge", taskObj.priority);
    badge.textContent = taskObj.priority;

    // Due date
    const due = document.createElement("small");
    due.textContent = "Due: " + taskObj.dueDate;

    // Action container
    const actions = document.createElement("div");
    actions.classList.add("actions");

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.classList.add("editBtn");
    editBtn.textContent = "Edit";
    editBtn.setAttribute("data-action", "edit");
    editBtn.setAttribute("data-id", taskObj.id);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("deleteBtn");
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("data-action", "delete");
    deleteBtn.setAttribute("data-id", taskObj.id);

    containerCard.appendChild(title);
    containerCard.appendChild(badge);

    // Append buttons to actions
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Append everything to li
    li.appendChild(containerCard);
    li.appendChild(desc);
    li.appendChild(due);
    li.appendChild(actions);

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
   INLINE EDIT (DOUBLE CLICK)
========================= */
document.addEventListener("dblclick", (e) => {
    if (!e.target.classList.contains("task-title")) return;

    const titleEl = e.target;
    const li = titleEl.closest("li");
    const taskId = li.dataset.id;

    const input = document.createElement("input");
    input.type = "text";
    input.value = titleEl.textContent;

    titleEl.replaceWith(input);
    input.focus();

    function saveEdit() {
        const newTitle = input.value.trim();
        if (!newTitle) return;

        updateTask(taskId, { title: newTitle });
    }

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit();
    });
});

/* =========================
   PRIORITY FILTER
========================= */
document.getElementById("filter-priority").addEventListener("change", (e) => {
    const selected = e.target.value;

    document.querySelectorAll(".task-card").forEach(card => {
        const task = tasks.find(t => t.id === card.dataset.id);
        if (!task) return;

        const shouldHide = selected !== "all" && task.priority !== selected;
        card.classList.toggle("is-hidden", shouldHide);
    });
});

/* =========================
   CLEAR DONE (STAGGER)
========================= */
document.getElementById("clearDone").addEventListener("click", () => {
    const doneList = document.querySelector("#done ul");
    if (!doneList) return;

    const cards = doneList.querySelectorAll(".task-card");

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("fade-out");

            card.addEventListener("animationend", () => {
                const id = card.dataset.id;
                tasks = tasks.filter(t => t.id !== id);
                card.remove();
                updateCounter();
            }, { once: true });

        }, index * 100);
    });
});

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