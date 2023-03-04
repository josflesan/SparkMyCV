import bs4
import cloudscraper

class WebScraper:

    def __init__(self):
        self._scraper = cloudscraper.create_scraper(delay=10, browser={
            'browser': 'chrome',
            'platform': 'android',
            'desktop': False
        })

    def __get_soup(self, url):
        """Returns a BeautifulSoup object for the given URL"""    
        response = self._scraper.get(url)
        return bs4.BeautifulSoup(response.text, 'html.parser')

    def __soup_to_text(self, soup):
        """Returns the text from a BeautifulSoup object"""
        return soup.get_text()

    def get_text_from_url(self, url):
        """Returns the text from a URL"""
        return self.__soup_to_text(self.__get_soup(url))