// 2. 
const planModel = require("../model/planModel");
// request 
module.exports.queryIncluder=(req,res,next)=>{
req.query.sort="price%ratingAverage";
req.query.filter="name%description%ratingAverage";
req.query.limit=5;
next();
}

module.exports.deletePlan = async (req, res) => {
  let id = req.params["id"];
  // let id = req.params["id"];
  try {
    var result = await planModel.findByIdAndDelete(id);
    // var result = await planModel.find({_id:id});
    res.status(201).json({
      ans: result
    });
  } catch (err) {
    // console.log(err);
    res.status(401).json({
      status: "bad request"
    });
  }
};
module.exports.getPlan = async (req, res) => {
  // console.log(req.params);
  let id = req.params["id"];
  try {
    var result = await planModel.findById(id);
    // var result = await planModel.find({_id:id});
    res.status(201).json({
      ans: result
    });
  } catch (err) {
    // console.log(err);
    res.status(401).json({
      status: "bad request"
    });
  }
};
module.exports.getAllPlans = async (req, res) => {
  // res.status(200).json(plan);
  // filter
//  let result= planModel.find();
//  res.status(200).json({
//    result:result
//  })
  try {
    // console.log(typeof req.query.price);
    // req.query;
    // query
    let query = req.query;
    let queryObj = { ...query };
    // filter
    let ExcludefromQuery = ["filter", "limit", "page", "sort"];

    for (let i = 0; i < ExcludefromQuery.length; i++) {
      delete queryObj[ExcludefromQuery[i]];
    }
    // gt lt lte
    let queryString = JSON.stringify(queryObj);
    // /\b(gt|gte|lte|lt)\b/g
    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, function(match) {
      return "$" + match;
    });
    // console.log(queryString);
    // console.log(req.query);
    queryObj = JSON.parse(queryString);
    // console.log(queryObj);
    let result = planModel.find(queryObj);
    // console.log(result);
    // sort
    console.log(query);
    if (query.sort) {
      //  price%ratingsAverage
      var args = query.sort.split("%").join(" ");
      //  sort("price -ratingsAverage");
      result = result.sort(args);
    }
    // // filter
    if (query.filter) {
      //
      var args = query.filter.split("%").join(" ");
      result = result.select(args);
  
      // sort("price ratingsAverage");
      // result = result.sort(args);
    } else {
      result = result.select("-__v");
    }
   // pagination
   // 10 million result 
    let limit = Number(query.limit) || 2;
    // client
    let page = Number(query.page) || 1;
    let ElementToskip=(page-1)*limit;
// skip(4).limit(10)
    result=result.skip(ElementToskip).limit(limit);
    // Query Execution
    let finalresult = await result;
    res.status(200).json({
      result: finalresult
    });
  } catch (err) {
    res.status(401).json({
      response: "data not found",
      err: err
    });
  }
  // alias
  // sort
  //
  // MOngodb
  // queryObj={
  //   price:{$gt:400},
  //   duration:10
  // }
  // // mongoose
  //
  // let sresult= await result("price").sort();

  // let result = await planModel.find(queryObj);
};
module.exports.updatePlan = async (req, res) => {
  let id = req.params["id"];
  try {
    // name:steve
    // name:stevenson
    var result = await planModel.findByIdAndUpdate(id, req.body,{ new: true});
    console.log(result);
    res.status(201).json({ status: "updated your document", result: result });
  } catch (err) {
    res.send(err);
  }
};
module.exports.createPlan = async (req, res) => {
  // post
  // console.log(req.body);
  // var newObj=new planModel({})
  // newObj.save();
  try {
    var result = await planModel.create(req.body);
    res.status(201).json({
      ans: result
    });
  } catch (err) {
    // console.log(err);
    res.status(401).json({
      status: err
    });
  }
};
