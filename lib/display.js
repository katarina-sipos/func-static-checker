var self = module.exports={
  error: function error(message,msg_details){
    atom.notifications.addError(message,{detail:msg_details,dismissable:true,icon:'alert'});
  },
  info: function info(message,msg_details){
    atom.notifications.addInfo(message,{detail:msg_details,dismissable:true,icon:'alert'});
  }
};
/*
__________
5
___________
use y(5)   5
___________
use x (use y(5),5)

*/
