FROM node:22-bullseye

ADD package.json ./
ADD package-lock.json ./

RUN npm install

# Copy data for add-on
COPY . .
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]