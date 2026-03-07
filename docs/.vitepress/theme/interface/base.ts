interface IAWord {
    title: string;
    content: string;
    date: string;
    desc?: string;
}

interface IShuoShuo {
    content: string;
    date: string;
    tags?: string[];
}

export {
    IAWord,
    IShuoShuo
}