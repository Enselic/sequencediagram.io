# pylint: disable=unused-wildcard-import
from end_to_end_tests.utils import *


class MiscObjectTestCase(BaseTestCase):
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
