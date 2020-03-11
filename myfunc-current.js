// works in nodejs 13 + vscode debug ..
// or firefox console also (safari support WIP)

function printout(){
    var out=''
    for(argument_idx in arguments) out+=arguments[argument_idx]+' '
    print(out)
}

if(typeof writeout=='undefined')
	if(typeof console!='undefined') writeout=console.log
	else if(typeof print!='undefined') writeout=printout

function def_func(function_def){
    var defined=function defined(){
        var fcontext={args:{},defs:{}}
        for(var argidx in arguments){
            var key, value, idx
            key=function_def.arguments[argidx]
            idx=function_def.arguments.indexOf(key)
            value=arguments[idx]
            fcontext.args[key]=value
        }
        fcontext.defs[function_def.name]=defined
        return callfunc(function_def, fcontext)
    }
    // test the return with assignment even of anonymous functions
    if(typeof window=='undefined') var window=this
    return window[function_def.name]=defined
}

function callfunc(function_def, fcontext){
    function handle_argument(argument){
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
            return func.apply(this,args)
        }

        var specials=['if','block'] // automatically add others. make it more extensible
        if(Array.isArray(argument) && argument.length>0 &&
        (specials.indexOf(argument[0])!=-1 || argument[0] in this)
        ) return exec_statement(argument)

        return argument
    }

    var value
    for(var statement_idx in function_def.statements){
        var statement=function_def.statements[statement_idx]
        value=exec_statement(statement)
    }
    return value

    function exec_statement(statement){
        var value
        if(Array.isArray(statement)){
            if(statement[0]=='if'){
                var idx=1
                while(true){
                    if(!(idx in statement)) break
                    if(idx+1 in statement){
                        if(true==exec_statement(statement[idx])){
                            value=exec_statement(statement[idx+1])
                            break
                        }
                    }else
                    value=exec_statement(statement[idx])
                    idx+=2
                }
            }else if(statement[0]=='block'){
                var substatements=statement.slice(1)
                for(var substatement_idx in substatements) value=exec_statement(substatements[substatement_idx])
            }else{
                // generic or unrecognized statement
                // statement as argument
                // todo: verify if proper
                value=handle_argument(statement)
            }
        }else if(typeof statement=='string'){
            value=eval_statement(fcontext,statement)
        }else{
            value=statement
        }
        
        return value
    }
    function eval_statement(fcontext,statement){
        var value = (function(fcontext,statement){
            /*
            for(variable in fcontext){
                var to_eval=variable+"="+fcontext[variable]
                eval(to_eval) // todo : remove
            }
            */
            var args=fcontext.args
            var defs=fcontext.defs
            return eval(statement)
          })(fcontext,statement)
        return value
    }
}
////////////// sum
var def_mysum={"name":"mysum","arguments":["x","y"],
"statements":["args.x+args.y"]
}
def_func(def_mysum) // it can be defined with ['def_func',def_mysum], also
writeout(mysum(14,3))
////////////// pow
var statements1=["if(args.exponent<0) returned=1/defs.mypow(args.base,-args.exponent) \n\
else if(args.exponent==0) returned=1 \n\
else returned=defs.mypow(args.base,args.exponent-1)*args.base",
"returned"]
var statements2=["if(args.exponent<0) 1/defs.mypow(args.base,-args.exponent) \n\
else if(args.exponent==0) 1 \n\
else defs.mypow(args.base,args.exponent-1)*args.base"] // does not work
var statements3=[['if','args.exponent<0','1/defs.mypow(args.base,-args.exponent)',
'args.exponent==0','1',
'defs.mypow(args.base,args.exponent-1)*args.base']]

var statements4=[
    ['writeout','"abc"'], // passing a string
    //['console.log','"abc from console.log()"'], // todo: this should work too!
    ['writeout','variable_test'], // passing a variable
    ['writeout',[1,2,3]], // passing a list
    ['if','true',['writeout','"if reached"']],
    ['if','true',['block', // codeblock test
        ['writeout','123'],['writeout','456']
    ]],
    ['writeout',['if','true','"if returned this value"']],
    // define and call a function (named mysum)
    ['def_func',def_mysum],
    ['writeout',['mysum',3,4]],
]
/*
[    
    ['assign','name','"Dario"'],
    ['assign','line',['strcat','"My name is "','name']],
    ['writeout','line'],
]
*/

var statements5=[
    ['assign','returned',
        ['if','exponent<0','1/mypow(base,-exponent)',
            'exponent==0','1',
            'mypow(base,exponent-1)*base'],
    ],
    ['writeout','returned'], // writeout and return
]
var def_mypow={"name":"mypow","arguments":["base","exponent"],"statements":statements2 }
def_func(def_mypow)
writeout(mypow(2,3))
writeout(mypow(2,-1))

var def_my={"name":"my","arguments":[],"statements":statements4 }
def_func(def_my)
var variable_test='a variable for testing'
my()
