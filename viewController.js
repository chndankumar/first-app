const planModel = require("../model/planModel");
module.exports.viewHomePage = async (req, res) => {
  // list all plans from db
  let allPlans = await planModel.find();
  //  first 3 plan
  allPlans = allPlans.slice(0, 3);
  // console.log(allPlans)
  res.status(201).render("home.pug", {
    plans: allPlans
  });
};
module.exports.viewLoginPage = (req, res) => {
  res.status(201).render("login.pug");
};
module.exports.viewPlansPage = async (req, res) => {
  let allPlans = await planModel.find();
  //  first 3 plan
  // allPlans=allPlans.slice(0,3);
  // console.log(allPlans)
  res.status(201).render("plansPage.pug", {
    plans: allPlans
  });
};
// locals
module.exports.viewAccountPage = async (req, res) => {
  res.status(201).render("account.pug");
};
module.exports.viewPasswordPage = async (req, res) => {
  res.status(201).render("password.pug");
};
module.exports.viewSignupPage=async(req,res)=>{
  res.status(201).render("signup.pug");
}