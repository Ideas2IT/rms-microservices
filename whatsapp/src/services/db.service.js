/**
 * @name insertData
 * @description To insert/create a data into te model
 * @param {*} model 
 * @param {object} data 
 * @returns {object} of the created data
 */
const insertData = async (model, data) => {
  try {
    let insertedData = await model.create(data);
    if (insertedData) {
      return insertedData;
    } else {
      throw new Error('Something wrong happened');
    }
  } catch (err) {
    throw err;
  }
};

/**
 * @name updateData
 * @description To update the data based on the Object ID of the model
 * @param {*} model 
 * @param {*} id 
 * @param {*} data 
 * @returns {object} The Updated Object
 */
const updateData = async (model, id, data) => {
  try {
    let updatedData = await model.findByIdAndUpdate(id, data, { new: true });
    return updatedData;
  } catch (err) {
    throw err;
  }
};

/**
 * @name updateByOtherField
 * @description To update the data based on the Other field
 * @param {*} model 
 * @param {*} filter 
 * @param {*} data 
 * @returns {object} The Updated Object
 */
const updateByOtherField = async (model, filter, data) => {
  try {
    let updatedData = await model.findOneAndUpdate(filter, data, {
      new: true
    }).sort({"createdAt": -1});
    return updatedData;
  } catch (err) {
    throw err;
  }
};

const updateOldData = async(model, filter, data) => {
  try {
    let updatedData = await model.findOneAndUpdate(filter, data, {
      new: true
    }).sort({"createdAt": 1});
    return updatedData;
  } catch (err) {
    throw err;
  }
};

const findAllAndUpdate = async(model, filter, data) => {
  try {
    await model.updateMany(filter, data);
  } catch (err) {
    throw err;
  }
}

/**
 * @name deleteData
 * @description To the delete the data based on Mongo ObjectID
 * @param {*} model 
 * @param {*} id 
 * @returns 
 */
const deleteData = async (model, id) => {
  try {
    let deletedData = await model.findByIdAndDelete(id)
    return deletedData;
  } catch (err) {
    throw err;
  }
};

/**
 * @name deleteMany
 * @description To delete multiple data based on the filter
 * @param {*} model 
 * @param {*} filter 
 * @returns 
 */
const deleteMany = async (model, filter) => {
  try {
    let deletedData = await model.deleteMany(filter);
    return deletedData;
  } catch (err) {
    throw err;
  }
}

/**
 * @name getById
 * @description To get the data based on Mongo Object ID
 * @param {*} model 
 * @param {*} id 
 * @returns {object}
 */
const getById = async (model, id) => {
  try {
    let data = await model.findById(id);
    if(data) return data;
    else return null;
  } catch (err) {
    throw err;
  }
}

/**
 * @name getByOtherField
 * @description To get the data based on the Other field
 * @param {*} model 
 * @param {*} filter 
 * @returns {object}
 */
const getByOtherField = async (model, filter) => {
  try {
    let data = await model.findOne(filter);
    if(data) return data;
    else return null;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  insertData,
  updateData,
  updateByOtherField,
  updateOldData,
  findAllAndUpdate,
  deleteData,
  deleteMany,
  getById,
  getByOtherField
};
