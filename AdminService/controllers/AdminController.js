const express = require('express');
const dataSource = require("../config/config");
const { createAccessToken, createRefreshToken } = require("../JWT");

const getAllAdmins = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    res.json(await AdminRepo.find());
};

const login = async (req, res) => {
    const userRepository = dataSource.getRepository("Admin");
    const { email, password } = req.body;
    const user = await userRepository.findOne({ where: { email: email } });

    if (!user) {
        return res.status(400).json({ message: "Incorrect E-mail address" });
    }

    const dbPassword = user.password;
    const match = await bcrypt.compare(password, dbPassword);

    if (!match) {
        return res.status(400).json({ message: "Wrong Username and Password Combination!" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);


    res.cookie("refresh-token", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    });

    const userDetail = {
        id: user.AdminId,
        userName: user.AdminName,
        email: user.email,
        hasTakenQuiz: user.hasTakenQuiz,
        role: user.role,
    }

    res.json({ message: "Logged in", accessToken , user: userDetail});
};


const saveAdmin = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");

    try {
        const { AdminName, email, password, NIC, Contact } = req.body;

        // Retrieve the last admin to generate a new ID
        const lastAdmin = await AdminRepo.createQueryBuilder("admin")
            .orderBy("admin.AdminId", "DESC")
            .getOne();

        let newAdminId;
        if (lastAdmin) {
            const lastIdNum = parseInt(lastAdmin.AdminId.slice(1), 10);
            const newIdNum = lastIdNum + 1;
            newAdminId = `A${newIdNum.toString().padStart(3, '0')}`;
        } else {
            newAdminId = "A001";
        }

        // Create the new admin with the generated ID
        const newAdmin = AdminRepo.create({
            AdminId: newAdminId,
            AdminName,
            email,
            password,
            NIC,
            Contact,
            role: "Admin"
        });

        // Save the new admin
        const savedAdmin = await AdminRepo.save(newAdmin);

        res.status(201).json(savedAdmin);
    } catch (error) {
        console.error("Error saving admin:", error);
        res.status(500).json({ message: 'Internal server error' });
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
    getAdminCount,
    login
}