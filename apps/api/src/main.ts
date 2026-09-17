import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Sessions are cookies, not bearer tokens, so the web app's cross-port
  // fetches need credentialed CORS explicitly enabled against its origin.
  app.enableCors({
    origin: process.env.WEB_APP_URL ?? "http://localhost:3000",
    credentials: true,
  });
  // Matches 04-architecture.md's API surface (/api/auth/..., /api/offices/...);
  // /health stays unprefixed, and future /internal and /platform route trees
  // (Step 06) will need their own exclusion added here when they're built.
  app.setGlobalPrefix("api", { exclude: ["health"] });
  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  await app.listen(port);
}

bootstrap();
