import mysql.connector


def init():
    global mydb
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        passwd="admin",
        database="hipc_signature"
    )


def query():
    mycursor = mydb.cursor()

    mycursor.execute(
        "SELECT submission.id, observationSummary FROM submission JOIN observation_template ON submission.observationTemplate_id=observation_template.id")
    myresult = mycursor.fetchall()
    print(len(myresult))
    summary_template = {}
    for x in myresult:
        summary_template[x[0]] = x[1]
        # print(x)

    print(len(summary_template))

    # final result - map observation ID to populated summary
    final_result = {}
    mycursor.execute(
        "SELECT DISTINCT observation.id, submission.id FROM observation JOIN submission ON observation.submission_id=submission.id")
    myresult = mycursor.fetchall()
    for x in myresult:
        observation_id = x[0]
        submission_id = x[1]
        final_result[observation_id] = summary_template[submission_id]
    print("final result count", len(final_result))
    print("test", final_result[3112707])

    # replace subjects
    mycursor.execute("""SELECT observation_id, observed_subject_role.columnName, dashboard_entity.displayName FROM observed_subject
        JOIN observed_subject_role ON observed_subject.observedSubjectRole_id=observed_subject_role.id
        JOIN subject ON observed_subject.subject_id=subject.id
        JOIN dashboard_entity ON subject.id=dashboard_entity.id""")
    myresult = mycursor.fetchall()
    for x in myresult:
        observation_id = x[0]
        one_placeholder = x[1]
        subject_name = x[2]
        final_result[observation_id] = final_result[observation_id].replace(
            "<"+one_placeholder+">", subject_name)
    print("column count", len(myresult))
    print("test", final_result[3112707])

    # replace evidences
    mycursor.execute("""SELECT observation_id, observed_evidence_role.columnName, dashboard_entity.displayName FROM observed_evidence
        JOIN observed_evidence_role ON observed_evidence.observedEvidenceRole_id=observed_evidence_role.id
        JOIN evidence ON observed_evidence.evidence_id=evidence.id
        JOIN dashboard_entity ON evidence.id=dashboard_entity.id""")
    myresult = mycursor.fetchall()
    for x in myresult:
        observation_id = x[0]
        one_placeholder = x[1]
        evidence_name = x[2]
        final_result[observation_id] = final_result[observation_id].replace(
            "<"+one_placeholder+">", evidence_name)
    print("column count", len(myresult))
    print("test", final_result[3112707])

    count = 1
    for x in final_result:
        if count > 5:
            break  # for debug
        print(x, final_result[x])
        count += 1
    print("final_result count", len(final_result))
    return final_result


def save(data):
    mycursor = mydb.cursor()
    mycursor.execute(
        "CREATE TABLE expanded_summary (observation_id INT PRIMARY KEY, summary VARCHAR(1024))")

    for id in data:
        sql = "INSERT INTO expanded_summary (observation_id, summary) VALUES (%s, %s)"
        val = (id, data[id])
        mycursor.execute(sql, val)

    mydb.commit()


def main():
    init()
    data = query()
    save(data)


if __name__ == '__main__':
    main()
