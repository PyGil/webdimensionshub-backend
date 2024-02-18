# WebDimensionsHub

## Description

This project was inspired by the “Spider-Man: Across the Spider-Verse” movie.
The project includes CRUD operations with spiders, authorization and authentication, verifications, and user profile management.

## Development

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file using the `.env.example` file in the root directory

3. The project requires `Postgres` as the main database and `Redis` as the cache. If you have `Docker` you can use the `docker-compose.yml` file from the root directory to run containers for databases, you can do this by running the following command:

```bash
docker compose up -d;
```

4. Run the development server:

```bash
npm run start:dev
```

There is documentation for the API endpoints. To check this, open the following address in your browser:
`http://localhost:3000/documentation`.
Documentation was created using `Swagger`.

## Production

Run the following command:

```bash
docker-compose -f ./docker-compose-prod.yml up -d
```
