const express = require('express');
const dataSource = require("../config/config");

const getAllAdmins = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    res.json(await AdminRepo.find());
};

const saveAdmin = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    const Adminsave = AdminRepo.save(req.body);
    res.json(Adminsave);
};

const deleteAdmin = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    const AdminId = req.params.id;

    try {
        const AdminToDelete = await AdminRepo.findOne({
            where: {
                AdminId: AdminId,
            },
        })

        if (!AdminToDelete) {
            return res.status(404).json({message: 'Admin not found'});
        }

        await AdminRepo.remove(AdminToDelete);
        res.json({message: 'Admin deleted successfully'});
    } catch (error) {
        console.error("Error deleting Admin:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports = {
    getAllAdmins,
    saveAdmin,
    deleteAdmin
}