/**
 * Name: Zach Wu, Jordy Uribe
 * Date: 11/3/24
 * Section: CSE 154 AD
 *
 * This is the index.js page which handles the functionality of our home page
 * within our website. It allows users to search for items from the search bar
 * on the home page as well as click on the product images to automatically
 * filter results.
 */
"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * This is the init function which runs after the page loads. It adds a event listeners
   * throughout the website. No parameters or returns
   */
  function init() {
    id("bar").addEventListener("keydown", searched);
    id("baseball").addEventListener("click", filteredSport);
    id("basketball").addEventListener("click", filteredSport);
    id("soccer").addEventListener("click", filteredSport);
  }

  /**
   * This is the filteredSport function which updates the local storage and moves
   * the user to the products page with the filtered products. It allows users
   * to click on a sport section on the home page and it brings them to the products
   * page pre-loaded with that filter.
   */
  function filteredSport() {
    window.localStorage.setItem("Searched", this.id);
    window.location.href = "products.html";
  }

  /**
   * This is the searched function that is called when a user searches for something
   * using the search bar. If the user searches for something, the page will
   * direct them to the products page and update the local storage. No returns.
   * @param {object} evt - An object that can be used to track what event the user just
   * did, allows the function to know if the user clicked enter and if they did, can update
   * the page accordingly.
   */
  function searched(evt) {
    if (evt.key === "Enter") {
      window.localStorage.setItem("Searched", id("bar").value);
      window.location.href = "products.html";
    }
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