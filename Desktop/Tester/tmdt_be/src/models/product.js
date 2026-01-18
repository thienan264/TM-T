export default function ProductModel(sequelize, DataTypes) {
    return sequelize.define(
        "Product",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            cost: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            profitPercent: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: true,
            },
            weight: {
                type: DataTypes.DECIMAL(8, 3),
                allowNull: true,
            },
            // Thông tin cho thiết bị y tế
            brand: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Thương hiệu/nhà sản xuất",
            },
            modelNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Mã sản phẩm/model",
            },
            warrantyPeriod: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "Thời gian bảo hành (tháng)",
            },
            certification: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Chứng nhận/giấy phép lưu hành",
            },
            specifications: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Thông số kỹ thuật (JSON hoặc text)",
            },
            usageInstructions: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Hướng dẫn sử dụng",
            },
            medicalDeviceType: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Loại thiết bị y tế (máy đo huyết áp, máy đo đường huyết, etc.)",
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: "active",
                comment: "Trạng thái sản phẩm (active, inactive, out_of_stock)",
            },
        },
        {
            tableName: "products",
            timestamps: true,
        }
    );
}