var self = module.exports={
  error: function error(message,msg_details){
    atom.notifications.addError(message,{detail:msg_details,dismissable:true});
  },
  info: function info(message,msg_details){
    atom.notifications.addInfo(message,{detail:msg_details,dismissable:true});
  }
};
