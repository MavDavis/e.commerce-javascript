const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOm = document.querySelector(".cart");
const cartOverlay = document.querySelector("#cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");
const navLink = document.querySelector("#navlink");
const bars = document.getElementById("bars");
let cart = [];
let buttonsDOM = [];
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map((item) => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}
class UI {
    showNavLink() {
        navLink.classList.add("none");
        bars.addEventListener("click", (e) => {
            if (navLink.classList.contains("none")) {
                navLink.classList.remove("none");
                navLink.classList.add("flex");
            } else {
                navLink.classList.remove("flex");
                navLink.classList.add("none");
            }
        });
    }
    displayProducts(products) {
        let result = "";
        products.forEach((product) => {
            result += `
              <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img" />
                    <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            `;
        });
        productsDom.innerHTML = result;
    }
    getBagButton() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
            let id = button.dataset.id;
            let inCart = cart.find((item) => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get products from products
                let cartItem = {...Storage.getProduct(id), amount: 1 };

                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            });
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemTotal;
    }
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
 <img src=${item.image} alt="" />
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up"data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down"data-id=${item.id}></i>
                    </div>
`;
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.remove("cart-overlay");
        cartOverlay.classList.add("transparentBcg");
        cartDOm.classList.remove("cart");
        cartDOm.classList.add("showCart");
    }
    setupApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
    }
    populateCart(cart) {
        cart.forEach((item) => this.addCartItem(item));
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    hideCart() {
        cartOverlay.classList.add("cart-overlay");
        cartOverlay.classList.remove("transparentBcg");
        cartDOm.classList.add("cart");
        cartDOm.classList.remove("showCart");
    }
    cartLogic() {
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContent.addEventListener("click", (event) => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);

                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let subtractAmount = event.target;
                let id = subtractAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                if (tempItem.amount > 1) {
                    tempItem.amount = tempItem.amount - 1;
                } else {
                    cartContent.removeChild(subtractAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
                Storage.saveCart(cart);
                this.setCartValues(cart);
                subtractAmount.previousElementSibling.innerText = tempItem.amount;
            }
        });
    }
    clearCart() {
        let cartItems = cart.map((item) => item.id);
        cartItems.forEach((id) => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `
            <i class="fas fa-shopping-cart"></i>add to cart
            `;
    }
    getSingleButton(id) {
        return buttonsDOM.find((button) => button.dataset.id === id);
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }
    static getCart() {
        return localStorage.getItem("cart") ?
            JSON.parse(localStorage.getItem("cart")) :
            [];
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
}

// add event listeners
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    ui.showNavLink();
    ui.setupApp();
    products
        .getProducts()
        .then((products) => {
            ui.displayProducts(products);
            Storage.saveProducts(products);
        })
        .then(() => {
            ui.getBagButton();
            ui.cartLogic();
        });
});