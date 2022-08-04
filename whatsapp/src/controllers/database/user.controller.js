const UserModel = require("../../models/user.model");
const dbServices = require("../../services/db.service");

/**
 * @name createUser
 * @description To create a user in db with initial values
 * @param {object} req 
 * @param {object} res 
 */
const createUser = async (req, res) => {
  try {
    const {
      whatsappNumber,
      userName
    } = req.body;
    const result = await dbServices.insertData(UserModel, { whatsappNumber, userName });
    res.send(result);
  } catch (err) {
    res.send(err)
  }
};

/**
 * @name updateByWhatsappNumber
 * @description To update the object based on whatsapp number
 * @param {object} req 
 * @param {object} res 
 */
const updateByWhatsappNumber = async(req,res) => {
  try {
    const { whatsappNumber } = req.params;
    const result = await dbServices.updateByOtherField(UserModel, {whatsappNumber}, req.body);
    res.send(result);
  } catch(err) {
    res.send(err);
  }
};

/**
 * @name getByWhatsappNumber
 * @description To get the data based on whatsapp number
 * @param {object} req 
 * @param {object} res 
 */
const getByWhatsappNumber = async (req, res) => {
  try {
    const { whatsappNumber } = req.params;
    const result = await dbServices.getByOtherField(UserModel, { whatsappNumber });
    res.send(result);
  } catch (err) {
    res.send(err);
  }
}

module.exports = {
  createUser,
  updateByWhatsappNumber,
  getByWhatsappNumber
};
