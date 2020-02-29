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
        var value = (function(fcontext,statement){
          for(variable in fcontext)
            eval(variable+"="+fcontext[variable])
          return eval(statement)
        })(fcontext,statement)
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
var def_mypow={"name":"mypow","arguments":["base","exponent"],"statements":[
    `if(exponent<0) returned=1/mypow(base,-exponent)
    else if(exponent==0) returned=1
    else returned=mypow(base,exponent-1)*base`,
    "returned"]}
def_func(def_mypow)
console.log(mypow(2,3))
console.log(mypow(2,-1))
