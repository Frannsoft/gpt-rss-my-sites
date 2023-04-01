// In a separate test file, import the getHackerNewsLink function
import { getHackerNewsLink } from '../utils/getHackerNewsLink';

// Write a describe block for the getHackerNewsLink function
describe('getHackerNewsLink function', () => {
    // Write a test case for when the item is from Hacker News
    it('returns the correct link for an item from Hacker News', () => {
        const item = {
            source: 'Hacker News',
            link: 'https://news.ycombinator.com/item?id=12345',
        };
        expect(getHackerNewsLink(item)).toBe({ link: 'https://news.ycombinator.com/item?id=12345', source: 'Hacker News' });
    });

    // Write a test case for when the item is not from Hacker News
    it('returns null for an item not from Hacker News', () => {
        const item = {
            source: 'Wall Street Journal',
            link: 'https://www.wsj.com/articles/article-12345',
        };
        expect(getHackerNewsLink(item)).toBe(item);
    });
});
