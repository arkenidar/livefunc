// works in nodejs 13 + vscode debug .. or firefox console also

function def_func(function_def){
    var defined=function defined(...farguments){
        var fcontext={}
        for(argidx in function_def.arguments) fcontext[function_def.arguments[argidx]]=farguments[argidx]
        fcontext[function_def.name]=defined
        return callfunc(function_def, fcontext)
    }
    this[function_def.name]=defined
}

function callfunc(function_def, fcontext){
    var exitfunc=false
    for(statement of function_def.statements){
        if(Array.isArray(statement)){
            var value=undefined
            if(statement[0]=='if'){
                var idx=1
                while(true){
                    if(!(idx in statement)) break
                    if(idx+1 in statement){
                        if(true==eval_statement(fcontext,statement[idx])){
                            value=eval_statement(fcontext,statement[idx+1])
                            break
                        }
                    }else
                    value=eval_statement(fcontext,statement[idx])
                    idx+=2
                }
            }else if(statement[0]=='print'){
                var line=eval_statement(fcontext,statement[1])
                console.log(line)
            }
        }else if(typeof statement=='string'){
            var value=eval_statement(fcontext,statement)
        }
        
        function eval_statement(fcontext,statement){
            var value = (function(fcontext,statement){
                for(variable in fcontext)
                  eval(variable+"="+fcontext[variable])
                return eval(statement)
              })(fcontext,statement)
            return value
        }

        if(exitfunc==true) break
    }
    return value
}
////////////// sum
var def_mysum={"name":"mysum","arguments":["x","y"],
"statements":["x+y"]
}
def_func(def_mysum)
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

// breaking change introduced:
// ! and $ sigils https://en.wikipedia.org/wiki/Sigil_(computer_programming)
// UPDATE: no more needed... see below
var statements4=[
    ['print','"abc"'],
    ['print','variable_test']
    ]
/*
[    
    ['assign','name','"Dario"'],
    ['assign','line',['strcat','"My name is "','name']],
    ['print','line'],
]
*/

var statements5=[
    ['assign','returned',
        ['if','exponent<0','1/mypow(base,-exponent)',
            'exponent==0','1',
            'mypow(base,exponent-1)*base'],
    ],
    ['print','returned'], // print and return
]
var def_mypow={"name":"mypow","arguments":["base","exponent"],"statements":statements2 }
def_func(def_mypow)
console.log(mypow(2,3))
console.log(mypow(2,-1))

var def_my={"name":"my","arguments":[],"statements":statements4 }
def_func(def_my)
var variable_test='a variable for testing'
my()

/*
myeval(['list', [1,2,3]])
myeval(['block', statements])
*/
