# How To Deploy

## Connect to Digital Ocean

ssh to 45.55.220.119
(talk to Kevin for access)
  
## Update the Code

    cd cardkit
    git pull
    npm install # in case you need new node dependencies
    npm run build # update the static files for nginx

## Kill and Restart Server

To run the node server, first kill any running one.

    ps aux | grep server
    kill -9 <process id>

Start the server in the background:

    nohup ./runserver &
