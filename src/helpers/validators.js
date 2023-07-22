import {
    allPass,
    anyPass,
    compose,
    converge,
    curry,
    empty,
    equals,
    keys,
    length,
    lt,
    not,
    prop,
    reject,
} from "ramda";
/**
 * @file Домашка по FP ч. 1
 *
 * Основная задача — написать самому, или найти в FP библиотеках функции anyPass/allPass
 * Эти функции/их аналоги есть и в ramda и в lodash
 *
 * allPass — принимает массив функций-предикатов, и возвращает функцию-предикат, которая
 * вернет true для заданного списка аргументов, если каждый из предоставленных предикатов
 * удовлетворяет этим аргументам (возвращает true)
 *
 * anyPass — то же самое, только удовлетворять значению может единственная функция-предикат из массива.
 *
 * Если какие либо функции написаны руками (без использования библиотек) это не является ошибкой
 */

// 1. Красная звезда, зеленый квадрат, все остальные белые.

const getStar = prop("star");
const getSquare = prop("square");
const getTriangle = prop("triangle");
const getCircle = prop("circle");

const isWhite = equals("white");
const isRed = equals("red");
const isGreen = equals("green");
const isBlue = equals("blue");
const isOrange = equals("orange");

const isNotOrange = compose(not, isOrange);
const isNotWhite = compose(not, isWhite);
const isNotGreen = compose(not, isGreen);
const isNotBlue = compose(not, isBlue);
const isNotRed = compose(not, isRed);

const isWhiteTriangle = compose(isWhite, getTriangle);
const isWhiteSquare = compose(isWhite, getCircle);
const allWhiteTriangleSquare = allPass([isWhiteTriangle, isWhiteSquare]);

const isRedStar = compose(isRed, getStar);
const isGreenSquare = compose(isGreen, getSquare);
const checkColorStarAndSquare = allPass([isRedStar, isGreenSquare]);

const ifAnyWhiteElseCheckOtherColor = allPass([
    allWhiteTriangleSquare,
    checkColorStarAndSquare,
]);

// figures = { star, square, triangle, circle }
export const validateFieldN1 = (figures) =>
    ifAnyWhiteElseCheckOtherColor(figures);

// 2. Как минимум две фигуры зеленые.
const isGreenStar = compose(isGreen, getStar);
const isGreenTriangle = compose(isGreen, getTriangle);
const isGreenCircle = compose(isGreen, getCircle);

const greenStarSquare = allPass([isGreenStar, isGreenSquare]);
const greenStarTriangle = allPass([isGreenStar, isGreenTriangle]);
const greenStarCircle = allPass([isGreenStar, isGreenCircle]);
const greenTriangleSquare = allPass([isGreenTriangle, isGreenSquare]);
const greenTriangleCircle = allPass([isGreenTriangle, isGreenCircle]);
const greenSquareCircle = allPass([isGreenSquare, isGreenCircle]);
const minTwoGreenFigure = anyPass([
    greenStarSquare,
    greenStarTriangle,
    greenStarCircle,
    greenTriangleSquare,
    greenTriangleCircle,
    greenSquareCircle,
]);

export const validateFieldN2 = (figures) => minTwoGreenFigure(figures);

// 3. Количество красных фигур равно кол-ву синих.
const checkLengthKeys = compose(length, keys);

const rejectIsNotRed = reject(isNotRed);
const checkCountRed = compose(checkLengthKeys, rejectIsNotRed);

const rejectIsNotBlue = reject(isNotBlue);
const checkCountBlue = compose(checkLengthKeys, rejectIsNotBlue);

const isNotEmpty = compose(not, empty);
const isNotEmptyRed = compose(isNotEmpty, checkCountRed);
const isNotEmptyBlue = compose(isNotEmpty, checkCountBlue);

const checkEqualsLengthRedBlueCount = converge(equals, [
    checkCountRed,
    checkCountBlue,
]);

const checkEqualsLengthWithoutEmpty = allPass([
    checkEqualsLengthRedBlueCount,
    isNotEmptyRed,
    isNotEmptyBlue,
]);

export const validateFieldN3 = (figures) =>
    checkEqualsLengthWithoutEmpty(figures);

// 4. Синий круг, красная звезда, оранжевый квадрат треугольник любого цвета
const isBlueCircle = compose(isBlue, getCircle);
const isOrangeSquare = compose(isOrange, getSquare);

const checkBlueCirRedStOrangeSq = allPass([
    isBlueCircle,
    isRedStar,
    isOrangeSquare,
]);
export const validateFieldN4 = (figures) => checkBlueCirRedStOrangeSq(figures);

// 5. Три фигуры одного любого цвета кроме белого (четыре фигуры одного цвета – это тоже true).
// const rejectIsWhite = reject(isWhite);
const checkCount = compose(checkLengthKeys, reject);
const curryCheckCount = curry(checkCount);
const countRed = curryCheckCount(isNotRed);
const countOrange = curryCheckCount(isNotOrange);
const countGreen = curryCheckCount(isNotGreen);
const countBlue = curryCheckCount(isNotBlue);

const lt2Red = compose(lt(2), countRed);
const lt2Orange = compose(lt(2), countOrange);
const lt2Green = compose(lt(2), countGreen);
const lt2Blue = compose(lt(2), countBlue);
const checkOnLessThen2 = anyPass([lt2Red, lt2Orange, lt2Green, lt2Blue]);

export const validateFieldN5 = (figures) => checkOnLessThen2(figures);

// 6. Ровно две зеленые фигуры (одна из зелёных – это треугольник), плюс одна красная. Четвёртая оставшаяся любого доступного цвета, но не нарушающая первые два условия
const twoGreen = compose(equals(2), countGreen);
const oneRed = compose(lt(0), countRed);

export const validateFieldN6 = (figures) =>
    allPass([twoGreen, isGreenTriangle, oneRed])(figures);

// 7. Все фигуры оранжевые.
const customEquals = (params, a, ...args) => {
    return a === undefined || (a === params && customEquals(params, ...args));
};

const curryCustomEquals = curry(customEquals);
const customEqualsToOrange = curryCustomEquals("orange");
const curryConverge = curry(converge);

const checkAllOrangeFigure = curryConverge(customEqualsToOrange)([
    getCircle,
    getSquare,
    getTriangle,
    getStar,
]);

export const validateFieldN7 = (figures) => checkAllOrangeFigure(figures);

// 8. Не красная и не белая звезда, остальные – любого цвета.
const isNotRedStar = compose(isNotRed, getStar);
const isNotWhiteStar = compose(isNotWhite, getStar);
const isNotWhiteOrNotRedStar = allPass([isNotRedStar, isNotWhiteStar]);

export const validateFieldN8 = (figures) => isNotWhiteOrNotRedStar(figures);

// 9. Все фигуры зеленые.
const customEqualsToGreen = curryCustomEquals("green");
const checkAllGreenFigure = curryConverge(customEqualsToGreen)([
    getCircle,
    getSquare,
    getTriangle,
    getStar,
]);

export const validateFieldN9 = (figures) => checkAllGreenFigure(figures);

// 10. Треугольник и квадрат одного цвета (не белого), остальные – любого цвета

const isNotWhiteTriangle = compose(isNotWhite, getTriangle);
const isNotWhiteSquare = compose(isNotWhite, getSquare);
const isEqualsColor = converge(equals, [getTriangle, getSquare]);

const isEqualsColorAndWithoutWhite = allPass([
    isNotWhiteTriangle,
    isNotWhiteSquare,
    isEqualsColor,
]);

export const validateFieldN10 = (figures) =>
    isEqualsColorAndWithoutWhite(figures);
