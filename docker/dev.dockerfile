# Freeze base image version to
# ubuntu:20.04 (pushed 2021-10-16T00:48:18.442154Z)
FROM ubuntu@sha256:7cc0576c7c0ec2384de5cbf245f41567e922aab1b075f3e8ad565f508032df17

SHELL ["bash", "-c"]

RUN set -euxo pipefail \
&& export DEBIAN_FRONTEND=noninteractive \
&& apt-get update -qq --yes \
&& apt-get install -qq --no-install-recommends --yes \
  bash \
  ca-certificates \
  curl \
  git \
  make \
  xz-utils \
>/dev/null \
&& apt-get autoremove --yes >/dev/null \
&& apt-get clean autoclean >/dev/null \
&& rm -rf /var/lib/apt/lists/*

COPY .nvmrc /.nvmrc

ENV TERM="xterm-256color"
ENV HOME="/home/${USER}"
ENV NODE_DIR="/node"
ENV PATH="${NODE_DIR}/bin:${HOME}/.local/bin:/workdir/node_modules/.bin:$PATH"

RUN set -euxo pipefail \
&& NODE_VERSION=$(cat /.nvmrc) \
&& mkdir -p "${NODE_DIR}" \
&& curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" | tar -xJ --strip-components=1 -C "${NODE_DIR}" \
&& ls -al /node \
&& ls -al /node/bin \
&& which node \
&& node --version

RUN set -x \
&& mkdir -p "/home/.config/yarn" \
&& npm install -g \
  nodemon@2.0.15 \
  yarn@1.22.17 \
&& which npm \
&& which yarn \
&& npm --version \
&& yarn --version

WORKDIR /workdir
