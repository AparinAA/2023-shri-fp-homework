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
    applyTo,
    compose,
    converge,
    curry,
    gt,
    gte,
    identity,
    ifElse,
    length,
    lt,
    lte,
    modulo,
    partial,
    partialRight,
    pick,
    pipe,
    prop,
    tap,
    test,
} from "ramda";

import Api from "../tools/api";

const api = new Api();
const wait = (time) =>
    new Promise((resolve) => {
        setTimeout(resolve, time);
    });

const apiGetNumber = api.get("https://api.tech/numbers/base");

const less2AndGreat10 = allPass([gt(10), lt(2)]);
const isPossitive = compose(lte(0), Number);
const checkLength = compose(less2AndGreat10, length);
const checkTrueFloat = test(/^\d+(\.\d+)?$/g);

const checkAllConditionValue = allPass([
    checkLength,
    checkTrueFloat,
    isPossitive,
]);

const validValue = (value) => checkAllConditionValue(value);

const roundNumberAndToString = compose(String, Math.round, parseFloat);

const templateStr = (id) => `https://animals.tech/${id}`;

const processSequence = (params) => {
    /**
     * Я – пример, удали меня
     */
    const { value, writeLog, handleSuccess, handleError } = params;

    const writeLogTap = tap(writeLog);
    writeLogTap(value);
    const query = applySpec({
        from: always(10),
        to: always(2),
        number: roundNumberAndToString,
    });

    //power by 2
    const pow2 = converge(Math.pow, [compose(writeLogTap, length), always(2)]);
    //modulo by 3
    const modulo3 = modulo(__, 3);

    const result = pipe(
        query,
        apiGetNumber,
        andThen(prop("result")),
        andThen(writeLogTap),
        andThen(pow2),
        andThen(writeLogTap),
        andThen(modulo3),
        andThen(writeLogTap),
        andThen(templateStr),
        andThen(partialRight(api.get, [{}])),
        andThen(prop("result")),
        andThen(handleSuccess)
    );

    const handleErrorPartial = partial(handleError, ["ValidationError"]);

    const checkValid = ifElse(validValue, result, handleErrorPartial);

    checkValid(value);
};

export default processSequence;
