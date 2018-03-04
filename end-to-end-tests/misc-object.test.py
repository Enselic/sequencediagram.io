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

def send_keys_and_return(driver, keys):
    ActionChains(driver).send_keys(keys).send_keys(Keys.RETURN).perform()

def rename_from_to(driver, old_name, new_name):
    click_text(driver, old_name)
    send_keys_and_return(driver, )

def start_width(driver, sequence_diagram):


    driver.get("http://localhost:3000/")
    script = "return window.sequencediagram_io.setCurrentDiagram('" + initial_state"');"
    driver.execute_script()



# go to the google home page
start_with(driver, {"objects":[{"id":"o1","name":"ChangeMyName"}],"messages":[]})
rename_from_to(driver, "ChangeMyName", "NewText")
click_text(driver, )





try:
    # we have to wait for the page to refresh, the last thing that seems to be updated is the title
    WebDriverWait(driver, 10).until(EC.title_contains("cheese!"))

    # You should see "cheese! - Google Search"
    print driver.title

finally:
    driver.quit()
