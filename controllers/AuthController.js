import getPrismaInstance from "../utils/PrismaClient.js";
import { generateToken04 } from "../utils/TokenGenerator.js";

export const userInformation = async (request, response, next) => {
  try {
    const { id } = request.params;

    const prisma = getPrismaInstance();

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    
    return response.json({ message: "Success", success: true, user });
  } catch (error) {
    return response.json({
      success: false,
      error: true,
      message: error.message
    })
  }
}

export const checkUser = async (request, response, next) => {
  try {
    const { email } = request.body;
    if (!email) {
      return response.json({ message: "Email is required", status: false });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return response.json({ message: "User not found", status: false });
    } else
      return response.json({ message: "User Found", status: true, data: user });
  } catch (error) {
    return response.json({
      success: false,
      error: true,
      message: error.message
    })
  }
};

export const onBoardUser = async (request, response, next) => {
  try {
    const {
      email,
      name,
      about = "Available",
      image: profilePicture,
      resume
    } = request.body;
    if (!email || !name || !profilePicture) {
      return response.json({
        message: "Email, Name and Image are required",
      });
    } else {
      const prisma = getPrismaInstance();
      await prisma.user.create({
        data: { email, name, about, profilePicture, resume: request?.file?.filename },
      });
      return response.json({ message: "Success", status: true });
    }
  } catch (error) {
    // next(error);
    return response.json({
      success: false,
      error: true,
      message: error.message
    })
  }
};

export const registerUser = async (request, response, next) => {
  try {
    const {
      email,
      name,
      phoneNumber,
      userType,
      about = "Available",
      profilePicture = "",
      skills = []
    } = request.body;

    if (!email || !name) {
      return response.json({
        message: "Fields are required",
      });
    }

    const prisma = getPrismaInstance();
    let user = await prisma.user.create({
      data: { 
        email, 
        name, 
        phoneNumber, 
        userType, 
        about, 
        profilePicture,
        skills 
      },
    });

    return response.json({ message: "Success", success: true, user });
  } catch (error) {
    response.json({
      success:false,
      error: true,
      message: error.message,
    })
  }
}

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        about: true,
        userType: true,
        phoneNumber: true
      },
    });
    const usersGroupedByInitialLetter = {};
    users.forEach((user) => {
      const initialLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupedByInitialLetter[initialLetter]) {
        usersGroupedByInitialLetter[initialLetter] = [];
      }
      usersGroupedByInitialLetter[initialLetter].push(user);
    });

    return res.status(200).send({ users: usersGroupedByInitialLetter });
  } catch (error) {
    // next(error);
    return res.json({
      success: false,
      error: true,
      message: error.message
    })
  }
};

export const generateToken = (req, res, next) => {
  try {
    const appID = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_APP_SECRET;
    const userId = req.params.userId;
    const effectiveTimeInSeconds = 3600;
    const payload = "";
    if (appID && serverSecret && userId) {
      const token = generateToken04(
        appID,
        userId,
        serverSecret,
        effectiveTimeInSeconds,
        payload
      );
      res.status(200).json({ token });
    }
    return res
      .status(400)
      .send("User id, app id and server secret is required");
  } catch (err) {
    console.log({ err });
    next(err);
  }
};
