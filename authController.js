const UserModel = require("../model/UserModel");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const secret = "super secret";
// const sendEmail = require("../utility/email");
const Email = require("../utility/email");
// AuThenticate=>
module.exports.loginUser = async (req, res) => {
  try {
    let data = req.body;
    // 1. check emailID and password is present in req.body
    let { email, password } = data;
    if (!email || !password) {
      res.end("email or password is not present");
      return;
    }

    // 2.a find user
    let userData = await UserModel.findOne({
      email: email
    });
    // console.log(userData);
    if (!userData) {
      res.end("User not found");
      return;
    }
    // console.log(userData);
    //2.b  verify password
    // hashed ,encrypted form
    let dbPassword = userData.password;
    // console.log(dbPassword,password);
    // console.log(typeof dbPassword, typeof password);
    let ans = await bcrypt.compare("" + password, dbPassword);
    if (!ans) {
      // new Error("Password was wrong")
      res.end("password is wrong");
      return;
    }
    // token is assigned
    // 3. create token using jsonwebtokens

    const JWTtoken = jsonwebtoken.sign({ id: userData._id }, secret, {
      expiresIn: "10d"
    });

    // Welcome mail
    let url = "http://localhost:3000/me";
    await new Email(userData, url).sendWelcome();
    //4. respond to user
    // modify
    res.cookie("jwt", JWTtoken, { httpOnly: "true" });
    res.json({
      status: "user logged in",
      userData
    });
  } catch (err) {
    console.log(err);
    res.status(501).json({
      status: "User not logged"
    });
  }
  res.end("Sending after try catch");
};
module.exports.userSignUp = async (req, res) => {
  // 1. check emailID and password is present in req.body
  //  form submisson
  try {
    let data = req.body;
    // value longer syntax
    // let email = data.email;
    // let password = data.password;
    // value shorter destructuring
    let { email, password } = data;
    if (!email || !password) {
      res.end("email or password is not present");
      return;
    }
    // 2. create  user
    // async
    let user = await UserModel.create(data);
    // console.log( result);
    // result=JSON.parse(result);
    // 3. create token using jsonwebtokens
    // encrypt
    const JWTtoken = jsonwebtoken.sign({ id: user._id }, secret, {
      expiresIn: "10d"
    });
    res.cookie("jwt", JWTtoken, { httpOnly: "true" });
    res.status(200).json({
      status:"user Signedup",
      user
    })
  } catch (err) {
    console.log(err);
    res.status(501).json({
      status: "User not signed In"
    });
  }
  // 4. responed to  user
};
module.exports.logoutUser = async (req, res) => {
  res.cookie("jwt", "Logged out", {
    expires: new Date(Date.now() + 100),
    httpOnly: true
  });
  res.status(201).json({
    status: "user logged Out"
  });
  console.log(Date.now());
};
// (SignedIN)view => Signout ,IMage
//view=>Login
module.exports.isloggedIn = async (req, res, next) => {
  //
  try {
    // 1. check token exist's ot not

    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log(token);
      // 2. verify the token
      let decode = jsonwebtoken.verify(token, secret);
      if (!decode) {
        // res.end("User is not authenticated");
        return next();
      }
      console.log(decode);
      // 3. check that user associated with the token exist in db or not
      // user name:steve
      //role:admin
      const user = await UserModel.findById(decode.id);
      if (!user) {
        // res.end("user does not exist");
        return next();
      }
      // 4. password update
      // db => ADMIN,User
      // authorize
      req.headers.role = user.role;
      // pug file
      res.locals.user = user;
      return next();
    } else {
      return next();
    }
  } catch (err) {
    // res.json(err);
    // console.log(err);
    return next();
  }
};
module.exports.protectRoute = async (req, res, next) => {
  //
  try {
    // 1. check token exist's ot not
    // console.log(req.headers);
    // console.log(req.headers.authorization);
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else {
      res.end("User is not logged in ");
    }
    // 2. verify the token
    try {
      let decode = jsonwebtoken.verify(token, secret);
      const user = await UserModel.findById(decode.id);
      if (!user) {
        res.end("user does not exist");
      }
      // 4. password update
      // db => ADMIN,User

      req.headers.role = user.role;
      req.headers.user = user;
      // user.password = undefined;
      res.locals.user = user;
      next();
    } catch (err) {
      return res.end("User is not authenticated");
    }
    // console.log(decode);
    // 3. check that user associated with the token exist in db or not
    // user name:steve
    //role:admin
  } catch (err) {
    // res.json(err);
    console.log(err);
  }
};
//  admin owner=> level of privilages
module.exports.authorizeeasy = (req, res, next) => {
  if (req.headers.role === "admin" || req.headers.role === "restaurantOwner") {
    next();
  } else {
    res.end("user is not authorized");
  }
};
module.exports.authorize = function(...args) {
  let roles = args;
  return function(req, res, next) {
    if (roles.includes(req.headers.role)) {
      next();
    } else {
      res.end("user is not authorized");
    }
  };
};
module.exports.forgetPassword = async (req, res) => {
  // 1. get emailID from req.body
  const email = req.body.email;
  if (!email) {
    req.end("Please enter your email ID");
  }

  // 2. DB findone
  let user = await UserModel.findOne({
    email: email
  });
  if (!user) {
    res.end("User with given EmailID not found");
  }
  // 3. randomtoken
  // associate

  let token = user.createResetToken();

  await user.save({ validateBeforeSave: false });

  // generate
  // 4. send token via email

  let message =
    "Your reset token is send please send a patch request to reset password route using provided token \n " +
    token;
  // console.log("I was here");
  try {

    // sendEmail({
    //   recieverId: user.email,
    //   message: message,
    //   subject: "token is only valid for 10 minutes"
    //   // html
    // });  
    let url = `http://localhost:3000/resetPassword/${token}`;
    await new Email(user,url).sendReset();

  } catch (err) {
    console.log(err);
    res.status(501).send(err);
  }
  res.end("Password reset token has been send to your email ID");
};
module.exports.resetPassword = async (req, res) => {
  // 1. get token from the user
  const token = req.params.token;
  // console.log(token);
  const encryptedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  let user = await UserModel.findOne({ resetToken: encryptedToken });
  if (!user) {
    res.end("User with this reset token is not present");
  }
  // 2. verify the token
  // console.log(user);
  // process.exit(1);
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetToken = undefined;
  user.expiresIn = undefined;
  user.save();
  // console.log("I arrived here");
  // 3. update the password
  res.end("Password has been reset");
};
module.exports.updateMyPassword = async (req, res) => {
  //  currentPassword,NewPassword,confirmPassword
  console.log(req.body);
  const dbPassword = req.headers.user.password;
  // ui
  const password = req.body.currentPassword;
  // db
  const user = req.headers.user;
  let ans = await bcrypt.compare("" + password, dbPassword);
  if (!ans) {
    // new Error("Password was wrong")
    res.end("password is wrong");
    return;
  }
  //  model user password update
  console.log(user);
  user.password = req.body.NewPassword;
  user.confirmPassword = req.body.confirmPassword;
  // validators
  user.save();
  // send tokens
  // const JWTtoken = jsonwebtoken.sign({ id: user._id }, secret, {
  //   expiresIn: "10d"
  // });
  // res.cookie("jwt", JWTtoken, { httpOnly: "true" });
  res.json({
    status: "user Password Updated"
  });
};
