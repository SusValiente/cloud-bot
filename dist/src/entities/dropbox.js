"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("../entities/user");
let Dropbox = class Dropbox {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn('uuid')
], Dropbox.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar', length: 250, nullable: false, unique: true })
], Dropbox.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar', length: 250, nullable: false })
], Dropbox.prototype, "password", void 0);
__decorate([
    typeorm_1.OneToOne(type => user_1.User),
    typeorm_1.JoinColumn()
], Dropbox.prototype, "user", void 0);
Dropbox = __decorate([
    typeorm_1.Entity(),
    typeorm_1.Unique(['email'])
], Dropbox);
exports.Dropbox = Dropbox;
//# sourceMappingURL=dropbox.js.map