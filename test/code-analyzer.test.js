import assert from 'assert';
import {parseCode,getRangeOfIfTestStatements,getParamList} from '../src/js/code-analyzer';
import * as escodegen from 'escodegen';
import * as esprima from 'esprima';


describe('Parse Code Without Args', () => {

    it('Simple Code', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo(){return 4;}'))))),escodegen.generate(esprima.parseScript( 'function foo(){return 4;}'))); });
    it('Complex Code', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo(x, y, z){\n' + ' let a = x + 1;\n' + ' let b = a + y;\n' + ' let c = 0;\n' + 'if(a){}\n' + 'if(3>0){}\n' + 'if(a>0){}\n' + 'if(b>0){}\n' + 'if(c>0){}\n' + 'if(a>b){}\n' + ' \n' + ' while (a < z) {\n' + ' c = a + b;\n' + ' z = c * 2;\n' + ' }\n' + ' \n' + ' return z;\n' + '}\n'))))),escodegen.generate(esprima.parseScript( 'function foo(x, y, z) {\n' + 'if (x + 1) {\n' + '}\n' + 'if (3 > 0) {\n' + '}\n' + 'if (x + 1 > 0) {\n' + '}\n' + 'if (x + 1 + y > 0) {\n' + '}\n' + 'if (0 > 0) {\n' + '}\n' + 'if (x + 1 > x + 1 + y) {\n' + '}\n' + 'while (x + 1 < z) {\n' + 'z = (x + 1 + (x + 1 + y)) * 2;\n' + '}\n' + 'return z;\n' + '}'))); });
    it('Complex Code 2', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo(x, y, z){\n' + ' let a = x + 1;\n' + ' let b = a + y;\n' + ' let c = 0;\n' + ' \n' + ' while (a < z) {\n' + ' c = a + b;\n' + ' z = c * 2;\n' + ' }\n' + ' \n' + ' return z;\n' + '}\n'))))), escodegen.generate(esprima.parseScript('function foo(x, y, z) {\n' + 'while (x + 1 < z) {\n' + 'z = (x + 1 + (x + 1 + y)) * 2;\n' + '}\n' + 'return z;}'))); });
    it('Complex Code 3', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo(x,y){\n' + ' let a=y;\n' + ' let b=x;\n' + ' if(1>0){\n' + ' return a+b;\n' + ' }else{\n' + ' return b;\n' + ' }\n' + '\n' + '}'))))), escodegen.generate(esprima.parseScript('function foo(x, y) {\n' + 'if (1 > 0) {\n' + 'return y + x;\n' + '} else {\n' + 'return x;\n' + '}\n' + '}'))); });
    it('Complex Code 4', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo(x, y, z){\n' + ' let a = x + 1;\n' + ' let b = a + y;\n' + ' let c = 0;\n' + ' \n' + ' if (b < z) {\n' + ' c = c + 5;\n' + ' return x + y + z + c;\n' + ' } else if (b < z * 2) {\n' + ' c = c + x + 5;\n' + ' return x + y + z + c;\n' + ' } else {\n' + ' c = c + z + 5;\n' + ' return x + y + z + c;\n' + ' }\n' + '}\n'))))), escodegen.generate(esprima.parseScript('function foo(x, y, z) {\n' + 'if (x + 1 + y < z) {\n' + 'return x + y + z + (0 + 5);\n' + '} else if (x + 1 + y < z * 2) {\n' + 'return x + y + z + (0 + x + 5);\n' + '} else {\n' + 'return x + y + z + (0 + z + 5);\n' + '}\n' + '}'))); });
    it('Complex Code 5', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo (){\n' + '\n' + 'if(1>0){}\n' + 'else{\n' + 'if(1>0){}\n' + 'else{\n' + 'if(2>0){}else{\n' + 'if(1>0){}else{}\n' + '}\n' + '}\n' + '\n' + '}\n' + 'return 5;\n' + '}'))))), escodegen.generate(esprima.parseScript('function foo() {\n' + 'if (1 > 0) {\n' + '} else {\n' + 'if (1 > 0) {\n' + '} else {\n' + 'if (2 > 0) {\n' + '} else {\n' + 'if (1 > 0) {\n' + '} else {\n' + '}\n' + '}\n' + '}\n' + '}\n' + 'return 5;\n' + '}'))); });
    it('Complex Code 6', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo(){\n' + '\t\n' + '\tif(1){\n' + '\t\t\n' + '\t}else if(2){\n' + '\t\t\n' + '\t}else if(3){\n' + '\t\t\n' + '\t}\n' + '}'))))), escodegen.generate(esprima.parseScript('function foo() {\n' + 'if (1) {\n' + '} else if (2) {\n' + '} else if (3) {\n' + '}\n' + '}'))); });
    it('Simple Code 2', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('function foo(){\n' + '\t\n' + '\tfor(var i=0;i<5;i++){}\n' + '}'))))), escodegen.generate(esprima.parseScript('function foo() {\n' + 'for (var i = 0; i < 5; i++) {\n' + '}\n' + '}'))); });
});

describe('Parse Code With Args', () => {

    it('args1', () => { assert.equal( escodegen.generate(esprima.parseScript(escodegen.generate((parseCode('let g1=5;\n' + 'let g2;\n' + 'function foo(x, y, z){\n' + 'g2=6;\n' + 'let a=x;\n' + 'let b=g1;\n' + '\n' + 'return a+b+g2;\n' + '\n' + '\n' + '}'))))), escodegen.generate(esprima.parseScript('let g1 = 5;\n' + 'let g2;\n' + 'function foo(x, y, z) {\n' + 'g2 = 6;\n' + 'return x + 5 + 6;\n' + '}'))); });


});

describe('Find location of if conditions ', () => {

    it('find', () => {
        assert.equal(getRangeOfIfTestStatements('function foo(x, y, z) {\n' +
            'if (x + 1 + y < z) {\n' +
            'return x + y + z + (0 + 5);\n' +
            '} else if (x + 1 + y < z * 2) {\n' +
            'return x + y + z + (0 + x + 5);\n' +
            '} else {\n' +
            'return x + y + z + (0 + z + 5);\n' +
            '}\n' +
            '}'),[{start:28,end:41,line:2},{start:84,end:101,line:4}].toString());
    });


    it('Simple Code', () => {
        assert.equal(getParamList(),'(x,y,z)');
    });



});


// it('Simple Code', () => {
//     assert.equal(
//         escodegen.generate(esprima.parseScript(escodegen.generate((parseCode(''))))),
//         escodegen.generate(esprima.parseScript('')));
// });