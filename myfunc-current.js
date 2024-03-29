// works in nodejs 13 + vscode debug ..
// or firefox console also (safari support WIP)

function definitions_module(){

function printout(){
    var out=''
    for(argument_idx in arguments) out+=arguments[argument_idx]+' '
    print(out)
}

if(typeof writeout=='undefined')
if(typeof console!='undefined') writeout=console.log
else if(typeof print!='undefined') writeout=printout

function input(question){
    // web-browser's prompt() function
    if(typeof prompt!="undefined"){
        var answer=prompt(question) // asks for input
        if(answer==undefined) gdefs.repl_active=0 // quits the repl, if cancelled
        writeout('#',answer) // writes what was inputted
        return answer
    }
    
    // npm module
    var get_line=require('readline-sync')
    var string=''
    while(true){
        try{
        var got_line=get_line.question(string==''?question+" ":'...')
        }
        catch(exception){
            writeout('caught exception',exception)
            gdefs.repl_active=0 // quits the repl
            return undefined
        }
        if(got_line[got_line.length-1]=='\\'){
            string+=got_line.slice(0,-1)+'\n'
        }
        else{
            string+=got_line
            break
        }
    }
    return string
    //return get_line.question(question+" ")

    //if(question!=undefined) writeout(question)
    //return '[["defs.sum",1,2]]' // fake input for a REPL
}
function sum(a,b){return a+b}
function lessthan(a,b){return a<b}
function division(a,b){return a/b}
function multiplication(a,b){return a*b}
function equal(a,b){return a==b}
function subtraction(a,b){return a-b}
function gassign(destination,source){ // global scope assignment
    globalThis[destination]=source
}
function strcat(a,b){
    return a+b
}
var variable_test='a variable for testing'
function exec(statements,arguments={}){
    return def_func({statements,arguments})()
}
function exec_one(statement,arguments={}){
    return def_func({statements:[statement],arguments})()
}


var gdefs={} // global defs
// keep it updated:
var already_defined={
    main, // for [["defs.main"]] in REPL
exec,exec_one,input,gdefs,globalThis,variable_test,def_func,writeout,
sum,lessthan,division,multiplication,equal,subtraction,gassign,strcat}
return already_defined
}

var already_defined=definitions_module()
//var gdefs=already_defined.gdefs // global defs

var fcontext={args:{},defs:{...already_defined},locs:{}}

function def_func(function_def){
    function json_filter(code){
        var json=JSON.stringify(code)
        var parsed=JSON.parse(json)
        //assert(()=>parsed==code)
        return parsed    
    }
    function_def=json_filter(function_def) // this means function definition is valid JSON
    var defined=function defined(){
        for(var argidx in arguments){
            var key, value, idx
            key=function_def.arguments[argidx]
            idx=function_def.arguments.indexOf(key)
            value=arguments[idx]
            fcontext.args[key]=value
        }

        // todo: check this line.
        // BTW it's needed for recursive calls
        fcontext.defs[function_def.name]=defined
        
        return callfunc(function_def, fcontext)
    }
    
    // test the return with assignment even of anonymous functions
    // this works for globally defined functions
    /////globalThis[function_def.name]=defined // seems unnecessary
    already_defined.gdefs[function_def.name]=defined // disabled

    return defined
}

function callfunc(function_def, fcontext=fcontext){ // use this more for sharing context TODO
    function handle_argument(argument){
        
        try{
        
        if(typeof argument=='string') return eval_statement(fcontext,argument)

        // bad for use of eval but quick to implement
        ///var func=eval(argument[0])
        var func // function or not
        if(true) // switch this for comparison
        func=eval_statement(fcontext,argument[0])
        else
        // this does not yet recognize expressions e.g. "console.log"
        if(argument[0] in this) func=this[argument[0]]

        if(typeof func=='function'){
            var args=argument.slice(1)
            args=args.map(exec_statement)
            var argument_returned=func.apply(this,args)
            if(argument_returned===null) throw new Error('ARN!!')
            return argument_returned
        }else console.log('not a function')

        /*
        var specials=['if','block','quote','lassign','while'] // automatically add others. make it more extensible
        if(Array.isArray(argument) && argument.length>0 &&
        (specials.indexOf(argument[0])!=-1 || argument[0] in this)
        ) return exec_statement(argument)
        */
       
        return argument
        //throw ['argument...',argument]
    
        }catch(exception){
            writeout('caught exception (re-throwing it)')//,['quote',exception])
            throw exception
            return undefined // TODO return in case of caught exception
        }
    }

    var value
    for(var statement_idx in function_def.statements){
        var statement=function_def.statements[statement_idx]
        value=exec_statement(statement)
    }
    return value

    function exec_statement(statement_to_exec){
        var value
        if(Array.isArray(statement_to_exec)){
            // while,quote,lassign,if,block
            if(statement_to_exec[0]=='while'){
                while(exec_statement(statement_to_exec[1]))
                exec_statement(statement_to_exec[2])
            }else
            if(statement_to_exec[0]=='quote'){
                //throw // to notice execution reaching this line
                value=statement_to_exec[1]
            }else
            if(statement_to_exec[0]=='lassign'){ // local assign
                var destination=exec_statement(statement_to_exec[1])
                var source=exec_statement(statement_to_exec[2])

                function dotted_set(str,value,pointed=fcontext){
                    //assert(()=>typeof str=='string')
                    var path=str.split('.')
                    var last_in_path = path.pop() // removes last item
                    for(var current of path){
                        if(current in pointed)
                        pointed=pointed[current]
                        else
                        {// set dotted
                        writeout('ERROR:',current+' not found','('+str+')',statement_to_exec)
                        throw statement_to_exec
                        }
                    }
                    return pointed[last_in_path]=value
                }
                //fcontext.locs[destination]=source // replaced by set_dotted()
                value=dotted_set(destination,source)
            }else
            if(statement_to_exec[0]=='if'){
                var idx=1
                while(true){
                    if(!(idx in statement_to_exec)) break
                    if(idx+1 in statement_to_exec){
                        if(true==exec_statement(statement_to_exec[idx])){
                            value=exec_statement(statement_to_exec[idx+1])
                            break
                        }
                    }else
                    value=exec_statement(statement_to_exec[idx])
                    idx+=2
                }
            }else if(statement_to_exec[0]=='block'){
                var statements=statement_to_exec.slice(1)
                for(var statement of statements){
                    // TODO: handle return/yield, break/continue, try/catch, etc
                    value=exec_statement(statement)
                }
            }else{
                // generic or unrecognized statement
                // statement as argument
                // todo: verify if proper
                value=handle_argument(statement_to_exec)
            }
        }else if(typeof statement_to_exec=='string'){
            value=eval_statement(fcontext,statement_to_exec)
        }else{
            value=statement_to_exec
        }
        
        return value
    }
    function eval_statement(fcontext,statement_to_eval){
        var value = (function(fcontext,statement_to_eval2){
            /*
            for(variable in fcontext){
                var to_eval=variable+"="+fcontext[variable]
                eval(to_eval) // todo : remove
            }
            */
            //var args=fcontext.args
            //var defs=fcontext.defs
            for(var variable in fcontext) this[variable]=fcontext[variable]
            return myeval(statement_to_eval2)//JSON.parse(statement)//eval(statement)
            function dotted_get(str,pointed=fcontext){ // get
                //assert(()=>typeof str=='string')
                var path=str.split('.')
                for(var current of path){
                    if(current in pointed)
                    pointed=pointed[current]
                    else
                    {// eval dotted
                    writeout('get ERROR!',current+' not found','('+str+')',JSON.stringify(statement))
                    throw statement
                    }
                }
                return pointed
            } // closes eval_dotted()
            function myeval(what_to_evaluate){
                if(typeof what_to_evaluate!='string') return what_to_evaluate
                try{
                    var parsed=JSON.parse(what_to_evaluate)
                    return parsed
                }catch{
                try{
                    var evaluated=dotted_get(what_to_evaluate)
                    return evaluated
                }
                catch{
                    /*
                    try{
                    var parsed=JSON.parse(what_to_evaluate)
                    return parsed
                    }
                    catch{
                        return 'invalid statement'
                    }*/
                    return 'invalid statement'
                }
                } //closes catch
            } // closes myeval()
          })(fcontext,statement_to_eval)
        return value
    }
}

function repl_tests(){
    def_func({statements:[
    ['defs.writeout',['quote','[\"defs.gdefs.qrepl\"] <- to Quit this REPL"']],
    ['defs.def_func',{name:"qrepl",statements:[["lassign",'"defs.gdefs.repl_active"',0]]}],
    ["lassign",'"defs.gdefs.repl_active"',1], // [["lassign","\"defs.gdefs.repl_active\"",0]] to exit
    ['while','defs.gdefs.repl_active',
    ['defs.writeout',
        ['defs.globalThis.JSON.stringify',
        ['defs.exec_one',
            ['defs.globalThis.JSON.parse',['defs.input','"JSON statement?"']]
        ]
        ],
    ],
    //["lassign",'"defs.gdefs.repl_active"',0] // temp.
    ], // close while
    ['defs.writeout','"quitting..."'],
    ]})()
}
//repl_tests()
exec_tests()
function exec_tests(){
writeout("exec_tests() in execution")
writeout(already_defined.exec_one(["quote",[1,2,3]]))
writeout(already_defined.exec_one(["quote","abc"]))
//writeout(already_defined.exec_one('"abc"'))
writeout(already_defined.exec_one(["block",["lassign",["quote","abc_var2"],["quote","text"]],null]))
writeout(already_defined.exec_one("abc_var2"))
writeout(already_defined.exec_one("defs.globalThis.Math.PI"))
var abc_var1='test succeeded'
fcontext.injected=abc_var1
writeout(fcontext.defs.exec_one("injected"))
// fcontext.defs or already_defined
}

//global_state_tests()
function global_state_tests(){

if(true)
def_func({statements:
[
    ["lassign","\"x\"",5],
    ["defs.writeout","x"]
]})()
/*
[["defs.multiplication",4,6]]

# with slashes at end-of-line multiline works
[["lassign","\"locs.x\"",5],\
["defs.writeout","locs.x"]\
]

[
    ["lassign","\"locs.x\"",5],
    ["defs.writeout","locs.x"]
]

# one line, valid json
[["lassign","\"locs.x\"",5],["defs.writeout","locs.x"]]

[["lassign","\"locs.x\"",6],["defs.writeout","locs.x"]]

# no
[["lassign","\"locs.x\"",6]]
[["defs.writeout","locs.x"]]

# yes
[["lassign","\"defs.gdefs.x\"",10]]
[["defs.writeout","defs.gdefs.x"]]
*/

// gdefs allow to save state across invocations
// this was mean to be done by local variables perhaps

// - this call sets a state
/////def_func({statements:[["lassign",'"defs.gdefs.x"',10]]})()
// - this call gets a state
////def_func({statements:[["defs.writeout","defs.gdefs.x"]]})()

// - this call sets a state
already_defined.exec_one(["lassign",'"y"',10])
// - this call gets a state
already_defined.def_func({statements:[["defs.writeout",'y']]})()
//["lassign",'"y"',10]
}

//main()
function main(){

// [quote] test
already_defined.exec([
    ['defs.writeout',
    ['quote',
    ['defs.multiplication',2,3]]
    ],
    ['defs.writeout',
    ['defs.multiplication',2,3],
    ],
])

//return // return main()

////////////// sum
var def_mysum={"name":"mysum","arguments":["x","y"],
"statements":[
    ["defs.sum","args.x","args.y"],
]}
var mysum=def_func(def_mysum) // it can be defined with ['def_func',def_mysum], also
assert(()=>17==mysum(14,3))

////////////// pow
var statements1=["if(args.exponent<0) returned=1/defs.mypow(args.base,-args.exponent) \n\
else if(args.exponent==0) returned=1 \n\
else returned=defs.mypow(args.base,args.exponent-1)*args.base",
"returned"]
var statements2=["if(args.exponent<0) 1/defs.mypow(args.base,-args.exponent) \n\
else if(args.exponent==0) 1 \n\
else defs.mypow(args.base,args.exponent-1)*args.base"] // does not work, requires classic eval() for js parsing

var statements3=[['if',['defs.lessthan','args.exponent','0'],

//'1/defs.mypow(args.base,-args.exponent)'
['defs.division','1',['defs.mypow','args.base',['defs.subtraction','0','args.exponent']]],

['defs.equal','args.exponent','0'],'1',

//'defs.mypow(args.base,args.exponent-1)*args.base'
['defs.multiplication','args.base',['defs.mypow','args.base',['defs.subtraction','args.exponent','1']]]

]]
var def_mypow={"name":"mypow","arguments":["base","exponent"],"statements":statements3 } // was 2
var mypow=def_func(def_mypow)
assert(()=>mypow(2,3)==8)
assert(()=>mypow(2,-1)==0.5)
/////
var statements4=[
    ['defs.writeout','"abc"'], // passing a string
    ['defs.globalThis.console.log','"abc from console.log()"'], // TODO: this should work too!
    ['defs.writeout','defs.variable_test'], // passing a variable
    ['defs.writeout',[1,2,3]], // passing a list
    ['if','true',['defs.writeout','"if reached"']],
    ['if','true',['block', // codeblock test
        ['defs.writeout','123'],['defs.writeout','456']
    ]],
    ['defs.writeout',['if','true','"if returned this value"']],
    
    // define and call a function (named mysum)
    ['defs.def_func',def_mysum],
    ['defs.writeout',['defs.gdefs.mysum',3,4]], // was: locs.tempsum // does not work (NOW WORKS)
    // this works:
    ['lassign','"locs.tempsum"',['defs.def_func',def_mysum]],
    ['defs.writeout',['locs.tempsum',3,4]], // locs.tempsum works
    // this works too
    ['defs.writeout',['defs.sum',3,4]],

    // this should work too! : (possibly with function definition shared across statements)
    // BTW this works for globally defined functions
    ////['defs.def_func',def_mysum], // alredy called above
    //['defs.writeout',['defs.globalThis.mysum',3,4]], // was: ref.mysum

]

var simple_assign_test=[   
    ['lassign','"locs.name"','"Dario"'],
    ['lassign','"locs.phrase"',['defs.strcat','"My name is "','locs.name']],
    ['defs.writeout','locs.phrase'],
]

def_func({statements:simple_assign_test})()

var statements5=[
    ['lassign','"locs.returned"',
        /*
        ['if','exponent<0','1/mypow(base,-exponent)',
            'exponent==0','1',
            'mypow(base,exponent-1)*base'],
        */
       ['if','true','"true!"','"false!"']
    ],
    ['defs.writeout','locs.returned'], // writeout and return
    'locs.returned',
]
writeout(def_func({statements:statements5})())

var def_my={"name":"my","arguments":[],"statements":statements4 }
var my=def_func(def_my)
my()

// from "lis.py" article https://norvig.com/lispy.html
var code={"name":"lispy","arguments":["r"],"statements":[
    ["defs.multiplication","defs.globalThis.Math.PI",["defs.multiplication","args.r","args.r"]]
]}

var lispy=def_func(code) // was: json_filter(code)
writeout(lispy(10)) // todo: assert this

function assert(func){
    if(func()!==true)
        writeout('assertion failed: '+func)
    writeout(''+func)
}
///assert(()=>false) // assert test (assert should fail)

///////writeout(eval_dotted('Math.PI'))
///assert(()=>eval_dotted('Math.PI')==Math.PI)

//var namespace={...global,multiplication}
//console.log('multiplication' in globalThis)
//var func=eval_dotted('multiplication')
///////writeout(func(2,3))
///assert(()=>eval_dotted('multiplication')==multiplication)
///assert(()=>eval_dotted('multiplication')(2,3)==6)
}