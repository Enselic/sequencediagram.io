# pylint: disable=unused-wildcard-import
from end_to_end_tests.utils import *


class MiscObjectTestCase(BaseTestCase):
    def test_change_object_name(self):
        self.start_with({
            "objects": [{
                "id": "o1",
                "name": "ChangeMyName"
            }],
            "messages": []
        })

        self.rename_from_to("ChangeMyName", "NewText")

        self.assert_diagram({
            "objects": [{
                "id": "o1",
                "name": "NewText"
            }],
            "messages": []
        })
