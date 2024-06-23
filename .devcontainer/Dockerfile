FROM node:20-alpine as builder

# 1. essential downloads
RUN apk update
RUN apk add bash


# # 2. install ffmpeg
# RUN apk --no-cache add ca-certificates wget
# RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
# RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk
# RUN apk add --no-cache --force-overwrite glibc-2.28-r0.apk
# RUN apk add --no-cache python3 py3-pip
# RUN apk add --no-cache ffmpeg
# RUN apk -U add yt-dlp