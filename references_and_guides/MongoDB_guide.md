MongoDB Connection Guide
3 months ago
Updated
1. Connecting from an Application
To connect to a MongoDB instance from your application, you need to use a Uniform Resource Identifier (URI). The URI is a string that specifies the connection details, often including credentials, host information, and the target database.

The general format for the URI used below is: mongodb://<user>:<password>@<host>:<port>/<database>. Note: user and database are the same values on the DCISM server.

Node.js
The official driver for Node.js is mongodb. This example uses TypeScript and the MongoClient to connect, ping the server, and then close the connection.

import { MongoClient, ServerApiVersion } from "mongodb";

// The URI specifies the connection details.
// Remember to replace "myuser", "mypassword", and "mydb" with your actual details.
const uri: string = "mongodb://myuser:mypassword@localhost:27017/mydb";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client: MongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
PHP
The official driver for PHP is installed via PECL and managed through the mongodb extension. This example uses the MongoDB\Client class to establish the connection and check its status.

Prerequisites
Ensure the mongodb extension is installed and enabled in your PHP environment.
Install the mongodb/mongodb library via Composer: composer require mongodb/mongodb
<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

use MongoDB\Client;
use MongoDB\Driver\ServerApi;

// The URI specifies the connection details.
// Remember to replace "myuser", "mypassword", and "mydb" with your actual details.
$uri = "mongodb://myuser:mypassword@localhost:27017/mydb";

// Client options array (optional, but good practice for modern connections)
$clientOptions = [
    'serverApi' => new ServerApi(ServerApi::V1)
];

try {
    // Connect to MongoDB
    $client = new Client($uri, [], $clientOptions);

    // Get the specified database (the client connects lazily, so we force an operation)
    $db = $client->selectDatabase('mydb');

    // Issue a ping command to verify the connection
    $command = new \MongoDB\Command(['ping' => 1]);
    $cursor = $db->command($command);
    $result = $cursor->toArray();

    if (isset($result[0]['ok']) && $result[0]['ok'] == 1) {
        echo "Successfully connected and pinged MongoDB!\n";
    } else {
        echo "Connection succeeded, but ping command failed.\n";
    }

} catch (Exception $e) {
    echo "Error connecting to MongoDB: " . $e->getMessage() . "\n";
}
?>
For more in-depth guides on connecting MongoDB with other frameworks or libraries, refer to the official MongoDB documentation: https://www.mongodb.com/docs/drivers.

2. Managing with MongoDB Compass
MongoDB Compass is a graphical user interface (GUI) tool that simplifies database management. You can download it for Windows, Linux, or macOS from the official MongoDB website: https://www.mongodb.com/products/tools/compass.

Step 2.1: Open an SSH Tunnel
If you are connecting from outside the local DCISM network, you must first create an SSH tunnel to securely access the database.

Open your Terminal and run the following command:

ssh -p 22077 username@web.dcism.org -L 27017:localhost:27017
This command forwards your local port 27017 to the server's MongoDB port 27017 via a secure SSH tunnel. Remember to replace username with your actual account username.

Step 2.2: Connect in MongoDB Compass
With the SSH tunnel active, use the following connection string in MongoDB Compass to connect to the database through the local forwarded port:

mongodb://myuser:mypassword@localhost:27017/mydb
Just like with the application connection, replace myuser, mypassword, and mydb with your database credentials.

3. Resolving Port Conflicts
If you have another MongoDB instance already running on port 27017 on your local machine, you'll encounter a port conflict. To fix this, simply use a different local port for your SSH tunnel, such as 27018.

SSH Tunnel Command
ssh -p 22077 username@web.dcism.org -L 27018:localhost:27017
MongoDB Compass Connection String
mongodb://myuser:mypassword@localhost:27018/mydb
By changing the local port in both the SSH command and the connection string, you can avoid conflicts and successfully connect.