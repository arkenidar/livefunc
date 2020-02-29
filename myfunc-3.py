# sudo apt install python3 python3-pip python3-setuptools python3-wheel

def execf(statements,arguments):
    # ldict : locals dictionary
    ldict = {"exitfunc":False,"retval":None }
    ldict.update(arguments)
    def ret(retval=None):
        ldict["exitfunc"]=True
        ldict["retval"]=retval
    ldict["ret"]=ret
    for statement in statements:
        exec(statement,globals(),ldict)
        if ldict["exitfunc"]==True: break
    return ldict["retval"]

def def_func(function_def):
    def defined(*args):
        statements=function_def["statements"]
        arguments=dict(zip(function_def["arguments"],args))
        return execf(statements,arguments)
    globals()[function_def["name"]]=defined

function_mypow={"name":"mypow","arguments":["base","exponent"],"statements":[
"""if exponent<0: ret(1/mypow(base,-exponent))
elif exponent==0: ret(1)
else: ret(mypow(base,exponent-1)*base)"""]}

def_func(function_mypow)
print(mypow(2,3))

def_mysum={"name":"mysum","arguments":["x","y"],
"statements":["ret(x+y)"]
}

def_func(def_mysum)
print(mysum(2,3))