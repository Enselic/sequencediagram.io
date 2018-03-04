from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

# Create a new instance of the Firefox driver
driver = webdriver.Firefox()

def find_element_by_partial_text(driver, text):
    return driver.find_element_by_xpath("//*[contains(text(),'" + text + "')]")

def click_text(driver, text):
    element = find_element_by_partial_text(driver, text)
    ActionChains(driver).click(element).perform()

def type_text(driver, text):

# go to the google home page
driver.get("http://localhost:3000/")
driver.execute_script("return window.sequencediagram_io.setCurrentDiagram('{\"objects\":[{\"id\":\"o1\",\"name\":\"ChangeMyName\"}],\"messages\":[]}');")
click_text(driver, "ChangeMyName")
ActionChains(driver).send_keys("NewText").send_keys(Keys.RETURN).perform()






try:
    # we have to wait for the page to refresh, the last thing that seems to be updated is the title
    WebDriverWait(driver, 10).until(EC.title_contains("cheese!"))

    # You should see "cheese! - Google Search"
    print driver.title

finally:
    driver.quit()
