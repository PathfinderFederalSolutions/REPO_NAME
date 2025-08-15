"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let MovesService = class MovesService {
    constructor() {
        this.moves = [];
    }
    listForUser(user) {
        if (user.role === 'TRANSCOM')
            return this.moves;
        if (user.role === 'PROVIDER')
            return this.moves.filter(m => m.providerId === (user.companyId || user.id));
        if (user.role === 'MEMBER')
            return this.moves.filter(m => m.memberId === user.id);
        return [];
    }
    getOneForUser(id, user) {
        const move = this.moves.find(m => m.id === id);
        if (!move)
            throw new common_1.NotFoundException('Move not found');
        if (user.role === 'TRANSCOM')
            return move;
        if (user.role === 'PROVIDER' && move.providerId === (user.companyId || user.id))
            return move;
        if (user.role === 'MEMBER' && move.memberId === user.id)
            return move;
        throw new common_1.ForbiddenException();
    }
    create(dto) {
        const now = new Date().toISOString();
        const move = { id: (0, crypto_1.randomUUID)(), status: 'NEW', createdAt: now, updatedAt: now, ...dto };
        this.moves.push(move);
        return move;
    }
    update(id, dto, user) {
        const idx = this.moves.findIndex(m => m.id === id);
        if (idx === -1)
            throw new common_1.NotFoundException('Move not found');
        const move = this.moves[idx];
        if (dto.providerId && user.role !== 'TRANSCOM') {
            throw new common_1.ForbiddenException('Only TRANSCOM can assign provider');
        }
        if (user.role === 'PROVIDER' && move.providerId && move.providerId !== (user.companyId || user.id)) {
            throw new common_1.ForbiddenException('Not your job');
        }
        const updated = { ...move, ...dto, updatedAt: new Date().toISOString() };
        this.moves[idx] = updated;
        return updated;
    }
    remove(id) {
        this.moves = this.moves.filter(m => m.id !== id);
    }
};
exports.MovesService = MovesService;
exports.MovesService = MovesService = __decorate([
    (0, common_1.Injectable)()
], MovesService);
