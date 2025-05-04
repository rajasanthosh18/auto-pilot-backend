import { Express, RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { logger } from "../common/logger";
import { authMiddleware } from "../middleware/auth";
import { IRouter } from "../types/router";

interface RouteConfig {
  basePath: string;
  isProtected?: boolean;
}

export class RouteLoader {
  static async loadRoutes(
    app: Express,
    configs: RouteConfig[] = [
      { basePath: "/api", isProtected: true },
      { basePath: "/api/public", isProtected: false },
    ]
  ): Promise<void> {
    try {
      const featuresPath = path.join(__dirname, "..", "features");
      logger.info(`Loading routes from: ${featuresPath}`);

      if (!fs.existsSync(featuresPath)) {
        throw new Error(`Features directory not found at: ${featuresPath}`);
      }

      const featureDirs = fs.readdirSync(featuresPath);
      logger.info(`Found feature directories: ${featureDirs.join(", ")}`);

      for (const featureDir of featureDirs) {
        const ext = path.extname(__filename) === ".ts" ? ".ts" : ".js";
        const routePath = path.join(featuresPath, featureDir, `routes${ext}`);

        logger.debug(`Checking route path: ${routePath}`);

        if (fs.existsSync(routePath)) {
          try {
            const routeModule = await import(routePath);
            const route: IRouter = routeModule.default;

            if (!route || !route.path || !route.router) {
              logger.error(`Invalid route module in ${featureDir}`);
              continue;
            }

            // Handle public and protected routes
            if (route.path.startsWith("/public/")) {
              // Public routes go under /api/public without auth
              const publicPath = `/api${route.path}`;
              logger.info(`Registering public route: ${publicPath}`);
              app.use(publicPath, route.router);
            } else {
              // Protected routes go under /api with auth
              const protectedPath = `/api${route.path}`;
              logger.info(`Registering protected route: ${protectedPath}`);
              app.use(
                protectedPath,
                authMiddleware as RequestHandler,
                route.router
              );
            }
          } catch (error) {
            logger.error(`Error loading route ${featureDir}: ${error}`);
          }
        } else {
          logger.warn(`No routes.ts found in ${featureDir}`);
        }
      }
    } catch (error) {
      logger.error(`Failed to load routes: ${error}`);
      throw error;
    }
  }
}
