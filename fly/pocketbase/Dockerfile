# PocketBase on Fly.io (persistent volume required)
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata bash

WORKDIR /pb

# Copy the PocketBase binary from the repo (Windows exe is not usable on Linux).
# You must replace this with a Linux PocketBase binary before deploy.
# Recommended: download pocketbase_*_linux_amd64.zip and extract pocketbase to fly/pocketbase/pocketbase
COPY pocketbase /pb/pocketbase

EXPOSE 8080

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--dir=/pb/pb_data"]

