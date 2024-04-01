const express = require('express');
const dataSource = require("../config/config");

const getAllUsers = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    res.json(await userRepo.find());
};

const getAllIssues = async (req, res) => {
    const IssueRepo = dataSource.getRepository("Issue");
    res.json(await IssueRepo.find());
};

const saveUser = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const usersave = userRepo.save(req.body);
    res.json(usersave);
};

const deleteUser = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const userId = req.params.id;

    try {
        const userToDelete = await userRepo.findOne({
            where: {
                userId: userId,
            },
        })

        if (!userToDelete) {
            return res.status(404).json({message: 'User not found'});
        }

        await userRepo.remove(userToDelete);
        res.json({message: 'User deleted successfully'});
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};

const getUserCount = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const userCount = await userRepo.count();
        res.json({ count: userCount });
    } catch (error) {
        console.error("Error fetching user count:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getPendingUsers = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const pendingUsers = await userRepo.find({
            where: {
                Verified: "Pending"
            }
        });
        res.json(pendingUsers);
    } catch (error) {
        console.error("Error retrieving pending users:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};

const getVerifiedUserCount = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
      const verifiedUserCount = await userRepo.count({
        where: {
          Verified: "Yes"
        }
      });
      res.json({ count: verifiedUserCount });
    } catch (error) {
      console.error("Error fetching verified user count:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  const getUsersWithVerificationIssues = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const usersWithIssues = await userRepo
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.issue", "issue")
            .where("user.Verified != :verified", { verified: "Yes" })
            .getMany();
        const formattedData = usersWithIssues.map(user => ({
            userId: user.userId,
            userName: user.userName,
            issue: user.issue ? user.issue.IssueName : "" 
        }));
        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching users with verification issues:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};




module.exports = {
    getAllUsers,
    saveUser,
    deleteUser,
    getUserCount,
    getPendingUsers,
    getVerifiedUserCount,
    getUsersWithVerificationIssues,
    getAllIssues
}