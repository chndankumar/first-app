const stripe = require("stripe")("YourPrivateKey");
// const {getPlan}=require("../controller/plancontroller");
const planModel = require("../model/planModel");
module.exports.getCheckout = async (req, res) => {
  const id = req.params["id"];
  // 1 Get plan DB
  const plan = await planModel.findById(id);
  // console.log(plan);
  // 2 Check out
  {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: req.headers.user["email"],
      client_reference_id: id,
      line_items: [
        {
          name: `${plan.name}`,
          description: `${plan.description}`,
          amount: `${plan.price}` * 100,
          currency: "usd",
          quantity: 1
        }
      ],
      success_url: "http://localhost:3000/",
      cancel_url: "http://localhost:3000/login"
    });
    // 3 Redirect
    res
      .status(201)
      .json({ status: "Payement for " + plan.name + " made", session });
    // res.locals.id = session["id"];
    // next();
  }
};
