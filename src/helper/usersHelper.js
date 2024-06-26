const mongoose = require('mongoose');
const User = mongoose.model('users');
const SuperAdmin = mongoose.model('superadmin');
const BetLists = mongoose.model('betList');
const PrivateTable = mongoose.model('rummyPrivateTable');
const LudoPrivateTable = mongoose.model('betListLudoPrivate');
const TeenPrivateTable = mongoose.model('teenPrivatebetList');
const bcrypt = require('bcrypt');
const logger = require('../../logger');


const usersHelper = {
  registerUser: async function (newData) {
    const newUser = new User(newData);
    const data = await newUser.save();

    if (data) {
      return {
        status: 1,
        message: 'record added',
        data: JSON.parse(JSON.stringify(data)),
      };
    } else {
      return { status: 0, message: 'record not added', data: null };
    }
  },

  autologin: async function (model, condition = {}) {
    try {
      const data = await model.findOne(condition).lean();

      if (data !== null) {
        return { status: 1, message: 'Login Succesfully', data };
      } else {
        return { status: 0, message: 'Id not Found' };
      }
    } catch (error) {
      return { status: 0, message: 'No data found' };
    }
  },

  login: async function (model, condition = {}) {
    const { email /*, password, */ } = condition;
    try {
      const dataF = await model.find(email).lean();
      bcrypt.compare();

      if (dataF !== null) {
        return { status: 1, message: 'Login Succesfully', data: dataF };
      } else {
        return { status: 0, message: 'Id not Found' };
      }
    } catch (error) {
      return { status: 0, message: 'No data found' };
    }
  },

  registerAdmin: async function (newData) {
    const newUser = new SuperAdmin(newData);
    const data = await newUser.save();

    if (data) {
      return {
        status: 1,
        message: 'record added',
        data: JSON.parse(JSON.stringify(data)),
      };
    } else {
      return { status: 0, message: 'record not added', data: null };
    }
  },

  betLists: async function (newData) {
    logger.info(' batLists table newData => ', newData);

    const newUser = new BetLists(newData);
    const data = await newUser.save();

    if (data) {
      return {
        status: 1,
        message: 'record added',
        data: JSON.parse(JSON.stringify(data)),
      };
    } else {
      return { status: 0, message: 'record not added', data: null };
    }
  },

  registerPrivateTable: async function (newData) {
    console.info(' Private table newData => ', newData);

    const newUser = new PrivateTable(newData);
    const data = await newUser.save();

    if (data) {
      return { status: 1, message: "record added", data: JSON.parse(JSON.stringify(data)) }
    } else {
      return { status: 0, message: "record not added", data: null }
    }
  },

  registerLudoPrivateTable: async function (newData) {
    console.info(' Private table newData => ', newData);

    const newUser = new LudoPrivateTable(newData);
    const data = await newUser.save();

    if (data) {
      return { status: 1, message: "record added", data: JSON.parse(JSON.stringify(data)) }
    } else {
      return { status: 0, message: "record not added", data: null }
    }
  },

  registerTeenPrivateTable: async function (newData) {
    console.info(' Private table newData => ', newData);

    const newUser = new TeenPrivateTable(newData);
    const data = await newUser.save();

    if (data) {
      return { status: 1, message: "record added", data: JSON.parse(JSON.stringify(data)) }
    } else {
      return { status: 0, message: "record not added", data: null }
    }
  },

};


module.exports = usersHelper;
