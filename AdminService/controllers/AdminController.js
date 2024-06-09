const express = require('express');
const dataSource = require("../config/config");

const getAllAdmins = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    res.json(await AdminRepo.find());
};


const saveAdmin = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");

    try {
    
        const { AdminName, Date, NIC, Contact, Age } = req.body;

        
        const newAdmin = AdminRepo.create({
            AdminName,
            Date,
            NIC,
            Contact,
            Age
        });

    
        const savedAdmin = await AdminRepo.save(newAdmin);

    
        res.status(201).json(savedAdmin);
    } catch (error) {
        console.error("Error saving admin:", error);
        res.status(500).json({message: 'Internal server error'});
    }
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

const getAdminCount = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    try {
        const count = await AdminRepo.count();
        res.json({ count: count });
    } catch (error) {
        console.error("Error retrieving admin count:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    getAllAdmins,
    saveAdmin,
    deleteAdmin,
    getAdminCount
}