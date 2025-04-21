# ApplicationMonitoring
A relational database store for logs and a visualization dashboard using Grafana for a node JS server

# NodeJS server setup
we have set up a mock nodeJS server using json-server that lets us expose demo API endpoints specified via a db.json file

# Logs and kafka setup
we add serialization(logs to json) and deserialzation(json to logs) logic to pass these to a kafka 2 different kafka topics here the json server is defined as a producer for kafka

# MySQL database as a logs storage
we have a mySQL db that is defined as a consumer and subscribes to these 2 topics and stores them to 2 tables within a db

# Grafana dashboard
according to requirements, wrote queries to fetch appropriate information from mysql and display visually onto a grafana dashboard
