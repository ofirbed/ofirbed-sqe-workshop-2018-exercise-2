import * as esprima from 'esprima';


var paramList;
var l_var = new Map();
var tablesVar = [l_var];
var params_array = [];
var global_array = [];
var ranges_of_if_test_statements=[];

const functions = new Map();
functions.set('FunctionDeclaration',handleFunction);
functions.set('VariableDeclaration',handleVariableMultiDec);
functions.set('VariableDeclarator',handleVariableDec);
functions.set('ExpressionStatement',handleExprStatement);
functions.set('WhileStatement',handleWhile);
functions.set('BlockStatement',handleBlockStatement);
functions.set('IfStatement',handleIfStatement);
functions.set('ReturnStatement',handleReturnStatement);
functions.set('ForStatement',handleForStatement);


function handleForStatement(parsedCode) {
    analyze(parsedCode.body);

}

function ReplaceArgument(parsedCode, table) {
    if (parsedCode.argument.type === 'Identifier') {
        let res = table.get(parsedCode.argument.name);
        if (res !== undefined)
            parsedCode.argument = res;
    }

    if(parsedCode.argument.type==='BinaryExpression'){
        ReplaceRightField_IfNecessary(parsedCode.argument, table);
        ReplaceLeftField_IfNecessary(parsedCode.argument,table);
    }
}

function handleReturnStatement(parsedCode) {
    ReplaceArgument(parsedCode,getLastLocalTable());

}

function handleElseIfStatement(parsedCode) {
    substituteCondition(parsedCode,getLastLocalTable());
    ranges_of_if_test_statements.push({start:parsedCode.test.range[0],end: parsedCode.test.range[1],line: parsedCode.test.loc.start.line});

    addLocalVarTable();
    analyze(parsedCode.consequent);
    deleteLastLocalVar();

    if(parsedCode.alternate!==null) {
        if (parsedCode.alternate.type === 'IfStatement')
            handleElseIfStatement(parsedCode.alternate);
        else {
            addLocalVarTable();
            analyze(parsedCode.alternate);
            deleteLastLocalVar();
        }
    }
}

function substituteCondition(parsedCode,table) {
    if(parsedCode.test.type==='BinaryExpression'){
        ReplaceRightField_IfNecessary(parsedCode.test, table);
        ReplaceLeftField_IfNecessary(parsedCode.test,table);
    }
    if (parsedCode.test.type === 'Identifier') {
        parsedCode.test = table.get(parsedCode.test.name);
    }


}

function addLocalVarTable() {
    let lastTable = tablesVar.pop();
    let newLocalTable= new Map();
    lastTable.forEach((value,key)=> newLocalTable.set(key,value));
    tablesVar.push(lastTable);
    tablesVar.push(newLocalTable);
}

function deleteLastLocalVar() {
    tablesVar.pop();
}

function getLastLocalTable(){
    return tablesVar[tablesVar.length-1];
}

function handleIfStatement(parsedCode) {
    substituteCondition(parsedCode,getLastLocalTable());
    ranges_of_if_test_statements.push({start:parsedCode.test.range[0],end: parsedCode.test.range[1],line: parsedCode.test.loc.start.line});

    addLocalVarTable();
    analyze(parsedCode.consequent);
    deleteLastLocalVar();

    if(parsedCode.alternate!==undefined && parsedCode.alternate!==null) {
        if (parsedCode.alternate.type === 'IfStatement')
            handleElseIfStatement(parsedCode.alternate);
        else {
            addLocalVarTable();
            analyze(parsedCode.alternate);
            deleteLastLocalVar();
        }
    }
}

function handleBlockStatement(parsedCode){
    parsedCode.body.map(curr => analyze(curr));
    /** if true, the filter keeps the element*/
    // parsedCode.body = parsedCode.body.filter(curr =>
    //     curr.type !== 'VariableDeclaration' &&  curr.type !== 'ExpressionStatement');

    /** if true, the filter keeps the element*/
    parsedCode.body = parsedCode.body.filter(curr =>
        filter_VariableDeclaration(curr)
        ||filter_ExpressionStatement(curr)
         ||((curr.type !== 'VariableDeclaration') && (curr.type !== 'ExpressionStatement'))
    );

}

function filter_VariableDeclaration(curr){
    return (curr.type === 'VariableDeclaration' && (params_array.includes (curr.declarations[0].id.name) || global_array.includes (curr.declarations[0].id.name)));
}

function filter_ExpressionStatement(curr){
    return (curr.type === 'ExpressionStatement' &&(curr.expression.type === 'AssignmentExpression')
        &&((curr.expression.left.type === 'Identifier')) &&
        (params_array.includes (curr.expression.left.name)
            || global_array.includes (curr.expression.left.name)));
}

function handleWhile(parsedCode){
    substituteCondition(parsedCode,getLastLocalTable());
    addLocalVarTable();
    //parsedCode.body.map(curr => analyze(curr));
    analyze(parsedCode.body);
    deleteLastLocalVar();

}

function substituteAssignment(parsedCode, table) {
    ReplaceRightField_IfNecessary(parsedCode,table);
}

function handleExprStatement(parsedCode){
    insertToLocalsMap(parsedCode.expression.left.name,parsedCode,getLastLocalTable());

}

function handleVariableDec(parsedCode) {
    insertToLocalsMap(parsedCode.id.name,parsedCode,getLastLocalTable());

}

function handleVariableMultiDec(parsedCode) {
    parsedCode.declarations.map(curr => analyze(curr));


}

function ReplaceRightField_IfNecessary(parsed, table) {
    if (parsed.right.type === 'BinaryExpression') {
        ReplaceLeftField_IfNecessary(parsed.right, table);
        ReplaceRightField_IfNecessary(parsed.right, table);
    }

    if (parsed.right.type === 'Identifier') {
        let res = table.get(parsed.right.name);
        if (res !== undefined)
            parsed.right = res;
    }

}

function ReplaceInitField_IfNecessary(parsed, table) {
    if (parsed.init.type === 'BinaryExpression') {
        ReplaceLeftField_IfNecessary(parsed.init, table);
        ReplaceRightField_IfNecessary(parsed.init, table);
    }

    if (parsed.init.type === 'Identifier') {
        let res = table.get(parsed.init.name);
        if (res !== undefined)
            parsed.init = res;
    }
}

function ReplaceLeftField_IfNecessary(parsed, table) {
    if (parsed.left.type === 'BinaryExpression') {
        ReplaceLeftField_IfNecessary(parsed.left, table);
        ReplaceRightField_IfNecessary(parsed.left, table);
    }

    if (parsed.left.type === 'Identifier') {
        let res = table.get(parsed.left.name);
        if (res !== undefined)
            parsed.left = res;
    }
}

function insertToLocalsMap(val,parsed,table){
    if(parsed.type==='ExpressionStatement') {
        substituteAssignment(parsed.expression, table);
        table.set(val,parsed.expression.right);
    }
    else {
        if(parsed.init !== null)
            ReplaceInitField_IfNecessary(parsed, table);
        table.set(val, parsed.init);
    }
}

function handleFunction(parsedCode) {
    paramList = parsedCode.params.reduce((acc,vari)=> acc + vari.name+',','');
    parsedCode.params.map (curr => params_array.push(curr.name));
    paramList=paramList.substring(0,paramList.length-1);
    paramList='('+paramList+')';

    analyze(parsedCode.body);

}

function spartaAnalyze(a){
    analyze(a);
}

function analyze(parsedCode) {
    let func= functions.get(parsedCode.type);
    func(parsedCode);
}

const parseCode = (codeToParse) => {
    l_var = new Map();
    tablesVar = [l_var];
    params_array = [];
    global_array = [];
    let parsedCode = esprima.parseScript(codeToParse,{loc: true, range: true});
    parsedCode.body.map(curr =>insertToGlobalsAndAnalyze(curr));
    // parsedCode.body.map(curr => analyze(curr));
    return parsedCode;
};

function insertToGlobalsAndAnalyze(varDec) {
    if(varDec.type==='VariableDeclaration') {
        varDec.declarations.map(curr => global_array.push(curr.id.name));
        let table = getLastLocalTable();
        varDec.declarations.map(curr => insertToLocalsMap(curr.id.name, curr, table));
    }else{
        analyze(varDec);
    }
}

function getRangeOfIfTestStatements(newCode){
    ranges_of_if_test_statements=[];
    let parsedNewCode = esprima.parseScript(newCode,{loc: true, range: true});
    parsedNewCode.body.map(curr => spartaAnalyze(curr));
    return ranges_of_if_test_statements;

}

function getParamList(){
    return paramList;
}

export {parseCode,getRangeOfIfTestStatements,analyze,spartaAnalyze,getParamList};
