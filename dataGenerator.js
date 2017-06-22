/**
 * Created by Johann on 10/06/2017.
 */

const _ = require('lodash');

let pad = (num, size) => {
    let s = "000000000" + num;
    return s.substr(s.length - size);
};

class DataGenerator {
    constructor(databaseAdapter) {
        this.databaseAdapter = databaseAdapter;
    }

    getProjectData(teamId, projectId) {
        return this.databaseAdapter.getProjectData(teamId, projectId);
    }

    getCustomerData(teamId) {
        return this.databaseAdapter.getCustomerData(teamId);
    }


    getProjectDetailData(teamId, projectId, invoiceId) {
        let annotations = {
            1: '<i class="fa fa-plus"></i>',
            2: '<i class="fa fa-circle-o"></i>',
            3: '<i class="fa fa-remove"></i>',
            4: '<i class="fa fa-info"></i>'
        };

        return this.databaseAdapter.getProjectDetailData(teamId, projectId, invoiceId).then((projectDetailData) => {
            _.forEach(projectDetailData, (projectStep) => {
                projectStep.annotationHTML = annotations[projectStep.annotationId];
            });

            return projectDetailData;
        });
    }

    getInvoiceData(teamId, invoiceId) {
        return this.databaseAdapter.getInvoiceData(teamId, invoiceId).then((invoiceData) => {

            _.forEach(invoiceData, (invoiceDataElement) => {
                invoiceDataElement.invoiceIdDisplay = pad(invoiceDataElement.invoiceId, 3);
                invoiceDataElement.projectIdDisplay = pad(invoiceDataElement.projectId, 3);
                invoiceDataElement.customerIdDisplay = pad(invoiceDataElement.customerId, 3);
            });


            return invoiceData;
        });
    }

    getTeamData(teamId) {
        return this.databaseAdapter.getTeamData(teamId);
    }

    generateFullInvoiceData(projectData, teamData, projectDetailData) {
        projectData.address = String(projectData.address).replace('\n', '<br>');
        teamData.addressBlock = String(teamData.addressBlock).replace(/\n/g, '<br>');
        teamData.hourLoan = teamData.hourLoan.toFixed(2);
        projectData.totalPrice = 0;

        _.forEach(projectDetailData, (pStep) => {
            let splitWorkHours = pStep.workHours.split(':');
            let hours = Number(splitWorkHours[0]);
            let minutes = Number(splitWorkHours[1]);

            pStep.workHoursFormat = (hours + (minutes / 60)).toFixed(2);
            pStep.totalPrice = (pStep.workHoursFormat * teamData.hourLoan).toFixed(2);
            projectData.totalPrice += Number(pStep.totalPrice);
        });

        projectData.totalPrice = projectData.totalPrice.toFixed(2);
    }
}

module.exports = DataGenerator;