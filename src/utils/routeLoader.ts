import { Express } from "express";
import fs from "fs";
import path from "path";
import { IRouter } from "../types/router";

export class RouteLoader {
  static async loadRoutes(
    app: Express,
    basePath: string = "/api"
  ): Promise<void> {
    const routesPath = path.join(__dirname, "../routes");
    const routeFiles = fs.readdirSync(routesPath);

    for (const file of routeFiles) {
      if (file.endsWith("Routes.ts") || file.endsWith("Routes.js")) {
        const routeModule = await import(path.join(routesPath, file));
        const route: IRouter = routeModule.default;
        app.use(`${basePath}${route.path}`, route.router);
      }
    }
  }
}
