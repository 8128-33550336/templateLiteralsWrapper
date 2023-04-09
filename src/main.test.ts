import templateLiteralsWrapper, { templateLiteralsTrimmer } from "./main";

templateLiteralsWrapper;

describe('normal', () => {
    test('basic usage', () => {
        expect(templateLiteralsWrapper`
            hoge
            fuga
            piyo
        `).toBe(`hoge\nfuga\npiyo`);
    });
    test('no cut \\S', () => {
        expect(templateLiteralsWrapper`
            hoge
        fuga
            piyo
        `).toBe(`hoge\nfuga\npiyo`);
        expect(templateLiteralsWrapper`
        hoge
        fuga
            piyo
        `).toBe(`hoge\nfuga\n    piyo`);
        expect(templateLiteralsWrapper`
            hoge
            \tfuga
            piyo
        `).toBe(`hoge\n\tfuga\npiyo`);
        expect(templateLiteralsWrapper`
            	hoge
            	fuga
            	piyo
        `).toBe(`hoge\nfuga\npiyo`);
        expect(templateLiteralsWrapper`
            hoge
            fuga\n\n
            piyo
        `).toBe(`hoge\nfuga\n\n\npiyo`);
    });
    test('l1 no lf', () => {
        expect(templateLiteralsWrapper
            `            hoge
            fuga
            piyo
        `).toBe(`hoge\nfuga\npiyo`);
        expect(templateLiteralsWrapper`
        hoge
        fuga
            piyo`).toBe(`hoge\nfuga\n    piyo`);
        expect(templateLiteralsWrapper
            `            hoge
            	fuga
            piyo
        `).toBe(`hoge\n	fuga\npiyo`);
        expect(templateLiteralsWrapper
            `	hoge
	fuga
	piyo
        `).toBe(`hoge\nfuga\npiyo`);
        expect(templateLiteralsWrapper`hoge
fuga
piyo
        `).toBe(`hoge\nfuga\npiyo`);
    });
});
