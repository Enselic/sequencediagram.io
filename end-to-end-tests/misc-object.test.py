from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.common.by import xpath
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
from selenium.webdriver.common.action_chains import ActionChains

# Create a new instance of the Firefox driver
driver = webdriver.Firefox()

def find_element_by_partial_text(driver, text)
    return driver.find_element_by_xpath("//*[contains(text(),'" + text + "')]")

def click_text(driver, text)
    element = find_element_by_partial_text(driver, text)
    ActionChains(driver).click(element).perform()

# go to the google home page
driver.get("http://localhost:3000/")
driver.execute_script("return window.sequencediagram_io.setCurrentDiagram('{\"objects\":[{\"id\":\"o1\",\"name\":\"ChangeMyName\"}],\"messages\":[]}');")
click_text(driver, "ChangeMyName")


# the page is ajaxy so the title is originally this:
print driver.title

# find the element that's name attribute is q (the google search box)
inputElement = driver.find_element_by_name("q")

# type in the search
inputElement.send_keys("cheese!")

# submit the form (although google automatically searches now without submitting)
inputElement.submit()

try:
    # we have to wait for the page to refresh, the last thing that seems to be updated is the title
    WebDriverWait(driver, 10).until(EC.title_contains("cheese!"))

    # You should see "cheese! - Google Search"
    print driver.title

finally:
    driver.quit()
