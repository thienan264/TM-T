export default function OrderModel(sequelize, DataTypes) {
    return sequelize.define(
        "Order",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "pending",
            },
            totalPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            shippingAddress: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            recipientPhone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            recipientName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            paymentMethod: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Phương thức thanh toán (cod, bank_transfer, credit_card, etc.)",
            },
            paymentStatus: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: "pending",
                comment: "Trạng thái thanh toán (pending, paid, failed, refunded)",
            },
            deliveryMethod: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Phương thức vận chuyển",
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Ghi chú đơn hàng",
            },
            couponId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "coupons",
                    key: "id",
                },
                comment: "Mã giảm giá đã áp dụng",
            },
            couponCode: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Mã giảm giá (lưu để tham khảo)",
            },
            discountAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment: "Số tiền được giảm",
            },
            subtotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                comment: "Tổng tiền trước giảm giá",
            },
        },
        {
            tableName: "orders",
            timestamps: true,
        }
    );
}