// Реализовать поиск подстроки в строке с помощью алгоритма Бойера-Мура. Вывести индексы всех вхождений подстроки.
// Эвристика плохого символа (стоп-символа), эвристика хорошего суффикса (совпавшего суффикса).

// Примеры запуска:

// node bm.js string.txt substring.txt
// node bm.js -t -n 5 string.txt substring.txt



const fs = require('fs');
let every = String.fromCharCode(1);  // строка-символ с кодом 1. Будет использоваться в алгоритме для замены любых символов в подстроке. 
// Она используется для создания новой строки, которая получается из подстроки добавлением в начало строки every на каждую позицию.
let stopSymbol = Array();  
let matched = Array();   // значения для эвристики хорошего суффикса (сдвиг для каждой позиции в строке)

main();

function main() {
    let result;
    let arguments = parseArgv(process.argv);
    let needTime = 'needTime' in arguments;
    let firstInputCount = ('firstInputCount' in arguments) ? arguments['firstInputCount'] : -1;
    
    result = bm(arguments['string'], arguments['substring'], needTime, firstInputCount);
    console.log(result);
}

function parseArgv(args) {
    let state = 0;     // текущее состояние обработки аргументов командной строки. 
    let string = "";
    let substring = "";
    let result = {}
    for (let i = 2; i < args.length; i++) {
        if (state === 3) {
            throw new Error("Too many arguments");
        }
        if (state === 0) {
            if (args[i] === '-t'){
                result['needTime'] = true;
                continue;
            }
            if (args[i] === '-n') {
                result['firstInputCount'] = Number(args[i+1]);
                i++;
                continue;
            }
            i--;
            state = 1;
            continue;
        }
        if (state === 1) {
            checkExistence(args[i]);
            string = fs.readFileSync(args[i], "utf8");
            state = 2;
            continue;
        }
        if (state === 2) {
            checkExistence(args[i]);
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

function checkExistence(file) {
    if (!fs.existsSync(file)) {
        throw new Error(`${file} file does not exist`);
    }
}

// ЭВРИСТИКА СТОП-СИМВОЛА:
function shift(x,y) {        
    if (x === y) return -1;
    else {
        x = String(x);
        y = String(y);
        let j = y.length - 1;
        while (j>0 && y.charAt(j) === x.charAt(j))
            j--;
        let ret;
        let retstop;
        if (stopSymbol[x.charAt(j)] === undefined) ret=(j+1);
        else
            // сдвигаем подстроку вправо на индекс последнего вхождения символа строка[j] в подстроку
            ret = j - stopSymbol[x.charAt(j)];
        retstop = matched[(y.length-1)-j];
        if (ret<=retstop) return retstop;
        else if ((0<ret) && (retstop<ret)) return ret;
        else return 1;
    }
}

// Функция equals проверяет, равны ли две строки, игнорируя символ every:
function equals(x,y) {
    for (let p=x.length-1; p>=0;p--) {
        if (x.charAt(p) !== every && y.charAt(p) !== every && x.charAt(p) !== y.charAt(p)) {
            return false;
        }}
    return true;
}

// Сначала инициализируются массивы stopSymbol и matched. Затем функция ищет подстроку в строке, сдвигая подстроку на количество позиций, 
// равное функции сдвига, вычисленной с помощью эвристики плохого символа. Если подстрока найдена, то функция добавляет индекс ее первого символа 
// в строке в результат. Если нужно найти несколько вхождений подстроки, то функция продолжает поиск до тех пор, пока не найдет нужное 
// количество вхождений. Если нужно измерить время работы алгоритма, то функция добавляет время в результат.

function bm(str, substr, needTime, firstInputCount) {
    let exist = false;
    const start= new Date().getTime();
    for (let i = 0; i < substr.length; i++) stopSymbol[substr.charAt(i)] = i;
    let sub = '';
    for (let i = 0; i < substr.length; i++) sub += every;
    sub += substr;
    let u = 0;
    while (substr.charAt(substr.length - 1) === substr.charAt(substr.length - u - 1)) u++;
    matched[0] = u;
    let findstr;
    for (let i = 1; i <= substr.length; i++) {
        findstr = substr.substr(substr.length - i, i);
        for (u = 1; u <= substr.length; u++) {
            if (equals(findstr, sub.substr(sub.length - i - u, i))) {
                if (substr.charAt(substr.length - i - 1) !== sub.charAt(sub.length - i - u - 1)) {
                    break;
                }
            }
        }
        matched[i] = u;
    }
    let i = 0;
    let index = "";
    let result;
    let equalsCount = 0;
    let shif;
    while (i < str.length - substr.length + 1) {
        shif = shift(str.substr(i, substr.length), substr);
        if (shif === -1) {
            index += ((i + 1) + ' ');
            exist = true;
            i+=matched[substr.length-1];
            equalsCount++;
            if (equalsCount === firstInputCount) {
                break
            }
        } else
            i += shif;
    }
    result = (exist) ? "No substrings found!" : index;
    const end = new Date().getTime();
    if (needTime) result += `Time = ${end - start}ms `
    return result;
}