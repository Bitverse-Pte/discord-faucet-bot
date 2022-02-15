const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
	discordId: { type : String , unique : true, required : true, dropDups: true },
    eth_address: {type:String},
    hasReceivedFromFaucet: Boolean,
    isAdmin:Boolean,
    isMod:Boolean,
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

module.exports = mongoose.model('User', UserSchema);
