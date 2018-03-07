from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
import json
import unittest


class BaseTestCase(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome()

    def test_change_object_name(self):
        start_with(self.driver, {
            "objects": [{
                "id": "o1",
                "name": "ChangeMyName"
            }],
            "messages": []
        })

        rename_from_to(self.driver, "ChangeMyName", "NewText")

        assert_diagram(self, self.driver, {
            "objects": [{
                "id": "o1",
                "name": "NewText"
            }],
            "messages": []
        })

    def tearDown(self):
        self.driver.quit()


def assert_diagram(testcase, driver, expected_diagram):
    script = "return window.sequencediagram_io.stringifyCurrentDiagram();"
    current_diagram_string = driver.execute_script(script)
    current_diagram = json.loads(current_diagram_string)
    testcase.assertEqual(current_diagram, expected_diagram)


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
    script = "return window.sequencediagram_io.setCurrentDiagram('{}');".format(
        json.dumps(sequence_diagram))
    driver.execute_script(script)


if __name__ == '__main__':
    unittest.main()
