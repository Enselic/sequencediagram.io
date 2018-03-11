# pylint: disable=unused-wildcard-import
from end_to_end_tests.utils import *
import time


def add_object_test(driver, initial, expected_new):
    start_with(driver, initial)
    time.sleep(0.05)

    click_add_object(driver)

    expected = initial.copy()
    expected["objects"].append(expected_new)
    assert_diagram(driver, expected)


def test_add_object_to_empty_diagram(driver):
    add_object_test(driver, {
        "objects": [],
        "messages": [],
    }, {
        "id": "o1",
        "name": "NewObject"
    })


def test_add_object_to_non_empty_diagram(driver):
    add_object_test(driver, {
        "objects": [{
            "id": "o1",
            "name": "Foo"
        }],
        "messages": [],
    }, {
        "id": "o2",
        "name": "NewObject",
    })


def test_add_object_to_non_empty_diagram_with_message(driver):
    add_object_test(
        driver, {
            "objects": [{
                "id": "o1",
                "name": "Foo",
            }, {
                "id": "o10",
                "name": "Bar",
            }],
            "messages": [{
                "id": "m10",
                "sender": "o10",
                "receiver": "o1",
                "name": "Heeeeej",
            }]
        }, {
            "id": "o11",
            "name": "NewObject",
        })


def test_add_object_id_is_highest_plus_one(driver):
    add_object_test(
        driver, {
            "objects": [{
                "id": "o10",
                "name": "10",
            }, {
                "id": "o100",
                "name": "100",
            }, {
                "id": "o1000",
                "name": "1000",
            }],
            "messages": []
        }, {
            "id": "o1001",
            "name": "NewObject",
        })


def test_change_object_name(driver):
    start_with(driver, {
        "objects": [{
            "id": "o1",
            "name": "ChangeMyName"
        }],
        "messages": []
    })

    rename_from_to(driver, "ChangeMyName", "NewText")

    assert_diagram(driver, {
        "objects": [{
            "id": "o1",
            "name": "NewText"
        }],
        "messages": []
    })
