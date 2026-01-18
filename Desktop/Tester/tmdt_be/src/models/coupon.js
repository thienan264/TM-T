export default function CouponModel(sequelize, DataTypes) {
    return sequelize.define(
        "Coupon",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                comment: "Mã giảm giá (VD: GIAM10, SALE50K)",
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Mô tả mã giảm giá",
            },
            discountType: {
                type: DataTypes.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
                comment: "Loại giảm giá: percent (%), fixed (số tiền cố định)",
            },
            discountValue: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: "Giá trị giảm (% hoặc số tiền VND)",
            },
            minOrderValue: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment: "Giá trị đơn hàng tối thiểu để áp dụng",
            },
            maxDiscount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                comment: "Số tiền giảm tối đa (cho loại percent)",
            },
            usageLimit: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Số lần sử dụng tối đa (null = không giới hạn)",
            },
            usedCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Số lần đã sử dụng",
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "Ngày bắt đầu hiệu lực",
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "Ngày hết hạn",
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: "Trạng thái kích hoạt",
            },
        },
        {
            tableName: "coupons",
            timestamps: true,
        }
    );
}

