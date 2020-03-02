// works in nodejs 13 + vscode debug .. or firefox console also

function def_func(function_def){
    var defined=function defined(...farguments){
        var fcontext={}
        for(var argidx in function_def.arguments) fcontext[function_def.arguments[argidx]]=farguments[argidx]
        fcontext[function_def.name]=defined
        return callfunc(function_def, fcontext)
    }
    // test the return with assignment even of anonymous functions
    return this[function_def.name]=defined
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
            return func(...args)
        }

        var specials=['if','write','block'] // automatically add others. make it more extensible
        if(Array.isArray(argument) && argument.length>0 &&
        (specials.indexOf(argument[0])!=-1 || argument[0] in this)
        ) return exec_statement(argument)

        return argument
    }

    var value
    for(statement of function_def.statements)
        value=exec_statement(statement)
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
            }else if(statement[0]=='write'){
                var line=exec_statement(statement[1])
                console.log(line)
            }else if(statement[0]=='block'){
                for(var substatement of statement.slice(1)) value=exec_statement(substatement)
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
            for(variable in fcontext)
              eval(variable+"="+fcontext[variable])
            return eval(statement)
          })(fcontext,statement)
        return value
    }
}
////////////// sum
var def_mysum={"name":"mysum","arguments":["x","y"],
"statements":["x+y"]
}
def_func(def_mysum) // it can be defined with ['def_func',def_mysum], also
console.log(mysum(14,3))
////////////// pow
var statements1=[`if(exponent<0) returned=1/mypow(base,-exponent)
else if(exponent==0) returned=1
else returned=mypow(base,exponent-1)*base`,
"returned"]
var statements2=[`if(exponent<0) 1/mypow(base,-exponent)
else if(exponent==0) 1
else mypow(base,exponent-1)*base`]
var statements3=[['if','exponent<0','1/mypow(base,-exponent)',
'exponent==0','1',
'mypow(base,exponent-1)*base']]

var statements4=[
    ['write','"abc"'], // passing a string
    ['console.log','"abc from console.log()"'], // todo: this should work too!
    ['write','variable_test'], // passing a variable
    ['write',[1,2,3]], // passing a list
    ['if','true',['write','"if reached"']],
    ['if','true',['block', // codeblock test
        ['write','123'],['write','456']
    ]],
    ['write',['if','true','"if returned this value"']],
    // define and call a function (named mysum)
    ['def_func',def_mysum],
    ['write',['mysum',3,4]],
]
/*
[    
    ['assign','name','"Dario"'],
    ['assign','line',['strcat','"My name is "','name']],
    ['write','line'],
]
*/

var statements5=[
    ['assign','returned',
        ['if','exponent<0','1/mypow(base,-exponent)',
            'exponent==0','1',
            'mypow(base,exponent-1)*base'],
    ],
    ['write','returned'], // write and return
]
var def_mypow={"name":"mypow","arguments":["base","exponent"],"statements":statements2 }
def_func(def_mypow)
console.log(mypow(2,3))
console.log(mypow(2,-1))

var def_my={"name":"my","arguments":[],"statements":statements4 }
def_func(def_my)
var variable_test='a variable for testing'
my()
