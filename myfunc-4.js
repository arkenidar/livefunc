var def_mypow={"name":"mypow","arguments":["base","exponent"],"locals":{},"statements":[
    `if(exponent<0) returned=1/mypow(base,-exponent)
    else if(exponent==0) returned=1
    else returned=mypow(base,exponent-1)*base`,
    "returned"]}

def_func(def_mypow)

function def_func(function_def){
    globalThis[function_def.name]=function(...farguments){
        var argdict={}
        for(argidx in function_def.arguments) argdict[function_def.arguments[argidx]]=farguments[argidx]
        return callfunc(function_def, argdict)
    }
}

function callfunc(function_def, farguments){
    var exitfunc=false
    for(statement of function_def.statements){
        var context=farguments
        var value = (function(context,statement){
          for(variable in context) eval(variable+"="+context[variable])
          return eval(statement)
        })(context,statement)
        if(exitfunc==true) break
    }
    return value
}

console.log(mypow(2,3))
