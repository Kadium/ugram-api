exports.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
};
