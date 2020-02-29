def mypow(base,exponent):
    function_power={"name":"mypow","arguments":{"base":base,"exponent":exponent},"locals":{},"statements":[
"""if exponent<0: ret(1/mypow(base,-exponent))
elif exponent==0: ret(1)
else: ret(mypow(base,exponent-1)*base)""",
]}
    function=function_power
    # ldict : locals dictionary
    ldict = {"exitfunc":False,"retval":None }
    ldict.update(function['arguments'])
    def ret(retval=None):
        ldict["exitfunc"]=True
        ldict["retval"]=retval
    ldict['ret']=ret
    for statement in function["statements"]:
        exec(statement,globals(),ldict)
        if ldict["exitfunc"]==True: break
    return ldict["retval"]

