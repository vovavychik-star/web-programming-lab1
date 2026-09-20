// 1. Имитация базы данных товаров
const PRODUCTS = [
    { id: 1, name: "Беспроводные наушники", price: 4500 },
    { id: 2, name: "Смарт-часы", price: 8900 },
    { id: 3, name: "Игровая мышь", price: 2300 },
    { id: 4, name: "Мембрановая клавиатура", price: 5600 },
];

// 2. Инициализация корзины из localStorage или создание новой
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Находим элементы DOM
const catalogContainer = document.getElementById('catalog');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const modalTotalPriceEl = document.getElementById('modal-total-price');
const cartItemsList = document.getElementById('cart-items-list');

const cartModal = document.getElementById('cart-modal');
const openCartBtn = document.getElementById('open-cart-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const orderForm = document.getElementById('order-form');

// 3. Функция вывода каталога товаров на страницу
function renderCatalog() {
    catalogContainer.innerHTML = '';
    PRODUCTS.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">${product.price} руб.</p>
            <button class="btn" onclick="addToCart(${product.id})">Добавить в корзину</button>
        `;
        catalogContainer.appendChild(card);
    });
}

// 4. Функция обновления цен и сохранения в localStorage
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));

    // Считаем общее количество и сумму
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    // Обновляем текст на странице
    cartTotalPriceEl.textContent = total;
    modalTotalPriceEl.textContent = total;

    renderCartItems();
}

// 5. Добавление товара в корзину
window.addToCart = function(id) {
    const product = PRODUCTS.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
};

// 6. Удаление товара из корзины
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
};

// 7. Изменение количества товара прямо в корзине
window.changeQuantity = function(id, quantity) {
    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.quantity = parseInt(quantity) || 1;
        if (cartItem.quantity < 1) cartItem.quantity = 1;
    }
    updateCart();
};

// 8. Рендер элементов внутри модального окна корзин
function renderCartItems() {
    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p>Корзина пуста</p>';
        return;
    }

    cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.innerHTML = `
            <div>
                <strong>${item.name}</strong> — ${item.price} руб.
            </div>
            <div class="quantity-controls">
                <input type="number" min="1" value="${item.quantity}" onchange="changeQuantity(${item.id}, this.value)">
                <button class="btn btn-danger" onclick="removeFromCart(${item.id})">&times;</button>
            </div>
        `;

        cartItemsList.appendChild(itemRow);
    });
}



// Открыть корзину
openCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
});

// Закрыть корзину
closeModalBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

// Закрытие при клике на серый фон вокруг модалки
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.add('hidden');
    }
});

// Отправка формы заказа
orderForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы

    if (cart.length === 0) {
        alert('Ваша корзина пуста! Добавьте товары перед оформлением.');
        return;
    }

    // Выводим успешное сообщение
    alert('Заказ создан!');

    // Очищаем корзину после заказа
    cart = [];
    updateCart();
    orderForm.reset(); // Очищаем поля формы
    cartModal.classList.add('hidden'); // Закрываем окно
});

// Инициализация при загрузке страницы
renderCatalog();
updateCart();
