/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */
import {
    __,
    allPass,
    always,
    andThen,
    applySpec,
    call,
    compose,
    converge,
    gt,
    ifElse,
    length,
    lt,
    lte,
    modulo,
    otherwise,
    partial,
    partialRight,
    prop,
    tap,
    test,
} from "ramda";

import Api from "../tools/api";

const api = new Api();
const apiGet = api.get;
const apiGetNumber = apiGet("https://api.tech/numbers/base");

const getResult = prop("result");
const getValue = prop("value");
const getWriteLog = prop("writeLog");

const less2AndGreat10 = allPass([gt(10), lt(2)]);
const isPossitive = compose(lte(0), Number);
const checkLength = compose(less2AndGreat10, length);
const isTrueFloatNumber = test(/^\d+(\.\d+)?$/g);

const checkAllConditionValue = allPass([
    checkLength,
    isTrueFloatNumber,
    isPossitive,
]);

const validValue = compose(checkAllConditionValue, getValue);

const roundNumberAndToString = compose(
    String,
    Math.round,
    parseFloat,
    getValue
);

const queryToNumber = applySpec({
    from: always(10),
    to: always(2),
    number: roundNumberAndToString,
});

//power by 2
const pow2 = partialRight(Math.pow, [2]);
//modulo by 3
const modulo3 = modulo(__, 3);
//get TemplateStr
const templateStr = (id) => `https://animals.tech/${id}`;

const processSequence = (params) => {
    const { writeLog, handleSuccess, handleError } = params;
    const writeLogTap = tap(writeLog);
    const handleErrorPartial = partial(handleError, ["ValidationError"]);
    const tapGetValueAndWrite = tap(converge(call, [getWriteLog, getValue]));

    const lengthResult = compose(length, getResult);
    const getPipeNumber = compose(apiGetNumber, queryToNumber);
    const handleSuccessResult = compose(handleSuccess, getResult);
    const writeLogTapResult = tap(compose(writeLogTap, getResult));

    const resolvePipe = compose(
        andThen(partialRight(apiGet, [{}])),
        andThen(templateStr),
        andThen(writeLogTap),
        andThen(modulo3),
        andThen(writeLogTap),
        andThen(pow2),
        andThen(writeLogTap),
        andThen(lengthResult),
        andThen(writeLogTapResult)
    );

    const result = compose(
        otherwise(handleError),
        andThen(handleSuccessResult),
        resolvePipe,
        getPipeNumber
    );

    const checkValid = ifElse(validValue, result, handleErrorPartial);

    const app = compose(checkValid, tapGetValueAndWrite);

    app(params);
};

export default processSequence;
