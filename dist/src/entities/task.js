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
let Task = class Task {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn('uuid')
], Task.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar', length: 250, nullable: false, unique: true })
], Task.prototype, "name", void 0);
__decorate([
    typeorm_1.Column({ type: 'varchar', length: 250, nullable: false })
], Task.prototype, "description", void 0);
__decorate([
    typeorm_1.ManyToOne(type => user_1.User, user => user.tasks)
], Task.prototype, "user", void 0);
Task = __decorate([
    typeorm_1.Entity()
], Task);
exports.Task = Task;
//# sourceMappingURL=task.js.map