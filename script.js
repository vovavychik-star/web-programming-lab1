// 1.      localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// 2.    (DOM API)
const body = document.body;

const appContainer = document.createElement('main');
appContainer.className = 'app-container';

// 
const header = document.createElement('header');
const h1 = document.createElement('h1');
h1.textContent = ' Mint & Espresso To-Do';
header.appendChild(h1);
appContainer.appendChild(header);

//   
const form = document.createElement('form');
form.className = 'todo-form';

const formRow = document.createElement('div');
formRow.className = 'form-row';

const textInput = document.createElement('input');
textInput.type = 'text';
textInput.placeholder = '  ?';
textInput.required = true;

const dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.required = true;

const submitBtn = document.createElement('button');
submitBtn.type = 'submit';
submitBtn.className = 'btn-main';
submitBtn.textContent = '';

formRow.appendChild(textInput);
formRow.appendChild(dateInput);
form.appendChild(formRow);
form.appendChild(submitBtn);
appContainer.appendChild(form);

//   (, , )
const controlsPanel = document.createElement('div');
controlsPanel.className = 'controls-panel';

const searchBar = document.createElement('input');
searchBar.type = 'text';
searchBar.className = 'search-input';
searchBar.placeholder = '    ...';

const filterSortRow = document.createElement('div');
filterSortRow.className = 'filter-sort-row';

const filterSelect = document.createElement('select');
filterSelect.innerHTML = `
    <option value="all"> </option>
    <option value="active"></option>
    <option value="completed"></option>
`;

const sortSelect = document.createElement('select');
sortSelect.innerHTML = `
    <option value="none"> </option>
    <option value="date-asc">  ( )</option>
    <option value="date-desc">  ( )</option>
`;

filterSortRow.appendChild(filterSelect);
filterSortRow.appendChild(sortSelect);
controlsPanel.appendChild(searchBar);
controlsPanel.appendChild(filterSortRow);
appContainer.appendChild(controlsPanel);

//  
const todoListContainer = document.createElement('ul');
todoListContainer.className = 'todo-list';
appContainer.appendChild(todoListContainer);

//     
body.prepend(appContainer);

// =================   =================

//  
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

//        
function renderTodos() {
    todoListContainer.innerHTML = '';

    let filteredTodos = [...todos];

    // 
    const searchQuery = searchBar.value.toLowerCase().trim();
    if (searchQuery) {
        filteredTodos = filteredTodos.filter(t => t.text.toLowerCase().includes(searchQuery));
    }

    // 
    const filterValue = filterSelect.value;
    if (filterValue === 'active') {
        filteredTodos = filteredTodos.filter(t => !t.completed);
    } else if (filterValue === 'completed') {
        filteredTodos = filteredTodos.filter(t => t.completed);
    }

    // 
    const sortValue = sortSelect.value;
    if (sortValue === 'date-asc') {
        filteredTodos.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === 'date-desc') {
        filteredTodos.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (filteredTodos.length === 0) {
        todoListContainer.innerHTML = '<p style="text-align:center; opacity:0.6;">  </p>';
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('draggable', true);
        li.dataset.id = todo.id;

        //    ( + )
        const leftDiv = document.createElement('div');
        leftDiv.className = 'todo-item-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const infoDiv = document.createElement('div');
        infoDiv.className = 'todo-info';

        if (todo.isEditing) {
            //  
            infoDiv.className = 'edit-container';
            const editTextInput = document.createElement('input');
            editTextInput.type = 'text';
            editTextInput.className = 'edit-input';
            editTextInput.value = todo.text;

            const editDateInput = document.createElement('input');
            editDateInput.type = 'date';
            editDateInput.className = 'edit-date';
            editDateInput.value = todo.date;

            infoDiv.appendChild(editTextInput);
            infoDiv.appendChild(editDateInput);

            //  /
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions-row';

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn-icon';
            saveBtn.textContent = '';
            saveBtn.onclick = () => saveEdit(todo.id, editTextInput.value, editDateInput.value);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-icon';
            cancelBtn.textContent = '';
            cancelBtn.onclick = () => toggleEdit(todo.id);

            actionsDiv.appendChild(saveBtn);
            actionsDiv.appendChild(cancelBtn);
            
            li.appendChild(infoDiv);
            li.appendChild(actionsDiv);
        } else {
            //   
            const textSpan = document.createElement('span');
            textSpan.className = 'todo-text';
            textSpan.textContent = todo.text;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'todo-date';
            
            //   
            const dateObj = new Date(todo.date);
            dateSpan.textContent = isNaN(dateObj) ? todo.date : dateObj.toLocaleDateString('ru-RU');

            infoDiv.appendChild(textSpan);
            infoDiv.appendChild(dateSpan);
            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(infoDiv);

            //   
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions-row';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn-icon';
            editBtn.textContent = '';
            editBtn.onclick = () => toggleEdit(todo.id);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon';
            deleteBtn.textContent = '';
            deleteBtn.onclick = () => deleteTodo(todo.id);

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(leftDiv);
            li.appendChild(actionsDiv);
        }

        //   Drag and Drop   
        setupDragAndDropEvents(li);

        todoListContainer.appendChild(li);
    });
}

//   
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTodo = {
        id: Date.now().toString(),
        text: textInput.value.trim(),
        date: dateInput.value,
        completed: false,
        isEditing: false
    };
    todos.push(newTodo);
    saveToLocalStorage();
    renderTodos();
    form.reset();
});

//   / 
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();
    }
}

//  
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveToLocalStorage();
    renderTodos();
}

// /  
function toggleEdit(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.isEditing = !todo.isEditing;
        renderTodos();
    }
}

//   
function saveEdit(id, newText, newDate) {
    const todo = todos.find(t => t.id === id);
    if (todo && newText.trim() && newDate) {
        todo.text = newText.trim();
        todo.date = newDate;
        todo.isEditing = false;
        saveToLocalStorage();
        renderTodos();
    }
}

//    
searchBar.addEventListener('input', renderTodos);
filterSelect.addEventListener('change', renderTodos);
sortSelect.addEventListener('change', renderTodos);

// ================= DRAG AND DROP LOGIC =================
function setupDragAndDropEvents(item) {
    item.addEventListener('dragstart', () => {
        setTimeout(() => item.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        
        //    todos       DOM
        const currentItems = [...todoListContainer.querySelectorAll('.todo-item')];
        const newOrderTodos = [];
        
        currentItems.forEach(element => {
            const id = element.dataset.id;
            const originalTodo = todos.find(t => t.id === id);
            if (originalTodo) newOrderTodos.push(originalTodo);
        });
        
        todos = newOrderTodos;
        saveToLocalStorage();
    });
}

//    

