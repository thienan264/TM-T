import { User, Role } from "../models/index.js";

// Repository layer for User model
const UserRepository = {
    findAndCountAll: (options) => User.findAndCountAll(options),
    findByPk: (id, options) => User.findByPk(id, options),
    findOne: (options) => User.findOne(options),
    create: (data) => User.create(data),
    updateInstance: (instance, data) => instance.update(data),
    destroyInstance: (instance) => instance.destroy(),
    Role, // expose Role for includes if needed upstream
};

export default UserRepository;
