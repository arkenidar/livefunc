def mypow(base,exponent):
    function_power={"name":"mypow","arguments":{"base":base,"exponent":exponent},"locals":{},"statements":[
"#exitnow(); returned='exiting...!';",
"""if exponent<0: returned=1/mypow(base,-exponent)
elif exponent==0: returned=1
else: returned=mypow(base,exponent-1)*base""",
"1",
"returned"]}
    function_return_test={"statements":[
"1",
##"returned='exiting...!'"
"exitnow(456)",
"exitnow(123)",
]}

    function=function_power
    # ldict : locals dictionary
    ldict = {"exitfunc":False,"returned":None, # for emulating return keyword
    #"base":base, "exponent": exponent
    }
    ldict.update(function['arguments'])
    ##exitfunc=False
    def exitnow(returned=None):
        ##exitfunc=True
        ldict["exitfunc"]=True
        ldict["returned"]=returned
        return returned
    #returned=None
    ldict['exitnow']=exitnow
    for statement in function["statements"]:
        #print(repr(
        #value=exec(statement,globals(),locals())
        ##print(statement)        
        #https://stackoverflow.com/questions/1463306/how-does-exec-work-with-locals        
        exec(statement,globals(),ldict)
        ##print(ldict["returned"])        
        ##if exitfunc==True: break
        if ldict["exitfunc"]==True: break
    #return returned
    return ldict["returned"]

#// var1=false; eval('var1=true'); console.log(var1) // proof of concept, check (JS)
#var1=False; exec('var1=True'); print(var1, 'var1') # success

print(mypow(2,3))
#https://stackoverflow.com/questions/1463306/how-does-exec-work-with-locals
