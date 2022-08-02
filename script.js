const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDom = document.querySelector(".products-center");

const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");
import { productsData } from "./products.js";
let cart = [];
let buttonsDOM = [];
//get products
class Products {
  //get from API and point
  getProducts() {
    return productsData;
  }
}
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `<div class="product">
            <div class="img-container">
              <img src=${item.imgUrl} class="product-img" alt="pro-1" />
            </div>
            <div class="product-desc">
              <p class="product-title">
                ${item.title}
              </p>
              <p class="product-price">
                 ${item.price}$
              </p>
            </div>
            <button class="btn add-to-cart" data-id=${item.id}>Add to cart</button>
          </div>`;
      productsDom.innerHTML = result;
    });
  }
  getAddToCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtns;

    addToCartBtns.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = cart.find((p) => p.id === id);
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };

        //add to cart
        cart = [...cart, addedProduct];
        //save cart to local storage
        Storage.saveCart(cart);
        //update cart value
        this.setCartValue(cart);
        //add to cart item
        this.addCartItem(addedProduct);
      });
    });
  }
  setCartValue(cart) {
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);

    cartTotal.innerText = `total price: ${totalPrice.toFixed(2)}$`;
    cartItems.innerText = tempCartItems;
  }
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${cartItem.imgUrl} class="cart-img" alt="pro-1 " />
            <div class="cart-item-desc">
              <h4 id="product-title">${cartItem.title}</h4>
              <h5>$ ${cartItem.price}</h5>
            </div>
            <div class="cart-item-controller">
              <i class="fa-solid fa-sort-up" data-id=${cartItem.id}></i>
              <p>${cartItem.quantity}</p>
              <i class="fa-solid fa-sort-down" data-id=${cartItem.id}></i>
            </div>
            <i class="fa-solid fa-trash" data-id=${cartItem.id}></i>
          </div> `;
    cartContent.appendChild(div);
  }
  setupApp() {
    // get cart from storage
    cart = Storage.getCart() || [];
    //addCartItems
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    this.setCartValue(cart);
  }
  cartLogic() {
    //clear cart
    clearCart.addEventListener("click", () => this.clearCart());
    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-sort-up")) {
        const addQuantity = event.target;
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );

        addedItem.quantity++;
        //update cart
        this.setCartValue(cart);
        //save cart
        Storage.saveCart(cart);
        //update cart item in UI
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-sort-down")) {
        const subQuantity = event.target;
        const substractItem = cart.find(
          (cItem) => cItem.id == subQuantity.dataset.id
        );
        substractItem.quantity--;
        this.setCartValue(cart);
        Storage.saveCart(cart);
        subQuantity.previousElementSibling.innerText = substractItem.quantity;
      } else if (event.target.classList.contains("fa-trash")) {
        const removeItem = event.target;
        const removedItem = cart.find((c) => c.id == removeItem.dataset.id);
        this.removeItem(removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
      }
    });
  }
  clearCart() {
    cart.forEach((cItem) => this.removeItem(cItem.id));
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }
  removeItem(id) {
    //update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    //total price and cart items
    this.setCartValue(cart);
    //update storage:
    Storage.saveCart(cart);
    //get add to cart btns => update text and disable
    this.getSingleButton(id);
  }
  getSingleButton(id) {
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) == parseInt(id)
    );
    button.innerText = "Add to cart";
    button.disabled = false;
  }
}
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => parseInt(p.id) === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"))
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  //set up: get cart and set up app
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.cartLogic();
  Storage.saveProducts(productsData);
});
// When the user clicks the button, open the modal
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}
// When the user clicks on <span> (x), close the modal
function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

// When the user clicks anywhere outside of the modal, close it

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);
