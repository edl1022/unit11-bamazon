var mysql = require("mysql");
var inquirer = require("inquirer");
var pw = require("./pw.js");
var cTable = require("console.table");
//Creating the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: pw.pw,

    database: "bamazon"
});

//Connection to the mysql server and sql database.
connection.connect(function(err) {
    if (err) throw err;
    //Runs the start function after the connection is made to prompt the user.
    start();
});


function start() {
    console.log("\n-------------------" + "\nWelcome to Bamazon!\n" + "-------------------\n");
    inquirer.prompt([{
        name: "action",
        type: "list",
        choices: ["View products in store", "Exit"],
        message: "What would you like to do?"
    }]).then(function(action) {
        if (action.action === "View products in store") {
            buy();
        } else if (action.action === "Exit") {
            exit();
        }
    });
};

//Allows user to view and buy products.
function buy() {
    //Saves sql query to a variable.
    var query = "SELECT * FROM products";
    //Queries db display results.
    connection.query(query, function(error, results) {
        if (error) throw error;
        //Calls the console table function to display the products table.
        consoleTable(results);
        //Asks customer what they want to buy and how much.
        inquirer.prompt([{
                name: "id",
                message: "Please enter the ID of the item that you would like to purchase.",
                //Validates that the ID is the same as an ID of an item in the database.
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
                //Validates that the quantity purchased is greater than 0.
                validate: function(value) {
                    if (value > 0 && isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function(transaction) {

            var itemQuantity;
            var itemPrice;
            var itemName;
            //Sets the above variables equal to results where the id entered by the user matches database id.
            for (var i = 0; i < results.length; i++) {
                if (parseInt(transaction.id) === results[i].item_id) {
                    itemQuantity = results[i].stock_quantity;
                    itemPrice = results[i].price;
                    itemName = results[i].product_name;
                }
            }
            //If user tries to buy more than is in stock, tells them no and runs start function again.
            if (parseInt(transaction.Amount) > itemQuantity) {
                console.log("\nInsufficient inventory for your requested quantity. We have " +
                    itemQuantity + " in stock. Try again.\n");
                start();
            }
            //If user buys less than is in stock, tells them transaction was succesful and lowers the amount
            //in stock by the user's quantity ordered.
            else if (parseInt(transaction.Amount) <= itemQuantity) {
                var amountPurchased = parseInt(transaction.Amount);
                var amountLeft = itemQuantity - amountPurchased;
                var amountSpent = amountPurchased * itemPrice;

                console.log("\nCongrats! You successfully purchased " + transaction.Amount +
                    " of " + itemName + ". There are " + amountLeft + " " + itemName + "s left. Your purchase cost $" + amountSpent + ".");

                lowerAmount(transaction.id, transaction.Amount, itemQuantity, itemPrice);
            }
        });
    });
}


//Builds table for users to view in console.
function consoleTable(results) {
    //Declares empty array.
    var values = [];
    //Loops through all results.
    for (var i = 0; i < results.length; i++) {
        //Creates resultObject for each iteration.
        var resultObject = {
            ID: results[i].item_id,
            Item: results[i].product_name,
            Price: "$" + results[i].price
        };
        //Pushes resultObject to values array.
        values.push(resultObject);
    }
    //Adds header to table.
    console.table("\nProducts for Sale", values);
}

//Reduces amount left of purchased item in database.
function lowerAmount(item, purchaseAmount, stockAmount, price) {
    connection.query(
        "UPDATE products SET ? WHERE ?", [{
                stock_quantity: stockAmount - parseInt(purchaseAmount)
            },
            {
                item_id: parseInt(item)
            }
        ],
        function(error, response) {
            if (error) throw error;
        });

    exit();
}
//Exit function ends database connection.
function exit() {
    console.log("\nThanks for stopping at Bamazon! Have a good day.");
    connection.end();
}