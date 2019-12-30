const user = require('../models/userModel');

exports.login = (req, res, next) => {
    res.status(200).render('home');
}

exports.home = (req, res, next) => {
    res.status(200).render('page');
}

exports.register = (req, res, next) => {
    res.status(200).render('register');
}