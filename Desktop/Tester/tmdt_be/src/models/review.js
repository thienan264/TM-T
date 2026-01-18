export default function ReviewModel(sequelize, DataTypes) {
    return sequelize.define(
        "Review",
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
                comment: "Người đánh giá",
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "id",
                },
                comment: "Sản phẩm được đánh giá",
            },
            rating: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 1,
                    max: 5,
                },
                comment: "Số sao đánh giá (1-5)",
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Nội dung bình luận",
            },
            isApproved: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: "Trạng thái duyệt bình luận",
            },
        },
        {
            tableName: "reviews",
            timestamps: true,
        }
    );
}

