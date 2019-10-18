const UserModel = require("../model/UserModel");
// 


module.exports.deleteUser = async (req, res) => {
  let id = req.params["id"];
  // let id = req.params["id"];
  try {
    var result = await UserModel.findByIdAndDelete(id);
    // var result = await UserModel.find({_id:id});
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
module.exports.getUser = async (req, res) => {
  // console.log(req.params);
  let id = req.params["id"];
  try {
    var result = await UserModel.findById(id);
    // var result = await UserModel.find({_id:id});
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
module.exports.getAllUser = async (req, res) => {
  // res.status(200).json(User);
  // filter
  //  let result= UserModel.find();
  //  res.status(200).json({
  //    result:result
  //  })
  try {
    // console.log(typeof req);
    // console.log(req.query);
    // console.log(typeof req.query);

    // console.log(typeof req.query.price);
    // req.query;
    // query
    // address

    let query = req.query;
    // value
    let queryObj = { ...query };
    // let queryNew=query;
    // let Query;
    // for (var key in req.query) {
    //   Query[key] = req.query[key];
    // }
    // set
    // Query.price = req.query.price;
    // Query.duration = req.query.duration;
    // Query.rating = req.query.rating;

    // req.query = {
    //   price: 100,
    //   duration: 10,
    //   rating: 4.5
    // };
    // values 

    
    // // filter parameters=> sort,pagination,filter,limit 
    let ExcludefromQuery = ["filter", "limit", "page", "sort"];

    for (let i = 0; i < ExcludefromQuery.length; i++) {
      delete queryObj[ExcludefromQuery[i]];
    }
    // // {price:{$lt:400}}
    // // {price:{lt:400}}
    let queryString = JSON.stringify(queryObj);
    // // /\b(gt|gte|lte|lt)\b/g

    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, function(match) {
      return "$" + match;
    });

    // console.log(queryString);
    // console.log(req.query);
    // 
    queryObj = JSON.parse(queryString);
    // console.log(queryObj);
    // promise
    // promise  wash.then(ironing).then(wear)
// object
    let result = UserModel.find(queryObj);

    // console.log(result);
    console.log(query);

    // sort
    if (query.sort) {
      //  price%ratingsAverage
      var args = query.sort.split("%").join(" ");
      // sort("price ratingsAverage");
      result = result.sort(args);
    }
    // // filter
    if (query.filter) {
      //
      var args = query.filter.split(",").join(" ");
      result = result.select(args);
      // sort("price ratingsAverage");
      // result = result.sort(args);
    } else {
      result = result.select("-__v");
    }
    // // pagination
    let limit = Number(query.limit) || 2;
    // // client
    let page = Number(query.page) || 1;

    let ElementToskip=(page-1)*limit;
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

  // let result = await UserModel.find(queryObj);
};
module.exports.updateUser = async (req, res) => {
  let id = req.params["id"]||req.headers.user["_id"];
  try {
    // name:steve
    // name:stevenson
    var result = await UserModel.findByIdAndUpdate(id, req.body,{ new: true });
    console.log(result);
    res.status(201).json({ status: "user Data Updated", result: result });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};
module.exports.createUser = async (req, res) => {
  // post
  // console.log(req.body);
  // var newObj=new UserModel({})
  // newObj.save();
  try {
    // request
    var result = await UserModel.create(req.body);
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
