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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClaimsService = class ClaimsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        // filedAt defaults to "now" in service
        return this.prisma.claim.create({
            data: {
                moveId: dto.moveId,
                filedAt: new Date(),
                // Persist array/object as JSON string
                items: JSON.stringify(dto.items ?? []),
                // status default is FILED via schema default
            },
        });
    }
    async listAll() {
        // For TRANSCOM/PROVIDER
        const claims = await this.prisma.claim.findMany({
            orderBy: { filedAt: 'desc' },
        });
        // Parse JSON string for convenience
        return claims.map((c) => ({
            ...c,
            items: this.safeParse(c.items),
        }));
    }
    async getOne(id) {
        const c = await this.prisma.claim.findUnique({ where: { id } });
        if (!c)
            return null;
        return { ...c, items: this.safeParse(c.items) };
    }
    async update(id, dto) {
        const updates = {};
        if (dto.status)
            updates.status = dto.status;
        if (typeof dto.items !== 'undefined') {
            updates.items = JSON.stringify(dto.items ?? []);
        }
        const c = await this.prisma.claim.update({
            where: { id },
            data: updates,
        });
        return { ...c, items: this.safeParse(c.items) };
    }
    async remove(id) {
        await this.prisma.claim.delete({ where: { id } });
        return { ok: true };
    }
    safeParse(s) {
        try {
            return JSON.parse(s);
        }
        catch {
            return s;
        }
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClaimsService);
