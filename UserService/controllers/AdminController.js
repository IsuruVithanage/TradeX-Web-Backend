const dataSource = require("../config/config");

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
      const usersWithIssues = await userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.issues", "issue")
        .where("user.isVerified NOT IN (:...statuses)", { statuses: ['Yes', 'No', 'Pending'] })
        .getMany();
  
      const formattedData = usersWithIssues.map((user) => ({
        userId: user.userId,
        userName: user.userName,
        issues: user.issues.map(issue => issue.issueName)
      }));
  
      res.json(formattedData);
    } catch (error) {
      console.error("Error fetching users with verification issues:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

module.exports = {
    getUserCount,
    getPendingUsers,
    getVerifiedUserCount,
    getUsersWithVerificationIssues,
};
