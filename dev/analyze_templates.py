# rough count of number of lines in each template
def main():
    x = '<script type="text/template"'
    print(x)
    with open('web/src/main/webapp/index.jsp','r') as fh:
        i = 0
        previous = 0
        count = 0
        for line in fh.readlines():
            i += 1
            line = line.strip()
            if line.startswith(x):
                count += 1
                print(count, line, (i-previous))
                previous = i

if __name__=='__main__':
    main()