import { Express } from "express";
import fs from "fs";
import path from "path";
import { IRouter } from "../types/router";

export class RouteLoader {
  static async loadRoutes(
    app: Express,
    basePath: string = "/api"
  ): Promise<void> {
    const featuresPath = path.join(__dirname, "../features");
    const featureDirs = fs.readdirSync(featuresPath);

    for (const featureDir of featureDirs) {
      const routePath = path.join(featuresPath, featureDir, "routes.ts");
      if (fs.existsSync(routePath)) {
        const routeModule = await import(routePath);
        const route: IRouter = routeModule.default;
        app.use(`${basePath}${route.path}`, route.router);
      }
    }
  }
}
