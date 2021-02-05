''' this script preprocesses the raw data to make it ready for loading '''
# 1. organize the submission data into the required subdiretory structure, create per-template and per-column summary files
# 2. create three config files: (1) admin.properties (2) observationDataApplicationContext.xml (3) observationDataSharedApplicationContext.xml

import os
import shutil
from data_config import DataConfig

SOURCE_DATA_LOCATION = os.path.expanduser("~/git/hipc-dashboard-pipeline/submissions")
TARGET_DATA_LOCATION = os.path.expanduser("~/data_collection/hipc_data")
HIPC_APPLICATION_LOCATION = "."


def read_raw_data():
    print("source data location", SOURCE_DATA_LOCATION)
    print("target data location", TARGET_DATA_LOCATION)
    print("HIPC application location", HIPC_APPLICATION_LOCATION)

    # remove old submission data files
    submission_directory = os.path.join(TARGET_DATA_LOCATION, "submissions")
    for filename in os.listdir(submission_directory):
        file_path = os.path.join(submission_directory, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))

    # there are multiple subdirectories under the source data location
    # there is no data file directly under the the source data location
    with open(os.path.join(TARGET_DATA_LOCATION, "dashboard-CV-per-column.txt"), "w", encoding='utf-8') as per_column_file:
        per_column_file.write(
            "id	template_name	column_name	subject	evidence	role	mime_type	numeric_units	display_text\n")

        with open(os.path.join(TARGET_DATA_LOCATION, "dashboard-CV-per-template.txt"), "w", encoding='utf-8') as per_template_file:
            per_template_file.write(
                "observation_tier	template_name	observation_summary	template_description	submission_name	submission_description	project	submission_story	submission_story_rank	submission_center	principal_investigator\n")

            all_files = []

            column_id = 0

            id2template_name = {}
            column_infos = {}
            for x in os.listdir(SOURCE_DATA_LOCATION):

                # skip the useless content
                if x=='.Rhistory': continue
                if x.endswith('_csv'): continue

                fullpath = os.path.join(SOURCE_DATA_LOCATION, x)
                # print(fullpath)
                # print(os.path.isdir(fullpath))
                if not os.path.isdir(fullpath):
                    continue

                # open the path
                for f in os.listdir(fullpath):
                    if f.endswith("per-template.txt"):
                        # process per-template summary"
                        with open(os.path.join(fullpath, f), "r", encoding='utf-8') as f_template:
                            i = 0
                            for line in f_template:
                                i += 1
                                if i == 1:
                                    continue
                                per_template_file.write(line)
                    else:
                        if f.startswith('.'):
                            continue
                        if os.path.isdir(os.path.join(fullpath,f)):
                            if f=='files':
                                evidence_dir = os.path.join(fullpath,f)
                                for evidencefile in os.listdir( evidence_dir ):
                                    shutil.copy(os.path.join(evidence_dir, evidencefile),os.path.join('./web/src/main/webapp/data', evidencefile))
                            continue
                        # process submission data"
                        move_data_file(f, fullpath)
                        all_files.append(f)

                        template_name, column_info = read_column_info(
                            f, fullpath)
                        id = f[f.find('-')+1:f.rfind('.txt')].replace('-',
                                                                      '.')
                        id2template_name[id] = template_name
                        # column names entry is created only once because they are the same for the same template_name
                        if template_name in column_infos:
                            continue

                        column_infos[template_name] = []
                        for idx in range(len(column_info[0])):
                            column_id += 1
                            per_column = [str(column_id), template_name]
                            for index in range(7):
                                per_column.insert(
                                    index+2, column_info[index][idx])
                            row = "\t".join(per_column) + "\n"
                            per_column_file.write(row)

                            cleaned_column_name = column_info[0][idx].strip(
                                '"')  # raw data are all double-quoted!!!
                            subject = column_info[1][idx].strip('"')
                            evidence = column_info[2][idx].strip('"')
                            role = column_info[3][idx].strip('"')
                            mime_type = column_info[4][idx].strip('"')
                            numeric_units = column_info[5][idx].strip('"')
                            display_text = column_info[6][idx].strip('"')
                            column_infos[template_name].append(
                                (cleaned_column_name, subject, evidence, role, mime_type, numeric_units, display_text))

    return all_files, id2template_name, column_infos


def read_column_info(filename, dir):

    column_info = []
    i = 0
    with open(os.path.join(dir, filename), encoding='utf-8') as datafile:
        try:
            line = datafile.readline()
        except UnicodeDecodeError as e:
            print('filename=', filename, '; directory=', dir)
            print(e)
            import sys
            sys.exit(1)
        while line:
            fields = line.strip('\n').split('\t')
            if i < 7:
                column_info.insert(i, fields[4:])
                i += 1
                line = datafile.readline()
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
        TARGET_DATA_LOCATION, "submissions/"+template_name)
    if not os.path.exists(target_path):
        os.mkdir(target_path)
    shutil.copy(os.path.join(dir, filename),
                os.path.join(target_path, filename))
    # also copy to hosted location
    target_path = os.path.join(
        './web/src/main/webapp/data', "submissions")
    if not os.path.exists(target_path):
        os.mkdir(target_path)
    shutil.copy(os.path.join(dir, filename),
                os.path.join(target_path, filename))


def update_configs(all_files):
    old_properties = open(os.path.join(HIPC_APPLICATION_LOCATION,
                                       "admin/src/main/resources/META-INF/spring/admin.properties"), 'r')
    new_properties = open(os.path.join(HIPC_APPLICATION_LOCATION,
                                       "admin/src/main/resources/META-INF/spring/admin.properties.tmp"), 'w')
    remove = False
    ids = []
    for line in old_properties:
        if not remove:
            new_properties.write(line)

        if line.strip() == "# submission data":
            remove = True
        elif remove and len(line.strip()) == 0:
            for f in all_files:
                id = f[f.find('-')+1:f.rfind('.txt')].replace('-',
                                                              '.')
                x = id+".data.location"
                sub = f[:f.rfind('.txt')]
                ids.append((id, x))
                new_properties.write(
                    x+"=file:${HIPC_DATA_HOME}/submissions/"+sub+"/"+f+'\n')

            new_properties.write('\n')
            remove = False
            # resume copying

    old_properties.close()
    new_properties.close()

    shutil.copy(os.path.join(HIPC_APPLICATION_LOCATION,
                             "admin/src/main/resources/META-INF/spring/admin.properties.tmp"),
                os.path.join(HIPC_APPLICATION_LOCATION,
                             "admin/src/main/resources/META-INF/spring/admin.properties"))

    return ids


def main():
    all_files, id2template_name, column_infos = read_raw_data()
    ids = update_configs(all_files)

    config = DataConfig(HIPC_APPLICATION_LOCATION, ids,
                        id2template_name, column_infos)
    config.save()
    config.saveSharedConfig()


if __name__ == '__main__':
    main()
