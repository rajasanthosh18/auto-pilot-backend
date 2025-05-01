import { Express } from "express";
import fs from "fs";
import path from "path";
import { logger } from "../common/logger";
import { IRouter } from "../types/router";

export class RouteLoader {
  static async loadRoutes(
    app: Express,
    basePath: string = "/api"
  ): Promise<void> {
    try {
      // Use __dirname for reliable path resolution
      const featuresPath = path.join(__dirname, "..", "features");
      logger.info(`Loading routes from: ${featuresPath}`);

      // Check if features directory exists
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

            const fullPath = `${basePath}${route.path}`;
            logger.info(`Registering route: ${fullPath}`);
            app.use(fullPath, route.router);
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
