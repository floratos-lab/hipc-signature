# usage: pytest -s test_api.py
# or pytest test_api.py (to capture print output)
# or pytest (using the conventional test_*.py naming)
def test_api_studies():
    import requests

    r = requests.get("http://localhost:8081/api/studies")
    assert r.status_code == 200
    # assert r.json() == {"message": "Hello, World!"}
    print(r.json())
    print("API test studies passed!")


def test_api_signature():
    import requests

    r = requests.get("http://localhost:8081/api/signature/hipc-vac-ctf-28687661-10")
    assert r.status_code == 200
    print(r.json())
    print("API signature test passed!")


def test_api_browse():
    import requests

    r = requests.get("http://localhost:8081/api/browse/gene/stat1")
    assert r.status_code == 200
    print(r.json())
    print("API browse test passed!")
