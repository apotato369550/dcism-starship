Using PM2 for Production Node.js Applications
10 days ago
Updated
PM2 (Process Manager 2) is a robust, open-source, production-ready process manager for Node.js applications. It's essential for developers looking to manage, monitor, and ensure their applications remain running 24/7 by automatically handling restarts, logging, and performance metrics.

PM2 is readily available on the DCISM server via the command line. This guide will walk you through the steps to effectively use PM2 for deploying and managing your Node.js applications in a production environment.

1. Preparing Your Application for Production
The crucial first step for any production deployment is to ensure you are running the optimized, compiled version of your application. If your app requires compilation (e.g., TypeScript, Webpack), run the necessary build command.

Most build commands will look like this if you're using npm:

npm run build
2. Starting Your Application with PM2
PM2 provides flexible methods for starting your process, whether it's a single entry file or a script defined in your package.json.

Basic Start Command
The simplest way to start a Node.js file is:

PORT=<port> pm2 start <script_path> --name "<app_name>"
👉 Important! Don't forget to customize the <port> according to the port assigned to your application (e.g., 4000).
Always use the --name flag to assign a human-readable identifier (e.g., "my-next-app") for easier management and monitoring.
Next.js Specific Options
Using npm run start (Recommended for default Next.js projects): This is the standard way to run the production build after npm run build. PM2 starts the npm process and instructs it to execute the start script defined in your package.json.

PORT=4000 pm2 start npm --name "my-next-app" -- run start
Using a Custom Server: If you are running a custom Node.js server (like Express or Koa) that handles your Next.js application, start the server file directly.

PORT=4000 pm2 start server.js --name "my-custom-server"
3. Advanced Configuration with an Ecosystem File (Optional)
For production, using a configuration file, typically named ecosystem.config.js, is the standard best practice. This allows you to define multiple processes, specify environment variables, and configure log files.

Key Features in ecosystem.config.js
Environment Variables: Define separate sets of environment variables for different environments (e.g., env for default, env_production for production).
Watch & Restart: Configure automatic restarts on file changes (useful for development).
Starting with the Configuration File
To start your processes using the configuration and apply a specific environment (like production):

pm2 start ecosystem.config.js --env production
4. Managing and Monitoring PM2 Processes
PM2 offers powerful, simple commands to check the status, health, and logs of your running applications.

View Process Status: Displays a real-time table of all managed processes, showing their ID, name, status, CPU, and memory usage.

pm2 list
Stream Logs: Streams the combined stdout and stderr logs for a specific process or all processes.

pm2 logs my-next-app
Stop and Start: Stop or start a specific application or all applications.

pm2 stop my-next-app
pm2 start all
Restart: Use restart for a full process kill and start.

pm2 restart my-next-app
Delete: Remove a process from PM2's management.

pm2 delete my-next-app
5. Ensuring Persistence on System Startup
To guarantee your applications automatically restart after a system reboot (e.g., following a server update or power outage), you must set up PM2 to run on system startup.

Save the Process List: This command saves the currently running processes and their configurations.

pm2 save
After completing these steps, your Node.js application is fully managed and configured for robust production uptime.