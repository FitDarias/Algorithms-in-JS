// Реализовать поиск подстроки в строке с помощью конечного автомата. Вывести индексы всех вхождений подстроки.

// ЗАПУСК:
// node auto.js string.txt substring.txt
// node auto.js -a -t -n 1 string.txt substring.txt

// КЛЮЧИ:
// -n N, где N - произвольное натуральное число - вывести первые N вхождений;
// -t - вывести также время работы алгоритма;
// -a - помимо списка вхождений вывести таблицу автомата.



const fs = require('fs');
main();

function main() {
    let result;
    let arguments = parseArgv(process.argv);
    let needTable = 'table' in arguments;
    let needTime = 'needTime' in arguments;
    let firstInputCount = ('firstInputCount' in arguments) ? arguments['firstInputCount'] : -1;
    
    result = auto(arguments['string'], arguments['substring'], needTable, needTime, firstInputCount);
    
    console.log(result);
}

function parseArgv(args) {
    let state = 0;
    let string = "";
    let substring = "";
    let result = {}
    for (let i = 2; i < args.length; i++) {
        if (state === 3) {
            throw new Error("Too many arguments");
        }
        if (state === 0) {
            if (args[i] === '-a'){
                state = 0;
                result['table'] = true;
                continue;
            }
            if (args[i] === '-t'){
                state = 0;
                result['needTime'] = true;
                continue;
            }
            if (args[i] === '-n') {
                state = 0;
                result['firstInputCount'] = Number(args[i+1]);
                i++;
                continue;
            }
            i--;
            state = 1;
            continue;
        }
        if (state === 1) {
            exist(args[i]);
            string = fs.readFileSync(args[i], "utf8");
            state = 2;
            continue;
        }
        if (state === 2) {
            exist(args[i]);
            substring = fs.readFileSync(args[i], "utf8");
            state = 3;
        }
    }
    if (state < 3) {
        throw new Error("Not enough arguments");
    }
    result['string'] = string;
    result['substring'] = substring;
    return result;
}

function exist(file) {
    if (!fs.existsSync(file)) {
        throw new Error(`${file} file does not exist`);
    }
}

function auto(str, substr, needTable, needTime, firstInputCount){
    const start = new Date().getTime();
    let equalsCount = 0;
    let exist = false;
    let automate = new Automate(substr);
    let result;
    let index = "";
    for (let i = 0; i < str.length; i++) {
        if (automate.change(str.charAt(i))) {
            exist = true;
            index += (i - substr.length + 2) + ' ';
            equalsCount++;
            if (equalsCount === firstInputCount) {
                break
            }
        }
    }
    result = (exist === false) ? "No substrings found!" : index;
    const end = new Date().getTime();
    if (needTime) result += `Time = ${end - start}ms `
    if (needTable) printTable(substr, automate);
    return result;
}

function printTable(substr, k) {
    let title = "";
    for (let key in k.symbols) {
        title += `  ${key}`;
    }
    console.log(title);
    for (let i = 0; i < substr.length; i++){
        let table = `${i}  `;
        for (let j in k.stringAlphabet){
            table += `${k.del[i][j]}  `;
        }
        console.log(table);
    }
}

function Automate(substr) {
    this.finstate = substr.length;
    let stringAlphabet = [];
    let symbols = [];
    let del = [];             // Таблица состояний

    for(let j = 0; j <= substr.length; j++)
        del[j]=[];                                  // Собираем индексы
    for(let i = 0; i < substr.length;i++) {
        stringAlphabet[substr.charAt(i)] = 0;     // Символ
        symbols[substr[i]] = 0;
    }
    for(let i in stringAlphabet)
        del[0][i] = 0;                        // нолики в первой строке
    for(let j = 0; j < substr.length; j++){  // Заполн таблицу, идем по строкам (состояниям)
        let prev=del[j][substr.charAt(j)];  // Предыдущее состояние для заполнения след строчки
        del[j][substr.charAt(j)] = j+1;
        for(let i in stringAlphabet)
            del[j+1][i] = del[prev][i];
    }

    this.stringAlphabet = stringAlphabet;
    this.symbols = symbols;
    this.del = del;
    this.state=0;
    this.change = function (symbol) {
        if (del[this.state][symbol] == null)
            this.state=0;
        else
            this.state = del[this.state][symbol];
        return this.finstate === this.state;
    }
}