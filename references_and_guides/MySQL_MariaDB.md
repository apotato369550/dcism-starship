MySQL/MariaDB Connection Guide
3 months ago
Updated
1. Connecting from an Application
Node.js
Using the mysql2 library with its Promise-based interface is the modern, non-blocking, and highly recommended approach for Node.js.

// For better type safety and modern async/await syntax
import * as mysql from "mysql2/promise";

async function connectToDatabase() {
  try {
    // ⚠️ Use Environment Variables in production!
    const connection = await mysql.createConnection({
      host: "localhost",
      // Remember to replace "myuser", "password", and "mydb" with your actual details.
      user: "myuser",
      password: "password",
      database: "mydb",
    });

    console.log("Successfully connected to the database!");

    // Example query (Use parameterized queries for security!):
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE status = ?",
      ["active"]
    );
    console.log(rows);
    
    await connection.end(); // Close the connection when done
  } catch (error) {
    console.error("Database connection or query failed:", error);
  }
}

connectToDatabase();
PHP
The mysqli (MySQL Improved) extension is preferred over the older mysql_* functions.

<?php
// ⚠️ Use Environment Variables in production!
$servername = "localhost";
// Remember to replace "myuser", "password", and "mydb" with your actual details.
$username = "myuser";
$password = "password";
$dbname = "mydb";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

echo "Connected successfully (via PHP mysqli)!";

// Remember to close the connection when the script finishes or is no longer needed
$conn->close();
?>
2. Managing with phpMyAdmin
For administrative tasks, configuration checks, and direct SQL execution without writing code, use the provided web interface: https://dbadmin.dcism.org/.