const spreadChain = <P extends unknown[], I extends unknown[], R>(before: (...arg: P) => I, after: (...arg: I) => R) => {
    return (...arg: P) => after(...before(...arg));
};

const noSpreadChain = <P extends unknown[], I, R>(before: (...arg: P) => I, after: (arg: I) => R) => {
    return (...arg: P) => after(before(...arg));
};

type templateLiteralsArg = [literals: (readonly (string | undefined)[]) & { raw: readonly string[]; }, ...args: { toString(): string; }[]];

function templateLiteralsToString(literals: (readonly (string | undefined)[]) & { raw: readonly string[]; }, ...args: { toString(): string; }[]) {
    const value = literals[0] + literals.slice(1).map((str, i) => '' + args[i] + str).join('');
    return value;
};
// \s: [\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]

function templateLiteralsTrimmer(literals: (readonly (string | undefined)[]) & { raw: readonly string[]; }, ...args: { toString(): string; }[]): templateLiteralsArg {
    if (literals.raw[0] === undefined) {
        return [literals, ...args];
    }
    const cutLength = (() => {
        if (/^[\s]*\n/.test(literals.raw[0])) {
            const matchText = literals.raw[0].match(/^[^\n]*\n([\s]*)/)?.[1];
            return matchText?.length;
        } else {
            const matchText = literals.raw[0].match(/^[\s]*/)?.[0];
            return matchText?.length;
        }
    })() ?? 0;

    console.log({ raw: literals.raw[0], m: literals.raw[0].match(/^[^\n]*\n([\s]*)/), cutLength });

    const removeRegexp = new RegExp(String.raw`\n[\t\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]{0,${cutLength}}`, 'g');
    const removeRegexpWithoutLF = new RegExp(String.raw`^[\t\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]{0,${cutLength}}`, 'g');
    console.log(removeRegexp);
    const trimmedLiterals = literals
        .map(text => text && text.replace(removeRegexp, '\n'))
        .map((v, i) => v && i === 0 ? v.replace(/^\n/, '') : v)
        .map((v, i) => v && i === 0 ? v.replace(removeRegexpWithoutLF, '') : v)
        .map((v, i, a) => v && (a.length - 1 === i) ? v.replace(/\n[\t\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*$/, '') : v) as ((string | undefined)[]) & { raw?: string[]; };
    trimmedLiterals.raw = literals.raw
        .map(text => text.replace(removeRegexp, '\n'))
        .map((v, i) => i === 0 ? v.replace(/^\n/, '') : v)
        .map((v, i) => i === 0 ? v.replace(removeRegexpWithoutLF, '') : v)
        .map((v, i, a) => a.length - 1 === i ? v.replace(/\n[\t\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*$/, '') : v);

    return [trimmedLiterals as templateLiteralsArg[0], ...args];
}

interface templateLiteralsWrapper {
    (...arg: templateLiteralsArg): string;
    tag(...arg: templateLiteralsArg): templateLiteralsArg;
    json(): templateLiteralsWrapper;
    func(convertFunc: (text: string) => string): templateLiteralsWrapper;
}

const emptyFunc = <T extends unknown[]>(...arg: T) => arg;
const templateLiteralsWrapperCreator = (useJson: boolean, convertFunc: typeof emptyFunc<[string]>) => {
    const argConverter: typeof emptyFunc<templateLiteralsArg> = useJson ?
        (...arg: templateLiteralsArg) => [arg[0], ...arg.slice(1).map(v => JSON.stringify(v))] :
        emptyFunc<templateLiteralsArg>;

    const templateLiteralsWrapperNoSubstitutions = spreadChain(argConverter, templateLiteralsTrimmer);
    const templateLiteralsWrapper = spreadChain(templateLiteralsWrapperNoSubstitutions, templateLiteralsToString) as templateLiteralsWrapper;
    templateLiteralsWrapper.tag = templateLiteralsWrapperNoSubstitutions;
    templateLiteralsWrapper.json = () => templateLiteralsWrapperCreator(true, convertFunc);
    templateLiteralsWrapper.func = (innerConvertFunc: (text: string) => string) => templateLiteralsWrapperCreator(useJson, noSpreadChain(innerConvertFunc, convertFunc));

    return templateLiteralsWrapper;
};

const templateLiteralsWrapper = templateLiteralsWrapperCreator(false, emptyFunc);

export default templateLiteralsWrapper;
