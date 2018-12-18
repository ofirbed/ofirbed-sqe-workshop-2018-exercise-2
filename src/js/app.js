import $ from 'jquery';
import * as escodegen from 'escodegen';

import {getRangeOfIfTestStatements,parseCode,getParamList} from './code-analyzer';

var safeEval = require('safe-eval');


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        var codeToParse = $('#codePlaceholder').val();
        let code = parseCode(codeToParse);
        var if_ranges = getRangeOfIfTestStatements(escodegen.generate(code));
        var colors = evalIfStatments(escodegen.generate(code),if_ranges,getParamList(),$('#InputVector').val());
        //var colors = evalIfStatments($('#InputVector').val(),escodegen.generate(code));
        DisplayFunc(escodegen.generate(code),colors);
        //$('#InputVector').val(JSON.stringify(b, null, 2));
    });
});

function evalIfStatments(inputCode,if_ranges,paramList,InputVector){

    let colors=[];
    if(InputVector!=='') {
        if_ranges.forEach(curr => {
            var code = '(function ' + paramList + '{ return ' + inputCode.substring(curr.start, curr.end) + ';})(' + InputVector + ')';
            if (safeEval(code))
                colors.push({line: curr.line, color: 'g'});
            else
                colors.push({line: curr.line, color: 'r'});

        });
    }
    return colors;

}


function getBr(){
    return document.createElement('br');
}

function getSpan(){
    return document.createElement('span');
}

function DisplayFunc(str,colors){
    str=str+'\n';
    var div1 = document.getElementById('div1');
    div1.innerHTML = '';
    var paragraph = document.createElement('p');var line='';var lineText;var lineNum=0;
    for (var x = 0; x < str.length; x++)
    {var c = str.charAt(x);
        if(c ==='\n'){
            lineNum++;lineText = document.createTextNode(line);let span= getSpan();
            if(checkColors(colors)) {
                if (colors[0].line === lineNum) {
                    span.className = colors[0].color;
                    colors.shift();}}
            span.appendChild(lineText);
            paragraph.appendChild(span);
            paragraph.appendChild(getBr());
            line='';}
        else
            line = line + c;}
    div1.appendChild(paragraph);}

function checkColors(colors){
    return colors!==null && colors.length>0;
}


// function DisplayTable(elementsArr) {
//     //var div1 = document.getElementById('div1');
//     var tbl = document.getElementById('output_table');
//
//
//     for (var r = 0; r < elementsArr.length; r++) {
//         var row = document.createElement('tr');
//
//         for (var c = 0; c < 5; c++) {
//             var cell = document.createElement('td');
//             cell.className = 'output';
//             var cellText = document.createTextNode(convertUndefinedToEmptyString(getElementbyNumber(elementsArr[r],c+1)));
//             cell.appendChild(cellText);
//             row.appendChild(cell);}
//
//         tbl.appendChild(row);}


// var paragraph = document.createElement("p");
// var linebreak = document.createElement("br");
//     do{
//     while(char !='\n''){
//         text=text.append(char);
//         char.next();
//         }
//         lineText = document.createTextNode(text)
//         paragraph.appendChild(lineText);
//         paragraph.appendChild(linebreak)
//
//     }while(char == null);

// div1.appendChild(tbl);


