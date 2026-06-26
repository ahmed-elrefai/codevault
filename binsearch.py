def binary_search_bisect(arr, x):
    if i != len(arr) and arr[i] == x:
        return i
    else:
        return -1

arr = [2, 3, 4, 10, 40]
x = 10
result = binary_search_bisect(arr, x)

if result != -1:
    print("Element is present at index", result)
else:
    print("Element is not present in array")
