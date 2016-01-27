#!/usr/bin/env node

var async = require('async');
var AWS = require('aws-sdk');
var rc = require('rc');
var fs = require('fs');

var config = rc('ec2sync');

var START_SIGN = 'ec2sync-section-start';
var END_SIGN = 'ec2sync-section-end';

var ec2params = {
    Filters: [{
        Name: 'instance-state-code',
        Values: [
            '16',
        ]
    }]
};

function setSystemVariables(callback) {
    var isWin32 = (process.platform === 'win32');
    if (config.hostsFilePath === undefined) {
        if (isWin32) {
            config.hostsFilePath = process.env['windir'] + '\\system32\\drivers\\etc\\hosts';
        } else {
            config.hostsFilePath = '/etc/hosts';
        }
    }

    if (config.EOL === undefined) {
        config.EOL = (isWin32) ? '\r\n' : '\n';
    }

    callback();
}

function getDataFromAWS(callback) {
    function onResponse(err, data) {
        if (err) {
            console.error(err, err.stack);
            callback(err);
            return;
        }

        var res = data.Reservations;
        if (res === undefined) {
            callback(new Error('No instances found!'));
            return;
        }

        var result = [];

        for (var i = 0; i < res.length; i++) {
            var group = res[i].Instances;
            if (group !== undefined) {
                for (var j = 0; j < group.length; j++) {
                    var instance = group[j];
                    var tags = instance.Tags;
                    for (var k = 0; k < tags.length; k++) {
                        if (tags[k].Key === 'Name') {
                            result.push(instance.PublicIpAddress + ' ' + tags[k].Value);
                        }
                    }
                }
            }
        }

        callback(null, result);
    }

    var ec2 = new AWS.EC2(config.aws);
    ec2.describeInstances(ec2params, onResponse);
}

function writeToHostsFile(data, callback) {
    var resultArray = [];
    var startLineNumber = -1;
    var endLineNumber = -1;

    var linesArray = fs.readFileSync(config.hostsFilePath, 'utf-8').toString().split('\n');

    // Searching for start & end signs on hosts file
    for (var i = 0; i < linesArray.length; i++) {
        if (linesArray[i].indexOf(START_SIGN) > -1) {
            startLineNumber = i;
        } else if (linesArray[i].indexOf(END_SIGN) > -1) {
            endLineNumber = i;
        }
    }

    // Validating start & end signs
    if (startLineNumber === -1 || endLineNumber === -1 || startLineNumber >= endLineNumber) {
        callback(new Error('Sync sections are not defined correctly on hosts file!'));
        return;
    }

    // Deleting old data from file
    linesArray.splice(startLineNumber + 1, endLineNumber - startLineNumber - 1);

    // Inserting new data to file
    for (var i = 0; i < data.length; i++) {
        linesArray.splice(startLineNumber + 1, 0, data[i]);
    }

    // Writing new hosts file
    var resultString = linesArray.join(config.EOL);
    fs.writeFileSync(config.hostsFilePath, resultString, 'utf-8');

    callback();
}

function onEnd(err) {
    if (err) {
        console.error(err);
    } else {
        console.log('Process done successfully.');
    }
}

async.waterfall([setSystemVariables, getDataFromAWS, writeToHostsFile], onEnd);
