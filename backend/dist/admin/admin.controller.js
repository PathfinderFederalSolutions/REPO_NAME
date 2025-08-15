"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let AdminController = class AdminController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPolicy(region, serviceCat) {
        return this.prisma.allocationPolicy.findFirst({ where: { region, serviceCat } });
    }
    async putPolicy(body) {
        const { region, serviceCat, ...data } = body || {};
        const existing = await this.prisma.allocationPolicy.findFirst({
            where: { region, serviceCat },
            select: { id: true },
        });
        if (existing) {
            return this.prisma.allocationPolicy.update({ where: { id: existing.id }, data });
        }
        return this.prisma.allocationPolicy.create({ data: { region, serviceCat, ...data } });
    }
    async getShares(taskOrderId) {
        return this.prisma.allocationShare.findMany({
            where: { taskOrderId },
            orderBy: { orgId: 'asc' },
        });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('policy'),
    __param(0, (0, common_1.Query)('region')),
    __param(1, (0, common_1.Query)('serviceCat')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPolicy", null);
__decorate([
    (0, common_1.Put)('policy'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "putPolicy", null);
__decorate([
    (0, common_1.Get)('shares'),
    __param(0, (0, common_1.Query)('taskOrderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getShares", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminController);
