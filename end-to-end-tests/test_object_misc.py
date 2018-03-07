from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from lib.utils import BaseTestCase
import json
import unittest


class MiscObjectTestCase(unittest.BaseTestCase):
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
