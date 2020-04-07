let self = module.exports = {
    error: function error(message, msg_details) {
        atom.notifications.addError(message, {detail: msg_details, dismissable: true, icon: 'alert'});
    },
    duplicitFunc: function duplicitFunc(fun_name,startPos,endPos) {
        atom.notifications.addError('Function \'' + fun_name + '\' already declared.', {
            dismissable: true,
            icon: 'alert'
        });
      //atom.workspace.observeTextEditors(editor => {
        //let range = new Range([startPos.row, startPos.column], [endPos.row, endPos.column]);
        //let range = new Range([10, 5], [10, 6]);
        //let range = atom.workspace.getActiveTextEditor().getSelectedBufferRange();// # any range you like

        console.log(startPos.row+', '+ startPos.column);
        console.log(endPos.row+', '+ endPos.column);
        //console.log(range.toString());
        let marker = atom.workspace.getActiveTextEditor().markBufferRange([[10, 5], [10, 6]]);
        let decoration =


        atom.workspace.getActiveTextEditor().decorateMarker(marker, { type: 'line', class: 'error'})

      //})

        /*atom.workspace.observeTextEditors(editor => {

            editor.scan(new RegExp(/j/), iterator => {
                console.log('Match! ' + iterator.match);
            });


            let range = new Range([startPos.row, startPos.column], [endPos.row, endPos.column]);
            let marker = editor.markBufferRange(range);
            let decoration = editor.decorateMarker(marker, {type: 'line', class: 'func-static-checker'})
        })*/
    },
    info: function info(message, msg_details) {
        atom.notifications.addInfo(message, {detail: msg_details, dismissable: true, icon: 'alert'});
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
