function mypow(base,exponent){
    var function_power={"name":"mypow","arguments":{"base":undefined,"exponent":undefined},"locals":{},"statements":[
"//exitfunc=true; returned='exiting...!';",
`if(exponent<0) returned=1/mypow(base,-exponent)
else if(exponent==0) returned=1
else returned=mypow(base,exponent-1)*base`,
"returned"]}
    var exitfunc=false
    for(statement of function_power.statements){
        var value=eval(statement)
        if(exitfunc==true) break
    }
    return value
}

