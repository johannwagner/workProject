/**
 * Created by Johann on 10/06/2017.
 */

const _ = require('lodash');

let errorMessage = (req, header, body, error) => {
    let messageBody = body;

    if(error) {
        messageBody += + "<br>" + error.toString();
    }
    _createMessage(req, "alert-danger", header, messageBody);
};

let userMessage = (req, header, body) => {
    _createMessage(req, "alert-success", header, body);
};

let _createMessage = (req, alertParam, header, body) => {
    if(_.isUndefined(req.session.messages)){
        req.session.messages = [];
    }
    req.session.messages.push({
        alertParam: alertParam,
        header: header,
        body:body
    })


};

module.exports = {
    userMessage: userMessage,
    errorMessage: errorMessage
};
