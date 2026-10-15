# Session 7 - Docker Images and Multi-stage Builds

Dhruv Bansal - 24BCS10114

For this session I used a multi-stage Dockerfile for a small Node.js server. The first stage checks the JavaScript file. The second stage copies only the checked server file and runs it with a non-root user.

```bash
docker build -t session7-node ./multi-stage-node
docker run --rm --name session7-node -p 8081:8081 session7-node
curl http://localhost:8081
docker history session7-node
docker inspect session7-node
```

Keeping the build and runtime stages separate makes the final image smaller and avoids carrying unnecessary build files into the running container.

## Screenshot

The [Session 7 job](https://github.com/dhruvb2028/devops-heros/actions/runs/38801696689/job/116652084887) built the multi-stage image, ran it, checked its HTTP response, and printed `docker history`. This screenshot shows the response from that container.

![Response from the multi-stage Node image](screenshots/node.png)
