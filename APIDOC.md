# SportsXcel API Documentation - Zachary Wu and Jordy Uribe
This API is used for implementing our SportsXcel website. This API will allow users to view
products, post products, purchase products and view and manage their cart.

## Load single product endpoint
**Request Format:** /sportsxcel/id/:id

**Parameters** Path parameter which is the id of the product.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This will return all of the information needed for viewing a single item.

**Example Request:** /sportsxcel/id/0

**Example Response:**
*Fill in example response in the ticks*

```
{
  "product": [
    {
      "product_id": 0,
      "sport": "basketball",
      "gender": "female",
      "color": "blue",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/24NIKWWRNWLVTGRPXSOW_Lt_Carbon_Wht_Ftbll_Grey?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Renew Elevate 3",
      "price": 84.99,
      "type": "court",
      "stock": 13,
      "brand": "Nike",
      "location": "indoor"
    }
  ]
}
```

**Error Handling:**
If there is a server-side error, it will return a text error message with status code 500 and
message "There was a server error! Try again later.". If the id given through the path parameter
does not exist within the database, then it will send a message with status code 400 and error
message "Unfortunately we cannot find that product! Try again later.".


## Load product view (many products)
**Request Format:** /sportsxcel/all

**Request Type:** GET

**Parameters** Optional query parameter where the parameter
is the name of the sport you want products from

**Returned Data Format**: JSON

**Description:** This endpoint will return a JSON object with many different products.
If a user requests only products from a specific sport through a query parameter, it will only
return products from that sport. Otherwise, it will return all of the available (stock > 0) products

**Example Request 1:** /sportsxcel/all?sport=basketball

**Example Response:**

```
{
  "products": [
    {
      "product_id": 15,
      "sport": "basketball",
      "gender": "female",
      "color": "white",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/FZ6598103_BlckWhtKineticgrn_AL?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Tatum 3",
      "price": 124.99,
      "type": "court",
      "stock": 40,
      "brand": "Nike",
      "location": "Indoor"
    },
    {
      "product_id": 12,
      "sport": "basketball",
      "gender": "female",
      "color": "white",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/FZ2471100_SailBlkVaporGrn_AL?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Jordan Heir",
      "price": 109.99,
      "type": "court",
      "stock": 36,
      "brand": "Jordan",
      "location": "Indoor/Outdoor"
    }
  ]
}
```

**Example Request 2:** /sportsxcel/all

**Example Response:**

```
{
  "products": [
    {
      "product_id": 28,
      "sport": "baseball",
      "gender": "male",
      "color": "black",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/24NWBMFRSHFMX3000CLTA_Black_White?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Fresh Foam X 3000 V7",
      "price": 129.99,
      "type": "cleats",
      "stock": 21,
      "brand": "New Balance",
      "location": "Outdoor"
    },
    {
      "product_id": 26,
      "sport": "baseball",
      "gender": "male",
      "color": "red",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/23NIKMFRCTRT9KYSTRBB_White_University_Red_Team_Red?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Trout 9 Keystone",
      "price": 54.99,
      "type": "cleat",
      "stock": 29,
      "brand": "Nike",
      "location": "Outdoor"
    }
  ]
}
```

**Error Handling:**
If there is a server-side error it will return with status code 500 and a text
message that says "There was a server error! Try again later". If the query parameter passed in is
incorrect, or our database does not have any products for that sport, it will return a text message
that says "We do not have any products from that sport!".


## Add new item to database (post an item to sell)
**Request Format:** /sportsxcel/postProduct

**Parameters** This requires that there be a name, user id and image within the body. However the user can also add a bunch more attributes, including sport, color, gender and more. To see the full list, look at the example body.
**Request Type:** POST

**Returned Data Format**: TEXT

**Description:** This endpoint will update the database with the new item, as well as update the
user's posted_items list (so a user can see what they've posted). If successful, it will return a
text message that says "Congrats! You added a new item to our website!".

**Example Request:** /sportsxcel/postProduct
**Example body**
```
{
  sport: "basketball",
  color: "blue",
  gender: "male",
  stock: 3,
  name: "Lebron 21",
  price: "129.99",
  type: "court",
  brand: "nike",
  location: "outdoor",
  user_id: 0;
}
```

**Example Response:**

```
Congrats! You added a new item to our website!
```

**Error Handling:**
If the body is missing a parameter, it will return a text message with status code 400 that says
"Missing one or more of the required parameters!". If there is a server-side error, it will return
an error message saying "There was a server error! Try again later.".


## Add to cart endpoint
**Request Format:** /sportsxcel/addToCart

**Request Type:** POST

**Parameters** Required body parameters of the product id and the user's id.
**Returned Data Format**: TEXT

**Description:** This endpoint will add a product to your cart. It will update the user's cart
with the new item. It requires the id of the product and the id of the user.

**Example Request:** /sportsxcel/addToCart

**Example Body**
```
{
  user_id: 0,
  product_id: 25
}
```

**Example Response:**

```
"Successfully Added Item To Cart!"
```

**Error Handling:**
This will return an error with status code 500 if it cannot add the items to the cart and will send
a text message saying "There was a server error! Try again later.".
If there is a missing parameter, it will send  message with status code 400 that says "Missing one or more of the required parameters".



## Remove From Cart endpoint
**Request Format:** /sportsxcel/removeFromCart

**Request Type:** POST

**Parameters** Required body parameters of the product id, the user's id and a removeAll field which needs to be "true" if the user wants to remove all instances, not just one instance of an item within the cart.

**Returned Data Format**: TEXT

**Description:** This endpoint will remove an item from a user's cart. It requires the product id and the user's id and then will go update the cart. It also requires a boolean that represents whether the user wants to remove all instances of the item, or just one instance. It will send a success message (text) if the request is successful.

**Example Request:** /sportsxcel/removeFromCart

**Example Body**
```
{
  user_id: 0,
  product_id: 25
  removeAll: "false"
}
```

**Example Response:**

```
"Successfully Removed Item"
```

**Error Handling:**
This will return an error with status code 500 if it cannot add the items to the cart and will send
a text message saying "There was a server error! Try again later.".
If there is a missing parameter, it will send  message with status code 400 that says "Missing one or more of the required parameters".



## Load cart endpoint
**Request Format:** /sportsxcel/loadCart/cart_id/:cart_id

**Request Type:** GET

**Parameters** Path parameter of the cart_id. Each user is assigned a cart_id when their account
is created.

**Returned Data Format**: JSON

**Description:** This endpoint will send back the image, name and price of each item within the
users cart. It will send these back as a JSON object with an array inside.

**Example Request:** /sportsxcel/loadCart/cart_id/0

**Example Response:**

```
{
  "cart": [
    {
      "name": "Ja 1",
      "price": 129.99,
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5LEJVzYqOcOElcEoeRuQivzkQ4qeoy9dEPw&s"
    },
    {
      "name": "Future 7 Match",
      "price": 89.99,
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/24PUMWFTR7MTCHFGGCLTB_White_Purple?qlt=70&wid=500&fmt=webp&op_sharpen=1"
    }
  ]
}
```

**Error Handling:**
This will return an error with status code 500 if it cannot add the items to the cart and will send
a text message saying "There was a server error! Try again later.".


## Search by word endpoint
**Request Format:** /sportsxcel/searchWord/:search

**Parameters** Path parameter which is the string that the user searched

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This will return all of the information needed for viewing items that have the searched path parameter somewhere.

**Example Request:** /sportsxcel/searchWord/sabrina

**Example Response:**
*Fill in example response in the ticks*

```
{
  "product": [
    {
      "product_id": 7,
      "sport": "basketball",
      "gender": "male",
      "color": "green",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/HF3234300_UnigldBlkOrngUnibluGy_AL?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Sabrina 1s",
      "price": 129.99,
      "type": "court shoes",
      "stock": 14,
      "brand": "Nike",
      "location": "indoor"
    }
  ]
}
```

**Error Handling:**
If there is a server-side error, it will return a text error message with status code 500 and message "There was a server error! Try again later.".



## Filters endpoint
**Request Format:** /sportsxcel/filters

**Parameters** This can take query parameters that represent the attribute and the value of the attribute.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint will take information from the query parameters and then will filter all items so the returned information matches the given filters

**Example Request:** /sportsxcel/filters?gender=female&color=red&sport=soccer


**Example Response:**
*Fill in example response in the ticks*

```
{
  "product": [
    {
      "product_id": 23,
      "sport": "soccer",
      "gender": "female",
      "color": "red",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/23PUMYTCTCPFGJRRDCLT_Red_Black?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Tacto 2 FG",
      "price": 39.99,
      "type": "cleats",
      "stock": 3,
      "brand": "Puma",
      "location": "outdoor"
    }
  ]
}
```

**Error Handling:**
If there is a server-side error, it will return a text error message with status code 500 and message "There was a server error! Try again later.".


## Purchase cart
**Request Format:** /sportsxcel/buyCart

**Request Type:** POST

**Paramters** Requires 4 body parameters, the user's id, the card number entered, the cvv entered and the zipcode entered

**Returned Data Format**: Text

**Description:** This endpoint will purchase all of the items in your cart. It will update the quantity of items (the stock) within our database, which is why it is a post endpoint instead of a get endpoint. It will also reset the user's cart to be empty, and add a new entry into the transactions database. It will return the transaction id.

**Example Request:** /buyCart

**Example Body**
{
  user_id: 0
  zipcode: 123456789
  card-num: 1234567890987654
  cvv: 123
}

**Example Response:**

```
"24.sportsxcel37277"
```

**Error Handling:**
This will return an error with status code 500 and message "There was a server error! Try again later." if there is a server side error. If there is a client side error, and the parameter is not given, it will send a message with status code 400 that says "Missing the required parameter.". If any of the given information (cvv, card number or zipcode) isn't in the correct length, the endpoint will return a text message with status code 400 that says "Incorrect information, make sure numbers are correct.". Finally, if any of the objects are out of stock, it will return a text message with status code 400 that says "One or more products is out of stock" and will not allow you to purchase anything.



## Get cart information
**Request Format:** /sportsxcel/getCart/:userId

**Parameters** This requires a path parameter which is the user's id.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint will return all of the items in the given user's cart. It will return said items in the form of a JSON object with one field, where that field is an array of products.

**Example Request:** /sportsxcel/getCart/0

**Example Response:**

```
{
  "product": [
    {
      "product_id": 26,
      "sport": "baseball",
      "gender": "male",
      "color": "red",
      "image": "https://dks.scene7.com/is/image/GolfGalaxy/23NIKMFRCTRT9KYSTRBB_White_University_Red_Team_Red?qlt=70&wid=500&fmt=webp&op_sharpen=1",
      "name": "Trout 9 Keystone",
      "price": 54.99,
      "type": "cleats",
      "stock": 29,
      "brand": "Nike",
      "location": "outdoor"
    }
  ]
}
```

**Error Handling:**
This will return an error with status code 500 and message "There was a server error! Try again later." if there is a server side error.



## Get user information
**Request Format:** /sportsxcel/getUser/:userId

**Parameters** This requires a path parameter which is the user's id.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint will return a lot of information about the user associated with the userId in the path parameter. Information will include the user's email, name, posted items and more. For all of the returned information, look at the example response.

**Example Request:** /sportsxcel/getUser/0


**Example Response:**

```
{
  "user_id": 0,
  "email": "example@example.com",
  "name": "John Doe",
  "cart_id": "0",
  "posted_items": "[]",
  "password": "1234"
}
```

**Error Handling:**
This will return an error with status code 500 and message "There was a server error! Try again later." if there is a server side error. If the user doesn't exist within the database, it will return a text message with status code 400 that says "Cannot find user, make sure that they are registered!".



## Check user information
**Request Format:** /sportsxcel/checkUser/:email

**Parameters** This requires a path parameter which is the user's email.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint will return information about the user with the associated email so the site can either check that the user exists. It will return the user's id and the user's password.

**Example Request:** /sportsxcel/checkUser/example@example.com


**Example Response:**

```
{
  "user_id": 0,
  "password": "1234"
}
```

**Error Handling:**
This will return an error with status code 500 and message "There was a server error! Try again later." if there is a server side error. If the user doesn't exist within the database, it will return a text message with status code 400 that says "We do not have this account".


## Add user endpoint
**Request Format:** /sportsxcel/createUser

**Parameters** This requires 3 parameters through the body, the name, email and password of the user.

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** This endpoint will add a user to the database, updating the user table as well as the cart table. It will require that the parameters listed above are sent, and will also make sure that the user isn't already registered with sportsxcel. If it is successful, it will return a JSON object with the newly added user's id and email.

**Example Request:** /sportsxcel/createUser

**Example Body**
```
{
  name: "test",
  email: "test@test.com",
  password: "test"
}
```

**Example Response:**

```
{
  "userId": 8
  "email": test@test.com
}
```

**Error Handling:**
This will return an error with status code 500 and message "There was a server error! Try again later." if there is a server side error. If the user does not give enough parameters/incorrect parameters, it will return a text message with status code 400 that says "Missing required parameters". If the email the user gives already exists within the database, it will return a text message with status code 400 that says "Email is already registered with Sportsxcel! Sign in instead.".



# Get past transactions
**Request Format:** /sportsxcel/getTransactions/:userId

**Parameters** This requires a path parameter which is the user's id.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint will return past transactions from the user. Each transaction will have the confirmation code and the items in the transaction - which are in an array but in string format.

**Example Request:** /sportsxcel/getTransactions/0

**Example Response:**

```
[
  {
    "confirmation": "38.sportsxcel27269",
    "transaction_items": "[30]"
  },
  {
    "confirmation": "39.sportsxcel13160",
    "transaction_items": "[30]"
  }
]
```

**Error Handling:**
This will return an error with status code 500 and message "There was a server error! Try again later." if there is a server side error.