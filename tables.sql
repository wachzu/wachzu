CREATE TABLE "cart" (
	"user_id"	TEXT,
	"cart_id"	INTEGER,
	"cart_items"	TEXT,
	PRIMARY KEY("cart_id" AUTOINCREMENT)
);

CREATE TABLE "product" (
	"product_id"	INTEGER,
	"sport"	TEXT,
	"gender"	TEXT,
	"color"	TEXT,
	"image"	TEXT,
	"name"	TEXT,
	"price"	REAL,
	"type"	TEXT,
	"stock"	INTEGER,
	"brand"	TEXT,
	"location"	TEXT,
	PRIMARY KEY("product_id" AUTOINCREMENT)
);

CREATE TABLE "transactions" (
	"user_id"	TEXT,
	"transaction_id"	INTEGER,
	"transaction_items"	TEXT,
	"confirmation"	TEXT,
	PRIMARY KEY("transaction_id" AUTOINCREMENT)
);

CREATE TABLE "user" (
	"user_id"	INTEGER,
	"email"	TEXT,
	"name"	TEXT,
	"cart_id"	TEXT,
	"posted_items"	TEXT,
	"password"	TEXT,
	PRIMARY KEY("user_id" AUTOINCREMENT)
);