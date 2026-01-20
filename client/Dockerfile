FROM node:20-alpine

WORKDIR /app

ARG DEPS_HASH=default

COPY package.json yarn.lock ./

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    echo "Installing dependencies (hash: ${DEPS_HASH})" && \
    yarn install --frozen-lockfile

COPY . .

# Expose port
EXPOSE 5173

# Start the development server
CMD ["yarn", "dev", "--host", "0.0.0.0"]
