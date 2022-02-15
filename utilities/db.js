const mongoose = require('mongoose');
const User = require('../models/user');

const ObjectId = mongoose.Types.ObjectId;

// TODO: update durations for prod
// claim test token durations
const durations = 60; // 24 * 60 * 60

async function findOrCreate(model, searchParameter, document) {
  const modelFound = await mongoose.model(model);
  let resultPromise = await modelFound.findOne(searchParameter, (error, loc) => {
    if (error) {
      console.log(error);
    }    
  }).clone();
  let canClaim = true;
  let interval = 0;
  if (resultPromise === null) {
    resultPromise = await modelFound.create(document);
    canClaim = true;
  } else {
    const nowTimestamp = parseInt(Date.now() / 1000);
    const claimTimestamp = Date.parse(new Date(resultPromise.updateTime)) / 1000;
    interval = nowTimestamp - claimTimestamp;
    canClaim = interval >= durations;
  }
  return {
    ...resultPromise,
    canClaim,
    interval
  };
}

async function findOne(model, searchParameter) {
  const modelFound = await mongoose.model(model);
  let resultPromise = await modelFound.findOne(searchParameter, (error, loc) => {
    if (error) {
      console.log(error);
    }    
  }).clone()
  return resultPromise;
}

async function findOneAndUpdate(model, searchParameter, changes) {
  const modelFound = await mongoose.model(model);
  const resultPromise = await modelFound.findOneAndUpdate(searchParameter, changes, (error, loc) => {
    if (error) {
      console.log(error);
    }
  }).clone();
  return resultPromise;
}

async function findOneAndDelete(model, searchParameter) {
  const modelFound = await mongoose.model(model);
  const resultPromise = await modelFound.findOneAndDelete(searchParameter, (error, loc) => {
    if (error) {
      console.log(error);
    }
  });
}

async function getFromDB(model, attribute, limit, sort, selection) {
  let maxLimit = 100;
  const modelFound = await mongoose.model(model);
  limit = (limit) ? limit : 1;
  limit = (limit>maxLimit||limit<1) ? maxLimit : limit;
  sort = (sort) ? sort : '_id';
  selection = (selection) ? selection : '';
  const resultPromise = await modelFound.find(attribute,).sort(sort).limit(limit).select(selection);
  return resultPromise;
}

module.exports = {
  getFromDB, findOrCreate,  findOneAndUpdate, findOneAndDelete
};
