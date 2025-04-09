/* VARIÁVEIS DE TRABALHO */
const productsList = [];
const cart = [];

/* CAPTURA DE ELEMENTOS DO HTML */
const elements = {
    bodyLeft: getById('body-left'),
    cart: {
        div: getById('cart'),
        closer: getById('cart-closer'),
        products: getById('cart-products'),
        total: getById('cart-total')
    },
    categorySelector: getById('category-selector'),
    modal: getById('item-modal'),
    nav: {
        cartButton: getById('nav-cart-button'),
        cartCounter: getById('nav-cart-counter')
    },
    productsGrid: getById('products-grid')
};

/* FUNÇÕES PRINCIPAIS*/
//Obtém a lista de produtos da loja
async function getProducts() {
    //Lógica para obter lista de productos por API, DB, Import...
    const products = productsJson.map(product => Object.freeze(product));
    return products;
}

//Carrega produtos na grade do site
function loadProducts(products) {
    const fragment = document.createDocumentFragment();

    products.forEach((item) => {
        const productItem = createEl('div', 'product__item');
        productItem.dataset.cat = item.category;
            //Verifica se está em promoção e adiciona alerta
            if (item.sale) {
                const warningDiv = createEl('div', 'product__item--warning', 'Promoção');
                productItem.append(warningDiv);
            }

            //Imagem do produto
            const photoDiv = createEl('div', 'product__item__photo');
                const img = createEl('img', 'product__item__photo__img');
                img.src = item.img;
                img.alt = item.name;
            photoDiv.append(img);

            //Informações do produto
            const infoDiv = createEl('div', 'product__item__info');      
                const nameDiv = createEl('div', 'product__item__name', item.name);
                const priceDiv = createEl('div', 'product__item__price', formatPrice(item.price));
            infoDiv.append(nameDiv, priceDiv);

            //Botão adicionar
            const addButton = createEl('div', 'product__item__add', '+');   
        productItem.append(photoDiv, infoDiv, addButton);

        productItem.addEventListener('click', () => loadItemModal(item.id));
        fragment.append(productItem);
    });
    elements.productsGrid.append(fragment);
}

//Filtra exibição de produtos por categoria
function categoryFilter(category) {
    document.querySelectorAll('[data-cat]').forEach(el => {
        el.classList.toggle('product__item--hidden', category !== 'all' && el.dataset.cat !== category);
    });
}

/* FUNÇÕES DO MODAL */
//Carregar Modal do Produto
function loadItemModal(id) {
    let modalQty = 1;
    const product = productsList.find((item) => item.id === id);

    //Modal do produto
    const itemModal = createEl('div', 'item__window__popup');
        //Botão de fechar modal
        const modalCloser = createEl('div', 'item__popup__closer', 'X');

        //Imagem do produto
        const photoDiv = createEl('div', 'item__popup__photo');
            const img = createEl('img', 'item__popup__photo__img');
            img.src = product.img;
            img.alt = product.name;
        photoDiv.append(img);

        //Verifica se está em promoção e adiciona alerta
        if (product.sale) {
            const warningDiv = createEl('div', 'item__window__popup--warning', 'Promoção');
            itemModal.append(warningDiv);
        }

        //Informações do produto
        const infoDiv = createEl('div','item__popup__info');
            const title = createEl('h1', 'item__popup__title', product.name);
            const description = createEl('p', 'item__popup__description', product.description);
            
            const priceArea = createEl('div', 'item__popup__pricearea');
                const priceTitle = createEl('div', 'item__popup__pricearea__title', 'Preço Unitário');

                const priceDiv = createEl('div', 'item__popup__pricediv');
                    const price = createEl('div', 'item__popup__price', formatPrice(product.price));

                    const qtyDiv = createEl('div', 'item__popup__qtydiv');
                        const minusBtn = createEl('button', 'item__popup__qty-button', '-');
                            minusBtn.addEventListener('click', () => modalQty = changeModalItemQty(qty, modalQty, -1));
                        const qty = createEl('div', 'item__popup__qty', modalQty);
                        const plusBtn = createEl('button', 'item__popup__qty-button', '+');
                            plusBtn.addEventListener('click', () => modalQty = changeModalItemQty(qty, modalQty, 1));
                    qtyDiv.append(minusBtn, qty, plusBtn);  
                priceDiv.append(price, qtyDiv);
            priceArea.append(priceTitle, priceDiv);

            //Botões do Modal
            const buttonsDiv = createEl('div', 'item__popup__buttons');
                const addCart = createEl('div', 'item__popup__addcart', 'Adicionar ao carrinho');
                    addCart.addEventListener('click', () => {
                        addToCart(id, modalQty);
                        closeModal();
                        openCart();
                    });
                const cancel = createEl('div', 'item__popup__desktopcancel', 'Cancelar');
            buttonsDiv.append(addCart, cancel);
        infoDiv.append(title, description, priceArea,buttonsDiv);
    itemModal.append(modalCloser, photoDiv, infoDiv);

    elements.modal.append(itemModal);
    openModal();
    setCloserModal(modalCloser, cancel);
}

//Mudar quantidade do item no modal (elemento qty do modal, quantidade atual, adicionar ou subtrair)
function changeModalItemQty(el, qty, delta) {
    let newQty = qty + delta;
    if(newQty < 1) newQty = 1;
    el.textContent = newQty;
    return newQty;
}

//Abrir modal
function openModal() {
    elements.modal.style.opacity = 0;
    elements.modal.style.display = 'flex';
    setTimeout(() => elements.modal.style.opacity = 1, 200);
}

//Configurar ouvintes de fechamento do modal (botão fechar, botão cancelar, clique fora do pop-up)
function setCloserModal(...elmnts) {
    elmnts.push(elements.modal);
    elmnts.forEach(el => el.addEventListener('click', (e) => { if(e.target === el) closeModal() }));
}

//Fechar Modal
function closeModal() {
    elements.modal.style.opacity = 0;
    setTimeout(() => {
        elements.modal.style.display = 'none';
        elements.modal.replaceChildren();
    }, 500);   
}

/* FUNÇÕES DO CARRINHO */
//Adiciona item ao array do carrinho
function addToCart(id, qty) {
    const product = productsList.find((item) => item.id === id);
    let itemKey = cart.findIndex((item) => item.id === product.id);
    
    if(itemKey > -1) {
        cart[itemKey].qty += qty;
        updateCartItem(itemKey);
    } else {
        cart.push({
            id: product.id,
            qty
        });
        itemKey = cart.length - 1;
        addCartItem(itemKey);
    }

    updateCartCounter();
    updateCartTotal();
}

//Adiciona novo item visualmente ao carrinho
function addCartItem(index) {
    const productItem = productsList.find((item) => item.id === cart[index].id);
    
    const cartItem = createEl('div', 'cart__item');
        cartItem.id = `cart-item-${cart[index].id}`;

        const img = createEl('img', 'cart__item__img');
        img.src = productItem.img;
        img.alt = productItem.name;
        
        const name = createEl('div', 'cart__item__name', productItem.name);

        const qtyDiv = createEl('div', 'cart__item__qtydiv');
            const minusBtn = createEl('button', 'cart__item__qty-button', '-');
                minusBtn.addEventListener('click', () => changeCartItemQty(productItem.id, -1));
            const itemQty = createEl('div', 'cart__item__qty', cart[index].qty);
            const plusBtn = createEl('button', 'cart__item__qty-button', '+');
                plusBtn.addEventListener('click', () => changeCartItemQty(productItem.id, 1));
        qtyDiv.append(minusBtn, itemQty, plusBtn);
    cartItem.append(img, name, qtyDiv);

    elements.cart.products.append(cartItem);
}

//Atualiza item existente no carrinho
function updateCartItem(index) {
    const cartItem = getById(`cart-item-${cart[index].id}`);

    if(cart[index].qty < 1) {
        cart.splice(index, 1);
        removeCartItem(cartItem);
    } else {
        const qty = cartItem.querySelector('.cart__item__qty');
        qty.textContent = cart[index].qty;
    }
}

//Remove item do carrinho
function removeCartItem(item) {
    item.remove();
    updateCartCounter();
    updateCartTotal();
    if(cart.length < 1) closeCart();
}

//Muda quantidade do item no carrinho
function changeCartItemQty(id, delta) {
    const index = cart.findIndex((item) => item.id === id);
    cart[index].qty += delta;
    updateCartItem(index);
    updateCartTotal();
}

//Atualiza os valores do carrinho
function updateCartTotal() {
    let subTotal = 0;

    cart.forEach((item, index) => {
        let objIndex = productsList.findIndex((obj) => obj.id === cart[index].id);
        subTotal += (productsList[objIndex].price * item.qty);
    });

    elements.cart.total.textContent = formatPrice(subTotal);
}

//Atualiza contador do carrinho no Head
function updateCartCounter() {
    elements.nav.cartCounter.textContent = cart.length;
}

//Abre o carrinho
function openCart() {
    if(cart.length > 0) elements.cart.div.classList.add('cart--show');
}

//Fecha o carrinho
function closeCart() {     
    elements.cart.div.classList.remove('cart--show');
}

/* FUNÇÕES AUXILIARES */
//Captura ID do elemento
function getById(id) {
    const elmnt = document.getElementById(id);
    return elmnt;
}

//Cria elemento HTML (elemento, classe, conteúdo de texto)
function createEl (el, clss, content) {
    const elmnt = document.createElement(el);
    elmnt.classList.add(clss);
    if(content) {
        elmnt.textContent = content;
    }
    return elmnt;
}

//Formata números para moeda
function formatPrice(number) {
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* EVENTS */
//Ouvinte seletor de categoria
elements.categorySelector.addEventListener('change', (e) => categoryFilter(e.target.value));

//Ouvinte botão head carrinho
elements.nav.cartButton.addEventListener('click', (e) => {
    e.stopPropagation();
    openCart();
});

//Ouvinte botão fechar carrinho
elements.cart.closer.addEventListener('click', () => closeCart());

//Ouvinte clique fora do carrinho
elements.bodyLeft.addEventListener('click', (e) => { if(elements.cart.div.classList.contains('cart--show') && e.target !== elements.cart.div) closeCart() });

/* INÍCIO DA APLICAÇÃO */
(async () => {
    const fetchedProducts = await getProducts();
    productsList.push(...fetchedProducts);
    loadProducts(productsList);
})();

/* TODO */
//Seleção de adicionais no modal do item
//Botão excluir item do carrinho
//Finalizar pedido
//Armazenar o carrinho no localStorage: localStorage.setItem('cart', JSON.stringify(cart));
//Login, entrega, pagamento...