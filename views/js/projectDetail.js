/**
 * Created by Johann on 12/06/2017.
 */
let lastHiddenElement = null;

function changeLabel(headerName, fontAwesomeTag, endTag, inputSelect, selectedValue, hideValue) {
    let iconString = '<i style="width:16px; text-align: center; padding-right: 24px;" class="fa ' + fontAwesomeTag + '"></i>' + endTag;
    document.getElementById(headerName).innerHTML = iconString;
    document.getElementById(inputSelect).value = selectedValue;

    if (lastHiddenElement) {
        document.getElementById(lastHiddenElement).style.display = "inline";
        lastHiddenElement = null;
    }

    if (hideValue) {
        lastHiddenElement = hideValue;
        document.getElementById(hideValue).style.display = "none";
    }

}


function loadTable() {

    let annotations = {
        1: '<i class="fa fa-plus"></i>',
        2: '<i class="fa fa-circle-o"></i>',
        3: '<i class="fa fa-remove"></i>',
        4: '<i class="fa fa-info"></i>'
    };

    let success = (projects) => {
        let htmlBuilder = [];

        // Table
        htmlBuilder.push('<table class="table table-sm">');

        // Header
        htmlBuilder.push('<thead> <tr> <th>#</th> <th> <i class="fa fa-wrench"></i></th> <th>Description</th> <th>Duration</th> <th>Worker</th> <th><i class="fa fa-money"></th></tr> </thead>');

        // Body
        htmlBuilder.push('<tbody>');

        for (let projectIndex in projects) {
            if (!projects.hasOwnProperty(projectIndex)) {
                continue;
            }
            console.log(projectIndex);
            let project = projects[projectIndex];
            let textFormat = String(project['text']).replace('\n', '<br>');
            let annotationId = Number(project['annotationId']);

            htmlBuilder.push('<tr>');

            htmlBuilder.push('<td> ' + project['projectStepId'] + ' </td>');
            htmlBuilder.push('<td style="text-align: center"> ' + annotations[annotationId] + ' </td>');
            htmlBuilder.push('<td> ' + textFormat + ' </td>');
            htmlBuilder.push('<td> ' + (annotationId !== 4 ? project['workHours'] : "") + ' </td>');
            htmlBuilder.push('<td> ' + project['name'] + ' </td>');
            htmlBuilder.push('<td> ' + (project['invoiceId'] ? '<i class="fa fa-check"></i>' : '<i class="fa fa-remove"></i>') + ' </td>');

            htmlBuilder.push('</tr>');

        }

        htmlBuilder.push('<tbody>');
        // End Table
        htmlBuilder.push('</table>');

        let htmlString = htmlBuilder.join('\n');
        document.getElementById('tableDiv').innerHTML = htmlString;
    };

    let error = (xhr, error) => {
        console.log(xhr);
        console.log(error);
    };

    $.ajax({
        url: window.location.href + '/table',
        success: success,
        error: error
    });


}

function addValues(id, projectId) {
    let descriptionValue = document.getElementById('taskDescription' + id).value;
    let timeValue = document.getElementById('timeInput' + id).value;
    let selectionValue = document.getElementById('annotationInput' + id).value;

    let postData = {
        "text": descriptionValue,
        "workHours": timeValue,
        "annotationId": selectionValue
    };

    let success = (data) => {
        // We should refresh the table now.
        loadTable();
        console.log('Successful POST.')
    };

    let error = (xhr, error) => {
        console.log(xhr);
        console.log(error);
    };

    $.ajax({
        type: "POST",
        url: '/projects/' + projectId + '/add',
        data: postData,
        success: success,
        error: error,
        dataType: 'json'
    });

}

function addContainer() {

}