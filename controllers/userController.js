const User = require('../models/userModel')
const Category = require('../models/category')
const Product = require('../models/product')
const Address = require('../models/address')
const Coupon = require('../models/coupon')
const Order = require('../models/orders')
const bcrypt = require('bcrypt');
let session
const loadRegister = async (req, res) => {
    try {
        res.render('users/login', { active: 1 })
    }
    catch (error) {
        console.log(error.message)
    }
}


const loginLoad = async (req, res) => {
    try {
        res.render('users/login', { active: 0 });
    }
    catch (error) {
        console.log(error.message);
    }
};
const loadforget = async (req, res) => {
    try {
        res.render('users/forget', { user: session, head: 1 });
    }
    catch (error) {
        console.log(error.message);
    }
};
const verifyforget = async (req, res) => {
    try {
        const is_user = await User.findOne({ mobile: req.body.phone })
        console.log(is_user + 'mno ' + req.body.phone);
        if (is_user) {
            newOtp = sendMessage(req.body.phone, res);
            console.log(newOtp);
            res.render('users/otp2', { otp: newOtp, user: is_user })
        } else {
            res.render('users/forget', { user: '', message: 'no user found', head: 1 });
        }
    }
    catch (error) {
        console.log(error.message);
    }
};
const resetPassword = async (req, res) => {
    try {
        if (req.query.otp == req.body.otp) {
            const spassword = await bcrypt.hash(req.body.password, 10);
            const userData = await User.updateOne({ _id: req.query.id }, { $set: { password: spassword } })
            console.log(userData);
            console.log('password changed successfully');
            res.redirect('login')
        } else {
            newOtp = sendMessage(req.body.phone, res);
            console.log(newOtp);
            res.render('users/otp2', { otp: newOtp, user: is_user, head: 1 })
        }
    } catch (error) {

    }
}
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email, is_admin: 0 });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {
                if (userData.is_verified) {
                    req.session.user_id = userData._id;
                    req.session.user = userData.name;
                    req.session.user1 = true
                    const status = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { status: 1 } }); console.log(status);
                    res.redirect('/')
                } else {
                    res.render('users/login', { message: "You have been temporarily blocked by the Administrator , Please login after sometime", active: 0 })
                }
            }
            else {
                res.render('users/login', { message: 'email or password is incorrect', active: 0 })
            }
        }
        else {
            res.render('users/login', { message: 'invalid user credentials', active: 0 })
        }
    }
    catch (error) {
        console.log(error.message);
    }
}
const fast2sms = require("fast-two-sms");
const coupon = require('../models/coupon');
require("dotenv").config();

const sendMessage = function (mobile, res, next) {
    let randomOTP = Math.floor(Math.random() * 9000) + 1000
    var options = {
        authorization: process.env.SMS_API,
        message: `your OTP verification code is ${randomOTP}`,
        numbers: [mobile],
    };
    fast2sms
        .sendMessage(options)
        .then((response) => {
            console.log("otp sent successfully");
        })
        .catch((error) => {
            console.log(error);
        });
    return randomOTP;
};
let user
const loadOtp = async (req, res) => {
    try {
        const is_user = await User.findOne({ $or: [{ email: req.body.email }, { mobile: req.body.phone }] })
        console.log(is_user);
        if (is_user) {
            res.render('users/login', { message: 'user already exists', active: 1 })
        } else {
            const spassword = await bcrypt.hash(req.body.password, 10);
            user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.phone,
                password: spassword,
                is_admin: 0
            });
            newOtp = sendMessage(req.body.phone, res);
            console.log(newOtp);
            // const userData = await User.find()
            res.render("users/otp", { otp: newOtp,user:'', head: 1 })
        }
    } catch (error) {
        console.log(error.message);
    }
}
const resendOtp = async (req, res) => {
    try {
        newOtp = sendMessage(req.body.phone, res);
        console.log(newOtp);
        const userData = await User.find()
        res.render("users/otp", { otp: newOtp, user: userData, head: 1 })
    } catch (error) {
        console.log(error.message);
    }

}


const verifyOtp = async (req, res) => {

    try {
        if (req.query.id == req.body.otp) {
            const userData = await user.save()
            if (userData) {
                req.session.user_id = userData._id;
                req.session.user = userData.name;
                req.session.user1 = true
                await User.findByIdAndUpdate({ _id: userData._id }, { $set: { status: 1 } })
                res.redirect('/')
            }
            else {
                res.render('users/login', { message: "your registration is failed", active: 1 })
            }
        } else {
            res.render('users/login', { message: "otp entered is incorrect", active: 1 })
            console.log("otp is incorrect");
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadHome = async (req, res) => {
    try {
        productData = await Product.find()
        if (req.session.user) { session = req.session.user } else session = false
        res.render('users/home', { user: session, product: productData, head: 1 })
    }
    catch (error) {
        console.log(error.message)
    }
}
const loadProfile = async (req, res) => {
    try {
        if(session){
        res.render('users/profile', { user: session, head: 5 })
    }else{
        res.redirect('login')
    }
    }catch (error) {
        console.log(error.message)
    }
}
const loadAddress = async (req, res) => {
    try {
        if(session){
        const addressData = await Address.find({ userId: req.session.user_id })
        res.render('users/address', { user: session, head: 5 ,address:addressData })
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
const userLogout = async (req, res) => {
    try {
        req.session.user1 = null;
        req.session.user = null;
        time = new Date().getHours() + ":" + new Date().getMinutes()
        const status = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { status: time } }); console.log(status);
        req.session.user_id = null;
        res.redirect('/')
    }
    catch (error) {
        console.log(error.message)
    }

}
const loadProducts = async (req, res) => {
    try {
        const categoryData = await Category.find()
        let { search, sort, category, limit, page } = req.query
        if (!search) {
            search = ''
        }
        if(!page){
            skip=0
        }else{
            skip=page*10
        }
        console.log(category);
        let arr = []
        if (category) {
            for (i = 0; i < category.length; i++) {
                arr = [...arr, categoryData[category[i]].name]
            }
        } else {
            category = []
            arr = categoryData.map((x) => x.name)
        }
        console.log('sort ' + req.query.sort);
        console.log('category ' + arr);
        if (sort == 0) {
            productData = await Product.find({ is_admin: 0, $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }, { category: { $regex: ".*" + search + ".*" } }] }] }).sort({$natural:-1}).skip(skip).limit(limit)
        } else {
            productData = await Product.find({ is_admin: 0, $and: [{ category: arr }, { $or: [{ name: { $regex: '' + search + ".*" } }, { category: { $regex: ".*" + search + ".*" } }] }] }).sort({ price: sort }).skip(skip).limit(limit)
        }
        console.log(productData.length + ' results found');
        if (req.session.user) { session = req.session.user } else session = false
        res.render('users/products', { user: session, products: productData, category: categoryData, val: search, selected: category, order: sort, limit: limit, head: 2 })
    } catch (error) {
        console.log(error.message);
    }
}
const loadProductDetails = async (req, res) => {
    try {
        productData = await Product.findOne({ _id: req.query.id })
        productsData = await Product.find({ category: productData.category })
        if (req.session.user) { session = req.session.user } else session = false
        res.render('users/productDetail', { user: session, products: productsData, product: productData, head: 2 })
    } catch (error) {
        console.log(error.message);
    }
}
const addToCart = async(req,res)=>{
    try{
        const productId = req.query.id
        console.log('proid'+productId);
        userSession = req.session.user_id
        console.log(userSession);
        if(userSession){
            const userData =await User.findById({_id:userSession})
            const productData =await Product.findById({ _id:productId })
            userData.addToCart(productData)
            res.redirect('/cart')
        }else{
            res.redirect('/login')
        }
    }catch(error){
        console.log(error)
    }
}
const removeFromCart = async(req,res)=>{
    const productId = req.query.id
    const userData =await User.findById({_id:req.session.user_id})
    userData.removefromCart(productId)
    res.redirect('/cart')
}
const loadCart = async (req, res) => { 
    try {
        if(req.session.user_id){
            const userData =await User.findById({ _id:req.session.user_id })
            const cartData = await userData.populate('cart.item.productId')
        res.render('users/cart', { user: session, head: 4 ,products:cartData.cart })}
        else{
            res.render('users/cart', { user: session, head: 4 ,products:null })
        }
    } catch (error) {
        console.log(error);
    }
}
const addToWishlist = async(req,res)=>{
    const productId = req.query.id
    if(session){
        const userData =await User.findById({_id:req.session.user_id})
        const productData =await Product.findById({ _id:productId })
        userData.addToWishlist(productData)
        res.redirect('/wishList')
    }else{
        res.redirect('/wishList')
    }
}
const deleteFromWishlist = async(req,res)=>{
    const productId = req.query.id
    const userData =await User.findById({_id:req.session.user_id})
    userData.removefromWishlist(productId)
    res.redirect('/wishList')
}
const loadWishList = async (req, res) => {
    try {
        if(req.session.user_id){
            const userData =await User.findById({ _id:req.session.user_id })
            const wishData = await userData.populate('wishlist.item.productId')
        res.render('users/wishList', { user: session, products:wishData.wishlist, head: 3 })
        }else{
            res.render('users/wishList', { user: session,products:null, head: 3 })

        }
    } catch (error) {
        console.log(error);
    }
}

const loadCheckout = async(req,res)=>{
    try {
        if(req.session.user_id){
            const userData =await User.findById({ _id:req.session.user_id })
            const cartData = await userData.populate('cart.item.productId')
            const addressData = await Address.find({ userId: req.session.user_id })
            // const selectAddress = await Address.findOne({ _id: id });
            const couponData = await Coupon.find()
            console.log(req.query.id);
            if(req.query.id){
             offer = await Coupon.findOne({_id:req.query.id})
             console.log(offer);
            }else{offer = null}
            res.render('users/checkout',{ user: session, head: 4,products:cartData.cart,address:addressData , coupons:couponData , discount:offer})       
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const placeOrder = async(req,res)=>{
    try {
        if(req.body.address==0){
            addrData = new Address({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                country: req.body.country,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.pin,
                mobile: req.body.mno,
            })
        }else{
            addrData= await Address.findOne({_id: req.body.address})
        }
        const userData = await User.findOne({_id:req.session.user_id})
        const order = new Order({
            userId:req.session.user_id,
            address:addrData,
            payment:req.body.payment,
            offer:req.body.coupon,
            products:userData.cart
        })
        await order.save(); 
        await User.updateOne({_id:req.session.user_id},{$unset:{cart:1}})
        console.log('order successfull');
        res.send('order')
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {
    loadRegister,
    loginLoad,
    loadforget,
    verifyforget,
    resetPassword,
    verifyLogin,
    loadHome,
    userLogout,
    loadProducts,
    loadProductDetails,
    loadOtp,
    resendOtp,
    verifyOtp,
    loadProfile,
    loadAddress,
    saveAddress,
    loadCart,
    loadWishList,
    loadCheckout,
    addToCart,
    addToWishlist,
    deleteFromWishlist,
    removeFromCart,
    placeOrder
}
