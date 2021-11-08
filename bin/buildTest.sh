docker kill test;
docker rm test;
docker run --name test \
-v $(pwd)/config.ini:/app/config.ini \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $(pwd)/docker-compose.yml:/app/docker-compose-origin.yml \
-v $(pwd)/nginx:/app/nginx \
qkrgkdsma17/healthchecker:stable