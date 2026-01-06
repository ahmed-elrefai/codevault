
import pytest
import sys

def run_tests():
    from io import StringIO
    
    # Capture stdout/stderr
    capture = StringIO()
    # sys.stdout = capture
    # sys.stderr = capture
    
    # result = pytest.main(["-vv", "tests/test_auth.py"])
    
    # Instead of capturing sys, let's use pytest's internal capture or plain run and write to file
    # We can just use subprocess inside python
    import subprocess
    with open("tests/run.log", "w") as f:
        subprocess.run([sys.executable, "-m", "pytest", "-vv", "tests/test_auth.py"], stdout=f, stderr=f)

if __name__ == "__main__":
    run_tests()
