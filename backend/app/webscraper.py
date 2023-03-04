import bs4
import cloudscraper

scraper = cloudscraper.create_scraper(delay=10, browser='chrome') 

def get_soup(url):
    """Returns a BeautifulSoup object for the given URL"""
    response = scraper.get(url)
    return bs4.BeautifulSoup(response.text, 'html.parser')

def soup_to_text(soup):
    """Returns the text from a BeautifulSoup object"""
    return soup.get_text()

def get_text_from_url(url):
    """Returns the text from a URL"""
    return soup_to_text(get_soup(url))