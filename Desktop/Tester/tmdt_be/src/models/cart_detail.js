export default function CartDetailModel(sequelize, DataTypes) {
    return sequelize.define(
        "CartDetail",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            cartId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "carts",
                    key: "id",
                },
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "id",
                },
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            tableName: "cart_details",
            timestamps: true,
        }
    );
}