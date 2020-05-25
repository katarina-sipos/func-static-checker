/**
 * Function class. Objects of this class are stored in the type environment.
 */
class Function_stat {
    /**
     *
     * @param name - string with the function name
     * @param ret_type - return type node form the tree
     * @param arg_types - root of the arguments types list from function declaration statement
     * @param arg_list - root of the arguments list from function definition statement
     * @param body - root of the body tree from function definition statement
     */
    constructor(name, ret_type, arg_types, arg_list, body) {
        this.name = name;
        this.ret_type = ret_type;
        this.arg_types = arg_types;
        this.arg_list = arg_list;
        this.body = body;
    }
}

module.exports=Function_stat;