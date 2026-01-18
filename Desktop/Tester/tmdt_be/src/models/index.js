import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

// Import model definitions
import RoleModel from "./role.js";
import UserModel from "./user.js";
import ProductModel from "./product.js";
import CartModel from "./cart.js";
import CartDetailModel from "./cart_detail.js";
import OrderModel from "./order.js";
import OrderDetailModel from "./order_detail.js";
import ReviewModel from "./review.js";
import CouponModel from "./coupon.js";
import BannerModel from "./banner.js";

// Initialize models
const Role = RoleModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const Cart = CartModel(sequelize, DataTypes);
const CartDetail = CartDetailModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const OrderDetail = OrderDetailModel(sequelize, DataTypes);
const Review = ReviewModel(sequelize, DataTypes);
const Coupon = CouponModel(sequelize, DataTypes);
const Banner = BannerModel(sequelize, DataTypes);

// Define associations
// Role - User (1:N)
Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

// User - Cart (1:N)
User.hasMany(Cart, { foreignKey: "userId", as: "carts" });
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

// Cart - CartDetail (1:N)
Cart.hasMany(CartDetail, { foreignKey: "cartId", as: "cartDetails" });
CartDetail.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });

// Product - CartDetail (1:N)
Product.hasMany(CartDetail, { foreignKey: "productId", as: "cartDetails" });
CartDetail.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User - Order (1:N)
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

// Order - OrderDetail (1:N)
Order.hasMany(OrderDetail, { foreignKey: "orderId", as: "orderDetails" });
OrderDetail.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Product - OrderDetail (1:N)
Product.hasMany(OrderDetail, { foreignKey: "productId", as: "orderDetails" });
OrderDetail.belongsTo(Product, { foreignKey: "productId", as: "product" });

// User - Review (1:N)
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

// Product - Review (1:N)
Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Coupon - Order (1:N)
Coupon.hasMany(Order, { foreignKey: "couponId", as: "orders" });
Order.belongsTo(Coupon, { foreignKey: "couponId", as: "coupon" });

// Export models and sequelize instance
export {
    sequelize,
    Role,
    User,
    Product,
    Cart,
    CartDetail,
    Order,
    OrderDetail,
    Review,
    Coupon,
    Banner,
};

export default {
    sequelize,
    Role,
    User,
    Product,
    Cart,
    CartDetail,
    Order,
    OrderDetail,
    Review,
    Coupon,
    Banner,
};
