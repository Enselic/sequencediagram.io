import json
import unittest
import os
from random import randint
import sys

from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

# Make sure to always use the same size since different windw sizes
# affect how tests are run, and we want tests to run as predictable
# as possible
WINDOW_SIZE_WIDTH = 1280
WINDOW_SIZE_HEIGHT = 1050


class BaseTestCase(unittest.TestCase):
    def setUp(self):
        if os.environ.get('SELENIUM_BROWSER') == 'firefox':
            self.driver = self.create_firefox_driver()
        else:
            self.driver = self.create_chrome_driver()

    def create_firefox_driver(self):
        options = webdriver.firefox.options.Options()
        options.add_argument("-width={}".format(WINDOW_SIZE_WIDTH))
        options.add_argument("-height={}".format(WINDOW_SIZE_HEIGHT))
        self.setup_common_options(options)
        return webdriver.Firefox(options=options)

    def create_chrome_driver(self):
        options = webdriver.chrome.options.Options()
        options.add_argument("window-size={},{}".format(
            WINDOW_SIZE_WIDTH, WINDOW_SIZE_HEIGHT))
        self.setup_common_options(options)
        return webdriver.Chrome(options=options)

    def is_truthy(self, str):
        l = str.lower()
        return l == "y" or l == "yes" or l == "t" or l == "true" or l == "1"

    def setup_common_options(self, options):
        # Default to headless testing when running in Continous Integration
        # environments
        if self.is_truthy(os.environ.get('HEADLESS', os.environ.get('CI'))):
            options.set_headless()

    def get_port(self):
        # CI scripts run from npm run build with serve (port 5000)
        # while you (typically) you run from npm start (port 3000)
        return os.environ.get('PORT', '5000' if 'CI' in os.environ else '3000')

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

    def write_code_coverage_data_if_present(self):
        # Get coverage data from browser
        __coverage__ = self.driver.execute_script(
            'return "__coverage__" in window ? window.__coverage__ : undefined;'
        )

        if __coverage__ and os.path.isdir("coverage-data"):
            # To avoid file name collision without global state
            file_name = "./coverage-data/coverage-{}.json".format(
                randint(1, sys.maxsize))
            with open(file_name, "w") as cov_file:
                cov_file.write(json.dumps(__coverage__))

    def tearDown(self):
        self.write_code_coverage_data_if_present()
        self.driver.quit()
