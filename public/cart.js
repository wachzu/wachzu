/**
 * Name: Zach Wu, Jordy Uribe
 * Date: 11/3/24
 * Section: CSE 154 AD
 *
 * This is the cart.js page which handles all functionality for the cart section
 * of our website. This entails things like switching from cart to checkout, or
 * submitting a purchase. Additionally, this page will interact with the database,
 * updating transactions, cart and more.
 */
"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * This is the init function which runs after the page loads. It adds a event listeners
   * throughout the website. Additionally, it calls the loadCart function which
   * loads up the cart with the user's cart information. No parameters or returns
   */
  function init() {
    id("purchase-button").addEventListener("click", toCheckout);
    id("back-cart-btn").addEventListener("click", backToCart);
    id("bar").addEventListener("keydown", searched);
    loadCart();
    id("payment-info").addEventListener("submit", submitPurchase);
  }

  /**
   * This is the submitPurchase function which allows a user to submit a purchase
   * to the website. It will update their transaction history and make sure that
   * the transfer goes through. It will also, upon a success, load the success view.
   * @param {object} evt an object that allows the function to stop the default
   * behavior of reloading the page.
   */
  async function submitPurchase(evt) {
    evt.preventDefault();
    try {
      let data = new FormData(id("payment-info"));
      data.append("user_id", window.localStorage.getItem("userId"));
      let transactionId = await fetch("/sportsxcel/buyCart", {method: "POST", body: data});
      await statusCheck(transactionId);
      transactionId = await transactionId.text();
      loadSuccess(transactionId);
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * This is the loadSuccess function which is called upon when a user's transaction is
   * successful. When it is successful, it will switch views, allowing users to view their
   * confirmation code and a success message. No return values.
   * @param {String} transactionId the confirmation code for the current transaction.
   */
  function loadSuccess(transactionId) {
    id("cart-view").classList.add("hidden");
    id("checkout-container").classList.add("hidden");
    id("error").classList.add("hidden");
    id("success-container").classList.remove("hidden");
    id("success-msg").textContent = "Confirmation code: " + transactionId;
  }

  /**
   * This is the loadCart function which loads up the cart view with all of the
   * products in the user's cart. It will fetch information from an endpoint and
   * format it accordingly.
   */
  async function loadCart() {
    try {
      id("cart-items").innerHTML = "";
      let cartData = await fetch("/sportsxcel/getCart/" + window.localStorage.getItem("userId"));
      await statusCheck(cartData);
      cartData = await cartData.json();
      formatCart(cartData["product"]);
    } catch (err) {
      handleError("Make sure you are signed in before accessing the cart!");
    }
  }

  /**
   * This is the formatCart function which takes an array with a bunch of items (items
   * within the user's cart) and then goes and adds each to the cart view. This will
   * allow users to view the visual representation of their cart.
   * @param {object} cart a object representing the cart.
   */
  function formatCart(cart) {
    let subtotal = 0;
    for (let i = 0; i < cart.length; i++) {
      subtotal += cart[i]["price"];
      if (!id(cart[i]["product_id"])) {
        let curArticle = document.createElement("article");
        curArticle.id = cart[i]["product_id"];
        curArticle.classList.add("item");
        let htmlArr = imageNamePriceTrash(cart, i, cart[i]["product_id"]);
        for (let j = 0; j < htmlArr.length; j++) {
          curArticle.appendChild(htmlArr[j]);
        }
        id("cart-items").appendChild(curArticle);
      } else {
        let children = id(cart[i]["product_id"]).children;
        for (let j = 0; j < children.length; j++) {
          updatePriceOrQuantity(children, j, cart[i]);
        }
      }
    }
    updateSubtotal(subtotal);
  }

  /**
   * This is the updatePriceOrQuantity function which updates the price of a single
   * item in the cart (when a user increases the stock) or updates the quantity of
   * items on the cart item.
   * @param {NodeList} children A list of the children of an HTML element.
   * @param {number} index The index of the child that this function wants to update.
   * @param {object} cartItem The item within the cart that this function wants to get
   * information from (the price).
   */
  function updatePriceOrQuantity(children, index, cartItem) {
    if (children[index].classList.contains("quantity")) {
      let quantity = children[index].textContent;
      quantity = Number(quantity);
      quantity += 1;
      children[index].textContent = quantity;
    } else if (children[index].classList.contains("price")) {
      let price = children[index].textContent;
      price = price.slice(1);
      price = Number(price);
      price += Number(cartItem["price"]);
      children[index].textContent = "$" + price.toFixed(2);
    }
  }

  /**
   * This is the imageNamePriceTrash function which essentially generates a bunch of
   * HTML elements that help with the formatting and view of the website. It takes
   * a bunch of information and returns all of the html elements in the form of an array.
   * @param {object} cart object with information about the user's cart
   * @param {number} index a number so the function knows which cart item to look at.
   * @param {number} productId The id of the current product.
   * @returns {array} This returns an array with a bunch of HTML elements, which will be appended
   * to the HTML page.
   */
  function imageNamePriceTrash(cart, index, productId) {
    let image = document.createElement("img");
    image.classList.add("product-image-cart");
    image.alt = cart[index]["name"];
    image.src = cart[index]["image"];
    let name = document.createElement("h3");
    name.textContent = cart[index]["name"];
    name.classList.add("name");
    let price = document.createElement("p");
    price.classList.add("price");
    price.textContent = "$" + cart[index]["price"];
    let changeQuant = document.createElement("section");
    let buttonsArr = stockButtons(productId);
    changeQuant.appendChild(buttonsArr[0]);
    changeQuant.appendChild(buttonsArr[1]);
    changeQuant.classList.add("change-quant");
    return [image, name, price, changeQuant, buttonsArr[2], buttonsArr[3]];
  }

  /**
   * This is the stockButtons function which is a helper function for the imageNamePriceTrash
   * function (which is also a helper function). This function generates the buttons
   * that will be needed and returns an array with all of the buttons.
   * @param {number} productId - The id of the product, so the buttons will know
   * which item to update
   * @returns {array} Array of HTML elements to be appended
   */
  function stockButtons(productId) {
    let trashImage = document.createElement("img");
    trashImage.src = "images/trash.png";
    trashImage.alt = "Trash Image";
    trashImage.classList.add("trash");
    trashImage.addEventListener("click", function() {
      removeCart(true, productId);
    });
    let add = document.createElement("button");
    add.textContent = "▲";
    add.addEventListener("click", function() {
      addToCart(productId);
    });
    let quantity = document.createElement("p");
    quantity.textContent = "1";
    quantity.classList.add("quantity");
    let remove = document.createElement("button");
    remove.textContent = "▼";
    remove.addEventListener("click", function() {
      removeCart(false, productId);
    });
    return [add, remove, quantity, trashImage];
  }

  /**
   * This is the addToCart function which will update the user's cart with a new
   * product. It requires the product's id and will update the cart, then reload
   * the cart for the user. No returns.
   * @param {number} productId - the id of the product to add to the cart.
   */
  async function addToCart(productId) {
    try {
      let data = new FormData();
      data.append("user_id", window.localStorage.getItem("userId"));
      data.append("product_id", productId);
      let update = await fetch("/sportsxcel/addToCart", {method: "POST", body: data});
      await statusCheck(update);
      loadCart();
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * This is the removeCart function which takes a boolean that represents whether
   * or not the user wants to remove all items, and a productId that represents
   * the product that the user will remove. It will update the user's cart by
   * removing the item(s). It will then reload the page.
   * @param {boolean} removeAll Represents whether or not you want to remove all
   * instances of a product, or just the first instance.
   * @param {number} productId The id of the product.
   */
  async function removeCart(removeAll, productId) {
    try {
      let data = new FormData();
      data.append("user_id", window.localStorage.getItem("userId"));
      data.append("product_id", productId);
      data.append("removeAll", "" + removeAll);
      let update = await fetch("/sportsxcel/removeFromCart", {method: "POST", body: data});
      await statusCheck(update);
      loadCart();
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * This is the updateSubtotal function which takes a subtotal and updates the views
   * to reflect the correct subtotal. It will update both the checkout screen, as
   * well as the confirm purchase screen.
   * @param {number} subtotal - The current subtotal of the user's cart.
   */
  function updateSubtotal(subtotal) {
    id("subtotal-num").textContent = "Subtotal: $" + subtotal.toFixed(2);
    id("subtotal-num2").textContent = "Subtotal: $" + subtotal.toFixed(2);
  }

  /**
   * This is the handleError function which handles any error that
   * occurs on the cart site. If an error occurs, it will un-hide the
   * user section and hide everything else.
   * @param {string} message - An error message that will be appended to the error view.
   */
  function handleError(message) {
    id("error").classList.remove("hidden");
    id("checkout-container").classList.add("hidden");
    id("cart-view").classList.add("hidden");
    id("success-container").classList.add("hidden");
    id("error-message").textContent = message;
  }

  /**
   * This is the searched function that is called when a user searches for something
   * using the search bar. If the user searches for something, the page will
   * direct them to the products page and update the local storage. No returns.
   * @param {object} evt - An object, used to check if the user hit enter when they
   * searched for an object.
   */
  function searched(evt) {
    if (evt.key === "Enter") {
      window.localStorage.setItem("Searched", id("bar").value);
      window.location.href = "products.html";
    }
  }

  /**
   * This is the backToCart function which will show the user the cart view in the checkout
   * page and remove the checkout side. This will allow users to switch between the
   * cart and confirmed checkout page.
   */
  function backToCart() {
    id("cart-view").classList.remove("hidden");
    id("checkout-container").classList.add("hidden");
  }

  /**
   * This method flips the cart page from the cart view to the checkout view. It will
   * show the user new information about their current transaction. It will not let
   * the user toggle view if the cart is empty.
   * No parameters or returns
   */
  async function toCheckout() {
    let cartData = await fetch("/sportsxcel/getCart/" + window.localStorage.getItem("userId"));
    await statusCheck(cartData);
    cartData = await cartData.json();
    if (cartData["product"].length === 0) {
      let noItems = document.createElement("article");
      noItems.textContent = "Cart is empty!";
      noItems.classList.add("noItems");
      id("cart-items").appendChild(noItems);
      setTimeout(function() {
        id("cart-items").removeChild(noItems);
      }, 2000);
    } else {
      id("cart-view").classList.add("hidden");
      id("checkout-container").classList.remove("hidden");
    }
  }

  /**
   * This function checks if the passed promise resolved, or rejected. If it was rejected,
   * it will throw an error. Otherwise it will return the passed promise.
   * @param {Promise} res - A promise to be checked by this function
   * @return {Promise} res - The promise that was passed
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * This method returns an element by the ID passed in the parameter
   * @param {String} id - An ID.
   * @return {element} Returns an element with the given ID
   */
  function id(id) {
    return document.getElementById(id);
  }
})();