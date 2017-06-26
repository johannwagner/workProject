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

    getTeamData(teamId, timeStamp) {
        return this.databaseAdapter.getTeamData(teamId, timeStamp);
    }

    generateFullInvoiceData(projectData, teamData, projectDetailData) {
        projectData.address = String(projectData.address).replace('\n', '<br>');
        teamData.addressBlock = String(teamData.addressBlock).replace(/\n/g, '<br>');
        teamData.hourLoan = teamData.hourLoan.toFixed(2);
        projectData.totalPrice = 0;

        let groupIds = [];

        _.forEach(projectDetailData, (pStep) => {
            let splitWorkHours = pStep.workHours.split(':');
            let hours = Number(splitWorkHours[0]);
            let minutes = Number(splitWorkHours[1]);

            pStep.workHoursFormat = (hours + (minutes / 60)).toFixed(2);
            if (pStep.projectGroupFixedPrice) {
                pStep.projectGroupFixedPrice = pStep.projectGroupFixedPrice.toFixed(2);

                if(!groupIds.includes(pStep.projectGroupId)) {
                    projectData.totalPrice += Number(pStep.projectGroupFixedPrice);
                    groupIds.push(pStep.projectGroupId);
                }

            } else {
                pStep.totalPrice = (pStep.workHoursFormat * teamData.hourLoan).toFixed(2);
                projectData.totalPrice += Number(pStep.totalPrice);
            }
        });

        projectData.totalPrice = projectData.totalPrice.toFixed(2);
    }

    generateDisplayInvoiceData(projectDetailData) {
        let displayRows = [];

        _.forEach(projectDetailData, (pStep) => {
            if (!pStep.projectGroupId) {
                pStep.projectGroupName = "Sonstiges";
                pStep.projectGroupId = 0;
            }

            if (displayRows[pStep.projectGroupId]) {
                displayRows[pStep.projectGroupId].projectSteps.push(pStep);
            } else {
                displayRows[pStep.projectGroupId] = {
                    projectGroupName: pStep.projectGroupName,
                    projectGroupDescription: pStep.projectGroupDescription,
                    projectGroupFixedPrice: pStep.projectGroupFixedPrice,
                    projectSteps: [pStep]
                };
            }
        });

        return displayRows;
    }
}

module.exports = DataGenerator;