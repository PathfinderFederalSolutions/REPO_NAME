"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix(process.env.API_PREFIX || '/api');
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({ origin: true, credentials: true }));
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
