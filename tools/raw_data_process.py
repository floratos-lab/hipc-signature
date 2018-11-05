''' this script preprocesses the raw data to make it ready for loading '''
# 1. organize the submission data into the required subdiretory structure, create per-template and per-column summary files
# 2. create three config files: (1) admin.properties (2) observationDataApplicationContext.xml (3) observationDataSharedApplicationContext.xml

import os
import shutil

SOURCE_DATA_LOCATION = "C:\\Users\\zji\\Desktop\\hipc-data-20181102\\source_data"
TARGET_DATA_LOCATION = "C:\\data_collection\\hipc_data"
HIPC_APPLICATION_LOCATION = "C:\\Users\\zji\\git\\hipc-signature"


def read_raw_data():
    print("source data location", SOURCE_DATA_LOCATION)
    print("target data location", TARGET_DATA_LOCATION)
    print("HIPC application location", TARGET_DATA_LOCATION)

    # there are multiple subdirectories under the source data location
    # there is no data file directly under the the source data location
    per_column_file = open(os.path.join(
        TARGET_DATA_LOCATION, "dashboard-CV-per-column.txt"), "w")
    per_column_file.write(
        "id	template_name	column_name	subject	evidence	role	mime_type	numeric_units	display_text\n")

    per_template_file = open(os.path.join(
        TARGET_DATA_LOCATION, "dashboard-CV-per-template.txt"), "w")
    per_template_file.write(
        "observation_tier	template_name	observation_summary	template_description	story_title	submission_name	submission_description	project	submission_story	submission_story_rank	submission_center	principal_investigator\n")

    all_files = []

    column_id = 0

    for x in os.listdir(SOURCE_DATA_LOCATION):
        fullpath = os.path.join(SOURCE_DATA_LOCATION, x)
        # print(fullpath)
        # print(os.path.isdir(fullpath))
        if not os.path.isdir(fullpath):
            continue

        # open the path
        for f in os.listdir(fullpath):
            if f.endswith("per-template.txt"):
                # process per-template summary"
                f_template = open(os.path.join(fullpath, f), "r")
                i = 0
                for line in f_template:
                    i += 1
                    if i == 1:
                        continue
                    per_template_file.write(line)
            else:
                # process submission data"
                move_data_file(f, fullpath)
                all_files.append(f)

                template_name, column_info = read_column_info(f, fullpath)
                for idx in range(len(column_info[0])):
                    column_id += 1
                    per_column = [str(column_id), template_name]
                    for index in range(7):
                        per_column.insert(index+2, column_info[index][idx])
                    row = "\t".join(per_column) + "\n"
                    per_column_file.write(row)

    per_template_file.close()
    per_column_file.close()

    return all_files


def read_column_info(filename, dir):
    datafile = open(os.path.join(dir, filename))
    column_info = []
    i = 0
    for line in datafile:
        fields = line.strip('\n').split('\t')
        if i < 7:
            column_info.insert(i, fields[4:])
            i += 1
        else:
            template_name = fields[3]
            break

    return template_name, column_info


def move_data_file(filename, dir):
    # filename must match 'tempalte name'
    template_name = filename[:filename.rfind('.txt')]
    # print(filename)
    # print(tempalte_name)
    # print(os.path.join(dir, filename))
    # copy file to target submissin
    target_path = os.path.join(
        TARGET_DATA_LOCATION, "submissions\\"+template_name)
    if not os.path.exists(target_path):
        os.mkdir(target_path)
    shutil.copy(os.path.join(dir, filename),
                os.path.join(target_path, filename))


def update_configs(all_files):
    old_properties = open(os.path.join(HIPC_APPLICATION_LOCATION,
                                       "admin\\src\\main\\resources\\META-INF\\spring\\admin.properties"), 'r')
    new_properties = open(os.path.join(HIPC_APPLICATION_LOCATION,
                                       "admin\\src\\main\\resources\\META-INF\\spring\\admin.properties.tmp"), 'w')
    remove = False
    for line in old_properties:
        if not remove:
            new_properties.write(line)

        if line.strip() == "# submission data":
            remove = True
        elif remove and len(line.strip()) == 0:
            for f in all_files:
                x = f[f.find('-')+1:f.rfind('.txt')].replace('-',
                                                             '.')+".data.location"
                sub = f[:f.rfind('.txt')]
                new_properties.write(
                    x+"=file:${HIPC_DATA_HOME}/submissions/"+sub+"/"+f+'\n')

            new_properties.write('\n')
            remove = False
            # resume copying

    old_properties.close()
    new_properties.close()

    shutil.copy(os.path.join(HIPC_APPLICATION_LOCATION,
                             "admin\\src\\main\\resources\\META-INF\\spring\\admin.properties.tmp"),
                os.path.join(HIPC_APPLICATION_LOCATION,
                             "admin\\src\\main\\resources\\META-INF\\spring\\admin.properties"))


def main():
    all_files = read_raw_data()
    update_configs(all_files)


if __name__ == '__main__':
    main()
