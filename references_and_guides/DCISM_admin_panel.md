Beginner's Guide to the DCISM Admin Panel
4 months ago
Updated
Welcome to the DCISM Admin Panel
The DCISM Admin Panel is a powerful management platform designed to help students, teachers, and staff of DCISM leverage our departmental server. As a member of DCISM, you can take advantage of various features, including:

Hosting personal websites and web applications with a custom subdomain
Serving databases for dynamic content
Storing and managing data in your personal drive
Hosting Your First Website: Creating a Subdomain
A subdomain provides a unique, user-friendly address for your project (e.g., yourproject.dcism.org). It allows you to host multiple distinct websites on a single server without needing separate main domains.

Step-by-Step Guide
Navigate to the Subdomains Section. From the main navigation menu, click on the Subdomains tab.
Create a New Subdomain. Enter your desired name for the subdomain (e.g., my-portfolio) and click the Create Subdomain button.
Automatic Configuration. The system will automatically set up the default server configuration for your new subdomain. You can later modify these settings by selecting the subdomain from your list.
Once created, a new folder with the same name as your subdomain will be generated on your web server's personal drive. This is your project's root directory, where you will upload all of your website files.

Connecting to The Server: SSH and SFTP
To upload your website's files, manage databases, or execute commands, you'll need to connect to the server. We support two primary, secure methods: SSH and SFTP.

Understanding the Difference
SSH (Secure Shell): This is a command-line interface (CLI) for remote server management. SSH is the most powerful way to interact with the server, allowing you to install software, manage files, and run scripts directly. You can connect using an application like PuTTY (Windows) or the built-in Terminal on macOS/Linux.

SFTP (Secure File Transfer Protocol): This protocol is used specifically for securely transferring files between your local computer and the server. SFTP uses the same secure connection as SSH but provides a graphical, file-browser interface, making it easy to drag-and-drop files. Recommended applications include FileZilla or WinSCP.

Your Connection Credentials
You can find all of your necessary connection details on the SSH and SFTP pages of the admin panel. You will need the following information to connect:

Host/Server Address: The server address to connect to (e.g., web.dcism.org or data.dcism.org).
Username: Your unique username.
Password: This is the same password you use to sign in to the DCISM Network.
Port: The specific port number assigned for the connection.
Managing Your Databases
Databases are crucial for dynamic websites and web applications, as they store essential information like user accounts, blog posts, and product details. We support a variety of popular database technologies, including MariaDB, PostgreSQL, MongoDB, and Redis.

Step-by-Step Guide
Navigate to the Databases Section. Click on the Databases tab in the navigation menu.
Create a New Database. Select your desired database type from the list and click Create Database. You will be prompted to create a unique username and password for this database.
Connect to Your Application. Use the credentials you just created to establish a connection between your web application and the database. Most modern programming languages and frameworks have built-in libraries to simplify this process.
Manage with a Web Tool. For easy management of your database tables and data, you can access a web-based tool like phpMyAdmin or pgAdmin directly from the database modal in the Databases page.
Hopefully this guide has prepared you to take your first steps toward hosting your own websites and applications on the DCISM server. Happy coding!