function mypow(base,exponent){
    var function_power={"name":"mypow","arguments":{"base":base,"exponent":exponent},"locals":{},"statements":[
`if(exponent<0) returned=1/mypow(base,-exponent)
else if(exponent==0) returned=1
else returned=mypow(base,exponent-1)*base`,
"returned"]}
    return callfunc(function_power)
}

function callfunc(function_def){
    var exitfunc=false
    for(statement of function_def.statements){
        var context=function_def.arguments
        var value = (function(context,statement){
          for(variable in context) eval(variable+"="+context[variable])
          return eval(statement)
        })(context,statement)
        if(exitfunc==true) break
    }
    return value
}
console.log(mypow(2,3))
