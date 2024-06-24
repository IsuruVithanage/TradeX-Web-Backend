const dataSource = require("../config/config");
const { Not, IsNull } = require('typeorm');

const getUserCount = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const userCount = await userRepo.count();
        res.json({count: userCount});
    } catch (error) {
        console.error("Error fetching user count:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

const getPendingUsers = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const pendingUsers = await userRepo.find({
            where: {
                isVerified: "Pending",
            },
        });
        res.json(pendingUsers);
    } catch (error) {
        console.error("Error retrieving pending users:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

const getVerifiedUserCount = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const verifiedUserCount = await userRepo.count({
            where: {
                isVerified: "Yes",
            },
        });
        res.json({count: verifiedUserCount});
    } catch (error) {
        console.error("Error fetching verified user count:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

const getUsersWithVerificationIssues = async (req, res) => {
    const userRepo = dataSource.getRepository("User");

    try {
        const user = await userRepo.find({where: {issue: Not("")}});

        if (!user) {
            return res.status(404).json({message: "User with an issue not found"});
        }

        res.json(user);
    } catch (error) {
        console.error("Error finding user", error);
        res.status(500).json({message: "Internal server error"});
    }
  };

  const getAllUsers = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const users = await userRepo.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({message: "Internal server error"});
    }

}

const getUserVerificationDetails = async (req, res) => {
    const userRepo = dataSource.getRepository("UserVerificationDetail");
    const userId = req.body.id;

    try {
        const user = await userRepo.findOne({where: {userId: userId}});

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        
        res.json(user);
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(500).json({message: "Internal server error"});
    }
};
  

module.exports = {
    getUserCount,
    getPendingUsers,
    getVerifiedUserCount,
    getUsersWithVerificationIssues,
    getAllUsers,
    getUserVerificationDetails
};
