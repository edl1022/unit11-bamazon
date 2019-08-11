var mysql = require("mysql");
var inquirer = require("inquirer");
var pw = require("./pw.js");
var cTable = require("console.table");
// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: pw.pw,
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});


function start() {
    console.log("\n------------------------------" + "\nWelcome to Bamazon!\n" + "-------------------\n");
    // ask customer what they'd like to do
    inquirer.prompt([{
        name: "action",
        type: "list",
        choices: ["View products in store", "Exit"],
        message: "What would you like to do?"
    }]).then(function(action) {
        // if user wants to view items, run the view items function
        if (action.action === "View products in store") {
            viewProducts();
            // if user wants to leave, run exit function
        } else if (action.action === "Exit") {
            exit();
        }
    });
};

// view items function
function viewProducts() {
    // save my sql query
    var query = "SELECT * FROM products";
    // query db display results
    connection.query(query, function(error, results) {
        // if error, tell us
        if (error) throw error;
        // // call the console table function to build/display the items table
        consoleTable(results);
        // // ask customer what they'd like to buy and how much Amount
        inquirer.prompt([{
                name: "id",
                message: "Please enter the ID of the item that you would like to purchase.",
                // validates that the id is a number greater than 0 and less than/equal to 
                // the number of items
                validate: function(value) {
                    if (value > 0 && isNaN(value) === false && value <= results.length) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "Amount",
                message: "What quantity would you like to purchase?",
                // validate the quantity is a number larger than 0
                validate: function(value) {
                    if (value > 0 && isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function(transaction) {
            // init itemQuantity, itemPrice, itemName vars
            var itemQuantity;
            var itemPrice;
            var itemName;
            // set above vars equal to results where the user id matches db id
            for (var j = 0; j < results.length; j++) {
                if (parseInt(transaction.id) === results[j].item_id) {
                    itemQuantity = results[j].stock_quantity;
                    itemPrice = results[j].price;
                    itemName = results[j].product_name;
                }
            }
            // if user tries to buy more Amount than db has available, tell them no, run the
            // welcome function again
            if (parseInt(transaction.Amount) > itemQuantity) {
                console.log("\nInsufficient inventory for your requested quantity. We have " +
                    itemQuantity + " in stock. Try again.\n");
                start();
            }
            // if user tries to buy equal/less Amount than db has available, tell them yes,
            // update the db to reduce Amount by customer purchase amt, update product sales
            // with revenue from the sale
            else if (parseInt(transaction.Amount) <= itemQuantity) {
                console.log("\nCongrats! You successfully purchased " + transaction.Amount +
                    " of " + itemName + ". There are " + itemQuantity + " " + itemName + "s left.");

                lowerAmount(transaction.id, transaction.Amount, itemQuantity, itemPrice);
            }
        });
    });
}


// function for building the items table for customers to view
function consoleTable(results) {
    // create empty values array
    var values = [];
    // loop through all results
    for (var i = 0; i < results.length; i++) {
        // create resultObject for each iteration. properties of object will be column
        // headings in the console table
        var resultObject = {
            ID: results[i].item_id,
            Item: results[i].product_name,
            Price: "$" + results[i].price
        };
        // push result object to values array
        values.push(resultObject);
    }
    // create table with title items for sale with the values array
    console.table("\nItems for Sale", values);
}

// // reduce stock Amount function
function lowerAmount(item, purchaseAmount, stockAmount, price) {
    // query with an update, set stock equal to stockAmount - purchase Amount
    // where the item_id equals the id the user entered
    connection.query(
        "UPDATE products SET ? WHERE ?", [{
                stock_quantity: stockAmount - parseInt(purchaseAmount)
            },
            {
                item_id: parseInt(item)
            }
        ],
        // throw error if error, else run displayCost
        function(error, response) {
            if (error) throw error;
        });

    exit();
}
// exit function says bye to user and ends db connection
function exit() {
    console.log("\nThanks for stopping by! Have a good day.");
    connection.end();
}