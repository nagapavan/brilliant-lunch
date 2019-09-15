# ---- Base Node ----
FROM node:carbon-alpine AS base

# # install pre-requisites
# RUN apk update \
#   # &&  apk add --no-cache --update alpine-sdk alpine-base \
#   && apk add --no-cache bash bash-doc bash-completion util-linux coreutils binutils findutils grep \
#   && apk add  --no-cache man man-pages mdocml-apropos less less-doc pciutils usbutils \
#   # &&  apk add postgresql-libs postgresql-dev \
#   && apk add --no-cache --update gcc python python-dev py-pip musl-dev \
#   && apk add --no-cache --update build-base nodejs nodejs-npm \
#   && echo "Pre-configure base image - COMPLETED"

# set working directory
WORKDIR /app

# copy project file
COPY package.json .

# ---- Build and Dependencies ----
FROM base AS build

COPY . .

# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm install -g gulp

# install ALL node_modules, including 'devDependencies'
RUN npm install
RUN gulp

# # ---- Test ----
# # run unit tests
# FROM build AS test

# # RUN  npm run lint && npm run setup && npm run test
# RUN  npm run test

# ---- Release ----
FROM base AS release

# copy dist directory from build stage image
COPY --from=build /app/dist .

# copy production node_modules
RUN npm install --only=production

# expose port and define CMD
EXPOSE 5030

CMD [ "node", "server"]
