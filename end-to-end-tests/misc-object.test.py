from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
import json
import unittest

class MiscObjectTestCase(unittest.TestCase):
    def setUp(self):
        driver = webdriver.Firefox()

    def change_object_name(self):
        start_with(driver, {"objects":[{"id":"o1","name":"ChangeMyName"}],"messages":[]})
        rename_from_to(driver, "ChangeMyName", "NewText")
        assert 1 == 1, 'incorrect default size'

    def tearDown(self):
        driver.quit()

def find_element_by_partial_text(driver, text):
    return driver.find_element_by_xpath("//*[contains(text(),'" + text + "')]")

def click_text(driver, text):
    element = find_element_by_partial_text(driver, text)
    ActionChains(driver).click(element).perform()

def send_keys_and_return(driver, keys):
    ActionChains(driver).send_keys(keys).send_keys(Keys.RETURN).perform()

def rename_from_to(driver, old_name, new_name):
    click_text(driver, old_name)
    send_keys_and_return(driver, new_name)

def start_with(driver, sequence_diagram):
    driver.get("http://localhost:3000/")
    script = "return window.sequencediagram_io.setCurrentDiagram('" + json.dumps(sequence_diagram) + "');"
    driver.execute_script(script)

if __name__ == '__main__':
    unittest.main()

