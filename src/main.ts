const spreadchain = <P extends unknown[], I extends unknown[], R>(before: (...arg: P) => I, after: (...arg: I) => R) => {
    return (...arg: P) => after(...before(...arg));
};

const nospreadchain = <P extends unknown[], I, R>(before: (...arg: P) => I, after: (arg: I) => R) => {
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
    const trimedLiterals = literals
        .map(text => text && text.replace(removeRegexp, '\n'))
        .map((v, i) => v && i === 0 ? v.replace(/^\n/, '') : v)
        .map((v, i) => v && i === 0 ? v.replace(removeRegexpWithoutLF, '') : v)
        .map((v, i, a) => v && (a.length - 1 === i) ? v.replace(/\n[\t\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*$/, '') : v) as ((string | undefined)[]) & { raw?: string[]; };
    trimedLiterals.raw = literals.raw
        .map(text => text.replace(removeRegexp, '\n'))
        .map((v, i) => i === 0 ? v.replace(/^\n/, '') : v)
        .map((v, i) => i === 0 ? v.replace(removeRegexpWithoutLF, '') : v)
        .map((v, i, a) => a.length - 1 === i ? v.replace(/\n[\t\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*$/, '') : v);

    return [trimedLiterals as templateLiteralsArg[0], ...args];
}

interface templateLiteralsWrapper {
    (...arg: templateLiteralsArg): string;
    tag(...arg: templateLiteralsArg): templateLiteralsArg;
    json(): templateLiteralsWrapper;
    func(convertFunc: (text: string) => string): templateLiteralsWrapper;
}

const emptyFunc = <T extends unknown[]>(...arg: T) => arg;
const templateLiteralsWrapperCreater = (usejson: boolean, convertFunc: typeof emptyFunc<[string]>) => {
    const argConv: typeof emptyFunc<templateLiteralsArg> = usejson ?
        (...arg: templateLiteralsArg) => [arg[0], ...arg.slice(1).map(v => JSON.stringify(v))] :
        emptyFunc<templateLiteralsArg>;

    const templateLiteralsWrapperNoSubstitutions = spreadchain(argConv, templateLiteralsTrimmer);
    const templateLiteralsWrapper = spreadchain(templateLiteralsWrapperNoSubstitutions, templateLiteralsToString) as templateLiteralsWrapper;
    templateLiteralsWrapper.tag = templateLiteralsWrapperNoSubstitutions;
    templateLiteralsWrapper.json = () => templateLiteralsWrapperCreater(true, convertFunc);
    templateLiteralsWrapper.func = (innerConvertFunc: (text: string) => string) => templateLiteralsWrapperCreater(usejson, nospreadchain(innerConvertFunc, convertFunc));

    return templateLiteralsWrapper;
};

const templateLiteralsWrapper = templateLiteralsWrapperCreater(false, emptyFunc);

export default templateLiteralsWrapper;
