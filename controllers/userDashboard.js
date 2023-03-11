const User = require('../models/userModel')
const Product = require('../models/product')
const Address = require('../models/address')
const Orders = require('../models/orders')
const Coupon = require('../models/coupon')
const loadDash = async (req, res) => {
    try {
        if(req.session.user){
        const userData = await User.findOne({_id:req.session.user_id})  
        const orderData = await Orders.find({ userId: req.session.user_id })
        res.render('users/dashboard', { user: req.session.user,userData,orderData, head: 5 , active:1 })
    }else{
        res.redirect('login')
    }
    }catch (error) {
        console.log(error.message)
    }
}
const loadAddress = async (req, res) => {
    try {
        if(req.session.user){
        const addressData = await Address.find({ userId: req.session.user_id })
        res.render('users/address', { user: req.session.user, head: 5 ,address:addressData,active:3 })
    }else{
        res.redirect('login')
    }
    }catch (error) {
        console.log(error.message)
    }
}
const saveAddress = async(req,res)=>{
    try {
      const addressData = new Address({
        userId:req.session.user_id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.pin,
        mobile: req.body.mno,
      })
       await addressData.save();
       res.redirect('/address');
  
  
    } catch (error) {
      console.log(error.message)
    }
  }

  const editAddress = async(req,res)=>{
    try {
      const addressData = await Address.updateOne({_id:req.body.id},{$set:{
        userId:req.session.user_id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.pin,
        mobile: req.body.mno,
     } })
       res.redirect('/address');
  
  
    } catch (error) {
      console.log(error.message)
    }
  }
  const deleteAddress = async (req, res) => {
    try {
        if(req.session.user){
        const addressData = await Address.deleteOne({_id: req.query.id})
        res.redirect('/address');
        }else{
        res.redirect('login')
    }
    }catch (error) {
        console.log(error.message)
    }
}

  const loadOrders = async function (req,res) {
    try {
        const orderData = await Orders.find({ userId: req.session.user_id })
        res.render('users/orders',{active:2,user: req.session.user, orders:orderData, head: 5})
    } catch (error) {
        console.log(error.message);
    }
  }
  const loadOrderDetails = async (req,res)=>{
    try {
      const orderData = await Orders.findOne({_id:req.query.id}).populate('userId')
      const productData = await orderData.populate('products.item.productId')
      res.render('users/orderDetails',{active:2,user: req.session.user, order:orderData, head: 5, products:productData.products})
    } catch (error) {
      console.log(error.message);
    }
  }  
  const loadProfile = async function (req,res) {
    try {
        const userData = await User.findOne({_id:req.session.user_id})
        res.render('users/profile',{active:4,user: req.session.user, head: 5,userData})
    } catch (error) {
        console.log(error.message);
    }
  }
module.exports = {
    loadDash,
    loadOrders,
    loadOrderDetails,
    loadProfile,
    loadAddress,
    saveAddress,
    editAddress,
    deleteAddress
}