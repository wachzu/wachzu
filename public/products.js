/**
 * Name: Zach Wu, Jordy Uribe
 * Date: 11/3/24
 * Section: CSE 154 AD
 *
 * This is the JS which allows users to interact with specifically the product overview
 * section of the website. This page allows users to interact and view a variety of products
 * that our website offers, and load up single product views. This page also allows
 * users to switch views, from a grid to a list view and more.
 */
"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * This is the init function which runs after the page loads. It adds a event listeners
   * throughout the website. It will also call the loadItems function which loads up all of
   * the products in our database.
   * No parameters or returns
   */
  function init() {
    loadItems();
    qs("button").addEventListener("click", backButton);
    id("bar").addEventListener("keydown", searched);
    id("filter-btn").addEventListener("click", filterItems);
    id("clear-filters").addEventListener("click", clearFilters);
    id("show-filters").addEventListener("click", showFilters);
    id("hide-filters").addEventListener("click", showFilters);
    id("filter-view").classList.remove("hidden");
    id("toggle-view").addEventListener("click", function() {
      id("product-view-list").classList.toggle("hidden");
      id("product-view-container").classList.toggle("hidden");
    });
  }

  /**
   * This is the searched function that is called when a user searches for something
   * using the search bar. If the user searches for something, the page will
   * direct them to the products page and update the local storage. No returns.
   * @param {object} evt - An object that allows the function to know what the last inputted
   * key was in the search. Allows us to make sure the user is clicking enter before searching.
   */
  function searched(evt) {
    if (evt.key === "Enter") {
      window.localStorage.setItem("Searched", id("bar").value);
      window.location.href = "products.html";
    }
  }

  /**
   * This is the loadItems function which loads all of the products onto the page. This is
   * called when the user loads the site, and gets information from our API. No returns
   * and no parameters
   */
  async function loadItems() {
    try {
      let dataArr = [];
      if (!window.localStorage.getItem("Searched")) {
        let data = await fetch("/sportsxcel/all");
        await statusCheck(data);
        data = await data.json();
        dataArr = data["products"];
      } else {
        let data = await fetch("/sportsxcel/searchWord/" + window.localStorage.getItem("Searched"));
        await statusCheck(data);
        data = await data.json();
        dataArr = data["product"];
      }
      window.localStorage.removeItem("Searched");
      loadCards(dataArr);
    } catch (err) {
      handleError();
    }
  }

  /**
   * This is the loadCards function which takes an array of objects and
   * formats and appends each object to the products screen. It has no returns.
   * @param {Array} dataArr - An array of the items to add to the website
   */
  function loadCards(dataArr) {
    if (dataArr.length > 0) {
      for (let i = 0; i < dataArr.length; i++) {
        let curProd = dataArr[i];
        let curCard = formatCard(curProd);
        curCard.addEventListener("click", singleView);
        id("product-view").appendChild(curCard);
        let curCardList = formatCardList(curProd);
        curCardList.addEventListener("click", singleView);
        id("product-view-list").appendChild(curCardList);
      }
    } else {
      let noProd = document.createElement("p");
      noProd.textContent = "We don't have anything that matches that search!";
      id("product-view").appendChild(noProd);
    }
  }

  /**
   * This is the handleError function. Whenever there is an error within our site, this error
   * is called which hides all other views and shows the error view. This error view will
   * essentially tell users what to do when an issue happens.
   */
  function handleError() {
    id("single-product-container").classList.add("hidden");
    id("product-view-container").classList.add("hidden");
    qs("button").classList.add("hidden");
    id("error").classList.remove("hidden");
  }

  /**
   * This is the singleView function, that is called when a user clicks on a single product.
   * Once a user clicks on a single product, it loads up all of the information needed and hides
   * all of the other views.
   */
  async function singleView() {
    id("toggle-view").classList.add("hidden");
    id("filter-view").classList.add("hidden");
    id("product-view-list").classList.add("hidden");
    id("single-product-container").classList.remove("hidden");
    id("product-view-container").classList.add("hidden");
    qs("button").classList.remove("hidden");
    await loadSingleInformation(this.classList[1]);
  }

  /**
   * This is the loadSingleInformation function which, when given an id, loads the product with
   * that prouct's infromation. This function will call another that will format the page for
   * the user. No returns.
   * @param {number} id - the id of the product the user clicked on.
   */
  async function loadSingleInformation(id) {
    try {
      let data = await fetch("/sportsxcel/id/" + id);
      await statusCheck(data);
      data = await data.json();
      data = data["product"][0];
      formatSingleView(data);
    } catch (err) {
      handleError();
    }
  }

  /**
   * This is the formatSingleView function which takes an object and loads information
   * from that object. It will load up the single view and format it with all of the information.
   * No returns.
   * @param {object} data - object filled with information about the current product
   */
  function formatSingleView(data) {
    let image = createImage(data);
    let info = document.createElement("section");
    info.classList.add("single-product-information");
    let name = document.createElement("h2");
    name.textContent = data["name"];
    let price = document.createElement("p");
    price.classList.add("price");
    price.textContent = "$" + data["price"];
    let addCart = document.createElement("p");
    addCart.id = "add-cart";
    addCart.addEventListener("click", addToCart);
    addCart.textContent = "Add to Cart";
    let hr = document.createElement("hr");
    let table = createTable(data);
    info.appendChild(name);
    info.appendChild(hr);
    info.appendChild(price);
    info.appendChild(table);
    info.appendChild(addCart);
    id("single-product-view").prepend(info);
    id("single-product-view").prepend(image);
  }

  /**
   * This function creates the data table that is displayed under the product's price.
   * This table will have a bunch of information about the product the user is currently
   * looking at
   * @param {object} data - An object with a bunch of information about the current product
   * @returns {element} table - the HTML table element with all of the information loaded.
   */
  function createTable(data) {
    let table = document.createElement("table");
    table.classList.add("table-styling");
    let body = document.createElement("tbody");
    for (let prop in data) {
      if (!(prop === "product_id" || prop === "image")) {
        let curRow = document.createElement("tr");
        let curAttribute = document.createElement("td");
        let propUpperCase = prop.charAt(0).toUpperCase() + prop.slice(1);
        curAttribute.textContent = propUpperCase;
        let attributeVal = document.createElement("td");
        attributeVal.textContent = data[prop];
        curRow.appendChild(curAttribute);
        curRow.appendChild(attributeVal);
        body.appendChild(curRow);
      }
    }
    table.appendChild(body);
    return table;
  }

  /**
   * This is the createImage function which creates an HTML element and returns it.
   * The returned element will be of type image and have information from the data
   * parameter
   * @param {object} data - An object with data about the current product.
   * @returns {element} - An image with the picture of the data image.
   */
  function createImage(data) {
    let image = document.createElement("img");
    image.id = data["product_id"];
    image.classList.add("single-product");
    image.src = data["image"];
    image.alt = data["name"];
    return image;
  }

  /**
   * This is the backButton function which is called when a user hits the back button on
   * the single product view. It will clear out the infromation and reset the screen back
   * to the overview of products. No parameters or returns.
   */
  function backButton() {
    id("toggle-view").classList.remove("hidden");
    id("single-product-container").classList.add("hidden");
    id("product-view-container").classList.remove("hidden");
    qs("button").classList.add("hidden");
    id("single-product-view").innerHTML = "";
    id("filter-view").classList.remove("hidden");
  }

  /**
   * This is the formatCard function which is given an object with information about a product
   * and will format a article and return that article.
   * @param {object} curProd - object with information about the current product
   * @returns {element} curCard, the cart which will be appended to the site.
   */
  function formatCard(curProd) {
    let curCard = document.createElement("article");
    curCard.classList.add("card");
    curCard.classList.add(curProd["product_id"]);
    let image = document.createElement("img");
    image.classList.add("multiple-products");
    image.src = curProd["image"];
    image.alt = curProd["name"];
    let name = document.createElement("h3");
    name.textContent = curProd["name"];
    let price = document.createElement("p");
    price.textContent = "$" + curProd["price"];
    curCard.appendChild(image);
    curCard.appendChild(name);
    curCard.appendChild(price);
    return curCard;
  }

  /**
   * This is the formatCardList which formats all of the cards within the list
   * view on the product page. It will take a curProd object (the current project)
   * and will load that project in the list view for easy user toggling.
   * @param {object} curProd - An object with information about the current product.
   * @returns {element} - The element created for the list view.
   */
  function formatCardList(curProd) {
    let curCardList = document.createElement("article");
    curCardList.classList.add("card-product-list");
    curCardList.classList.add(curProd["product_id"]);
    let name = document.createElement("p");
    name.textContent = curProd["name"];
    let price = document.createElement("p");
    price.textContent = "$" + curProd["price"];
    price.classList.add("card-product-list-price");
    let image = document.createElement("img");
    image.alt = "product-pic";
    image.src = curProd["image"];
    image.classList.add("card-product-list-image");
    curCardList.appendChild(name);
    curCardList.appendChild(price);
    curCardList.appendChild(image);
    return curCardList;
  }

  /**
   * This function shows the filters above the product information.
   * It will be called when a user hits the "show filters" button and
   * it does not take any params or return anything
   */
  function showFilters() {
    if (id("filters-container").classList.contains("hidden")) {
      id("show-filters").classList.add("hidden");
      id("filters-container").classList.remove("hidden");
      id("buttons-filter").classList.remove("hidden");
    } else {
      id("show-filters").classList.remove("hidden");
      id("filters-container").classList.add("hidden");
      id("buttons-filter").classList.add("hidden");
    }
  }

  /**
   * This is the filterItems function which is called when a user
   * uses the filters to search for items. It will load the page
   * with a bunch of products that match what the user clicked for the
   * filters.
   */
  async function filterItems() {
    try {
      let query = generateQuery();
      let filteredData = await fetch(query);
      await statusCheck(filteredData);
      filteredData = await filteredData.json();
      id("product-view").innerHTML = "";
      id("product-view-list").innerHTML = "";
      id("filters-container").classList.add("hidden");
      id("show-filters").classList.remove("hidden");
      id("buttons-filter").classList.add("hidden");
      loadCards(filteredData["product"]);
    } catch (err) {
      handleError();
    }
  }

  /**
   * This function looks at all of the filters on the products page
   * and generates a query for the clicked filters. It then returns that string.
   * It doesn't take any parameters.
   * @returns {string} query - a string that can be used for a SQL query
   */
  function generateQuery() {
    let divs = id("filters").children;
    let query = "/sportsxcel/filters?";
    for (let i = 0; i < divs.length; i++) {
      if (divs[i].tagName === "DIV") {
        let input = divs[i].children;
        let attributeName = divs[i].firstElementChild.id;
        for (let j = 0; j < input.length; j++) {
          if (input[j].tagName === "INPUT") {
            if (input[j].checked) {
              query = query + attributeName + "=" + input[j].value + "&";
            }
          }
        }
      }
    }
    if (query.endsWith("&")) {
      query = query.substring(0, query.length - 1);
    }
    return query;
  }

  /**
   * This is the addToCart function. When this function is called, it updates the user's cart
   * and switches the user to the cart page. It does nto take any parameters and does
   * not return anything.
   */
  async function addToCart() {
    try {
      let data = new FormData;
      let prodId = this.parentNode.previousElementSibling.id;
      data.append("user_id", window.localStorage.getItem("userId"));
      data.append("product_id", prodId);
      let cartInfo = await fetch("/sportsxcel/addToCart", {method: "POST", body: data});
      await statusCheck(cartInfo);
      window.location.href = "cart.html";
    } catch (err) {
      handleError();
    }
  }

  /**
   * This is the clearFilters function which removes all previous
   * choices by the user. It essentially resets the filters. Does not take
   * any parameters and does not return anything.
   */
  function clearFilters() {
    let divs = id("filters").children;
    for (let i = 0; i < divs.length; i++) {
      if (divs[i].tagName === "DIV") {
        let input = divs[i].children;
        for (let j = 0; j < input.length; j++) {
          input[j].checked = false;
        }
      }
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

  /**
   * This method returns an element by the class passed in the parameter
   * @param {String} selector - An class to search by
   * @return {element} Returns an element with the given class
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();