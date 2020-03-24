var self = module.exports={
  error: function error(message){
    atom.notifications.addError(message);
  },
  info: function info(message){
    atom.notifications.addInfo(message);
  }
};
