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


        //var value=eval(statement)

        var context=function_def.arguments
        context['mypow']=mypow
        var value = function(str){
          return eval(str)
        }.call(context,statement)

        if(exitfunc==true) break
    }
    return value
}

/*
var result = function(str){
  return eval(str);
}.call(context,somestring)
//https://stackoverflow.com/questions/8403108/calling-eval-in-particular-context
*/
