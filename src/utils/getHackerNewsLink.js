export const getHackerNewsLink = (link) => {
    console.log(link);
    const idMatch = /item\?id=(\d+)/.exec(link);
    if (idMatch) {
        const id = idMatch[1];
        return `https://news.ycombinator.com/item?id=${id}`;
    } else {
        return link;
    }
};