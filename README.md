## Route View

Verify that BGP route advertisements are as expected



### How to use

##### Build and run the backend container

* Build the backend docker image

```bash
cd .../route_view/backend
docker build -t route_view_backend:1.0.0 .
```

* Prepare configuration for docker

```bash
mkdir -p /opt/route_view_backend/docker
cd /opt/route_view_backend/docker
cp .../route_view/backend/docker-compose.yaml.j2 docker-compose.yaml
vim docker-compose.yaml
```

* Run the docker container

```bash
docker-compose up -d
```



##### Build and run the frontend container

* Build the frontend docker image

```bash
cd .../route_view/frontend
cd src
mkdir public
cd public
touch favicon.ico
touch logo.png

cd ..
docker build -t route_view_frontend:1.0.0 .
```

* Prepare configuration for docker

```bash
mkdir -p /opt/route_view_frontend/docker
cd /opt/route_view_frontend/docker
cp .../route_view/frontend/docker-compose.yaml.j2 docker-compose.yaml
vim docker-compose.yaml
```

* Run the docker container

```bash
docker-compose up -d
```



#####  Run the reverse proxy web server

* Create a web server configuration (the following is a sample configuration of Caddy)

``` bash
${hostname}:${port} {
  reverse_proxy /api/v1/* ${backend_listen_addr}:${backend_listen_port}
  reverse_proxy * ${frontend_listen_addr}:${frontend_listen_port}
}
```

* Run the web server



