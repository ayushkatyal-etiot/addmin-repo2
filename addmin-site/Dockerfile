FROM node:20-alpine

WORKDIR /app

# Install Hugo
RUN apk add --no-cache hugo

# Copy package files from addmin-site
COPY addmin-site/package.json addmin-site/package-lock.json ./

# Install dependencies
RUN npm install

# Copy entire addmin-site directory
COPY addmin-site/ .

# Run Hugo dev server
EXPOSE 1313
CMD ["hugo", "server", "--bind", "0.0.0.0", "--port", "1313"]
