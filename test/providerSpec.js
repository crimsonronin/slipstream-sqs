'use strict';

var fs = require('fs');
var sinon = require('sinon');
var should = require('should');
var AWS = require('aws-sdk');
var Message = require('slipstream-message');
var Sqs = require('../lib/sqs');

describe('SQS Provider', function() {
    var queueUrl = 'http://aws.com/queue-id';

    it('should create SQS with default values', function(done) {
        var sqsProvider = new Sqs({queueUrl: queueUrl});

        should(sqsProvider.sqs).not.be.empty;
        should(sqsProvider.queueUrl).be.equal(queueUrl);
        should(sqsProvider.visibilityTimeout).be.equal(120);
        should(sqsProvider.waitTimeSeconds).be.equal(20);

        done();
    });

    it('should create SQS with custom values', function(done) {
        var stubSqs = {};
        var sqsProvider = new Sqs({
            sqs: stubSqs,
            queueUrl: queueUrl,
            visibilityTimeout: 10,
            waitTimeSeconds: 1
        });

        should(sqsProvider.sqs).be.equal(stubSqs);
        should(sqsProvider.queueUrl).be.equal(queueUrl);
        should(sqsProvider.visibilityTimeout).be.equal(10);
        should(sqsProvider.waitTimeSeconds).be.equal(1);

        done();
    });

    it('should throw an error when missing a queue url', function(done) {
        (function() {
            new Sqs();
        }).should.throw();

        done();
    });

    it('should get 1 message from queue', function(done) {
        var stubSqs = {
            receiveMessage: function(options, cb) {
                var err;

                cb(err, {
                    Messages: [
                        {
                            ReceiptHandle: 'message-id',
                            Body: '{"id": "my-message-body-data"}'
                        }
                    ]
                });
            }
        };

        var sqsProvider = new Sqs({
            sqs: stubSqs,
            queueUrl: queueUrl,
            visibilityTimeout: 10,
            waitTimeSeconds: 1
        });

        sqsProvider.getMessages(1, function(err, messages) {
            should(err).be.empty;
            should(messages).not.be.empty;

            var message = messages[0];

            should(message.id).not.be.empty;
            should(message.id).be.equal('message-id');
            should(message.data).not.be.empty;
            should(message.data.id).not.be.empty;
            should(message.data.id).be.equal('my-message-body-data');
            should(message.meta).be.empty;

            done();
        });
    });

    it('should get 0 messages from queue', function(done) {
        var stubSqs = {
            receiveMessage: function(options, cb) {
                var err;

                cb(err, {
                    Messages: []
                });
            }
        };

        var sqsProvider = new Sqs({
            sqs: stubSqs,
            queueUrl: queueUrl,
            visibilityTimeout: 10,
            waitTimeSeconds: 1
        });

        sqsProvider.getMessages(1, function(err, messages) {
            should(err).be.empty;
            should(messages.length).be.equal(0);

            done();
        });
    });

    it('should return error from AWS SQS', function(done) {
        var stubSqs = {
            receiveMessage: function(options, cb) {
                cb('Problem with sqs');
            }
        };

        var sqsProvider = new Sqs({
            sqs: stubSqs,
            queueUrl: queueUrl,
            visibilityTimeout: 10,
            waitTimeSeconds: 1
        });

        sqsProvider.getMessages(1, function(err, messages) {
            should(err).not.be.empty;
            should(messages.length).be.equal(0);

            done();
        });
    });

    it('should return an error when greater than 10 messages requested', function(done) {
        var stubSqs = {};
        var sqsProvider = new Sqs({
            sqs: stubSqs,
            queueUrl: queueUrl
        });

        sqsProvider.getMessages(11, function(err, messages) {
            should(err).not.be.empty;
            should(messages).be.empty;

            done();
        });
    });

    it('should delete a message from SQS', function(done) {
        var stubSqs = {
            deleteMessage: function(options, cb) {
                cb();
            }
        };
        var sqsProvider = new Sqs({
            sqs: stubSqs,
            queueUrl: queueUrl
        });

        var message = new Message('message-id', {id: 'body-stuff'});

        sqsProvider.deleteMessage(message, function(err) {
            should(err).be.empty;

            done();
        });
    });
});