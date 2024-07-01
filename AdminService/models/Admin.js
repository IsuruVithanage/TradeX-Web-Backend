const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Admin",
    tableName: "admin",
    columns: {
        AdminId: {
            primary: true,
            type: "varchar",
        },
        AdminName: {
            type: "varchar",
        },
        email: {
            type: "varchar",
        },
        password: {
            type: "varchar",
        },
        NIC: {
            type: "varchar",
        },
        Contact: {
            type: "varchar",
        },
        role: {
            type: "varchar",
        },
    },
    hooks: {
        beforeInsert: async function(admin) {
            if (!admin.AdminId) {
                const adminRepo = admin.getRepository();
                const lastAdmin = await adminRepo.createQueryBuilder("admin")
                    .orderBy("admin.AdminId", "DESC")
                    .getOne();

                if (lastAdmin) {
                    const lastIdNum = parseInt(lastAdmin.AdminId.slice(1), 10);
                    const newIdNum = lastIdNum + 1;
                    admin.AdminId = `A${newIdNum.toString().padStart(3, '0')}`;
                } else {
                    admin.AdminId = "A001";
                }
            }
        }
    }
});