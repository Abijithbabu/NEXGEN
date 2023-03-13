const User = require("../models/userModel");
const Category = require('../models/category')
const Product = require('../models/product')
const Coupons = require('../models/coupon')
const bcrypt = require("bcrypt");
const Order = require('../models/orders')


const loadLogin = async (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
  }
};
const verifyLogin =async (req,res)=>{
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = {
      email:'nexadmin@gmail.com',
      password:'bab260919246'
    }
    if(email==adminData.email&& password==adminData.password){
      req.session.admin = adminData.email;
      res.redirect("/admin/dashboard");
    } else {
      res.render("admin/login", { message: "email or password is incorrect" });
     }
    
  } catch (error) {
    console.log(error.message);
  }
}
// const verifyLogin = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;

//     const userData = await User.findOne({ email: email });

//     if (userData) {
//       const passwordMatch = await bcrypt.compare(password, userData.password);

//       if (passwordMatch) {
//         if (userData.is_admin === 0) {
//           res.render("admin/login", { message: "email and password incorrect" });
//         } else {
//           req.session.admin_id = userData._id;
//           res.redirect("/admin/dashboard");
//         }
//       } else {
//         res.render("admin/login", { message: "email and password is incorrect" });
//       }
//     } else {
//       res.render("admin/login", { message: "email and password is incorrect" });
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const loadDashboard = async (req, res) => {
  try {
    const orderData = await Order.find().populate('products.item.productId')
    let arr =[] , dt=[]
    orderData.map((x)=>{
       let date = new Date(x.createdAt).getDate()
      arr = [...arr,x.amount]
      dt = [...dt,date]
    })
    console.log(arr,dt);
    res.render("admin/dashboard", { orderData,arr,dt, active: 1 });
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};


const loadUsers = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
        { mobile: { $regex: ".*" + search + ".*" } },
      ],
    });
    res.render("admin/users", { users: userData, val: search, active: 2 });
  } catch (error) {
    console.log(error.message);
  }
};
const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findOne({ _id: id });
    console.log(id);
    if (userData.is_verified) {
      const userData = await User.findByIdAndUpdate({ _id: id }, { $set: { is_verified: 0 } }); console.log("blocked " + userData.name); state=0
    } else { await User.findByIdAndUpdate({ _id: id }, { $set: { is_verified: 1 } }); console.log("unblocked " + userData.name); state=1 }
    res.send({state})
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  loadLogin,
  verifyLogin, 
  loadDashboard,
  logout,
  blockUser,
  loadUsers,

};




