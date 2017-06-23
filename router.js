/**
 * Created by Johann on 08/06/2017.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const Promise = require('bluebird');
const messageHelper = require('./messageHelper');
var moment = require('moment');
const _ = require('lodash');


const dataGeneratorClass = require('./dataGenerator');
const databaseAdapterClass = require('./databaseAdapter');
let databaseAdapter = new databaseAdapterClass();
let dataGenerator = new dataGeneratorClass(databaseAdapter);

let noCache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

let ensureLogin = function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/login/');
    } else {
        next();
    }
};

let generateStandardValues = (req, res, valueDict) => {

    if (req.session.user) {
        // User is logged in.
        valueDict.messages = req.session.messages;
        req.session.messages = [];
    }

    valueDict.helpers = {
        inc: (value, options) => {
            console.log("hi");
            return parseInt(value) + 1;
        },
        meh: (value, options) => {
            return "Mööh!";
        }
    };

    return valueDict;
};

router.get('*', noCache);

router.get('/', ensureLogin, (req, res, next) => {
    res.render('index.hbs', generateStandardValues(req, res, {userName: req.session.user.name}));
});

router.get('/customers', ensureLogin, (req, res, next) => {

    let teamId = req.session.user.teamId;

    let customerPromise = dataGenerator.getCustomerData(teamId).then((customerList) => {

        _.forEach(customerList, (customer) => {
            customer.address = String(customer.address).replace('\n', '<br>');
        });

        res.render('customers.hbs', generateStandardValues(req, res, {customerList: customerList}));

    }).catch((error) => {
        console.error(error);
        res.status(500).send();
    });

});

router.get('/invoices', ensureLogin, (req, res, next) => {


    let teamId = req.session.user.teamId;
    dataGenerator.getInvoiceData(teamId).then((invoiceList) => {


        res.render('invoices.hbs', generateStandardValues(req, res, {invoiceList: invoiceList}));

    }).error((error) => {
        console.log(error);
        res.redirect('/')
    });

});


router.get('/invoices/:id/:printView?', ensureLogin, (req, res, next) => {

    let teamId = req.session.user.teamId;
    let invoiceId = req.params.id;
    let printView = req.params.printView === 'printView';

    let invoicePromise = dataGenerator.getInvoiceData(teamId, invoiceId);
    let invoiceDataElem;

    invoicePromise.then((invoiceData) => {


        invoiceDataElem = invoiceData[0];

        let projectDataPromise = dataGenerator.getProjectData(teamId, invoiceDataElem.projectId);
        let projectDetailDataPromise = dataGenerator.getProjectDetailData(teamId, null, invoiceId);
        let teamPromise = dataGenerator.getTeamData(teamId, invoiceDataElem.createDate);

        return Promise.all([projectDataPromise, projectDetailDataPromise, teamPromise])
    }).then((promiseData) => {

        let projectData = promiseData[0][0];
        let projectDetailData = promiseData[1];
        let teamData = promiseData[2][0];

        projectDetailData = _.filter(projectDetailData, (step) => step.annotationId != 4);
        let displayId = 1;
        _.forEach(projectDetailData, (pdd) => {
            pdd.displayId = 1;
            displayId++;
        });


        dataGenerator.generateFullInvoiceData(projectData, teamData, projectDetailData);
        let date = invoiceDataElem.createDate;
        let todayDate = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();

        let transferData = {
            todayDate: todayDate,
            invoiceData: invoiceDataElem,
            projectData: projectData,
            projectSteps: projectDetailData,
            teamData: teamData
        };

        if (printView) {
            transferData.layout = 'layoutPrint';
        }

        res.render('invoiceDetail.hbs', generateStandardValues(req, res, transferData));

    }).error((error) => {
        console.error(error);
        res.redirect('/');
    });

});

router.get('/projects', ensureLogin, (req, res, next) => {

    let teamId = req.session.user.teamId;

    let projectPromise = dataGenerator.getProjectData(teamId);
    let customerPromise = dataGenerator.getCustomerData(teamId);

    Promise.join(projectPromise, customerPromise, (projectData, customerData) => {
        res.render('projects.hbs', generateStandardValues(req, res, {
            projectData: projectData,
            customerData: customerData
        }));
    });
});

router.get('/projects/:id', ensureLogin, (req, res, next) => {

    let teamId = req.session.user.teamId;
    let projectId = req.params.id;

    let projectPromise = dataGenerator.getProjectData(teamId, projectId);

    projectPromise.then((data) => {

        if (data.length <= 0) {
            res.sendStatus(401);
            return;
        }

        res.render('projectDetail.hbs', generateStandardValues(req, res, {project: data[0]}))

    });

});

router.get('/projects/:id/createInvoice', ensureLogin, (req, res, next) => {

    let teamId = req.session.user.teamId;
    let projectId = req.params.id;

    let projectPromise = dataGenerator.getProjectData(teamId, projectId);
    let projectDetailPromise = dataGenerator.getProjectDetailData(teamId, projectId);


    Promise.join(projectPromise, projectDetailPromise, (project, projectSteps) => {
        projectSteps = _.filter(projectSteps, (projectStep) => projectStep.invoiceId === null);

        res.render('projectInvoice.hbs', generateStandardValues(req, res, {
            project: project[0],
            projectSteps: projectSteps
        }));
    });
});

router.get('/login/', (req, res, next) => {
    res.render('login.hbs', generateStandardValues(req, res, {}));
});

router.post('/projects/create', ensureLogin, (req, res, next) => {

    if (!req.body.customerSelect) {
        messageHelper.errorMessage(req, "Error!", "You have to choose a customer.");
        res.redirect('/projects/')
    }

    let projectData = {
        teamId: req.session.user.teamId,
        displayName: req.body.projectNameInput,
        fixedPrice: req.body.fixedPrice ? req.body.fixedPrice : null,
        customerId: req.body.customerSelect
    };

    databaseAdapter.createProject(projectData).then((result) => {
        messageHelper.userMessage(req, "Success!", "You created " + projectData.displayName + "!");
        res.redirect('/projects/');

    }).catch((error) => {
        messageHelper.errorMessage(req, "Error!", "Something went wrong.", error);
        res.redirect('/projects/');

    })


});
router.get('/projects/:id/table/', ensureLogin, (req, res, next) => {

    let teamId = req.session.user.teamId;
    let projectId = req.params.id;

    let projectPromise = dataGenerator.getProjectDetailData(teamId, projectId);

    projectPromise.then((project) => {

        project = _.reverse(project);

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(project));
    });
});

router.get('/settings', ensureLogin, (req, res, next) => {

    dataGenerator.getTeamData(req.session.user.teamId).then((teamData) => {

        teamData = teamData[0];

        if (teamData.hourLoan)
            teamData.hourLoan = teamData.hourLoan.toFixed(2);


        res.render('settings.hbs', generateStandardValues(req, res, {teamData: teamData}));
    });

});

router.post('/settings', ensureLogin, (req, res, next) => {

    let teamId = req.session.user.teamId;

    let updateData = {
        bic: req.body.bicInput,
        iban: req.body.ibanInput,
        addressBlock: req.body.addressInput,
        hourLoan: req.body.hourLoanInput,
        taxNumber: req.body.taxNumberInput
    };

    databaseAdapter.updateTeamData(teamId, updateData).then((result) => {
        res.redirect('/settings');
    }).catch((error) => {
        messageHelper.errorMessage(req, "Error!", "Something went wrong", error);
        res.redirect('/settings');
    });
});

router.post('/projects/:id/createInvoice', ensureLogin, (req, res, next) => {
    let teamId = req.session.user.teamId;
    let projectId = req.params.id;

    let stepIds = req.body.stepIds;
    let invoiceId;

    if (!stepIds || stepIds.length <= 0) {
        messageHelper.errorMessage(req, 'Error', 'There are no selected project steps.');
        res.redirect('/projects/' + projectId + '/createInvoice');
        return;
    }


    if (!Array.isArray(stepIds)) {
        stepIds = [stepIds];
    }


    // Create Invoice

    databaseAdapter.createInvoice(projectId).then((result) => {

        let promiseCache = [];
        invoiceId = result.insertId;

        for (let sIdKey in stepIds) {
            let sId = stepIds[sIdKey];
            promiseCache.push(databaseAdapter.setInvoiceIdForProjectStep(Number(parseInt(sId)), invoiceId))
        }

        return Promise.all(promiseCache);

    }).then(() => {
        // Steps are assigned to Invoices.
        res.redirect('/invoices/' + invoiceId)
    }).error((error) => {
        console.error(error);
        res.redirect('/projects/' + projectId);
    });
});

router.post('/projects/:id/add/', ensureLogin, (req, res, next) => {
    let projectId = req.params.id;

    // TODO: Make sure, that you cannot modify other projects by changing url fields.
    // TODO: Verify Input Value

    let modifiedTimeString = String(req.body.workHours) + ":00";

    let projectValues = {
        projectId: projectId,
        text: req.body.text,
        workHours: modifiedTimeString,
        annotationId: req.body.annotationId,
        userId: req.session.user.id
    };

    databaseAdapter.addTaskToProject(projectValues).then((result) => {
        // Wenn ich nen leeren String zurück schiebe, sind noch restliche Daten eines Fehlers vorhanden und der Browser
        // denkt, dass ein Fehler aufgetreten ist, obwohl Statuscode 200 / 201 zurück kommt.
        res.status(200).send({});
    }).catch((error) => {
        console.error(error);
        res.send(400, error);
    });

});

router.post('/login/', (req, res, next) => {
    let userName = req.body.userNameInput;
    let inputPassword = req.body.passwordInput;

    databaseAdapter.getUser(null, userName).then((result) => {
        if (result.length <= 0) {
            // No user found
            res.sendStatus(401);
        }
        let comparisonValue = bcrypt.compareSync(inputPassword, result[0].passwordHash);

        if (!comparisonValue) {
            // Wrong password
            res.sendStatus(401);
            return;
        }

        req.session.user = result[0];
        req.session.save((error) => {
            console.error(error);
        });

        messageHelper.userMessage(req, "Success", "You are now logged in.");
        res.redirect('/');
        // Good to go.
    })
});

router.post('/register/', (req, res, next) => {
    // Create a new user account

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.passwordInput, salt);
    let userValues = {
        name: req.body.userNameInput,
        mailAddress: req.body.emailInput,
        passwordHash: hash,
        passwordSalt: salt
    };
    let teamValues = {
        displayName: req.body.teamNameInput
    };

    databaseAdapter.createUser(userValues, teamValues).then((result) => {
        res.redirect('/')
    }).catch((error) => {
        console.error(error);
        res.redirect('/')
    });

});


router.post('/customers/create', ensureLogin, (req, res, next) => {
    let customerData = {
        firstName: req.body.firstNameInput,
        lastName: req.body.lastNameInput,
        address: req.body.addressInput,
        teamId: req.session.user.teamId,
    };

    databaseAdapter.createCustomer(customerData).then((result) => {
        res.redirect('/customers');
    }).catch((error) => {
        console.error(error);
        res.redirect('/customers');
    })

});

module.exports = router;
