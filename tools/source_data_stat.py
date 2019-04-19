# this basic analysis of source data is helpful for optimizing the loading process
import os


def main():
    for x in os.listdir(".\\source_data"):
        for filename in os.listdir(".\\source_data\\"+x):
            if filename.endswith("-CV-per-template.txt"):
                continue
            with open(".\\source_data\\"+x+"\\"+filename, "r") as f:
                num_lines = sum(1 for line in f)
            observation_number = num_lines - 7
            print(filename, observation_number)


if __name__ == '__main__':
    main()
