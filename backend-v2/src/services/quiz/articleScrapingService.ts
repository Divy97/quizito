import * as cheerio from 'cheerio';
export class ArticleScrapingService {
  // Extracts main article content from a URL
  static async extractArticleContent(url: string): Promise<string> {
    if (url === '') {
        return '';
    }
    
    try {
      // Fetch and load the webpage
      const $ = await cheerio.fromURL(url);
      
      // Remove unnecessary elements
      $('script, style, nav, footer, iframe, img, svg, figure, noscript').remove();
      
      // Find the main article content
      let content = $('article, .article, .post, .entry-content, .content, main').first();
      
      // If no specific article container found, fall back to body
      if (content.length === 0) {
        content = $('body');
      }
      
      // Clean up the content
      const text = content
        .find('p, h1, h2, h3, h4, h5, h6, li')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 0) // Remove empty lines
        .join('\n\n');
      
      if (!text) {
        throw new Error('No meaningful content could be extracted from the article');
      }
      
      return text;
    } catch (error) {
      console.error('Error scraping article content:', error);
      throw new Error(`Failed to scrape article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
