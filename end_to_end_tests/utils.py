import json
import unittest
from os import environ

from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys


class BaseTestCase(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()

    def create_firefox_driver():
        options = webdriver.FirefoxOptions()
        options.add_argument('sdfasf')

    def get_port(self):
        # CI scripts run from npm run build with serve (port 5000)
        # while you (typically) you run from npm start (port 3000)
        return environ.get('PORT', '5000' if 'CI' in environ else '3000')

    def get_host_and_port(self):
        return "http://localhost:{}/".format(self.get_port())

    def start_with(self, sequence_diagram):
        self.driver.get(self.get_host_and_port())
        script = "return window.sequencediagram_io.setCurrentDiagram('{}');".format(
            json.dumps(sequence_diagram))
        self.driver.execute_script(script)

    def rename_from_to(self, old_name, new_name):
        self.click_text(old_name)
        self.send_keys_and_return(new_name)

    def click_text(self, text):
        element = self.find_element_by_partial_text(text)
        ActionChains(self.driver).click(element).perform()

    def send_keys_and_return(self, keys):
        ActionChains(self.driver).send_keys(keys).send_keys(
            Keys.RETURN).perform()

    def find_element_by_partial_text(self, text):
        return self.driver.find_element_by_xpath(
            "//*[contains(text(),'" + text + "')]")

    def assert_diagram(self, expected_diagram):
        script = "return window.sequencediagram_io.stringifyCurrentDiagram();"
        current_diagram_string = self.driver.execute_script(script)
        current_diagram = json.loads(current_diagram_string)
        self.assertEqual(current_diagram, expected_diagram)

    def tearDown(self):
        self.driver.quit()
