/**
 * Name: Zach Wu, Jordy Uribe
 * Date: 11/3/24
 * Section: CSE 154 AD
 *
 * This is the app.js page, which allows a user to interact with our database.
 * There are a bunch of endpoints defined which allow the user to interact with
 * our database in many ways, from creating an account to purchasing an order.
 */
"use strict";

const express = require("express");
const app = express();

const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const multer = require("multer");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

/**
 * This is the get solo item endpoint which requires a path paramter and will
 * return information about the item specified in the path parameter.
 */
app.get("/sportsxcel/id/:id", async function(req, res) {
  try {
    let db = await getDBConnection();
    let prodId = req.params["id"];
    let queryCheck = "SELECT * FROM product WHERE product_id=?";
    let prodInfo = await db.all(queryCheck, prodId);
    if (prodInfo.length === 0) {
      await db.close();
      res.status(400).type("text")
        .send("Unfortunately we cannot find that product! Try again later.");
    } else {
      let prodObj = {
        "product": prodInfo
      };
      await db.close();
      res.json(prodObj);
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the all endpoint which can take a query parameter representing a sport and will return
 * all of the products associated with that sport. If no query parameter is present, it will
 * return all available products.
 */
app.get("/sportsxcel/all", async function(req, res) {
  try {
    let db = await getDBConnection();
    if (req.query["sport"]) {
      let query = "SELECT * FROM product WHERE sport=? AND stock>0 ORDER BY stock DESC";
      let allInfo = await db.all(query, req.query["sport"]);
      if (allInfo.length === 0) {
        await db.close();
        res.status(400).type("text")
          .send("We do not have any products from that sport!");
      } else {
        let infoObj = {
          "products": allInfo
        };
        await db.close();
        res.json(infoObj);
      }
    } else {
      let sportInfo = await db.all("SELECT * FROM product WHERE stock>0 ORDER BY sport, stock");
      let infoObj = {
        "products": sportInfo
      };
      await db.close();
      res.json(infoObj);
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the postProduct endpoint which allows users to post an item to the database.
 * It requires that users put an image, price and name but will allow for many more
 * attributes.
 */
app.post("/sportsxcel/postProduct", async function(req, res) {
  try {
    let body = req.body;
    if (body["image"] && body["price"] && body["user_id"]) {
      let db = await getDBConnection();
      let query = "INSERT INTO product (sport, gender, color, name, stock, price, type, brand," +
          " location, image) VALUES (?,?,?,?,?,?,?,?,?,?)";
      let attributeArr = [body.sport, body.gender, body.color, body.name, body.stock, body.price,
          body.type, body.brand, body.location, body.image];
      let addedProd = await db.run(query, attributeArr);
      let newProdId = addedProd.lastID;
      let queryUser = "SELECT posted_items FROM user WHERE user_id=?";
      let data = await db.all(queryUser, body["user_id"]);
      let infoArr = updatePosted(data[0]["posted_items"], body["user_id"], newProdId);
      let query2 = "UPDATE user SET posted_items=? WHERE user_id=?";
      await db.run(query2, infoArr);
      await db.close();
      res.type("text").send("Congrats! You added a new item to our website!");
    } else {
      res.status(400).type("text")
        .send("Missing one or more of the required parameters!");
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the load cart endpoint which loads the items that are currently in the user's
 * cart and sends them back to the user. It requires the cart_id from the user.
 */
app.get("/sportsxcel/loadCart/cart_id/:cart_id", async function(req, res) {
  try {
    let db = await getDBConnection();
    let cartId = req.params["cart_id"];
    let query = "SELECT cart_items FROM cart WHERE cart_id=?";
    let cartItems = await db.get(query, cartId);
    let idArr = JSON.parse(cartItems["cart_items"]);
    let cartItemsArr = [];
    for (let i = 0; i < idArr.length; i++) {
      let prodQuery = "SELECT name, price, image FROM product WHERE product_id=?";
      let curProd = await db.get(prodQuery, idArr[i]);
      cartItemsArr.push(curProd);
    }
    let cartObj = {
      "cart": cartItemsArr
    };
    await db.close();
    res.json(cartObj);
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the addToCart endpoint which adds an item's id to the user's cart. This
 * requires that a user sends the user id and the product id when calling upon this endpoint.
 */
app.post("/sportsxcel/addToCart", async function(req, res) {
  try {
    let db = await getDBConnection();
    if (req.body["user_id"] && req.body["product_id"]) {
      let userId = req.body["user_id"];
      let prodId = Number(req.body["product_id"]);
      let cart = await db.all("SELECT cart_items FROM cart WHERE user_id=?", userId);
      cart = JSON.parse(cart[0]["cart_items"]);
      cart.push(prodId);
      let prodArr = JSON.stringify(cart);
      let query = "UPDATE cart SET cart_items=? WHERE user_id=?";
      await db.run(query, [prodArr, userId]);
      await db.close();
      res.type("text").send("Successfully Added Item to Cart");
    } else {
      await db.close();
      res.status(400).type("text")
        .send("Missing one or more of the required parameter!");
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the searchWord endpoint. When a user wants to search for something by
 * word (as opposed to by number - like name vs price) they can use this endpoint
 * to get the results they are looking for.
 */
app.get("/sportsxcel/searchWord/:search", async function(req, res) {
  try {
    let db = await getDBConnection();
    let search = req.params["search"];
    let query = "SELECT * FROM product WHERE sport LIKE ? OR gender LIKE ?" +
        " OR color LIKE ? OR name LIKE ? OR type LIKE ? OR brand LIKE ? ORDER BY sport";
    let wildcardArr = [];
    let replacement = "";
    if (search === "male") {
      replacement = search + "%";
    } else {
      replacement = "%" + search + "%";
    }
    for (let i = 0; i < 6; i++) {
      wildcardArr.push(replacement);
    }
    let data = await db.all(query, wildcardArr);
    let dataObj = {
      "product": data
    };
    await db.close();
    res.json(dataObj);
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the filters endpoint which takes query parameters and returns a JSON
 * object with one field - products and then an array of products that fit the filtered
 * description.
 */
app.get("/sportsxcel/filters", async function(req, res) {
  try {
    let db = await getDBConnection();
    if (Object.keys(req.query).length > 0) {
      let query = "SELECT * FROM product WHERE ";
      let fetchInfo = req.query;
      let formattedArr = formatQuery(fetchInfo, query);
      let filterInfo = await db.all(formattedArr[0], formattedArr[1]);
      let dataObj = {
        "product": filterInfo
      };
      await db.close();
      res.json(dataObj);
    } else {
      let info = await db.all("SELECT * FROM product ORDER BY sport");
      let dataObj = {
        "product": info
      };
      await db.close();
      res.json(dataObj);
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the buyCart endpoint which updates the user's cart to be empty
 * and updates the database's stock of products. It will only allow a user to purchase
 * something if they correctly enter the right number of numbers on the information form.
 * Additionally if the stock is 0 for any object, it will not allow the user to purchase
 * any of the objects.
 */
app.post("/sportsxcel/buyCart", async function(req, res) {
  try {
    let bod = req.body;
    if (bod["user_id"] && bod["zipcode"] && bod["card-num"] && bod["cvv"]) {
      if (bod["zipcode"].length === 5 && bod["card-num"].length === 16 && bod["cvv"].length === 3) {
        let db = await getDBConnection();
        let cart = await updateStock(db, bod);
        if (!(cart)) {
          await db.close();
          res.status(400).type("text")
            .send("One or more products is out of stock!");
        } else {
          let confirmation = await buyCartHelper(db, bod, cart);
          await db.close();
          res.type("text").send(confirmation);
        }
      } else {
        res.status(400).type("text")
          .send("Incorrect information, make sure numbers are correct.");
      }
    } else {
      res.status(400).type("text")
        .send("Missing the required parameter.");
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the getCart endpoint which requires a path parameter of the
 * user's id and returns all of the items in their cart. It will return
 * the items in the cart in the form of a JSON object with one field, which
 * is an array of products.
 */
app.get("/sportsxcel/getCart/:userId", async function(req, res) {
  try {
    let db = await getDBConnection();
    let cart = await db.all("SELECT cart_items FROM cart WHERE user_id=?", req.params["userId"]);
    cart = cart[0]["cart_items"];
    cart = JSON.parse(cart);
    let prodArr = [];
    for (let i = 0; i < cart.length; i++) {
      let curProd = await db.get("SELECT * FROM product WHERE product_id=?", cart[i]);
      prodArr.push(curProd);
    }
    let prodObj = {
      "product": prodArr
    };
    await db.close();
    res.json(prodObj);
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the checkUser endpoint which will essentially take a user's email
 * and return all of the the password and user ID so the front end can
 * check that the user does exist within the database.
 */
app.get("/sportsxcel/checkUser/:email", async function(req, res) {
  try {
    let db = await getDBConnection();
    let query = "SELECT user_id, password FROM user WHERE email=?";
    let data = await db.all(query, req.params["email"]);
    if (data.length > 0) {
      data = data[0];
      await db.close();
      res.json(data);
    } else {
      await db.close();
      res.status(400).type("text")
        .send("We do not have this account registered! Create an account instead.");
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the getUser endpoint which requires a path parameter which is the
 * user's id and will return all of the information related to that user. It will
 * return information like their name and password and more.
 */
app.get("/sportsxcel/getUser/:userId", async function(req, res) {
  try {
    let db = await getDBConnection();
    let data = await db.all("SELECT * FROM user WHERE user_id=?", req.params["userId"]);
    if (data.length === 0) {
      res.status(400).type("text")
        .send("Cannot find user, make sure that they are registered!");
    } else {
      res.json(data[0]);
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the create user endpoint. It takes a name, email and password within its
 * body and generates a user. Important things from this function include the fact
 * that it updates
 */
app.post("/sportsxcel/createUser", async function(req, res) {
  try {
    if (req.body["name"] && req.body["email"] && req.body["password"]) {
      let db = await getDBConnection();
      let checkEmail = await db.all("SELECT email FROM user WHERE email=?", req.body["email"]);
      if (checkEmail.length === 0) {
        let addedUser = await addUserHelper(db, req.body);
        let id = addedUser.lastID;
        let cart = await db.run("INSERT INTO cart (user_id, cart_items) VALUES (?,?)", [id, "[]"]);
        await db.run("UPDATE user SET cart_id=? WHERE user_id=?", [cart.lastID, id]);
        let idObj = {
          userId: id,
          email: req.body["email"]
        };
        await db.close();
        res.json(idObj);
      } else {
        await db.close();
        res.status(400).type("text")
          .send("Email is already registered with Sportsxcel! Sign in instead.");
      }
    } else {
      res.status(400).type("text")
        .send("Missing required parameters");
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the getTransactions endpoint which will return all of the user's
 * transactions. It takes one path parameter that is the user's id.
 */
app.get("/sportsxcel/getTransactions/:userId", async function(req, res) {
  try {
    let db = await getDBConnection();
    let userId = req.params["userId"];
    let transQuery = "SELECT confirmation, transaction_items FROM transactions WHERE user_id=?";
    let transactions = await db.all(transQuery, userId);
    await db.close();
    res.json(transactions);
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the sportsxcel/removeFromCart endpoint which removes an item
 * from the user's cart. It requires a user id, a product id and a boolean that
 * is whether or not the user wants to remove all instances or just one. It will
 * send back a text message that will say the removal was successful. This
 * endpoint updates the user's cart.
 */
app.post("/sportsxcel/removeFromCart", async function(req, res) {
  try {
    if (req.body["user_id"] && req.body["product_id"] && req.body["removeAll"]) {
      let db = await getDBConnection();
      let getCart = await getCartHelper(req.body, db);
      let removeAll = req.body["removeAll"];
      let firstInstance = true;
      let length = getCart.length;
      for (let i = 0; i < length; i++) {
        if (getCart[i] === Number(req.body["product_id"]) && firstInstance) {
          getCart.splice(i, 1);
          i--;
          if (removeAll === "false") {
            firstInstance = false;
          }
        }
      }
      removeFromCartHelper(db, getCart, req.body);
      await db.close();
      res.type("text")
        .send("Successfully Removed Item");
    } else {
      res.status(400).type("text")
        .send("Missing one or more of the required parameter");
    }
  } catch (err) {
    res.status(500).type("text")
      .send("There was a server error! Try again later.");
  }
});

/**
 * This is the addUserHelper function, which is a helper function for the endpoint above.
 * This function inserts a new user into the database and returns information about the
 * newly added user.
 * @param {object} db a way for the back end to access the database
 * @param {object} body Information about the user that was just added.
 * @returns {object} addedUser, information about the user that was just returned.
 */
async function addUserHelper(db, body) {
  let updateUser = "INSERT INTO user (email, name, password, posted_items) VALUES (?,?,?,?)";
  let userQueryArr = [body["email"], body["name"], body["password"], "[]"];
  let addedUser = await db.run(updateUser, userQueryArr);
  return addedUser;
}

/**
 * This is the createTransactionId function which takes a transaction id
 * and generates a unique confirmation number. It will return that
 * conficmation number.
 * @param {number} id The id of the transaction
 * @returns {String} - a unique transaction id.
 */
function createTransactionId(id) {
  let result = "" + id + ".sportsxcel" + Math.floor((Math.random() * 100000));
  return result;
}

/**
 * This is the buyCartHelper function which takes three parameters and updates
 * the databases. It will update the databases then return the confirmation code
 * that is generated.
 * @param {object} db A way to interact with the database.
 * @param {object} bod Information about the user, given through the parameters
 * @param {Array} cart all the items within the user's cart
 * @returns {string} a confirmation code that is unique and randomly generated.
 */
async function buyCartHelper(db, bod, cart) {
  let queryTransaction = "INSERT INTO transactions (user_id, transaction_items) VALUES (?,?)";
  let transactionId = await db.run(queryTransaction, [bod["user_id"], JSON.stringify(cart)]);
  let confirmation = createTransactionId(transactionId.lastID);
  let infoArr = [confirmation, transactionId.lastID];
  await db.run("UPDATE transactions SET confirmation=? WHERE transaction_id=?", infoArr);
  await db.run("UPDATE cart SET cart_items='[]' WHERE user_id=?", bod["user_id"]);
  return confirmation;
}

/**
 * This is the updatePosted method, which is a helper method for the endpoint which
 * adds new products. The purpose of this helper method is to create and format the
 * array of wildcards for the query which updates the items the user has posted.
 * @param {string} products - A string that is an array formatted into a string with info
 * about posted items
 * @param {number} id - The user's id
 * @param {number} newProdId - The id of the product to be added.
 * @returns {Array} - formatted with information for the query.
 */
function updatePosted(products, id, newProdId) {
  let productsArr = [];
  productsArr = JSON.parse(products);
  productsArr.push(newProdId);
  let productsArrString = JSON.stringify(productsArr);
  let infoArr = [productsArrString, id];
  return infoArr;
}

/**
 * This is the helper method for the filter endpoint. This method formats both the array
 * and the query string needed for the query and returns both in an array.
 * @param {object} fetchInfo an object with many attributes which represent what the user searched
 * @param {String} query a string that has the start to a search query.
 * @returns {array} An array with both the query and another array that has all of the attributes.
 * This will be used for an INSERT INTO SQL statement, hence why both are required.
 */
function formatQuery(fetchInfo, query) {
  let infoArr = [];
  for (let attribute in fetchInfo) {
    query = query + attribute + " LIKE ? AND ";
    if (attribute === "gender") {
      infoArr.push(fetchInfo[attribute] + "%");
    } else {
      infoArr.push("%" + fetchInfo[attribute] + "%");
    }
  }
  if (query.endsWith(" AND ")) {
    query = query.substring(0, query.length - 5);
  }
  let result = [query, infoArr];
  return result;
}

/**
 * This is the getCartHelper function which gets the cart and returns it. It uses
 * a fetch call to get the cart, then formats it correctly and returns it for the
 * removeFromCart endpoint to use.
 * @param {object} body An object that has information that the user passes through
 * the request. Has important information like the user's id.
 * @param {object} db An object that allows the function to communicate with the database.
 * @returns {Array} - an array of objects that are in the user's cart.
 */
async function getCartHelper(body, db) {
  let query = "SELECT cart_items FROM cart WHERE user_id=?";
  let getCart = await db.get(query, body["user_id"]);
  getCart = JSON.parse(getCart["cart_items"]);
  return getCart;
}

/**
 * This is the removeFromCartHelper function which updates the user's cart. This function
 * takes an array of items that are in the cart and then goes and updates it on the database
 * so when the user reloads their cart, they will see the updated cart.
 * @param {object} db _ An object that allows us to interact with the database
 * @param {Array} getCart An array of items that are currently in the user's cart.
 * @param {object} body - Information from the user about which item to remove and
 * the user's id.
 */
async function removeFromCartHelper(db, getCart, body) {
  getCart = JSON.stringify(getCart);
  let infoArr = [getCart, body["user_id"]];
  await db.run("UPDATE cart SET cart_items=? WHERE user_id=?", infoArr);
}

/**
 * This is the updateStock method which updates the stock of each item. If someone
 * attempts to buy an item and the stock is at 0, it will prematurely return an
 * undefined value. This will ensure that users cannot buy something that has 0 stock.
 * @param {object} db - A way to interact with the sportsxcel database
 * @param {object} bod - Information about the given payment info (zipcode, user
 * id and more)
 * @returns {array} An array with the user's cart items.
 */
async function updateStock(db, bod) {
  let cart = await db.all("SELECT cart_items FROM cart WHERE user_id=?", bod["user_id"]);
  cart = JSON.parse(cart[0]["cart_items"]);
  for (let i = 0; i < cart.length; i++) {
    let checkStock = "SELECT product_id FROM product WHERE stock=0 AND product_id=?";
    let none = await db.all(checkStock, cart[i]);
    if (none.length > 0) {
      return;
    }
  }
  for (let i = 0; i < cart.length; i++) {
    await db.run("UPDATE product SET stock = stock - 1 WHERE product_id=?", cart[i]);
  }
  return cart;
}

/**
 * This is the getDBConnection which when called creates a connection to the
 * database and returns a way to connect to the database.
 * @returns {object} db - a way for other functions to access the database.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "sportsxcel (1).db",
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);