function getRefined(){
    const expression = "12 / 2 + 2 - 3 * (2 - (1+1))"

    let src = expression.split("").filter(x => x !== " ")
    let refined_src = [];

    while (src.length > 0){
        let number = "";
        while(!isNaN(src[0])){
            number += src.shift();
        }
        number !== "" ? refined_src.push(number) : refined_src.push(src.shift());
    }

    return refined_src;
}

function print(x) {
    console.log(x)
}

let mainSrc = getRefined();

function ASTadd(){ //assume expr only has + or -
    let lhs = ASTmult();
    while(["+", "-"].includes(mainSrc[0])){
        let op = mainSrc.shift();
        let rhs = mainSrc.shift();
        lhs = {lhs: lhs, op: op, rhs: rhs}
    }
    return lhs;
}
function ASTmult(){ //substitute expr so it only has + or - left, evaluate all * and /
    ASTbrack();
    let lhs;
    let hold = firstIndexOfEither(mainSrc ,"*", "/");
    if(hold !== -1){

        lhs = mainSrc[hold - 1];
        while(hold !== -1){
            let op = mainSrc[hold];

            let rhs = mainSrc[hold + 1];

            mainSrc.splice(hold - 1, 3)
            mainSrc.splice(hold-1, 0, evaluate({lhs: lhs, op: op, rhs: rhs}));
            mainSrc = mainSrc.map(String)
            print(mainSrc)

            hold = firstIndexOfEither(mainSrc ,"*", "/");
            lhs = mainSrc[hold - 1];
        }
    }

    return mainSrc.shift();
}

function ASTbrack(){
    while(mainSrc.indexOf("(") !== -1){
        let bracketIndexOpen = mainSrc.indexOf("(");
        let bracketIndexClose;
        let i = bracketIndexOpen;
        let bracketCount = 1;
        while(bracketCount !== 0){
            i += 1;

            if(mainSrc[i] === ")"){
                bracketCount -= 1;
            } if (mainSrc[i] === "("){
                bracketCount += 1;
            }
        }
        bracketIndexClose = i;
        let subAST = mainSrc.slice(bracketIndexOpen + 1, bracketIndexClose)
        mainSrc.splice(bracketIndexOpen, subAST.length + 2)
        print("main SRC: "+mainSrc)
        print("SUB AST DERIVED: " + subAST) //1 instance of outer bracket

        //next steps

        //save mainSrc to temporary variable
        let tempMainSrc = mainSrc;

        //change mainSrc to the sub ast derived
        mainSrc = subAST;

        //run ast add again, which will now be working on the sub ast, and capture evaluated val
        let bracketASTevaluated = evaluate(ASTadd());

        //reset mainSrc to temporary mainSrc
        mainSrc = tempMainSrc;

        //add evaluated val to mainSrc
        mainSrc.splice(bracketIndexOpen , 0, bracketASTevaluated);
    }
}

print("MAIN => " + evaluate(ASTadd()))

function evaluate(ast_sect){
    let ret;
    if(!isObj(ast_sect.lhs)){
        ret = subeval(ast_sect.lhs, ast_sect.op, ast_sect.rhs);
    }else{
        ret = subeval(evaluate(ast_sect.lhs), ast_sect.op, ast_sect.rhs);
    }
    return ret;
}

function subeval(lhs, op, rhs){
    switch(op){
        case "+":
            return Number(lhs) + Number(rhs);
        case "-":
            return Number(lhs) - Number(rhs);
        case "*":
            return Number(lhs) * Number(rhs);
        case "/":
            return Number(lhs) / Number(rhs);
    }
}

function isObj(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)

}

function firstIndexOfEither(arr, a, b) {
    const indexA = arr.indexOf(a);
    const indexB = arr.indexOf(b);

    if (indexA === -1) return indexB;
    if (indexB === -1) return indexA;
    return Math.min(indexA, indexB);
}
