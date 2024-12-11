/**
 * Name: Zach Wu, Jordy Uribe
 * Date: 11/3/24
 * Section: CSE 154 AD
 *
 * This is the account.js page which helps with the functionality for the account
 * page. This page allows users to view their information and toggle views for
 * the posting of a product. It also loads up all of the past posted items and
 * past transactions.
 */
"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * This is the init function which runs after the page loads. It adds a event listeners
   * throughout the website. Additionally, it calls the loadPage function, which loads up
   * the page with important user information.
   * No parameters or returns
   */
  function init() {
    id("create-account-btn").addEventListener("click", createAccountView);
    id("sign-in-btn").addEventListener("click", signInView);
    id("sign-in-form").addEventListener("submit", submitSignIn);
    id("create-account-form").addEventListener("submit", submitCreateAccount);
    id("sign-out-btn").addEventListener("click", function() {
      window.localStorage.removeItem("userId");
      window.location.href = "account.html";
    });
    id("load-post-view").addEventListener("click", function() {
      id("post-form-container").classList.toggle("hidden");
    });
    id("post-product").addEventListener("submit", postProduct);
    id("load-posted").addEventListener("click", function() {
      id("past-posted").classList.toggle("hidden");
    });
    loadPage();
  }

  /**
   * This is the postProduct function which is called upon when the user submits
   * a product to post. It will update the database with the nwe product
   * and will temporarily show a success image (lebron). Then it will show the
   * form again, with the same values in case the user wants to post the same
   * thing again. No returns.
   * @param {object} evt Allows us to prevent the default behavior of the page
   * refreshing
   */
  async function postProduct(evt) {
    evt.preventDefault();
    try {
      let data = new FormData(id("post-product"));
      data.append("user_id", window.localStorage.getItem("userId"));
      let post = await fetch("/sportsxcel/postProduct", {method: "POST", body: data});
      await statusCheck(post);
      id("post-form-container").classList.add("hidden");
      id("success-container").classList.remove("hidden");
      setTimeout(function() {
        id("post-form-container").classList.remove("hidden");
        id("success-container").classList.add("hidden");
      }, 2000);
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * This is the load page button which, upon loading, will check if the
   * user is signed in. If they are signed in, it will load up the users information.
   * If they are not logged in, it will show the sign in/create account view.
   */
  function loadPage() {
    if (window.localStorage.getItem("userId")) {
      id("sign-in").classList.add("hidden");
      id("create-account").classList.add("hidden");
      id("account-view").classList.remove("hidden");
      loadUserInformation();
    }
  }

  /**
   * This is the loadUserInformation function which loads up the user's
   * information. It updates every part of the user view and also calls
   * the loadTransactions function which populates the page with past
   * transactions. No returns or parameters.
   */
  async function loadUserInformation() {
    try {
      let userId = window.localStorage.getItem("userId");
      let userData = await fetch("/sportsxcel/getUser/" + userId);
      await statusCheck(userData);
      userData = await userData.json();
      id("user-name").textContent = userData["name"];
      id("user-email").textContent = userData["email"];
      id("pswd").textContent = userData["password"];
      await loadPosted(userData["posted_items"]);
      let pastTransactions = await fetch("/sportsxcel/getTransactions/" + userId);
      await statusCheck(pastTransactions);
      pastTransactions = await pastTransactions.json();
      await loadTransactions(pastTransactions);
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * LoadPosted is a function which takes an array in string format, formats that
   * string, then gets all of the information from that array and loads the posted
   * products section of the account view. The given string array has all of the
   * info about posted products, so it will use this information and update the account
   * view. It has no returns.
   * @param {String} postedItems An array in the form of a string that holds information
   * about items the user has posted onto this website.
   */
  async function loadPosted(postedItems) {
    postedItems = JSON.parse(postedItems);
    for (let i = 0; i < postedItems.length; i++) {
      let prod = await fetch("/sportsxcel/id/" + postedItems[i]);
      await statusCheck(prod);
      prod = await prod.json();
      prod = prod["product"][0];
      let curPost = document.createElement("article");
      curPost.classList.add("post");
      let name = document.createElement("p");
      name.classList.add("post-name");
      name.textContent = "Product Name: " + prod["name"];
      let image = document.createElement("img");
      image.alt = "product image";
      image.src = prod["image"];
      let stock = document.createElement("p");
      stock.textContent = "Current stock: " + prod["stock"];
      curPost.appendChild(name);
      curPost.appendChild(image);
      curPost.appendChild(stock);
      id("past-posted").appendChild(curPost);
    }
  }

  /**
   * This is the loadTransactions method which takes an array of purchased products
   * and adds each to the current transaction information card. It doesn't
   * return anything.
   * @param {array} transArr an array of purchased products.
   */
  async function loadTransactions(transArr) {
    for (let i = 0; i < transArr.length; i++) {
      let transactionCard = await createTransactionCard(transArr[i]);
      id("all-transactions").appendChild(transactionCard);
    }
  }

  /**
   * This is the create transaction card function which creates a card
   * that represents a user's transaction. It will have information in it
   * including the name and the image of the product.
   * @param {object} transObj Information about the current transaction
   * @returns {element} An HTML element which is the article with the transaction inside.
   */
  async function createTransactionCard(transObj) {
    try {
      let transactionCard = document.createElement("article");
      transactionCard.classList.add("transaction");
      let spanCode = document.createElement("span");
      spanCode.textContent = "Confirmation Code:";
      spanCode.classList.add("bold");
      let spanConfirmationCode = document.createElement("span");
      spanConfirmationCode.textContent = transObj["confirmation"];
      let purchasedProducts = await populateSection(transObj);
      transactionCard.appendChild(spanCode);
      transactionCard.appendChild(spanConfirmationCode);
      transactionCard.appendChild(purchasedProducts);
      return transactionCard;
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * This function takes an object that represents all items in a transaction and returns
   * a HTML section with information about each item. It will have all info needed
   * within the section.
   * @param {object} transObj An object with two fields, the transaction items and the
   * confirmation code.
   * @returns {element} Html element that is a section with all purchased products.
   */
  async function populateSection(transObj) {
    let productArr = JSON.parse(transObj["transaction_items"]);
    let purchasedProducts = document.createElement("section");
    purchasedProducts.classList.add("purchased-products");
    for (let i = 0; i < productArr.length; i++) {
      let prodId = productArr[i];
      let prodInfo = await fetch("/sportsxcel/id/" + prodId);
      await statusCheck(prodInfo);
      prodInfo = await prodInfo.json();
      prodInfo = prodInfo["product"][0];
      let product = document.createElement("article");
      product.classList.add("product");
      let image = document.createElement("img");
      image.alt = prodInfo["name"];
      image.src = prodInfo["image"];
      let prodName = document.createElement("p");
      prodName.textContent = prodInfo["name"];
      product.appendChild(image);
      product.appendChild(prodName);
      purchasedProducts.appendChild(product);
    }
    return purchasedProducts;
  }

  /**
   * This is the submit create account function which is called when a user
   * creates an account. It will update our database with their information and
   * will also switch the page to the account view.
   * @param {object} evt object which will be used to prevent the default
   * behavior of the page reloading when a form is submitted.
   * No returns.
   */
  async function submitCreateAccount(evt) {
    try {
      evt.preventDefault();
      let formInfo = new FormData(id("create-account-form"));
      let data = await fetch("/sportsxcel/createUser", {method: "POST", body: formInfo});
      await statusCheck(data);
      data = await data.json();
      let userId = data["userId"];
      id("sign-in").classList.add("hidden");
      id("create-account").classList.add("hidden");
      id("account-view").classList.remove("hidden");
      window.localStorage.setItem("userId", userId);
      loadUserInformation();
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * This is the submit sign in object which is called when a user submits
   * the sign in form. When this occurs, this function will check the given
   * password and then allow the user to log in if the password and email are
   * correct. It will also update the local storage, allowing users to stay signed
   * in.
   * @param {object} evt event object.
   */
  async function submitSignIn(evt) {
    try {
      evt.preventDefault();
      let formInfo = new FormData(id("sign-in-form"));
      let email = formInfo.get("email");
      let pswd = formInfo.get("password");
      let userInfo = await fetch("/sportsxcel/checkUser/" + email);
      await statusCheck(userInfo);
      userInfo = await userInfo.json();
      let checkedPswd = userInfo["password"];
      let userId = userInfo["user_id"];
      if (pswd === checkedPswd) {
        id("sign-in").classList.add("hidden");
        id("create-account").classList.add("hidden");
        id("account-view").classList.remove("hidden");
        window.localStorage.setItem("userId", userId);
        loadUserInformation();
      } else {
        id("wrong-pswd").classList.remove("hidden");
        setTimeout(function() {
          id("wrong-pswd").classList.add("hidden");
        }, 2000);
      }
    } catch (err) {
      handleError(err.message);
    }
  }

  /**
   * This is the createAccountView method which will switch the user's view
   * from that of the sign in view to the create account view.
   */
  function createAccountView() {
    id("create-account").classList.remove("hidden");
    id("sign-in").classList.add("hidden");
  }

  /**
   * This is the signInView which allows users to sign in to the website.
   * If this is called, it will switch the view from the create account view
   * to the sign in view.
   */
  function signInView() {
    id("create-account").classList.add("hidden");
    id("sign-in").classList.remove("hidden");
  }

  /**
   * This is the handleError function which is called whenever something goes
   * wrong on the website. It will hide all of the sign in or account
   * views and encourage users to go home and try again later.
   * @param {string} message - A error message that will be appended to the error view
   */
  function handleError(message) {
    id("sign-in").classList.add("hidden");
    id("create-account").classList.add("hidden");
    id("account-view").classList.add("hidden");
    id("error").classList.remove("hidden");
    id("error-msg").textContent = message;
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