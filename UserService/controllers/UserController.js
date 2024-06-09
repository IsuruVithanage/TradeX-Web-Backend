const express = require("express");
const dataSource = require("../config/config");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const { createTokens, validateToken } = require("../JWT");

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
            hasTakenQuiz: hasTakenQuiz,
            level: level,
        });
        await userRepository.save(user);

        const accessToken = createTokens(user);
        res.cookie("access-token", accessToken, {
            maxAge: 60 * 60 * 24 * 30 * 1000,
            httpOnly: true,
        });

        res.json({message: "Logged in", token: accessToken, user: user});
    } catch (err) {
        res.status(400).json({error: err.message});
    }
};

const login = async (req, res) => {
    const userRepository = dataSource.getRepository("User");
    const {email, password} = req.body;
    const user = await userRepository.findOne({where: {email: email}});

    if (!user) {
        return res.status(400).json({error: "User doesn't exist"});
    }

    const dbPassword = user.password;
    const match = await bcrypt.compare(password, dbPassword);

    if (!match) {
        return res
            .status(400)
            .json({error: "Wrong Username and Password Combination!"});
    }

    const accessToken = createTokens(user);
    res.cookie("access-token", accessToken, {
        maxAge: 60 * 60 * 24 * 30 * 1000,
        httpOnly: true,
    });

    res.json({message: "Logged in", token: accessToken, user: user});
};


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


const getAllIssues = async (req, res) => {
    const IssueRepo = dataSource.getRepository("Issue");
    res.json(await IssueRepo.find());
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
      .leftJoinAndSelect("user.issue", "issue")
      .where("user.isVerified != :verified", { isVerified: "Yes" })
      .getMany();
    const formattedData = usersWithIssues.map((user) => ({
      userId: user.userId,
      userName: user.userName,
      issue: user.issue ? user.issue.IssueName : "",
    }));
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching users with verification issues:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  deleteUser,
  getUserCount,
  getPendingUsers,
  getVerifiedUserCount,
  getUsersWithVerificationIssues,
  getAllIssues,
  saveUserVerificationDetails,
  register,
  login,
  profile,
  updateUserHasTakenQuiz,
};
