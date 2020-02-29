function def_func(function_def){
    function defined(...farguments){
        var context={}
        for(argidx in function_def.arguments) context[function_def.arguments[argidx]]=farguments[argidx]
        context[function_def.name]=defined
        return callfunc(function_def, context)
    }
    this[function_def.name]=defined
}

function callfunc(function_def, context){
    var exitfunc=false
    for(statement of function_def.statements){
        var value = (function(context,statement){
          for(variable in context) eval(variable+"="+context[variable])
          return eval(statement)
        })(context,statement)
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
