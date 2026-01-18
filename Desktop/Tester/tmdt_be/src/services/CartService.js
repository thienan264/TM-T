import { sequelize, Cart, CartDetail, Product, Order, OrderDetail, Coupon } from "../models/index.js";

class CartService {
    static async getActiveCart(userId) {
        return Cart.findOne({
            where: { userId, status: "active" },
            include: [{ model: CartDetail, as: "cartDetails", include: [{ model: Product, as: "product" }] }],
        });
    }

    static async getOrCreateActiveCart(userId, t = null) {
        let cart = await Cart.findOne({ where: { userId, status: "active" }, transaction: t });
        if (!cart) {
            cart = await Cart.create({ userId, status: "active" }, { transaction: t });
        }
        return cart;
    }

    static async addItem(userId, productId, quantity = 1) {
        const q = Math.max(1, parseInt(quantity || 1));
        return await sequelize.transaction(async (t) => {
            const product = await Product.findByPk(parseInt(productId), { transaction: t });
            if (!product) throw new Error("Sản phẩm không tồn tại");

            // Kiểm tra tồn kho
            if (product.quantity <= 0) {
                throw new Error("Sản phẩm đã hết hàng");
            }

            const cart = await this.getOrCreateActiveCart(userId, t);

            // If item exists, increment quantity
            let detail = await CartDetail.findOne({ where: { cartId: cart.id, productId: product.id }, transaction: t });
            const currentQtyInCart = detail ? Number(detail.quantity) || 0 : 0;
            const newQty = currentQtyInCart + q;

            // Kiểm tra số lượng yêu cầu có vượt quá tồn kho không
            if (newQty > product.quantity) {
                throw new Error(`Chỉ còn ${product.quantity} sản phẩm trong kho. Bạn đã có ${currentQtyInCart} trong giỏ.`);
            }

            if (detail) {
                detail.quantity = newQty;
                detail.price = product.price;
                await detail.save({ transaction: t });
            } else {
                detail = await CartDetail.create({ cartId: cart.id, productId: product.id, quantity: q, price: product.price }, { transaction: t });
            }

            return this.getActiveCart(userId);
        });
    }

    static async updateItem(itemId, quantity) {
        const qty = parseInt(quantity || 0);
        const detail = await CartDetail.findByPk(parseInt(itemId));
        if (!detail) throw new Error("Cart item không tồn tại");
        if (qty <= 0) {
            await detail.destroy();
            return true;
        }
        detail.quantity = qty;
        await detail.save();
        return true;
    }

    static async removeItem(itemId) {
        const detail = await CartDetail.findByPk(parseInt(itemId));
        if (!detail) return false;
        await detail.destroy();
        return true;
    }

    /**
     * Checkout - Tạo đơn hàng từ giỏ hàng và trừ kho
     * @param {number} userId - ID người dùng
     * @param {object} checkoutData - Thông tin đặt hàng
     * @returns {object} - Đơn hàng đã tạo
     */
    static async checkout(userId, checkoutData) {
        const {
            shippingAddress,
            recipientPhone,
            recipientName,
            paymentMethod = "cod",
            deliveryMethod = "standard",
            notes = "",
            couponCode = null,
        } = checkoutData;

        // Chuẩn hóa phí vận chuyển dựa trên phương thức giao hàng (không tin vào client)
        const SHIPPING_FEE = {
            standard: 15000,
            fast: 30000,
        };
        const normalizedDelivery = String(deliveryMethod || "standard").toLowerCase();
        const shippingFee = SHIPPING_FEE[normalizedDelivery] ?? SHIPPING_FEE.standard;

        // Validate required fields
        if (!shippingAddress || !recipientPhone || !recipientName) {
            throw new Error("Vui lòng điền đầy đủ thông tin giao hàng");
        }

        return await sequelize.transaction(async (t) => {
            // 1. Lấy giỏ hàng active
            const cart = await Cart.findOne({
                where: { userId, status: "active" },
                include: [{
                    model: CartDetail,
                    as: "cartDetails",
                    include: [{ model: Product, as: "product" }]
                }],
                transaction: t,
            });

            if (!cart || !cart.cartDetails || cart.cartDetails.length === 0) {
                throw new Error("Giỏ hàng trống");
            }

            // 2. Kiểm tra tồn kho và tính tổng tiền
            let subtotal = 0;
            const orderItems = [];

            for (const item of cart.cartDetails) {
                const product = await Product.findByPk(item.productId, { transaction: t, lock: true });
                
                if (!product) {
                    throw new Error(`Sản phẩm "${item.product?.name || item.productId}" không tồn tại`);
                }

                if (product.quantity < item.quantity) {
                    throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.quantity} trong kho, bạn yêu cầu ${item.quantity}`);
                }

                const itemSubtotal = Number(product.price) * Number(item.quantity);
                subtotal += itemSubtotal;

                orderItems.push({
                    productId: product.id,
                    quantity: item.quantity,
                    unitPrice: product.price,
                    subtotal: itemSubtotal,
                    product: product, // Lưu reference để trừ kho
                });
            }

            // 3. Xử lý mã giảm giá (nếu có)
            let coupon = null;
            let discountAmount = 0;

            if (couponCode) {
                coupon = await Coupon.findOne({
                    where: { code: couponCode },
                    transaction: t,
                });

                if (!coupon) {
                    throw new Error("Mã giảm giá không tồn tại");
                }

                // Kiểm tra coupon còn hiệu lực
                const now = new Date();
                if (coupon.startDate && new Date(coupon.startDate) > now) {
                    throw new Error("Mã giảm giá chưa có hiệu lực");
                }
                if (coupon.endDate && new Date(coupon.endDate) < now) {
                    throw new Error("Mã giảm giá đã hết hạn");
                }
                if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                    throw new Error("Mã giảm giá đã hết lượt sử dụng");
                }
                if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
                    throw new Error(`Đơn hàng tối thiểu ${coupon.minOrderValue} để sử dụng mã này`);
                }

                // Tính giảm giá
                if (coupon.discountType === "percent") {
                    discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
                    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                        discountAmount = Number(coupon.maxDiscount);
                    }
                } else {
                    discountAmount = Number(coupon.discountValue);
                }

                // Cập nhật usedCount
                await coupon.update({ usedCount: (coupon.usedCount || 0) + 1 }, { transaction: t });
            }

            const totalBeforeShipping = Math.max(0, subtotal - discountAmount);
            const totalPrice = totalBeforeShipping + shippingFee;

            // 4. Tạo đơn hàng
            const order = await Order.create({
                userId,
                status: "PENDING",
                subtotal,
                discountAmount,
                totalPrice,
                shippingAddress,
                recipientPhone,
                recipientName,
                paymentMethod,
                paymentStatus: "pending",
                deliveryMethod: normalizedDelivery,
                notes,
                couponId: coupon?.id || null,
                couponCode: coupon?.code || null,
            }, { transaction: t });

            // 5. Tạo chi tiết đơn hàng và TRỪ KHO
            for (const item of orderItems) {
                await OrderDetail.create({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.subtotal,
                }, { transaction: t });

                // TRỪ KHO
                const newQuantity = item.product.quantity - item.quantity;
                await item.product.update({
                    quantity: newQuantity,
                    status: newQuantity <= 0 ? "out_of_stock" : "active",
                }, { transaction: t });
            }

            // 6. Đóng giỏ hàng
            await cart.update({ status: "completed" }, { transaction: t });

            // 7. Xóa các items trong giỏ hàng
            await CartDetail.destroy({ where: { cartId: cart.id }, transaction: t });

            // 8. Trả về đơn hàng đã tạo
            const orderWithDetails = await Order.findByPk(order.id, {
                include: [
                    {
                        model: OrderDetail,
                        as: "orderDetails",
                        include: [{ model: Product, as: "product", attributes: ["id", "name", "price", "image"] }],
                    },
                ],
                transaction: t,
            });
            orderWithDetails.setDataValue("shippingFee", shippingFee);
            orderWithDetails.setDataValue("totalBeforeShipping", totalBeforeShipping);
            return orderWithDetails;
        });
    }
}

export default CartService;
