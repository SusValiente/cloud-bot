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
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const task_entity_1 = require("./task.entity");
let TaskList = class TaskList {
};
__decorate([
    typeorm_1.Column({ type: 'varchar', length: 250, nullable: false, unique: true }),
    __metadata("design:type", String)
], TaskList.prototype, "name", void 0);
__decorate([
    typeorm_1.ManyToOne(type => user_entity_1.User, user => user.taskLists),
    __metadata("design:type", user_entity_1.User)
], TaskList.prototype, "user", void 0);
__decorate([
    typeorm_1.OneToMany(type => task_entity_1.Task, task => task.taskList),
    __metadata("design:type", Array)
], TaskList.prototype, "tasks", void 0);
TaskList = __decorate([
    typeorm_1.Entity()
], TaskList);
exports.TaskList = TaskList;
//# sourceMappingURL=taskList.entity.js.map