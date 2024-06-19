const dataSource = require("../config/config");
const bcrypt = require("bcrypt");
const {createAccessToken, createRefreshToken} = require("../JWT");
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    const {userName, password, email, isVerified, hasTakenQuiz, level} = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const userRepository = dataSource.getRepository("User");
        const user = userRepository.create({
            userName: userName,
            email: email,
            password: hash,
            isVerified: isVerified,
            issue: "",
            hasTakenQuiz: hasTakenQuiz,
            level: level,
            role: "User",
        });
        await userRepository.save(user);

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);


        res.cookie("refresh-token", refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });

        const userDetail = {
            id: user.userId,
            userName: user.userName,
            email: user.email,
            isVerified: user.isVerified,
            hasTakenQuiz: user.hasTakenQuiz,
            level: user.level,
            role: user.role,
        }

        res.json({ message: "Logged in", accessToken , user: userDetail});

    } catch (err) {
        res.status(400).json({error: err.message});
    }
};

const login = async (req, res) => {
    const userRepository = dataSource.getRepository("User");
    const { email, password } = req.body;
    const user = await userRepository.findOne({ where: { email: email } });

    if (!user) {
        return res.status(400).json({ error: "User doesn't exist" });
    }

    const dbPassword = user.password;
    const match = await bcrypt.compare(password, dbPassword);

    if (!match) {
        return res.status(400).json({ error: "Wrong Username and Password Combination!" });
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
        id: user.userId,
        userName: user.userName,
        email: user.email,
        isVerified: user.isVerified,
        hasTakenQuiz: user.hasTakenQuiz,
        level: user.level,
        role: user.role,
    }

    res.json({ message: "Logged in", accessToken , user: userDetail});
};

const refreshToken = (req, res) => {
    const refreshToken = req.cookies["refresh-token"];
    if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token not found" });
    }

    try {
        const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = createAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
    }
};

const logout = (req, res) => {
    res.clearCookie('refresh-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
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

const updateUserHasTakenQuiz = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const userId = req.params.id;

    try {
        const user = await userRepo.findOne({where: {userId: userId}});

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        user.hasTakenQuiz = true;
        await userRepo.save(user);

        res.json({message: "User quiz status updated successfully"});
    } catch (error) {
        console.error("Error updating user quiz status:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

const updateUserVerifyStatus = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const userId = req.body.id;
    const status = req.body.status;

    try {
        const user = await userRepo.findOne({where: {userId: userId}});

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        user.isVerified = status;
        if (status === "Yes") {
            user.role = "Trader";
        }

        await userRepo.save(user);

        res.json({message: "User verify status updated successfully"});
    } catch (error) {
        console.error("Error updating user quiz status:", error);
        res.status(500).json({message: "Internal server error"});
    }
};


const profile = async (req, res) => {
    res.json("profile");
};


const saveUserVerificationDetails = async (req, res) => {
    const verifyRepo = dataSource.getRepository("UserVerificationDetail");
    const verifySave = verifyRepo.save(req.body);
    res.json(verifySave);
};

const deleteUser = async (req, res) => {
    const userRepo = dataSource.getRepository("User");
    const userId = req.params.id;

    try {
        const userToDelete = await userRepo.findOne({
            where: {
                userId: userId,
            },
        });

        if (!userToDelete) {
            return res.status(404).json({message: "User not found"});
        }

        await userRepo.remove(userToDelete);
        res.json({message: "User deleted successfully"});
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({message: "Internal server error"});
    }
};



module.exports = {
    deleteUser,
    saveUserVerificationDetails,
    register,
    login,
    profile,
    updateUserHasTakenQuiz,
    updateUserVerifyStatus,
    refreshToken,
    logout,
    getAllUsers
};
