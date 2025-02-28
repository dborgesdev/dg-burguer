let productsList;
let cart = [];
let modalQty = 1;
let modalKey = 0;

const selectors = {
    product: {
        div: '.product__item',
        photo: '.product__item__photo__img',
        name: '.product__item__name',
        price: '.product__item__price'
    },
    cartItem: {
        div: '.cart__item',
        photo: '.cart__item__img',
        name: '.cart__item__name',
        qtyLess: '.cart__item__qtyless',
        qty: '.cart__item__qty',
        qtyPlus: '.cart__item__qtyplus'
    },
    nav: {
        cartButton: '.nav__cart',
        cartCounter: '.nav__cart__counter',
        mobileMenu: '.header__mobilemenu'
    },
    categorySelect: '.category__box__select',
    productsGrid: '.productsgrid',
    cart: {
        div: '.cart',
        closer: '.cart__closer__x',
        products: '.cart__products',
        subtotal: '.cart__summary__subtotal',
        delivery: '.cart__summary__delivery',
        total: '.cart__summary__total',
        checkoutButton: '.cart__summary__checkout'
    },
    modal: {
        window: '.item__window',
        popup: '.item__window__popup',
        closer: '.item__popup__closer',
        photoDiv: '.item__popup__photo',
        photo: '.item__popup__photo__img',
        warning: '.item__window__popup--warning',
        title: '.item__popup__title',
        description: '.item__popup__description',
        price: '.item__popup__price',
        qtyLess: '.item__popup__qtyless',
        qty: '.item__popup__qty',
        qtyPlus: '.item__popup__qtyplus',
        addButon: '.item__popup__addcart',
        cancelButton: '.item__popup__desktopcancel'
    }
};

const elements = mapSelectors(selectors);

/* FUNCTIONS */
function mapSelectors(selectors) {
    const elements = {};
    for (const key in selectors) {
        if (typeof selectors[key] === 'object') {
            elements[key] = mapSelectors(selectors[key]);
        } else {
            elements[key] = document.querySelector(selectors[key]);
        }
    }
    return elements;
}

async function init() {
    productsList = await getProducts();
    loadProducts(productsList);
}

async function getProducts() {
    // Lógica de obtenção de items do sistema por API ou Import    
    return productsJson;
}

function loadProducts(products) {
    const fragment = document.createDocumentFragment();
    products.forEach((item, index) => {
        let productItem = elements.product.div.cloneNode(true);
        productItem.setAttribute('data-key', index);
        productItem.setAttribute('data-cat', item.category);
        if (item.sale) {
            const warningDiv = document.createElement('div');
            warningDiv.classList.add('product__item--warning');
            warningDiv.innerHTML = 'Promoção';
            productItem.insertAdjacentElement('afterbegin', warningDiv);
        }
        productItem.querySelector(selectors.product.photo).src = item.img
        productItem.querySelector(selectors.product.photo).alt = item.name
        productItem.querySelector(selectors.product.name).innerHTML = item.name
        productItem.querySelector(selectors.product.price).innerHTML = item.price.toLocaleString("pt-BR",{ style: "currency", currency: "BRL" });
        productItem.addEventListener('click', () => loadItemPopup(index));
        fragment.appendChild(productItem);
    });
    elements.productsGrid.appendChild(fragment);
}

function categoryFilter(category) {
    document.querySelectorAll('[data-cat]').forEach(el => {
        el.classList.toggle('product__item--hidden', el.dataset.cat !== category);
    });
}

function loadItemPopup(key) {
    modalQty = 1;
    modalKey = key;
    const product = productsList[key];
    elements.modal.photo.src = product.img;
    elements.modal.photo.alt = product.name;
    elements.modal.warning.classList.toggle('item__window__popup--warning--hidden', !product.sale)
    elements.modal.title.innerHTML = product.name;
    elements.modal.description.innerHTML = product.description;
    elements.modal.price.innerHTML = product.price.toLocaleString("pt-BR",{ style: "currency", currency: "BRL" });
    elements.modal.qty.innerHTML = modalQty;
    elements.modal.window.style.opacity = 0;
    elements.modal.window.style.display = 'flex';
    setTimeout(() => elements.modal.window.style.opacity = 1, 200);
}

function closePopup() {
    elements.modal.window.style.opacity = 0;
    setTimeout(() =>  elements.modal.window.style.display = 'none', 500);
}

function openCart() {
        elements.cart.div.style.left = 'auto';
        elements.cart.div.classList.add('cart--show');
}

function closeCart() {
        elements.cart.div.style.left = '100vw';
        elements.cart.div.classList.remove('cart--show');
}

function updateCart() {
    const fragment = document.createDocumentFragment();
    elements.nav.cartCounter.innerHTML = cart.length;
    if(cart.length > 0) {
        let subtotal = 0;
        let delivery = 15; //criar função para calcular com base no endereço do cliente
        openCart();
        elements.cart.products.innerHTML = '';
        for(let i in cart) {
            let cartItem = elements.cartItem.div.cloneNode(true);
            let productItem = productsList.find((item) => item.id == cart[i].id);
            subtotal += productItem.price * cart[i].qty;
            cartItem.querySelector(selectors.cartItem.photo).src = productItem.img;
            cartItem.querySelector(selectors.cartItem.photo).alt = productItem.name;
            cartItem.querySelector(selectors.cartItem.name).innerHTML = productItem.name;
            cartItem.querySelector(selectors.cartItem.qty).innerHTML = cart[i].qty;
            cartItem.querySelector(selectors.cartItem.qtyLess).addEventListener('click', (e) => {
                e.stopPropagation();
                changeCartItemQty(i, -1)
            });
            cartItem.querySelector(selectors.cartItem.qtyPlus).addEventListener('click', (e) => {
                e.stopPropagation();
                changeCartItemQty(i, 1)
            });
            fragment.appendChild(cartItem);
        }
        elements.cart.products.appendChild(fragment);
        let total = subtotal + delivery;
        elements.cart.subtotal.innerHTML = subtotal.toLocaleString("pt-BR",{ style: "currency", currency: "BRL" });
        elements.cart.delivery.innerHTML = delivery.toLocaleString("pt-BR",{ style: "currency", currency: "BRL" });
        elements.cart.total.innerHTML = total.toLocaleString("pt-BR",{ style: "currency", currency: "BRL" });
    } else {
        closeCart();
    }
}

function changeCartItemQty(index, delta) {
    cart[index].qty += delta
    if(cart[index].qty < 1) {
       cart.splice(index, 1);
    }
    updateCart();
}

function addToCart() {
    let identifier = productsList[modalKey].id;
    let key = cart.findIndex((item) => item.identifier == identifier);
    if(key > -1) {
        cart[key].qty += modalQty;
    } else {
        cart.push({
            identifier,
            id: productsList[modalKey].id,
            qty: modalQty
        });
    }
    updateCart();
    closePopup();
}

/* EVENTS */
elements.categorySelect.addEventListener('change', (e) => categoryFilter(e.target.value));

[elements.modal.closer, elements.modal.cancelButton, elements.modal.window].forEach(el => 
    el.addEventListener('click', (e) => {
        if (!elements.modal.popup.contains(e.target) || el !== elements.modal.window) {
            closePopup();
        }
    })
);

elements.modal.qtyLess.addEventListener('click', () => {
    if(modalQty > 1) {
        modalQty --;
        elements.modal.qty.innerHTML = modalQty;
    }
});

elements.modal.qtyPlus.addEventListener('click', () => {
    modalQty ++;
    elements.modal.qty.innerHTML = modalQty;
});

elements.modal.addButon.addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart();
});

elements.nav.cartButton.addEventListener('click', (e) => {
    if(cart.length > 0) {
        e.stopPropagation();
        openCart();
    };
});

elements.cart.closer.addEventListener('click', () => closeCart());

document.addEventListener('click', (e) => {
    if(elements.cart.div.classList.contains('cart--show') && !elements.cart.div.contains(e.target)) {
        closeCart();
    }
});

/* START */
init()