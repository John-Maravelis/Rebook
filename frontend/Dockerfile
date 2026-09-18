FROM node:22-alpine

WORKDIR /app

# Αντιγράφουμε μόνο τα manifests πρώτα, ώστε το npm install να μπει σε cache layer
COPY package*.json ./
RUN npm install

# Ο υπόλοιπος κώδικας έρχεται μέσω bind mount στο docker-compose (βλ. volumes),
# οπότε δεν χρειάζεται COPY εδώ για development.

EXPOSE 5173

CMD ["npm", "run", "dev"]
