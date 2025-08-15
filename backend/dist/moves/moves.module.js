"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovesModule = void 0;
const common_1 = require("@nestjs/common");
const moves_service_1 = require("./moves.service");
const moves_controller_1 = require("./moves.controller");
let MovesModule = class MovesModule {
};
exports.MovesModule = MovesModule;
exports.MovesModule = MovesModule = __decorate([
    (0, common_1.Module)({
        providers: [moves_service_1.MovesService],
        controllers: [moves_controller_1.MovesController],
        exports: [moves_service_1.MovesService],
    })
], MovesModule);
