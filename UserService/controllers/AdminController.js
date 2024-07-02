const dataSource = require("../config/config");
const {Not, IsNull} = require('typeorm');

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
        const users = await userRepo.createQueryBuilder('user')
            .leftJoin(
                "UserVerificationDetail",
                'user_verification_detail',
                'user_verification_detail.userId = user.userId'
            )
            .select([
                'user.userId AS "userId"',
                'user.userName AS "userName"',
                'user.email AS "email"',
                'user.issue AS "issue"',
                'user.hasTakenQuiz AS "hasTakenQuiz"',
                'user.level AS "level"',
                'user.role AS "role"',
                'user_verification_detail.firstName AS "firstName"',
                'user_verification_detail.lastName AS "lastName"',
                'user_verification_detail.age AS "age"',
                'user_verification_detail.phoneNumber AS "phoneNumber"',
                'user_verification_detail.nic AS "nic"',
                'user_verification_detail.dateOfBirth AS "dateOfBirth"',
                'user_verification_detail.userImg AS "userImg"',
                'user_verification_detail.nicImg1 AS "nicImg1"',
                'user_verification_detail.nicImg2 AS "nicImg2"',
                'user_verification_detail.requestDate AS "requestDate"'
            ])
            .where('user.role = :role', {role: "User"})
            .orderBy('user.userId', 'ASC')
            .getRawMany();

        res.status(200).json(users);
    } catch (error) {
        console.log("error getting pending traders", error);
        res.status(500).json({message: "error getting pending traders"});
    }
};


const getVerifiedUserCount = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    try {
        const verifiedUserCount = await userRepo.count({
            where: {
                role: "Trader",
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
        const users = await userRepo.createQueryBuilder('user')
            .leftJoin(
                "UserVerificationDetail",
                'user_verification_detail',
                'user_verification_detail.userId = user.userId'
            )
            .select([
                'user.userId AS "userId"',
                'user.userName AS "userName"',
                'user.email AS "email"',
                'user.issue AS "issue"',
                'user.hasTakenQuiz AS "hasTakenQuiz"',
                'user.level AS "level"',
                'user.role AS "role"',
                'user_verification_detail.firstName AS "firstName"',
                'user_verification_detail.lastName AS "lastName"',
                'user_verification_detail.age AS "age"',
                'user_verification_detail.phoneNumber AS "phoneNumber"',
                'user_verification_detail.nic AS "nic"',
                'user_verification_detail.dateOfBirth AS "dateOfBirth"',
                'user_verification_detail.userImg AS "userImg"',
                'user_verification_detail.nicImg1 AS "nicImg1"',
                'user_verification_detail.nicImg2 AS "nicImg2"',
                'user_verification_detail.requestDate AS "requestDate"'
            ])
            .where('user.role = :role', {role: "PendingTrader"})
            .andWhere('user.issue != :issue', {issue: ""})
            .orderBy('user.userId', 'ASC')
            .getRawMany();

        res.status(200).json(users);
    } catch (error) {
        console.log("error getting pending traders", error);
        res.status(500).json({message: "error getting pending traders"});
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


const getAllUserDetails = async (req, res) => {
    const userRepo = dataSource.getRepository("User");

    try {
        const users = await userRepo.createQueryBuilder('user')
            .leftJoin(
                "UserVerificationDetail",
                'user_verification_detail',
                'user_verification_detail.userId = user.userId'
            )
            .select([
                'user.userId AS "userId"',
                'user.userName AS "userName"',
                'user.email AS "email"',
                'user.issue AS "issue"',
                'user.hasTakenQuiz AS "hasTakenQuiz"',
                'user.level AS "level"',
                'user.role AS "role"',
                'user_verification_detail.firstName AS "firstName"',
                'user_verification_detail.lastName AS "lastName"',
                'user_verification_detail.age AS "age"',
                'user_verification_detail.phoneNumber AS "phoneNumber"',
                'user_verification_detail.nic AS "nic"',
                'user_verification_detail.dateOfBirth AS "dateOfBirth"',
                'user_verification_detail.userImg AS "userImg"',
                'user_verification_detail.nicImg1 AS "nicImg1"',
                'user_verification_detail.nicImg2 AS "nicImg2"',
                'user_verification_detail.requestDate AS "requestDate"'
            ])
            .orderBy('user.userId', 'ASC')
            .getRawMany();

        res.status(200).json(users);
    } catch (error) {
        console.log("error getting users with verification details", error);
        res.status(500).json({message: "error getting users with verification details"});
    }
};

const getUserDetailsbyId = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const userId = req.params.id;

    try {
        const user = await userRepo.createQueryBuilder('user')
            .leftJoin(
                "UserVerificationDetail",
                'user_verification_detail',
                'user_verification_detail.userId = user.userId'
            )
            .select([
                'user.userId AS "userId"',
                'user.userName AS "userName"',
                'user.email AS "email"',
                'user.issue AS "issue"',
                'user.hasTakenQuiz AS "hasTakenQuiz"',
                'user.level AS "level"',
                'user.role AS "role"',
                'user_verification_detail.firstName AS "firstName"',
                'user_verification_detail.lastName AS "lastName"',
                'user_verification_detail.age AS "age"',
                'user_verification_detail.phoneNumber AS "phoneNumber"',
                'user_verification_detail.nic AS "nic"',
                'user_verification_detail.dateOfBirth AS "dateOfBirth"',
                'user_verification_detail.userImg AS "userImg"',
                'user_verification_detail.nicImg1 AS "nicImg1"',
                'user_verification_detail.nicImg2 AS "nicImg2"',
                'user_verification_detail.requestDate AS "requestDate"'
            ])
            .where('user.userId = :userId', {userId})
            .getRawOne();

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        console.log("error getting user by ID", error);
        res.status(500).json({message: "error getting user by ID"});
    }
};


module.exports = {
    getUserCount,
    getPendingUsers,
    getVerifiedUserCount,
    getUsersWithVerificationIssues,
    getAllUsers,
    getUserVerificationDetails,
    getUserDetailsbyId,
    getAllUserDetails
};
