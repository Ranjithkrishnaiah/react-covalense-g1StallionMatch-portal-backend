# Building layer
FROM node:slim as development
ARG MAX_OLD_SPACE_SIZE=10240
ENV NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}
# Optional NPM automation (auth) token build argument
# ARG NPM_TOKEN

# Optionally authenticate NPM registry
# RUN npm set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

WORKDIR /app

# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./
COPY .env ./

# Install dependencies from package-lock.json, see https://docs.npmjs.com/cli/v7/commands/npm-ci
RUN npm ci -f

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Copy application sources (.ts, .tsx, js)
COPY src/ src/
COPY views/ views/

# Build application (produces dist/ folder)
RUN npm run build

# Runtime (production) layer
FROM node:slim as production
ARG MAX_OLD_SPACE_SIZE=10240
ENV NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}
# Optional NPM automation (auth) token build argument
# ARG NPM_TOKEN

# Optionally authenticate NPM registry
# RUN npm set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

WORKDIR /app

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Copy dependencies files
#COPY package*.json ./

# Install runtime dependecies (without dev/test dependecies)
#RUN npm ci -f --omit=dev

# Copy production build
COPY --from=development /app/.env ./
COPY --from=development /app/package*.json ./
COPY --from=development /app/views/ ./views/
COPY --from=development /app/dist/ ./dist/
COPY --from=development /app/src/i18n/ ./src/i18n/
COPY --from=development /app/src/mail/mail-templates/ ./src/mail/mail-templates/
COPY --from=development /app/src/report-templates/hbs/ ./src/report-templates/hbs/
COPY --from=development /app/node_modules/ ./node_modules/

# Expose application port
EXPOSE 5000

# Start application
CMD [ "node", "dist/main.js" ]