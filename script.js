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
submitBtn.textContent = ' ';

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

//        (DOM Option API)
const filterSelect = document.createElement('select');
const filterOptions = [
    { value: 'all', text: ' ' },
    { value: 'active', text: '' },
    { value: 'completed', text: '' }
];
filterOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text;
    filterSelect.appendChild(option);
});

const sortSelect = document.createElement('select');
const sortOptions = [
    { value: 'none', text: ' ' },
    { value: 'date-asc', text: '  ( )' },
    { value: 'date-desc', text: '  ( )' }
];
sortOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text;
    sortSelect.appendChild(option);
});

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

function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

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
        todoListContainer.innerHTML = '<p style="text-align:center; font-weight:600; opacity:0.6; padding: 10px;">  </p>';
        return;
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('draggable', true);
        li.dataset.id = todo.id;

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
            const textSpan = document.createElement('span');
            textSpan.className = 'todo-text';
            textSpan.textContent = todo.text;

            const dateSpan = document.createElement('span');
            dateSpan.className = 'todo-date';
            
            const dateObj = new Date(todo.date);
            dateSpan.textContent = isNaN(dateObj) ? todo.date : dateObj.toLocaleDateString('ru-RU');

            infoDiv.appendChild(textSpan);
            infoDiv.appendChild(dateSpan);
            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(infoDiv);

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

        setupDragAndDropEvents(li);
        todoListContainer.appendChild(li);
    });
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveToLocalStorage();
    renderTodos();
}

function toggleEdit(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.isEditing = !todo.isEditing;
        renderTodos();
    }
}

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

searchBar.addEventListener('input', renderTodos);
filterSelect.addEventListener('change', renderTodos);
sortSelect.addEventListener('change', renderTodos);

// ================= DRAG AND DROP  =================
function setupDragAndDropEvents(item) {
    item.addEventListener('dragstart', () => {
        setTimeout(() => item.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        
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

todoListContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = todoListContainer.querySelector('.dragging');
    if (!draggingItem) return;

    const siblings = [...todoListContainer.querySelectorAll('.todo-item:not(.dragging)')];
    
    const nextSibling = siblings.find(sibling => {
        const box = sibling.getBoundingClientRect();
        return e.clientY <= box.top + box.height / 2;
    });

    todoListContainer.insertBefore(draggingItem, nextSibling);
});

renderTodos();

