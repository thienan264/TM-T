export default function CartModel(sequelize, DataTypes) {
    return sequelize.define(
        "Cart",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "active",
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
        },
        {
            tableName: "carts",
            timestamps: true,
        }
    );
}